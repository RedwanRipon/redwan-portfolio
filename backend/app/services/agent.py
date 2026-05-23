"""The agent — turns a user question into a spoken reply + nav hint.

Design notes
------------
We deliberately avoid `langchain.agents` / LangGraph helpers here so the
code stays version-proof and easy to read. Instead we implement the
classic tool-calling loop ourselves:

    1. Send the conversation (system + user) to the LLM, with the two
       tools attached.
    2. If the LLM responds with tool calls, run them, append results
       to the conversation, and loop.
    3. If the LLM responds with plain content (no more tool calls),
       that's the spoken reply — return it.

Two tools the LLM can call:
    - search_cv_tool   : RAG over the CV vector store (Step 2).
    - navigation_tool  : declares which page the frontend should
                         navigate to + which element to highlight.
                         The "return value" of this tool is symbolic;
                         what matters is that the LLM called it with
                         specific arguments — we extract those args
                         and surface them in the HTTP response.
"""
from typing import Optional

from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

from app.config import settings
from app.schemas import ChatResponse
from app.services.vector_store import search


# ----------------------------------------------------------------------
# Tools
# ----------------------------------------------------------------------

@tool
def search_cv_tool(query: str) -> str:
    """Search Md Redwan Hossain's CV for information relevant to the
    query. Use this whenever the user asks about Redwan's background,
    education, experience, master's thesis, projects, publications,
    skills, or languages. The query should be a short phrase
    describing what you're looking for (e.g. 'master thesis',
    'web developer experience', 'machine learning projects')."""
    hits = search(query, k=4)
    if not hits:
        return "No relevant information found in the CV."
    # Join hits with a clear separator so the LLM can tell them apart.
    return "\n\n---\n\n".join(content for content, _ in hits)


@tool
def navigation_tool(route: str, highlight_id: Optional[str] = None) -> str:
    """Tell the frontend which page to navigate to AND, optionally,
    which element to spotlight. Call this once per reply when a
    specific page would help the user see what you're talking about.

    Available routes (use the SAME values; the frontend matches them):
      /            home (top of the page)
      /#about      About section on the home page
      /#expertise  Expertise tiles on the home page
      /#portfolio  Project cards on the home page
      /#resume     Resume timeline on the home page (CV, education, experience)
      /#blog       Latest blog posts (home preview)
      /#travel     Latest travel posts (home preview)
      /#contact    Contact form on the home page
      /blogs       Full blog listing page
      /travels     Full travel listing page

    If the question is generic and no specific page applies, you can
    skip calling this tool.
    """
    suffix = f" (highlight: {highlight_id})" if highlight_id else ""
    return f"Acknowledged — frontend will navigate to {route}{suffix}."


# ----------------------------------------------------------------------
# System prompt
# ----------------------------------------------------------------------

SYSTEM_PROMPT = """You are the AI voice assistant on Md Redwan Hossain's
personal portfolio website. Your job is to answer questions about
Redwan using the tools you have.

Always use search_cv_tool first for any question about Redwan's
background. Never invent facts. If the tool returns nothing relevant,
say so honestly.

Ordering rules (IMPORTANT):
- When listing degrees, jobs, projects, or anything time-ordered,
  ALWAYS lead with the most recent and highest item first, then go
  backwards.
  Example: ask about education -> mention the Master's at Erlangen
  FIRST, then the Bachelor's at Southeast University.
  Example: ask about experience -> mention the Master Thesis role
  FIRST, then the older web-development jobs.
- The CV's section order is not chronological. Reorder it yourself.

Tone:
- Replies will be SPOKEN ALOUD by text-to-speech, so keep them to
  1 - 2 short sentences. No bullet points, no markdown, no headings.
- Conversational, friendly, and natural — like a smart friend
  describing Redwan.
- Refer to Redwan as "Redwan" or "he", never as "I". You are the
  assistant, not Redwan himself.
- Don't say things like "let's check it out" or "click here" — the
  navigation happens silently when you call navigation_tool, the
  user doesn't need to be told.

Navigation rules (IMPORTANT):
- ALWAYS call navigation_tool on EVERY reply about Redwan, picking
  the most relevant route from the list. Do NOT just mention going
  somewhere in the speech — actually call the tool.
- Map of topics -> routes:
    education / thesis / experience / publications / skills -> /#resume
    projects / portfolio                                    -> /#portfolio
    focus areas / what he does                              -> /#expertise
    bio / who is he                                         -> /#about
    blog / writing                                          -> /#blog or /blogs
    travel / cities visited                                 -> /#travel or /travels
    get in touch / contact / hire                           -> /#contact
- Only skip navigation_tool for truly off-topic questions.

Off-topic questions (weather, politics, random trivia): politely say
you can only answer questions about Redwan's work."""


# ----------------------------------------------------------------------
# The agent
# ----------------------------------------------------------------------

MAX_LOOPS = 5  # safety cap so we never spin forever


def run_agent(user_message: str) -> ChatResponse:
    """Run one chat turn. Returns a ChatResponse with speech + nav info."""
    # 1. LLM with tools attached. bind_tools() teaches the LLM about the
    #    function names + arg schemas (built from the @tool docstrings).
    llm = ChatOpenAI(
        api_key=settings.openai_api_key,
        model=settings.openai_llm_model,
        temperature=0.2,  # low temp = focused, factual replies
    )
    tools_by_name = {
        "search_cv_tool": search_cv_tool,
        "navigation_tool": navigation_tool,
    }
    llm_with_tools = llm.bind_tools(list(tools_by_name.values()))

    # 2. Seed conversation.
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_message),
    ]

    # 3. Tool-calling loop. We capture the latest navigation hint from
    #    any navigation_tool call so we can surface it in the response.
    nav_route: Optional[str] = None
    nav_highlight: Optional[str] = None
    response: AIMessage = AIMessage(content="")  # placeholder for the typechecker

    for _ in range(MAX_LOOPS):
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        # Done? (LLM gave a plain reply with no more tool calls)
        if not response.tool_calls:
            break

        # Run each requested tool call and feed the results back in.
        for call in response.tool_calls:
            name = call["name"]
            args = call["args"]

            # Capture nav hint regardless of what the tool "returns".
            if name == "navigation_tool":
                nav_route = args.get("route")
                nav_highlight = args.get("highlight_id")

            tool_fn = tools_by_name.get(name)
            if tool_fn is None:
                tool_output = f"Unknown tool: {name}"
            else:
                try:
                    tool_output = tool_fn.invoke(args)
                except Exception as exc:  # noqa: BLE001
                    tool_output = f"Tool error: {exc}"

            messages.append(
                ToolMessage(content=str(tool_output), tool_call_id=call["id"])
            )

    # 4. Extract the spoken reply from the last AI message.
    speech = (response.content or "").strip()
    if not speech:
        # Fallback if the model returned only tool calls and never spoke.
        speech = "I'm not sure how to answer that — try asking about Redwan's work or background."

    return ChatResponse(
        speech=speech,
        route=nav_route,
        highlight_id=nav_highlight,
    )
