import type { SearchResult } from "./types";

export function rankResults(items: SearchResult[], query: string): SearchResult[] {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return items.slice(0, 50);
  return items
    .map((item) => {
      const title = item.title.toLocaleLowerCase();
      const username = item.username.toLocaleLowerCase();
      const haystack = `${title} ${username} ${item.url} ${item.group}`.toLocaleLowerCase();
      if (!terms.every((term) => haystack.includes(term))) return null;
      const score = terms.reduce((sum, term) => sum + (title === term ? 80 : title.startsWith(term) ? 40 : title.includes(term) ? 20 : username.includes(term) ? 8 : 2), 0);
      return { item, score };
    })
    .filter((entry): entry is { item: SearchResult; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .map(({ item }) => item)
    .slice(0, 100);
}

export function safeDisplayUrl(value: string): string {
  if (!value) return "No URL";
  try {
    const url = new URL(value);
    return url.hostname || value;
  } catch {
    return value;
  }
}
