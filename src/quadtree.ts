export enum Kind { Empty, Leaf, Quad }

export type V2 = [ number, number ]
export type V4<T> = [ T, T, T, T ]
export type Index = 0 | 1 | 2 | 3
export type DistanceFn = ( v0: V2, v1: V2 ) => number
export type IEmpty = { kind: Kind.Empty }
export type ILeaf = { kind: Kind.Leaf, position: V2 }
export type IQuad = { kind: Kind.Quad, position: V2, dimension: V2, children: V4<QT> }
export type QT = IEmpty | ILeaf | IQuad

const { sqrt, pow, abs, min, max } = Math
const clamp = ( l: number, u: number, v: number ) => min(max(v, l), u)

export const manhattan = ( [ x0, y0 ]: V2, [ x1, y1 ]: V2 ) => abs(x1 - x0) + abs(y1 - y0)
export const euclidean = ( [ x0, y0 ]: V2, [ x1, y1 ]: V2 ) => sqrt(pow(x1 - x0, 2) + pow(y1 - y0, 2))
export const Empty = (): IEmpty =>
  ({ kind: Kind.Empty })
export const Leaf = ( position: V2 ): ILeaf =>
  ({ kind: Kind.Leaf, position })
export const Quad = ( position: V2, dimension: V2 ): IQuad =>
  ({ kind: Kind.Quad, position, dimension, children: [ Empty(), Empty(), Empty(), Empty() ] })

function nearestArray ( nodes: ILeaf[], dfn: DistanceFn, r: number, p: V2 ): null | ILeaf {
  var found = null

  for ( var i = 0, d; i < nodes.length; i++ ) {
    d = dfn(nodes[i].position, p)
    found = found == null || d < dfn(found.position, p) ? nodes[i] : found
  }
  return found
}

function index ( q: IQuad, [ x, y ]: V2 ): Index {
  return x < q.position[0]
    ? y < q.position[1] ? 3 : 0
    : y < q.position[1] ? 2 : 1
}

function positionForIndex ( q: IQuad, i: Index ): V2 {
  var [ x, y ] = q.position
  var [ w, h ] = q.dimension

  switch ( i ) {
    case 0: return [ x - w / 4, y + h / 4 ]
    case 1: return [ x + w / 4, y + h / 4 ]
    case 2: return [ x + w / 4, y - h / 4 ]
    case 3: return [ x - w / 4, y - h / 4 ]
  }
}

export function insert ( q: IQuad, l: ILeaf ) {
  var i = index(q, l.position)
  var c = q.children[i]

  switch ( c.kind ) {
    case Kind.Empty: 
      q.children[i] = l; break
    case Kind.Quad:  
      insert(c, l); break
    case Kind.Leaf:
      var position = positionForIndex(q, i) 
      var dimension: V2 = [ q.dimension[0] / 2, q.dimension[1] / 2 ]
      var node = Quad(position, dimension)

      q.children[i] = node
      insert(node, c)
      insert(node, l)
  }
}

function minDistToQuad ( q: IQuad, [ x, y ]: V2 ): number {
  var halfW = q.dimension[0] / 2
  var halfH = q.dimension[1] / 2
  var qx = q.position[0]
  var qy = q.position[1]
  var cx = clamp(x, qx - halfW, qx + halfW)
  var cy = clamp(y, qy - halfH, qy + halfH)
  var dx = x - cx
  var dy = y - cy

  return abs(dx) + abs(dy)
}

function insideQuad ( q: IQuad, [ x, y ]: V2 ): boolean {
  var halfW = q.dimension[0] / 2
  var halfH = q.dimension[1] / 2
  var t = q.position[1] + halfH
  var r = q.position[0] + halfW
  var b = q.position[1] - halfH
  var l = q.position[0] - halfW
  var inX = x <= l && x > r
  var inY = y <= b && y > t

  return inX && inY
}

export function nearest ( qt: QT, dfn: DistanceFn, r: number, p: V2 ): ILeaf | null {
  var quads = [ qt ]
  var found: ILeaf | null = null
  var q: QT
  var closer: boolean
  var i: number

  while ( q = quads.pop() as QT ) {
    switch ( q.kind ) {
      case Kind.Leaf:
        closer = found == null || dfn(q.position, p) < dfn(found.position, p)
        found = closer ? q : found
        break
      case Kind.Quad: 
        i = index(q, p)
        for ( var j = 0; j < 4; j += j + 1 == i ? 2 : 1 ) {
          quads.push(q.children[j]) 
        }
        quads.push(q.children[i])
        break
    }
  }
  return found
}

export function nearest3 ( qt: QT, dfn: DistanceFn, r: number, p: V2 ): ILeaf | null {
  var quads = [ qt ]
  var found: ILeaf | null = null
  var q: QT
  var dist: number
  var i: number
  var iq: boolean
  var minDist: number

  while ( q = quads.pop() as QT ) {
    switch ( q.kind ) {
      case Kind.Leaf:
        dist = dfn(q.position, p)
        if ( dist < r || found == null ) {
          r = dist
          found = q 
        }
        break
      case Kind.Quad:
        iq = insideQuad(q, p)
        minDist = minDistToQuad(q, p)
        if ( iq || minDist < r ) {
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
 
//  const MAX_NODES = pow(2, 12)
//  const r = Quad([ 0, 0 ], [ 2, 2 ])
//  const target: V2 = [ 0.5, 0.5 ]
//  const nodes = []
//  const log = (x:any, spaces?: number) => console.log(JSON.stringify(x, null, spaces || 2))
//  
//  for ( var i = 0, n; i < MAX_NODES; i++ ) {
//    n = Leaf([ Math.random() * 2 - 1, Math.random() * 2 - 1 ])
//    nodes.push(n)
//    insert(r, n)
//  }
//  
//  function benchmark ( COUNT: number, f: ( ...args: any[] ) => void, ...args: any[] ) {
//    var d: number = 0
//    var r: any
//    var s: number
//    var e: number
//  
//    for ( var i = 0; i < COUNT; i++ ) {
//      s = process.hrtime()[1]
//      r = f(...args) 
//      e = process.hrtime()[1]
//      d += (e - s)
//    }
//    console.log(d / COUNT, r)
//  }
//  
//  console.log(MAX_NODES, 'nodes')
//  benchmark(1, nearestArray, nodes, manhattan, Infinity, target)
//  benchmark(100, nearest, r, manhattan, Infinity, target)
//  benchmark(1, nearest3, r, manhattan, Infinity, target)
