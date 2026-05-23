import { useState } from "react"
import ComponentsPanel from "../sidebar/ComponentsPanel"
import LayersPanel from "../layout/LayersPanel"
import ThemePanel from "../theme/ThemePanel"

type LeftTab = "components" | "layers" | "theme"

export default function Sidebar() {
  const [tab, setTab] = useState<LeftTab>("components")

  return (
    <div id="sidebar">
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

      <div className="sidebar-body">
        {tab === "components" && <ComponentsPanel />}
        {tab === "layers" && <LayersPanel />}
        {tab === "theme" && (
          <div className="sidebar-theme-tab">
            <ThemePanel />
          </div>
        )}
      </div>
    </div>
  )
}
