import type { TextWidget as TextType } from "../../types/widgetTypes"

interface Props {
  widget: TextType
}

export default function TextWidget({ widget }: Props) {

  return (

    <div className="text-inner">

      <div className="text-wg-h1">
        {widget.heading}
      </div>

      <div className="text-wg-p">
        {widget.body}
      </div>

    </div>

  )

}