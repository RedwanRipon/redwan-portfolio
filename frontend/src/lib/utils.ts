import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Conditional Tailwind class joiner. Use in `className={cn(...)}`. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
