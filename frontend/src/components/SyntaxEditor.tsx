import { useMemo, useRef } from "react"
import { highlightLine, type HighlightLanguage } from "../utils/codeHighlight"

interface Props {
  value: string
  onChange?: (value: string) => void
  language: HighlightLanguage
  readOnly?: boolean
  placeholder?: string
  ariaLabel?: string
}

export default function SyntaxEditor({
  value,
  onChange,
  language,
  readOnly = false,
  placeholder,
  ariaLabel,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const lines = useMemo(() => value.replace(/\r\n/g, "\n").split("\n"), [value])
  const lineCount = Math.max(lines.length, 1)

  return (
    <div className="syntax-editor">
      <div ref={scrollRef} className="syntax-editor-scroll">
        <div className="syntax-editor-gutter" aria-hidden>
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i} className="syntax-editor-line-num">{i + 1}</span>
          ))}
        </div>
        <div className="syntax-editor-main">
          <pre className="syntax-editor-highlight" aria-hidden>
            {lines.map((line, i) => (
              <span key={i} className="syntax-editor-line">
                <span
                  dangerouslySetInnerHTML={{ __html: highlightLine(line, language) + "\n" }}
                />
              </span>
            ))}
          </pre>
          <textarea
            ref={textareaRef}
            className="syntax-editor-input"
            value={value}
            onChange={e => onChange?.(e.target.value)}
            readOnly={readOnly}
            spellCheck={false}
            aria-label={ariaLabel}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  )
}
