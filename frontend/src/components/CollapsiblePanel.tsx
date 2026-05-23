import type { ReactNode } from "react"

interface CollapsiblePanelProps {
  id: string
  side: "left" | "right"
  collapsed: boolean
  onToggle: () => void
  label: string
  children: ReactNode
}

function ChevronIcon({ side, collapsed }: { side: "left" | "right"; collapsed: boolean }) {
  const points =
    side === "left"
      ? collapsed
        ? "6 4 10 8 6 12"
        : "10 4 6 8 10 12"
      : collapsed
        ? "10 4 6 8 10 12"
        : "6 4 10 8 6 12"

  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d={`M${points}`}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Small collapse control — place inside the panel tab bar, not on the canvas. */
export function PanelCollapseButton({
  side,
  collapsed,
  onToggle,
  label,
}: {
  side: "left" | "right"
  collapsed: boolean
  onToggle: () => void
  label: string
}) {
  const action = collapsed ? "Expand" : "Collapse"
  return (
    <button
      type="button"
      className={`panel-collapse-btn panel-collapse-btn--${side}`}
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-label={`${action} ${label}`}
      title={`${action} panel`}
    >
      <ChevronIcon side={side} collapsed={collapsed} />
    </button>
  )
}

export default function CollapsiblePanel({
  id,
  side,
  collapsed,
  onToggle,
  label,
  children,
}: CollapsiblePanelProps) {
  return (
    <aside
      id={id}
      className={`collapsible-panel collapsible-panel--${side}${collapsed ? " is-collapsed" : ""}`}
      aria-label={label}
    >
      {!collapsed ? (
        <div className="collapsible-panel__content">{children}</div>
      ) : (
        <div className="panel-collapsed-rail">
          <PanelCollapseButton
            side={side}
            collapsed
            onToggle={onToggle}
            label={label}
          />
        </div>
      )}
    </aside>
  )
}
