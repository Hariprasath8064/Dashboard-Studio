// Sub-component: axis label / font / rotation options for StylePanel

interface Props {
  widget: any
  onSet: (field: string, value: any) => void
}

export default function AxisOptionsEditor({ widget, onSet }: Props) {
  return (
    <div className="pp-bar-list" style={{ gap: 6 }}>
      <div className="pp-row" style={{ margin: 0 }}>
        <span className="pp-label">X Label</span>
        <input className="pp-input" placeholder="X axis label"
          value={widget.xAxisLabel || ""}
          onChange={e => onSet("xAxisLabel", e.target.value || undefined)} />
      </div>
      <div className="pp-row" style={{ margin: 0 }}>
        <span className="pp-label">Y Label</span>
        <input className="pp-input" placeholder="Y axis label"
          value={widget.yAxisLabel || ""}
          onChange={e => onSet("yAxisLabel", e.target.value || undefined)} />
      </div>
      <div className="pp-row" style={{ margin: 0 }}>
        <span className="pp-label">Font Size</span>
        <input className="pp-input" type="number" min={8} max={20}
          value={widget.axisFontSize || 11}
          onChange={e => onSet("axisFontSize", Number(e.target.value))} />
      </div>
      <div className="pp-row" style={{ margin: 0 }}>
        <span className="pp-label">X Rotation</span>
        <input className="pp-input" type="number" min={-90} max={90} step={15}
          placeholder="0"
          value={widget.xTickRotation ?? ""}
          onChange={e => onSet("xTickRotation", e.target.value !== "" ? Number(e.target.value) : undefined)} />
      </div>
    </div>
  )
}
