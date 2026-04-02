import { useDashboardStore } from "../store/dashboardStore"
import type { TextWidget } from "../types/widgetTypes"

interface Props{
 widget: TextWidget
}

export default function TextProperties({widget}:Props){

 const updateWidget = useDashboardStore(s=>s.updateWidget)

 return(

  <div className="pp-section">

   <div className="pp-field">

    <label>Heading</label>

    <input
     value={widget.heading}
     onChange={(e)=>
      updateWidget({
       ...widget,
       heading:e.target.value
      })
     }
    />

   </div>

   <div className="pp-field">

    <label>Body</label>

    <textarea
     rows={4}
     value={widget.body}
     onChange={(e)=>
      updateWidget({
       ...widget,
       body:e.target.value
      })
     }
    />

   </div>

  </div>

 )

}