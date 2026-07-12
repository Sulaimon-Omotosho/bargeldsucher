import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// lib/split-name.ts
export function splitName(fullName: string) {
  const names = fullName.trim().split(/\s+/)

  return {
    firstName: names.shift() ?? '',
    lastName: names.join(' '),
  }
}
