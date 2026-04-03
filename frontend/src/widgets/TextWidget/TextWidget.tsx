import type { TextWidget as TextType } from "../../types/widgetTypes"

interface Props {
  widget: TextType
}

export default function TextWidget({ widget }: Props) {

  const headingStyle: React.CSSProperties = {
    fontSize:   `${widget.headingSize ?? 18}px`,
    color:      widget.headingColor  || undefined,
    fontWeight: widget.headingBold   ? 700 : 500,
    fontStyle:  widget.headingItalic ? "italic" : "normal",
    textAlign:  widget.headingAlign  || "left",
    fontFamily: widget.headingFont   || "inherit",
    lineHeight: 1.3,
    marginBottom: 6,
  }

  const bodyStyle: React.CSSProperties = {
    fontSize:       `${widget.bodySize ?? 13}px`,
    color:          widget.bodyColor     || undefined,
    fontWeight:     widget.bodyBold      ? 700 : 400,
    fontStyle:      widget.bodyItalic    ? "italic" : "normal",
    textDecoration: widget.bodyUnderline ? "underline" : "none",
    textAlign:      widget.bodyAlign     || "left",
    fontFamily:     widget.bodyFont      || "inherit",
    lineHeight:     1.6,
  }

  return (

    <div className="text-inner">

      <div className="text-wg-h1" style={headingStyle}>
        {widget.heading}
      </div>

      <div className="text-wg-p" style={bodyStyle}>
        {widget.body}
      </div>

    </div>

  )

}
