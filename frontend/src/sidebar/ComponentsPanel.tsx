export default function ComponentsPanel(){

 function startDrag(e:React.DragEvent,type:string){
  e.dataTransfer.setData("component-type",type)
 }

 function card(type:string, label:string, icon:React.ReactNode){

  return(

   <div
    className="comp-card"
    draggable
    onDragStart={(e)=>startDrag(e,type)}
   >

    <div className="comp-icon">{icon}</div>

    <div className="comp-name">{label}</div>

   </div>

  )

 }

 const icons = {
  bar: (
   <svg viewBox="0 0 16 16" fill="none">
    <rect x="1" y="5" width="3.5" height="9" rx="1" fill="#005EB8"/>
    <rect x="6.25" y="2" width="3.5" height="12" rx="1" fill="#005EB8" opacity=".7"/>
    <rect x="11.5" y="7" width="3.5" height="7" rx="1" fill="#005EB8" opacity=".45"/>
   </svg>
  ),
  line: (
   <svg viewBox="0 0 16 16" fill="none">
    <path d="M1 12L4.5 7l3 3.5L11 5l4 3" stroke="#005EB8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
   </svg>
  ),
  donut: (
   <svg viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke="#e2e8f0" strokeWidth="3"/>
    <path d="M8 1.5a6.5 6.5 0 016.5 6.5" stroke="#005EB8" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="8" cy="8" r="3" fill="white"/>
   </svg>
  ),
  pie: (
   <svg viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke="#e2e8f0" strokeWidth="1"/>
    <path d="M8 8L14.5 8A6.5 6.5 0 008 1.5Z" fill="#005EB8"/>
    <path d="M8 8L14.5 8A6.5 6.5 0 0 1 3 13Z" fill="#16a34a" opacity=".7"/>
    <path d="M8 8L3 13A6.5 6.5 0 0 1 8 1.5Z" fill="#f59e0b" opacity=".6"/>
   </svg>
  ),
  gauge: (
   <svg viewBox="0 0 16 16" fill="none">
    <path d="M2 12a6 6 0 0112 0" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M2 12a6 6 0 019-5.2" stroke="#005EB8" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="8" cy="12" r="1.5" fill="#005EB8"/>
   </svg>
  ),
  timeline: (
   <svg viewBox="0 0 16 16" fill="none">
    <rect x="1"  y="3"  width="7"  height="2.5" rx=".8" fill="#005EB8"/>
    <rect x="1"  y="7"  width="11" height="2.5" rx=".8" fill="#005EB8" opacity=".65"/>
    <rect x="1"  y="11" width="5"  height="2.5" rx=".8" fill="#005EB8" opacity=".4"/>
   </svg>
  ),
  kpi: (
   <svg viewBox="0 0 16 16" fill="none">
    <rect x="2" y="4" width="12" height="8" rx="2" fill="#eff6ff" stroke="#005EB8" strokeWidth="1"/>
    <text x="8" y="9.5" textAnchor="middle" fontSize="5.5" fill="#005EB8" fontWeight="700" fontFamily="sans-serif">KPI</text>
   </svg>
  ),
  table: (
   <svg viewBox="0 0 16 16" fill="none">
    <rect x="1" y="2.5" width="14" height="11" rx="1.5" stroke="#005EB8" strokeWidth="1" fill="none"/>
    <line x1="1" y1="6" x2="15" y2="6" stroke="#005EB8" strokeWidth=".8"/>
    <line x1="5.5" y1="6" x2="5.5" y2="13.5" stroke="#005EB8" strokeWidth=".8"/>
    <line x1="10.5" y1="6" x2="10.5" y2="13.5" stroke="#005EB8" strokeWidth=".8"/>
   </svg>
  ),
  text: (
   <svg viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="2" rx="1" fill="#005EB8" opacity=".8"/>
    <rect x="2" y="7" width="9" height="2" rx="1" fill="#005EB8" opacity=".5"/>
    <rect x="2" y="11" width="11" height="2" rx="1" fill="#005EB8" opacity=".35"/>
   </svg>
  )
 }

 return(

  <div>

   <div className="section-label">Charts</div>

   <div className="comp-grid">
    {card("bar","Bar Chart",icons.bar)}
    {card("line","Line Chart",icons.line)}
    {card("donut","Donut",icons.donut)}
    {card("pie","Pie Chart",icons.pie)}
    {card("gauge","Gauge",icons.gauge)}
    {card("timeline","Timeline",icons.timeline)}
   </div>

   <div className="section-label">Widgets</div>

   <div className="comp-grid">
    {card("kpi","KPI Card",icons.kpi)}
    {card("table","Table",icons.table)}
    {card("text","Text",icons.text)}
   </div>

  </div>

 )

}