import JSZip from "jszip"

export async function exportZip(files:any){

 const zip = new JSZip()

 Object.entries(files).forEach(([name,content])=>{
  zip.file(name,content as string)
 })

 const blob = await zip.generateAsync({type:"blob"})

 const url = URL.createObjectURL(blob)

 const a = document.createElement("a")

 a.href = url
 a.download = "dashboard.zip"

 a.click()

}