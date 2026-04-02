import { useDashboardStore } from "../store/dashboardStore"

export default function SmartGuides() {

  const guides = useDashboardStore(s => s.guideLines)

  if (!guides.vertical.length && !guides.horizontal.length) return null

  return (
    <div className="smart-guides-layer" aria-hidden="true">

      {guides.vertical.map((x, i) => (
        <div key={`v${i}`} className="guide-line guide-v" style={{ left: x }} />
      ))}

      {guides.horizontal.map((y, i) => (
        <div key={`h${i}`} className="guide-line guide-h" style={{ top: y }} />
      ))}

    </div>
  )

}
