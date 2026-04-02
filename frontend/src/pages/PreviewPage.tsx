import { useEffect, useRef } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import { buildHTML } from "../generator/HTMLGenerator"

interface Props {
  html?: string
}

export default function PreviewPage({ html: htmlProp }: Props) {

  const dashboard = useDashboardStore((s) => s.dashboard)
  const html = htmlProp ?? buildHTML(dashboard)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    iframe.src = url
    return () => URL.revokeObjectURL(url)
  }, [html])

  return (
    <iframe
      ref={iframeRef}
      style={{
        flex: 1,
        border: "none",
        margin: "24px",
        borderRadius: "8px",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05)",
        width: "calc(100% - 48px)",
        height: "calc(100% - 48px)"
      }}
    />
  )

}