import { defineEventHandler, getQuery, createError } from 'h3'
import { readFile, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const SLUG_RE = /^[a-z0-9-]{1,80}$/

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const slug = String(query.slug || '')
  const locale = String(query.locale || 'th')

  if (!SLUG_RE.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid manual slug' })
  }

  const manualsDir = resolve(process.cwd(), 'manuals')
  const candidates = locale && locale !== 'th'
    ? [`${slug}.${locale}.md`, `${slug}.md`]
    : [`${slug}.md`]

  for (const file of candidates) {
    const fullPath = join(manualsDir, file)
    const resolved = resolve(fullPath)
    if (!resolved.startsWith(manualsDir)) continue
    try {
      const content = await readFile(resolved, 'utf-8')
      let updatedAt: string | null = null
      try {
        const st = await stat(resolved)
        updatedAt = st.mtime.toISOString()
      } catch {
        updatedAt = null
      }
      const servedLocale = file === `${slug}.md` ? 'th' : locale
      return { slug, content, updatedAt, servedLocale }
    } catch {
      continue
    }
  }

  throw createError({ statusCode: 404, statusMessage: 'Manual not found' })
})
