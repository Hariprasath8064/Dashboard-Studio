import { buildHTML } from "../generator/HTMLGenerator.ts"
import { useDashboardStore } from "../store/dashboardStore"

export function exportDashboard(){

 const dashboard = useDashboardStore.getState().dashboard
 const html = buildHTML(dashboard)

 const blob = new Blob([html],{type:"text/html"})

 const url = URL.createObjectURL(blob)

 const a = document.createElement("a")

 a.href = url
 a.download = "dashboard.html"

 document.body.appendChild(a)

 a.click()

 document.body.removeChild(a)

 URL.revokeObjectURL(url)

}