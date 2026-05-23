/** Split a comma-separated list respecting parentheses nesting. */
function splitTopLevelComma(s: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ""
  for (const ch of s) {
    if (ch === "(") depth++
    else if (ch === ")") depth--
    else if (ch === "," && depth === 0) {
      parts.push(current)
      current = ""
      continue
    }
    current += ch
  }
  if (current.trim()) parts.push(current)
  return parts
}

function titleCaseWords(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

/** Turn a relevance sub-expression into a human-readable column label. */
export function relevanceExprToColumnName(expr: string): string {
  let e = expr.trim()

  const besPropQuoted = e.match(/bes property "([^"]+)"/i)
  if (besPropQuoted) return besPropQuoted[1]

  const besPropNamed = e.match(/name of it = "([^"]+)"/i)
  if (besPropNamed && /bes property/i.test(e)) return besPropNamed[1]

  const existsMatch = e.match(/exists\s+(?:\(([^)]+)\)|([^)]+?))\s+of\s+it/i)
  if (existsMatch) e = (existsMatch[1] || existsMatch[2]).trim()

  e = e.replace(/\s+as\s+string\s*$/i, "").trim()
  e = e.replace(/\s+of\s+it\s*$/i, "").trim()
  e = e.replace(/^\(+|\)+$/g, "").trim()

  if (!e) return "Value"

  const segments = e.split(/\s+of\s+/i)
  const leaf = segments[0].trim()

  return titleCaseWords(leaf)
}

/** Parse column names from Dashboard Studio / structured $x$ export queries. */
function namesFromStructuredQuery(query: string): string[] {
  if (!query.includes("item 0 of it") && !query.includes("$x$")) return []

  const names: string[] = []

  for (const m of query.matchAll(/concatenation "%0A" of \(\((.+?)\) as string\)/gi)) {
    let inner = m[1].trim()
    while (inner.startsWith("(") && inner.endsWith(")")) {
      inner = inner.slice(1, -1).trim()
    }
    if (/ of it\s*$/i.test(inner)) {
      names.push(relevanceExprToColumnName(inner))
    }
  }

  for (const m of query.matchAll(
    /values of results \(it,\s*bes property whose \(id of it = \d+ AND name of it = "([^"]+)"\)\)/gi,
  )) {
    names.push(m[1])
  }

  for (const m of query.matchAll(/values of results \(it,\s*bes property "([^"]+)"\)/gi)) {
    names.push(m[1])
  }

  for (const m of query.matchAll(
    /\(if \(exists \(([^)]+)\)\) then \(concatenation "%0A" of \(\(\1\) as string\)/gi,
  )) {
    names.push(relevanceExprToColumnName(m[1]))
  }

  return names
}

/** Parse `(a of it, b of it, ...) of bes ...` style queries. */
function namesFromTupleQuery(query: string): string[] {
  const targetMatch = query.match(/\)\s+of\s+[\s\n]*(?:bes\b|all\b)/i)
  if (!targetMatch || targetMatch.index == null) return []

  const beforeTarget = query.slice(0, targetMatch.index)
  const closeIdx = beforeTarget.lastIndexOf(")")
  if (closeIdx === -1) return []

  let depth = 1
  let openIdx = closeIdx - 1
  while (openIdx >= 0 && depth > 0) {
    if (beforeTarget[openIdx] === ")") depth++
    else if (beforeTarget[openIdx] === "(") depth--
    openIdx--
  }
  openIdx++

  const tupleBody = beforeTarget.slice(openIdx, closeIdx).trim()
  if (!tupleBody || tupleBody.includes("item 0 of it as string")) return []

  return splitTopLevelComma(tupleBody).map(relevanceExprToColumnName)
}

/** Single-value queries: `names of bes computers`. */
function nameFromSingularQuery(query: string): string | null {
  const trimmed = query.trim()
  const m = trimmed.match(/^(.+?)\s+of\s+(?:bes\b|all\b)/i)
  if (!m) return null
  const head = m[1].trim()
  if (head.includes("(") || head.includes(",")) return null
  return relevanceExprToColumnName(head.replace(/\s+of\s+it\s*$/i, ""))
}

/**
 * Infer dataset column names from a BigFix relevance query.
 * Falls back to "Column N" when parsing cannot match the result width.
 */
export function inferColumnNamesFromRelevance(query: string, colCount: number): string[] {
  if (colCount <= 0) return []

  let names: string[] = []

  const structured = namesFromStructuredQuery(query)
  if (structured.length > 0) names = structured

  if (names.length !== colCount) {
    const tuple = namesFromTupleQuery(query)
    if (tuple.length > 0) names = tuple
  }

  if (names.length !== colCount && colCount === 1) {
    const single = nameFromSingularQuery(query)
    if (single) names = [single]
  }

  const out: string[] = []
  const used = new Set<string>()

  for (let i = 0; i < colCount; i++) {
    let label = names[i]?.trim() || (colCount === 1 ? "Value" : `Column ${i + 1}`)
    if (used.has(label)) {
      let n = 2
      while (used.has(`${label} (${n})`)) n++
      label = `${label} (${n})`
    }
    used.add(label)
    out.push(label)
  }

  return out
}
