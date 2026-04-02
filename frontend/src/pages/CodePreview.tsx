import { useMemo, useState } from "react"

interface Props {
 code: string
}
function highlightHTML(line:string){

 const escaped = line
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")

 return escaped
  .replace(/(&lt;\/?[a-zA-Z0-9-]+)/g,'<span class="code-tag">$1</span>')
  .replace(/([a-zA-Z-]+)=/g,'<span class="code-attr">$1</span>=')
  .replace(/"([^"]*)"/g,'<span class="code-string">"$1"</span>')
}
export default function CodePreview({ code }: Props) {

 const [copied, setCopied] = useState(false)

 const normalizedCode = useMemo(() => {
    const normalized = code.replace(/\r\n/g, "\n").trim()
    if (normalized.includes("\n")) {
       return normalized
    }
    return normalized.replace(/>\s*</g, ">\n<")
 }, [code])

 const lines = useMemo(() => normalizedCode.split("\n"), [normalizedCode])

 async function handleCopy(){
  try{
   await navigator.clipboard.writeText(normalizedCode)
   setCopied(true)
   setTimeout(()=>setCopied(false),1200)
  }catch(err){
   console.error("Failed to copy HTML",err)
  }
 }

 return (

    <div className="code-preview">

   <div className="code-preview-toolbar">
    <span>Generated HTML</span>
    <div style={{flex:1}}/>
    <button
     type="button"
     className={`code-preview-copy${copied ? " copied" : ""}`}
     onClick={handleCopy}
    >
     {copied ? "✓ Copied" : "Copy HTML"}
    </button>
   </div>

   <div className="code-preview-body">

    <div
     className="code-editor"
     role="textbox"
     aria-label="Generated HTML"
    >
     {lines.map((line, index) => (
      <div key={`code-line-${index}`} className="code-line">
       <span className="code-line-number">{index + 1}</span>
       <span
            className="code-line-content"
            dangerouslySetInnerHTML={{
            __html: highlightHTML(line.length ? line : " ")
            }}
        />
      </div>
     ))}
    </div>

   </div>

  </div>

 )

}