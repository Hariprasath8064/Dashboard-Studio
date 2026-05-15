import type { ImageWidget as ImageWidgetType } from "../../types/widgetTypes"

interface Props {
  widget: ImageWidgetType
}

export default function ImageWidget({ widget }: Props) {

  if (!widget.src) {
    return (
      <div className="img-placeholder">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="2" y="5" width="28" height="22" rx="3" stroke="currentColor" strokeWidth="1.6"/>
          <circle cx="10.5" cy="12.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M2 22l7-7 5 5 4-4 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>No image — open Properties to add one</span>
      </div>
    )
  }

  return (
    <div className="img-inner">
      <img
        src={widget.src}
        alt={widget.alt || ""}
        draggable={false}
        style={{
          width:      "100%",
          height:     "100%",
          objectFit:  widget.fit     || "cover",
          opacity:    (widget.opacity ?? 100) / 100,
          display:    "block",
        }}
      />
    </div>
  )

}
