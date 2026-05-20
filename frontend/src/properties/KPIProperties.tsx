import type { KPIWidget } from "../types/widgetTypes"
import { useDashboardStore } from "../store/dashboardStore"
import DrillDownProperties from "./DrillDownProperties"

const AGGREGATIONS  = ["SUM", "AVG", "COUNT", "MIN", "MAX"]
const NUM_FORMATS   = [
  { value: "auto", label: "Auto" },
  { value: "full", label: "Full" },
  { value: "k",    label: "K"    },
  { value: "m",    label: "M"    },
  { value: "b",    label: "B"    },
]

interface Props { widget: KPIWidget }

export default function KPIProperties({ widget }: Props) {

  const dataset      = useDashboardStore(s => s.dashboard.dataset)
  const updateWidget = useDashboardStore(s => s.updateWidget)

  const upd = (patch: Partial<KPIWidget>) => updateWidget({ ...widget, ...patch })

  if (!dataset) return (
    <div className="pp-section">
      <div className="pp-empty-sm">Upload a dataset to configure this KPI</div>
    </div>
  )

  const numericColumns = dataset.columns.filter(c => c.type === "number")
  const cmpType = widget.comparisonType ?? "none"

  return (
    <div className="pp-section">

      <div className="pp-section-title">Value</div>

      <div className="pp-row">
        <span className="pp-label">Label</span>
        <input
          className="pp-input"
          value={widget.label}
          onChange={e => upd({ label: e.target.value })}
        />
      </div>

      <div className="pp-row">
        <span className="pp-label">Column</span>
        <select
          className="pp-select"
          value={widget.valueColumn}
          onChange={e => upd({ valueColumn: e.target.value })}
        >
          <option value="">Select column</option>
          {dataset.columns.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="pp-row">
        <span className="pp-label">Aggregation</span>
        <div className="pp-agg-group">
          {AGGREGATIONS.map(a => (
            <button
              key={a}
              className={`pp-agg-btn${(widget.aggregation || "SUM") === a ? " active" : ""}`}
              onClick={() => upd({ aggregation: a })}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="pp-section-divider" />

      <div className="pp-section-title">Format</div>

      <div className="pp-row">
        <span className="pp-label">Numbers</span>
        <div className="pp-agg-group">
          {NUM_FORMATS.map(f => (
            <button
              key={f.value}
              className={`pp-agg-btn${(widget.numberFormat ?? "auto") === f.value ? " active" : ""}`}
              onClick={() => upd({ numberFormat: f.value as any })}
              title={
                f.value === "auto"  ? "Auto: K for 10K+, M for 1M+, B for 1B+"  :
                f.value === "full"  ? "Always show full number (e.g. 1,247,000)" :
                f.value === "k"     ? "Always show in thousands (e.g. 1.2K)"     :
                f.value === "m"     ? "Always show in millions (e.g. 1.2M)"      :
                "Always show in billions (e.g. 1.2B)"
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pp-row">
        <span className="pp-label">Prefix</span>
        <input
          className="pp-input pp-input-sm"
          placeholder="e.g. $"
          value={widget.prefix || ""}
          onChange={e => upd({ prefix: e.target.value })}
        />
      </div>

      <div className="pp-row">
        <span className="pp-label">Suffix</span>
        <input
          className="pp-input pp-input-sm"
          placeholder="e.g. %"
          value={widget.suffix || ""}
          onChange={e => upd({ suffix: e.target.value })}
        />
      </div>

      <div className="pp-row">
        <span className="pp-label">Decimals</span>
        <input
          className="pp-input pp-input-sm"
          type="number" min={0} max={6}
          value={widget.decimals ?? 0}
          onChange={e => upd({ decimals: Math.max(0, Math.min(6, Number(e.target.value))) })}
        />
      </div>

      <div className="pp-row">
        <span className="pp-label">Font size</span>
        <input
          className="pp-input pp-input-sm"
          type="number" min={16} max={96} step={2}
          value={widget.fontSize || 36}
          onChange={e => upd({ fontSize: Math.max(16, Math.min(96, Number(e.target.value))) })}
        />
        <span style={{ fontSize: 11, color: "var(--text3)" }}>px</span>
      </div>

      <div className="pp-section-divider" />

      <div className="pp-section-title">Comparison</div>

      {/* Comparison type */}
      <div className="pp-row">
        <span className="pp-label">Compare to</span>
        <div className="pp-agg-group">
          {(["none", "column", "target"] as const).map(t => (
            <button
              key={t}
              className={`pp-agg-btn${cmpType === t ? " active" : ""}`}
              onClick={() => upd({ comparisonType: t })}
            >
              {t === "none" ? "None" : t === "column" ? "Column" : "Target"}
            </button>
          ))}
        </div>
      </div>

      {cmpType === "column" && (
        <>
          <div className="pp-row">
            <span className="pp-label">Column</span>
            <select
              className="pp-select"
              value={widget.comparisonColumn || ""}
              onChange={e => upd({ comparisonColumn: e.target.value })}
            >
              <option value="">Select column</option>
              {numericColumns.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", padding: "2px 0 6px", lineHeight: 1.5 }}>
            The same aggregation is applied to both columns. Pick a column that represents the baseline (e.g., "Last Month").
          </div>
        </>
      )}

      {cmpType === "target" && (
        <div className="pp-row">
          <span className="pp-label">Target</span>
          <input
            className="pp-input pp-input-sm"
            type="number"
            placeholder="e.g. 1000"
            value={widget.comparisonTarget ?? ""}
            onChange={e => upd({ comparisonTarget: Number(e.target.value) })}
          />
        </div>
      )}

      {cmpType !== "none" && (
        <>
          <div className="pp-row">
            <span className="pp-label">Direction</span>
            <div className="pp-agg-group">
              <button
                className={`pp-agg-btn${(widget.polarity ?? "higher") === "higher" ? " active" : ""}`}
                onClick={() => upd({ polarity: "higher" })}
                title="Higher value = good (green ▲)"
              >
                ▲ Higher = good
              </button>
              <button
                className={`pp-agg-btn${widget.polarity === "lower" ? " active" : ""}`}
                onClick={() => upd({ polarity: "lower" })}
                title="Lower value = good (green ▼)"
              >
                ▼ Lower = good
              </button>
            </div>
          </div>

          <div className="pp-row">
            <span className="pp-label">Label</span>
            <input
              className="pp-input"
              placeholder="e.g. vs last month"
              value={widget.comparisonLabel || ""}
              onChange={e => upd({ comparisonLabel: e.target.value })}
            />
          </div>
        </>
      )}

      <DrillDownProperties
        drillDown={widget.drillDown}
        onChange={cfg => upd({ drillDown: cfg })}
      />

    </div>
  )

}
