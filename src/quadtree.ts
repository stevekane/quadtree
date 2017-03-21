export enum Kind { Empty, Leaf, Quad }

export type V2 = [ number, number ]
export type V4<T> = [ T, T, T, T ]
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

const { sqrt, pow, floor, abs, min, max } = Math

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

// TODO: quad should have branching power value ... don't calc sqrt.... so slow
export function index ( q: IQuad, [ x, y ]: V2 ): number {
  const bx = sqrt(q.children.length)
  const by = bx
  const halfW = q.dimension[0] / 2
  const halfH = q.dimension[1] / 2
  const minX = q.position[0] - halfW
  const maxX = q.position[0] + halfW
  const minY = q.position[1] - halfH
  const maxY = q.position[1] + halfH
  const nx = (x - minX) / (maxX - minX)
  const ny = (y - minY) / (maxY - minY)
  const cx = floor(nx * bx)
  const cy = floor(ny * by)

  return cy * by + cx
}

// TODO: again, taking sqrt is ridiculous.... remove this at some point
export function positionForIndex ( q: IQuad, i: number ): V2 {
  const bx = sqrt(q.children.length)
  const by = bx
  const [ x, y ] = q.position
  const [ w, h ] = q.dimension
  const l = q.position[0] - q.dimension[0] / 2
  const b = q.position[1] - q.dimension[1] / 2
  const qx = i % bx 
  const qy = floor(i / bx)
  const eachW = w / bx
  const eachH = h / by
  const ox = l + eachW * ( qx + .5 )
  const oy = b + eachH * ( qy + .5 )

  return [ ox, oy ]
}

export function minDistToQuad ( q: IQuad, [ x, y ]: V2 ): number {
  const halfW = q.dimension[0] / 2
  const halfH = q.dimension[1] / 2
  const qx = q.position[0]
  const qy = q.position[1]
  const cx = min(max(x, qx - halfW), qx + halfW)
  const cy = min(max(y, qy - halfH), qy + halfH)
  const dx = x - cx
  const dy = y - cy

  return abs(max(dx, 0)) + abs(max(dy, 0))
}

export function insert ( q: IQuad, p: V2 ) {
  var i = index(q, p)
  var c = q.children[i]

  switch ( c.kind ) {
    case Kind.Empty: 
      q.children[i] = Leaf(p)
      break
    case Kind.Quad:  
      insert(c, p)
      break
    case Kind.Leaf:
      var position = positionForIndex(q, i) 
      var dimension: V2 = [ q.dimension[0] / 2, q.dimension[1] / 2 ]
      var node = Quad(position, dimension)

      q.children[i] = node
      insert(node, c.position)
      insert(node, p)
      break
  }
}

export function nearest ( qt: QT, dfn: DistanceFn, r: number, p: V2 ): V2 | null {
  var quads = [ qt ]
  var found: V2 | null = null
  var q: QT
  var dist: number
  var i: number

  while ( q = quads.pop() as QT ) {
    switch ( q.kind ) {
      case Kind.Leaf:
        dist = dfn(q.position, p)
        if ( dist < r || found == null ) {
          r = dist
          found = q.position
        }
        break
      case Kind.Quad:
        if ( minDistToQuad(q, p) <= r ) {
          i = index(q, p)
          for ( var j = 0; j < q.children.length; j += j + 1 == i ? 2 : 1 ) {
            quads.push(q.children[j]) 
          }
          quads.push(q.children[i])
        }
        break
      case Kind.Empty:
        break
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
