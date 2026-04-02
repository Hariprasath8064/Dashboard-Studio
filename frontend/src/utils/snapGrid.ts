export function snap(value:number,grid=20){
 return Math.round(value/grid)*grid
}

interface Rect { x: number; y: number; w: number; h: number }
interface GuideLines { vertical: number[]; horizontal: number[] }

export function snapToEdges(
  target: Rect,
  others: Rect[],
  threshold = 8
): { x: number; y: number; guides: GuideLines } {

  let { x, y } = target
  const { w, h } = target
  const guides: GuideLines = { vertical: [], horizontal: [] }
  let snappedX = false
  let snappedY = false

  for (const o of others) {

    if (!snappedX) {
      const checks = [
        { mine: x,         ref: o.x,         adj: 0       },  // left → left
        { mine: x,         ref: o.x + o.w,   adj: 0       },  // left → right
        { mine: x + w,     ref: o.x,         adj: -w      },  // right → left
        { mine: x + w,     ref: o.x + o.w,   adj: -w      },  // right → right
        { mine: x + w / 2, ref: o.x + o.w/2, adj: -w / 2  },  // center → center
      ]
      for (const c of checks) {
        if (Math.abs(c.mine - c.ref) < threshold) {
          x = c.ref + c.adj
          guides.vertical.push(c.ref)
          snappedX = true
          break
        }
      }
    }

    if (!snappedY) {
      const checks = [
        { mine: y,         ref: o.y,         adj: 0       },  // top → top
        { mine: y,         ref: o.y + o.h,   adj: 0       },  // top → bottom
        { mine: y + h,     ref: o.y,         adj: -h      },  // bottom → top
        { mine: y + h,     ref: o.y + o.h,   adj: -h      },  // bottom → bottom
        { mine: y + h / 2, ref: o.y + o.h/2, adj: -h / 2  },  // center → center
      ]
      for (const c of checks) {
        if (Math.abs(c.mine - c.ref) < threshold) {
          y = c.ref + c.adj
          guides.horizontal.push(c.ref)
          snappedY = true
          break
        }
      }
    }

    if (snappedX && snappedY) break
  }

  return { x, y, guides }
}