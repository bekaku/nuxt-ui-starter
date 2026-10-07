const HTML_ENTITIES: Record<string, string> = {
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  nbsp: ' '
}

/**
 * Convert a Hacker News style HTML snippet to plain text for BaseContentText:
 * paragraphs become blank lines and links become their full href so
 * BaseContentText `urlify` can render them as clickable links.
 * The result is plain text; BaseContentText escapes it before rendering.
 */
export const hackerHtmlToText = (html?: string | null): string => {
  if (!html) {
    return ''
  }
  return html
    .replace(/<a\s[^>]*?href="([^"]*)"[^>]*>[\s\S]*?<\/a>/gi, ' $1 ')
    .replace(/<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name: string) => HTML_ENTITIES[name.toLowerCase()] ?? match)
    .replace(/&amp;/g, '&')
    .trim()
}
