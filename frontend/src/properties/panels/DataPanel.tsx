import { useDashboardStore } from "../../store/dashboardStore"

export default function DataPanel({widget}:any){

 const dataset = useDashboardStore(s=>s.dashboard.dataset)
 const updateWidget = useDashboardStore(s=>s.updateWidget)

 if(!dataset){
  return <div>No dataset loaded</div>
 }

 function update(field:string,value:any){

  updateWidget({
   ...widget,
   query:{
    ...widget.query,
    [field]:value
   }
  })

 }

 return(

  <div className="pp-section">

   <div className="pp-section-title">
    Data
   </div>

   <div className="pp-row">

    <label className="pp-label">
     Chart Title
    </label>

    <input
     className="pp-input"
     value={widget.title || ""}
     onChange={(e)=>
      updateWidget({
       ...widget,
       title:e.target.value
      })
     }
    />

   </div>

   <div className="pp-row">

    <label className="pp-label">
     X Axis
    </label>

    <select
     className="pp-select"
     value={widget.query?.xColumn || ""}
     onChange={(e)=>update("xColumn",e.target.value)}
    >

     <option value="">Select Column</option>

     {dataset.columns.map((c:any)=>(
      <option key={c.name} value={c.name}>
       {c.name}
      </option>
     ))}

    </select>

   </div>

   <div className="pp-row">

    <label className="pp-label">
     Y Axis
    </label>

    <select
     className="pp-select"
     value={widget.query?.yColumn || ""}
     onChange={(e)=>update("yColumn",e.target.value)}
    >

     <option value="">Select Column</option>

     {dataset.columns.map((c:any)=>(
      <option key={c.name} value={c.name}>
       {c.name}
      </option>
     ))}

    </select>

   </div>

   <div className="pp-row">

    <label className="pp-label">
     Aggregation
    </label>

    <select
     className="pp-select"
     value={widget.query?.aggregation || "SUM"}
     onChange={(e)=>update("aggregation",e.target.value)}
    >

     <option value="SUM">SUM</option>
     <option value="AVG">AVG</option>
     <option value="COUNT">COUNT</option>
     <option value="MIN">MIN</option>
     <option value="MAX">MAX</option>

    </select>

   </div>

  </div>

 )

}