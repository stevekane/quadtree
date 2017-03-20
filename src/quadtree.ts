export enum Kind { Empty, Leaf, Quad }

export type V2 = [ number, number ]
export type V4<T> = [ T, T, T, T ]
export type Index = 0 | 1 | 2 | 3
export type DistanceFn = ( v0: V2, v1: V2 ) => number
export type IEmpty = { 
  kind: Kind.Empty
}
export type ILeaf = { 
  kind: Kind.Leaf, 
  position: V2
}
export type IQuad = { 
  kind: Kind.Quad, 
  position: V2, 
  dimension: V2, 
  children: V4<QT>
}
export type QT 
  = IEmpty 
  | ILeaf 
  | IQuad

const { sqrt, pow, abs, min, max } = Math
const clamp = ( l: number, u: number, v: number ) => 
  min(max(v, l), u)
export const manhattan = ( [ x0, y0 ]: V2, [ x1, y1 ]: V2 ) => 
  abs(x1 - x0) + abs(y1 - y0)
export const euclidean = ( [ x0, y0 ]: V2, [ x1, y1 ]: V2 ) => 
  sqrt(pow(x1 - x0, 2) + pow(y1 - y0, 2))

export const Empty = (): IEmpty => ({ 
  kind: Kind.Empty 
})
export const Leaf = ( position: V2 ): ILeaf => ({
  kind: Kind.Leaf, 
  position
})
export const Quad = ( position: V2, dimension: V2 ): IQuad => ({ 
  kind: Kind.Quad, 
  position, 
  dimension, 
  children: [ Empty(), Empty(), Empty(), Empty() ]
})

export function index ( q: IQuad, [ x, y ]: V2 ): Index {
  return x < q.position[0]
    ? y < q.position[1] ? 2 : 0
    : y < q.position[1] ? 3 : 1
}

export function positionForIndex ( q: IQuad, i: Index ): V2 {
  var [ x, y ] = q.position
  var [ w, h ] = q.dimension

  switch ( i ) {
    case 0: return [ x - w / 4, y + h / 4 ] // ul
    case 1: return [ x + w / 4, y + h / 4 ] // ur
    case 2: return [ x - w / 4, y - h / 4 ] // ll
    case 3: return [ x + w / 4, y - h / 4 ] // lr
  }
}

export function minDistToQuad ( q: IQuad, [ x, y ]: V2 ): number {
  var halfW = q.dimension[0] / 2
  var halfH = q.dimension[1] / 2
  var qx = q.position[0]
  var qy = q.position[1]
  var cx = min(max(x, qx - halfW), qx + halfW)
  var cy = min(max(y, qy - halfH), qy + halfH)
  var dx = x - cx
  var dy = y - cy

  return cx != x || cy != y 
    ? abs(dx) + abs(dy)
    : 0
}

export function insideQuad ( q: IQuad, [ x, y ]: V2 ): boolean {
  var halfW = q.dimension[0] / 2
  var halfH = q.dimension[1] / 2
  var t = q.position[1] + halfH
  var r = q.position[0] + halfW
  var b = q.position[1] - halfH
  var l = q.position[0] - halfW
  var inX = x >= l && x < r
  var inY = y >= b && y < t

  return inX && inY
}


export function insert ( q: IQuad, p: V2 ) {
  var i = index(q, p)
  var c = q.children[i]

  switch ( c.kind ) {
    case Kind.Empty: 
      q.children[i] = Leaf(p); break
    case Kind.Quad:  
      insert(c, p); break
    case Kind.Leaf:
      var position = positionForIndex(q, i) 
      var dimension: V2 = [ q.dimension[0] / 2, q.dimension[1] / 2 ]
      var node = Quad(position, dimension)

      q.children[i] = node
      insert(node, c.position)
      insert(node, p)
  }
}

export function nearest ( qt: QT, dfn: DistanceFn, r: number, p: V2 ): V2 | null {
  var quads = [ qt ]
  var found: V2 | null = null
  var q: QT
  var dist: number
  var i: number
  var minDist: number

  while ( q = quads.pop() as QT ) {
    switch ( q.kind ) {
      case Kind.Empty:
        break
      case Kind.Leaf:
        dist = dfn(q.position, p)
        if ( dist < r || found == null ) {
          r = dist
          found = q.position
        }
        break
      case Kind.Quad:
        minDist = minDistToQuad(q, p)
        if ( minDist <= r ) {
          i = index(q, p)
          for ( var j = 0; j < 4; j += j + 1 == i ? 2 : 1 ) {
            quads.push(q.children[j]) 
          }
          quads.push(q.children[i])
        }
    }
  }
  return found
}

export function traverse ( f: ( q: QT ) => void, qt: QT ) {
  f(qt)
  if ( qt.kind != Kind.Quad ) return
  for ( var i = 0; i < qt.children.length; i++ ) {
    traverse(f, qt.children[i]) 
  }
}
