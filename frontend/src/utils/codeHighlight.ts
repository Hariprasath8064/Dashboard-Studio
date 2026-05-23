function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function highlightRelevanceLine(line: string): string {
  let s = escapeHtml(line.length ? line : " ")

  s = s.replace(
    /\b(of|whose|exists|if|then|else|and|or|not|it|as|string|concatenation|unique|values|item)\b/gi,
    (w) => `<span class="hl-keyword">${w}</span>`,
  )
  s = s.replace(/"([^"]*)"/g, '<span class="hl-string">"$1"</span>')
  s = s.replace(/(\$x\$|%0A|&lt;none&gt;)/g, '<span class="hl-constant">$1</span>')
  s = s.replace(/\b(bes\s+(?:computers|fixlets|actions|sites|users|properties)\b)/gi, '<span class="hl-type">$1</span>')
  s = s.replace(/\b(item\s+\d+\s+of\s+it)/gi, '<span class="hl-special">$1</span>')
  s = s.replace(/([()])/g, '<span class="hl-paren">$1</span>')
  s = s.replace(/(&amp;)/g, '<span class="hl-operator">$1</span>')

  return s
}

export function highlightHtmlLine(line: string): string {
  let s = escapeHtml(line.length ? line : " ")

  if (/^\s*<!--/.test(line)) {
    return `<span class="hl-comment">${s}</span>`
  }

  s = s.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="hl-comment">$1</span>')
  s = s.replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="hl-tag">$2</span>')
  s = s.replace(/([\w-]+)(=)/g, '<span class="hl-attr">$1</span><span class="hl-operator">$2</span>')
  s = s.replace(/"([^"]*)"/g, '<span class="hl-string">"$1"</span>')
  s = s.replace(/(&lt;!DOCTYPE[\s\S]*?&gt;)/gi, '<span class="hl-meta">$1</span>')

  return s
}

export type HighlightLanguage = "relevance" | "html"

export function highlightLine(line: string, language: HighlightLanguage): string {
  return language === "html" ? highlightHtmlLine(line) : highlightRelevanceLine(line)
}
