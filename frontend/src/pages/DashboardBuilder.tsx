import { useEffect } from "react"

import Topbar         from "../layout/Topbar"
import Sidebar        from "../layout/Sidebar"
import Canvas         from "../canvas/Canvas"
import PropertiesPanel from "../layout/PropertiesPanel"
import TrashZone      from "../layout/TrashZone"
import DrillDownModal from "../widgets/DrillDown/DrillDownModal"

import CodePreview from "./CodePreview"
import PreviewPage from "./PreviewPage"
import BigfixQueryPage from "./BigfixQueryPage"

import { useDashboardStore } from "../store/dashboardStore"
import { buildHTML }         from "../generator/HTMLGenerator.ts"

import "../styles/dashboard.css"

export default function DashboardBuilder(){

 const dashboard        = useDashboardStore(s => s.dashboard)
 const undo             = useDashboardStore(s => s.undo)
 const redo             = useDashboardStore(s => s.redo)
 const copySelected     = useDashboardStore(s => s.copySelected)
 const pasteWidgets     = useDashboardStore(s => s.pasteWidgets)
 const duplicateSelected = useDashboardStore(s => s.duplicateSelected)
 const deleteSelected   = useDashboardStore(s => s.deleteSelected)
 const setSelection     = useDashboardStore(s => s.setSelection)

 const view    = useDashboardStore(s => s.builderView)
 const setView = useDashboardStore(s => s.setBuilderView)

 useEffect(() => {
  function onKeyDown(e: KeyboardEvent) {

   const mod    = e.ctrlKey || e.metaKey
   const tag    = (document.activeElement as HTMLElement)?.tagName
   const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"

   if (mod && !isInput) {
    if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo();              return }
    if (e.key === "y" || (e.key === "z" && e.shiftKey)) { e.preventDefault(); redo(); return }
    if (e.key === "c") { e.preventDefault(); copySelected();      return }
    if (e.key === "v") { e.preventDefault(); pasteWidgets();      return }
    if (e.key === "d") { e.preventDefault(); duplicateSelected(); return }
    if (e.key === "a") {
     e.preventDefault()
     setSelection(useDashboardStore.getState().dashboard.widgets.map(w => w.id))
     return
    }
   }

   if ((e.key === "Delete" || e.key === "Backspace") && !isInput) {
    e.preventDefault()
    deleteSelected()
   }

  }

  document.addEventListener("keydown", onKeyDown)
  return () => document.removeEventListener("keydown", onKeyDown)
 }, [undo, redo, copySelected, pasteWidgets, duplicateSelected, deleteSelected, setSelection])

 const bigfixSources = useDashboardStore(s => s.bigfixDataSources)
 const htmlCode = buildHTML(dashboard, bigfixSources)

 return(

  <div className="app-root">

   <Topbar view={view} setView={setView}/>

   {view==="design" && (

    <div className="main-layout">

     <Sidebar/>

     <Canvas/>

     <PropertiesPanel/>

    </div>

   )}

   {view==="preview" && (
    <div className="code-view">
     <PreviewPage html={htmlCode}/>
    </div>
   )}

   {view==="code" && (
    <div className="code-view">
     <CodePreview code={htmlCode}/>
    </div>
   )}

   {view==="query" && <BigfixQueryPage />}

   {view==="design" && <TrashZone/>}

   {view==="design" && <DrillDownModal/>}

  </div>

 )

}

