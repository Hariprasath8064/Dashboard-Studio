import { useRef } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import type { ImageWidget, FitMode } from "../types/widgetTypes"

interface Props { widget: ImageWidget }

const FIT_OPTIONS: { value: FitMode; label: string; title: string }[] = [
  { value: "cover",   label: "Cover",   title: "Fill the frame, crop edges if needed" },
  { value: "contain", label: "Contain", title: "Fit the whole image inside, letterboxed" },
  { value: "fill",    label: "Fill",    title: "Stretch image to fill (may distort)" },
  { value: "none",    label: "None",    title: "Original size, no scaling" },
]

export default function ImageProperties({ widget }: Props) {

  const updateWidget = useDashboardStore(s => s.updateWidget)
  const fileRef      = useRef<HTMLInputElement>(null)

  const upd = (patch: Partial<ImageWidget>) =>
    updateWidget({ ...widget, ...patch })

  function handleUrlChange(url: string) {
    upd({ src: url.trim(), sourceType: "url" })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUri = ev.target?.result as string
      upd({ src: dataUri, sourceType: "upload" })
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const isUpload = widget.sourceType === "upload"

  return (
    <div className="pp-section">

      <div className="pp-section-title">Source</div>

      <div className="pp-row" style={{ gap: 6 }}>
        <button
          className={`img-src-btn${!isUpload ? " active" : ""}`}
          onClick={() => upd({ sourceType: "url" })}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M6 1.5c-2 1.5-2 7.5 0 9M6 1.5c2 1.5 2 7.5 0 9M1.5 6h9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          URL
        </button>
        <button
          className={`img-src-btn${isUpload ? " active" : ""}`}
          onClick={() => fileRef.current?.click()}
          title="Upload image from your computer"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 9v1.5h8V9M6 2v6M4 4l2-2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {!isUpload && (
        <div className="pp-field" style={{ marginTop: 8 }}>
          <label>Image URL</label>
          <input
            className="pp-input"
            placeholder="https://example.com/image.png"
            value={widget.src}
            onChange={e => handleUrlChange(e.target.value)}
          />
        </div>
      )}

      {isUpload && widget.src && (
        <div
          className="img-upload-badge"
          title="Click Upload to replace"
          onClick={() => fileRef.current?.click()}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M10 8.5v1.5H2V8.5M6 2v6M4 4l2-2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Uploaded file — click to replace
        </div>
      )}

      {widget.src && (
        <div className="img-preview-thumb">
          <img
            src={widget.src}
            alt=""
            style={{ objectFit: "cover" }}
            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        </div>
      )}

      <div className="pp-section-title" style={{ marginTop: 14 }}>Display</div>

      <div className="pp-row">
        <span className="pp-label">Fit</span>
        <div className="img-fit-group">
          {FIT_OPTIONS.map(o => (
            <button
              key={o.value}
              className={`img-fit-btn${widget.fit === o.value ? " active" : ""}`}
              onClick={() => upd({ fit: o.value })}
              title={o.title}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pp-row" style={{ marginTop: 8 }}>
        <span className="pp-label">
          Opacity
          <span style={{ marginLeft: 6, fontSize: 11, color: "var(--text3)", fontVariantNumeric: "tabular-nums" }}>
            {widget.opacity ?? 100}%
          </span>
        </span>
        <input
          type="range"
          min={0} max={100} step={1}
          value={widget.opacity ?? 100}
          onChange={e => upd({ opacity: Number(e.target.value) })}
          style={{ flex: 1, accentColor: "var(--accent)" }}
        />
      </div>

      <div className="pp-section-title" style={{ marginTop: 14 }}>Accessibility</div>

      <div className="pp-field">
        <label>Alt Text</label>
        <input
          className="pp-input"
          placeholder="Describe the image…"
          value={widget.alt || ""}
          onChange={e => upd({ alt: e.target.value })}
        />
      </div>

    </div>
  )

}
