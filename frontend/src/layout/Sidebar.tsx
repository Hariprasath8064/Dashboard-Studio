import { useState } from "react"
import CollapsiblePanel, { PanelCollapseButton } from "../components/CollapsiblePanel"
import ComponentsPanel from "../sidebar/ComponentsPanel"
import LayersPanel from "../layout/LayersPanel"
import ThemePanel from "../theme/ThemePanel"
import { useDashboardStore } from "../store/dashboardStore"

type LeftTab = "components" | "layers" | "theme"

export default function Sidebar() {
  const [tab, setTab] = useState<LeftTab>("components")
  const collapsed = useDashboardStore(s => s.leftPanelCollapsed)
  const toggle = useDashboardStore(s => s.toggleLeftPanel)

  return (
    <CollapsiblePanel
      id="sidebar"
      side="left"
      collapsed={collapsed}
      onToggle={toggle}
      label="Components panel"
    >
      <div className="panel-tab-bar panel-tab-bar--left">
        <div className="sidebar-tabs">
          <button
            type="button"
            className={tab === "components" ? "active" : ""}
            onClick={() => setTab("components")}
          >
            Components
          </button>
          <button
            type="button"
            className={tab === "layers" ? "active" : ""}
            onClick={() => setTab("layers")}
          >
            Layers
          </button>
          <button
            type="button"
            className={tab === "theme" ? "active" : ""}
            onClick={() => setTab("theme")}
          >
            Theme
          </button>
        </div>
        <PanelCollapseButton
          side="left"
          collapsed={false}
          onToggle={toggle}
          label="Components panel"
        />
      </div>

      <div className="sidebar-body">
        {tab === "components" && <ComponentsPanel />}
        {tab === "layers" && <LayersPanel />}
        {tab === "theme" && (
          <div className="sidebar-theme-tab">
            <ThemePanel />
          </div>
        )}
      </div>
    </CollapsiblePanel>
  )
}
