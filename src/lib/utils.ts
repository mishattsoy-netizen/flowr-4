import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCostPerMillion(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "0";
  const perMillion = val * 1000000;
  return parseFloat(perMillion.toFixed(4)).toString();
}

export function formatCompactNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || val < 0) return "∞";
  if (val >= 1000000) {
    return `${parseFloat((val / 1000000).toFixed(1))}M`;
  }
  if (val >= 1000) {
    return `${parseFloat((val / 1000).toFixed(1))}K`;
  }
  return val.toString();
}

export function stripHtml(html: string): string {
  if (!html) return '';
  // Remove HTML tags
  const stripped = html.replace(/<[^>]*>?/gm, '');
  // Decode common entities
  return stripped
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}
