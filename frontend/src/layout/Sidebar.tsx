import { useState } from "react"
import ComponentsPanel from "../sidebar/ComponentsPanel"
import DatasetPanel from "../sidebar/DatasetPanel"
import LayersPanel from "../layout/LayersPanel"

export default function Sidebar(){

 const [tab,setTab] = useState<"components"|"data"|"layers">("components")

 return(

  <div id="sidebar">

   <div className="sidebar-tabs">

    <button
     className={tab==="components"?"active":""}
     onClick={()=>setTab("components")}
    >
     Components
    </button>

    <button
     className={tab==="data"?"active":""}
     onClick={()=>setTab("data")}
    >
     Data
    </button>

    <button
     className={tab==="layers"?"active":""}
     onClick={()=>setTab("layers")}
    >
     Layers
    </button>

   </div>

   <div className="sidebar-body">

    {tab==="components" && <ComponentsPanel/>}

    {tab==="data" && <DatasetPanel/>}

    {tab==="layers" && <LayersPanel/>}

   </div>

  </div>

 )
}