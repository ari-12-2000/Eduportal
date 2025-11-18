import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function cleanJSON(raw: string) {
  return raw
    .replace(/```json/i, "") // remove ```json
    .replace(/```/g, "")     // remove ```
    .trim();
}