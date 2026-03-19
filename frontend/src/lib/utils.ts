import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Normalize audio field returned from backend or other sources.
// Accepts: string URL, object with `url` property, or blob/object URL.
export function normalizeAudioUrl(audio: any): string {
  if (!audio) return '';
  if (typeof audio === 'string') return audio;
  if (typeof audio === 'object') {
    if (typeof audio.url === 'string') return audio.url;
    if (typeof audio.audioUrl === 'string') return audio.audioUrl;
  }
  return '';
}
