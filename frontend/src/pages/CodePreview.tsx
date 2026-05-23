import { useMemo, useState } from "react"
import SyntaxEditor from "../components/SyntaxEditor"

interface Props {
  code: string
}

export default function CodePreview({ code }: Props) {
  const [copied, setCopied] = useState(false)

  const normalizedCode = useMemo(() => {
    const normalized = code.replace(/\r\n/g, "\n").trim()
    if (normalized.includes("\n")) return normalized
    return normalized.replace(/>\s*</g, ">\n<")
  }, [code])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(normalizedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (err) {
      console.error("Failed to copy HTML", err)
    }
  }

  return (
    <div className="code-preview">
      <div className="code-preview-toolbar">
        <span>Generated HTML</span>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className={`code-preview-copy${copied ? " copied" : ""}`}
          onClick={handleCopy}
        >
          {copied ? "✓ Copied" : "Copy HTML"}
        </button>
      </div>

      <SyntaxEditor
        value={normalizedCode}
        language="html"
        readOnly
        ariaLabel="Generated HTML"
      />
    </div>
  )
}
