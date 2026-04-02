import { useDashboardStore } from "../../store/dashboardStore"

export default function LayoutPanel({widget}:any){

 const updateWidget = useDashboardStore(s=>s.updateWidget)

 function updatePosition(field:string,value:number){
  updateWidget({
   ...widget,
   position:{
    ...widget.position,
    [field]:value
   }
  })
 }

 function updateSize(field:string,value:number){
  updateWidget({
   ...widget,
   size:{
    ...widget.size,
    [field]:value
   }
  })
 }

 return(

  <div className="pp-section">

   <div className="pp-section-title">Layout</div>

   <div className="pp-row">
    <span className="pp-label">X / Y</span>
    <input
     className="pp-input small"
     type="number"
     value={Math.round(widget.position.x)}
     onChange={(e)=>updatePosition("x",Number(e.target.value))}
    />
    <input
     className="pp-input small"
     type="number"
     value={Math.round(widget.position.y)}
     onChange={(e)=>updatePosition("y",Number(e.target.value))}
    />
   </div>

   <div className="pp-row">
    <span className="pp-label">W / H</span>
    <input
     className="pp-input small"
     type="number"
     value={widget.size.width}
     onChange={(e)=>updateSize("width",Number(e.target.value))}
    />
    <input
     className="pp-input small"
     type="number"
     value={widget.size.height}
     onChange={(e)=>updateSize("height",Number(e.target.value))}
    />
   </div>

  </div>

 )
}