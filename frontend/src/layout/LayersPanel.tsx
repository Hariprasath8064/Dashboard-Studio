import { useDashboardStore } from "../store/dashboardStore"

export default function LayersPanel(){

 const widgets = useDashboardStore(s=>s.dashboard.widgets)
 const selected = useDashboardStore(s=>s.selectedWidgetId)
 const selectWidget = useDashboardStore(s=>s.selectWidget)

 const typeColors: Record<string, string> = {
  bar: '#005EB8',
  line: '#0891b2',
  area: '#06b6d4',
  'stacked-bar': '#6366f1',
  scatter: '#8b5cf6',
  radar: '#f59e0b',
  donut: '#7c3aed',
  pie: '#f59e0b',
  gauge: '#06b6d4',
  timeline: '#ec4899',
  kpi: '#16a34a',
  table: '#d97706',
  text: '#94a3b8'
 }

 const typeLabels: Record<string, string> = {
  bar: 'Bar Chart',
  line: 'Line Chart',
  area: 'Area Chart',
  'stacked-bar': 'Stacked Bar',
  scatter: 'Scatter',
  radar: 'Radar',
  donut: 'Donut',
  pie: 'Pie Chart',
  gauge: 'Gauge',
  timeline: 'Timeline',
  kpi: 'KPI Card',
  table: 'Table',
  text: 'Text'
 }

 if(!widgets.length){
  return(
   <div className="layers-panel">
    <div className="layers-title">Canvas Layers</div>
    <div style={{color:'var(--text3)',fontSize:11,padding:'4px 2px'}}>
     No components yet.
    </div>
   </div>
  )
 }

 return(

  <div className="layers-panel">

   <div className="layers-title">Canvas Layers</div>

   <div className="layers-list">

    {[...widgets].reverse().map(w=>{

     const isActive = selected===w.id

     return(

      <div
       key={w.id}
       className={`layer-item${isActive ? ' active' : ''}`}
       onClick={()=>selectWidget(w.id)}
      >

       <span
        className="layer-dot"
        style={{background: typeColors[w.type] || '#999'}}
       />

       <div className="layer-name">
        {typeLabels[w.type] || w.type}
       </div>

       <div className="layer-type">
        {w.type}
       </div>

      </div>

     )

    })}

   </div>

  </div>

 )

}