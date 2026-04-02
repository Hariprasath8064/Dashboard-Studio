interface Props {
  show: boolean
}

export default function CanvasGrid({ show }: Props) {

 if (!show) return null

 const cols = 12
 const gap = 20
 const width = 1200

 const colWidth=(width-gap*(cols-1))/cols

 return(

  <div className="grid-overlay">

   {Array.from({length:cols}).map((_,i)=>{

    const left=i*(colWidth+gap)

    return(
     <div
      key={i}
      className="grid-col"
      style={{left,width:colWidth}}
     />
    )

   })}

  </div>

 )

}