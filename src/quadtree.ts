enum Kind { Empty, Leaf, Quad }

type V2 = [ number, number ]
type V4<T> = [ T, T, T, T ]
type Index = 0 | 1 | 2 | 3
type DistanceFn = ( v0: V2, v1: V2 ) => number
type IEmpty = { kind: Kind.Empty }
type ILeaf = { kind: Kind.Leaf, position: V2 }
type IQuad = { kind: Kind.Quad, position: V2, dimension: V2, children: V4<QT> }
type QT = IEmpty | ILeaf | IQuad

const { sqrt, pow, abs, min } = Math
const manhattan = ( [ x0, y0 ]: V2, [ x1, y1 ]: V2 ) => abs(x1 - x0) + abs(y1 - y0)
const euclidean = ( [ x0, y0 ]: V2, [ x1, y1 ]: V2 ) => sqrt(pow(x1 - x0, 2) + pow(y1 - y0, 2))

const Empty = (): IEmpty =>
  ({ kind: Kind.Empty })
const Leaf = ( position: V2 ): ILeaf =>
  ({ kind: Kind.Leaf, position })
const Quad = ( position: V2, dimension: V2 ): IQuad =>
  ({ kind: Kind.Quad, position, dimension, children: [ Empty(), Empty(), Empty(), Empty() ] })

function index ( q: IQuad, [ x, y ]: V2 ): Index {
  return x < q.position[0]
    ? y < q.position[1] ? 3 : 0
    : y < q.position[1] ? 2 : 1
}

function positionForIndex ( q: IQuad, i: Index ): V2 {
  var [ x, y ] = q.position
  var [ w, h ] = q.dimension

  switch ( i ) {
    case 0: return [ x - w / 2, y + h / 2 ]
    case 1: return [ x + w / 2, y + y / 2 ]
    case 2: return [ x + w / 2, y - y / 2 ]
    case 3: return [ x - w / 2, y - y / 2 ]
  }
}

function insert ( q: IQuad, l: ILeaf ) {
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

function nearestArray ( nodes: ILeaf[], dfn: DistanceFn, r: number, p: V2 ): null | ILeaf {
  var found = null

  for ( var i = 0, d; i < nodes.length; i++ ) {
    d = dfn(nodes[i].position, p)
    found = found == null || d < dfn(found.position, p) ? nodes[i] : found
  }
  return found
}

function minDistToQuad ( q: IQuad, [ x, y ]: V2 ): number {
  var dx = x - q.position[0]
  var dy = y - q.position[1]
  var halfW = q.dimension[0] / 2
  var halfH = q.dimension[1] / 2

  return min(abs(dx + halfW), abs(dx - halfW), abs(dy + halfH), abs(dy - halfH))
}

function nearest ( qt: QT, dfn: DistanceFn, r: number, p: V2 ): ILeaf | null {
  var quads = [ qt ]
  var q: QT
  var found: ILeaf | null = null
  var dist

  while ( quads.length > 0 ) {
    q = quads.pop() as QT
    switch ( q.kind ) {
      case Kind.Empty:
        break
      case Kind.Leaf:
        dist = dfn(q.position, p)
        if ( dist < r ) {
          r = dist
          found = q
        }
        break
      case Kind.Quad:
        if ( minDistToQuad(q, p) < r ) {
          quads.unshift(...q.children) 
        }
    }
  }
  return found
}

// function proximity ( dfn: DistanceFn, p: V2 ) {
//   return function  ( q1: IQuad, q2: IQuad ): number {
//     if ( q1.kind == Kind.Empty || q1.kind == Kind.Empty ) return 1
//     if ( q2.kind == Kind.Empty || q2.kind == Kind.Empty ) return -1
//    
//     return dfn(q1.position, p) > dfn(q2.position, p) ? 1 : -1
//   }
// }

const MAX_NODES = pow(2, 6)
const r = Quad([ 0, 0 ], [ 1, 1 ])
const target: V2 = [ 0.5, 0.5 ]
const nodes = []
const log = (x:any, spaces?: number) => console.log(JSON.stringify(x, null, spaces || 2))

for ( var i = 0, n; i < MAX_NODES; i++ ) {
  n = Leaf([ Math.random() * 2 - 1, Math.random() * 2 - 1 ])
  nodes.push(n)
  insert(r, n)
}

const pdarray = nearestArray(nodes, euclidean, Infinity, target)
const pdqt = nearest(r, euclidean, Infinity, target)

if ( pdarray != null && pdqt != null ) {
  console.log(pdarray, euclidean(pdarray.position, target))
  console.log(pdqt, euclidean(pdqt.position, target))
  // console.log(nodes.map(n => euclidean(n.position, target)))
}
