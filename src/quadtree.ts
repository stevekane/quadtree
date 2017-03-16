type V2 = [ number, number ]
type V4<T> = [ T, T, T, T ]
type Index = 0 | 1 | 2 | 3
type DistanceFn = ( v0: V2, v1: V2 ) => number
type ILeaf<T> = { id: number, leaf: true, position: V2 }
type IQuad<T> = { leaf: false, position: V2, dimension: V2, children: V4<QT<T> | null> }
type QT<T> = ILeaf<T> | IQuad<T>

const { sqrt, pow, abs, min } = Math
const manhattan = ( [ x0, y0 ]: V2, [ x1, y1 ]: V2 ) => abs(x1 - x0) + abs(y1 - y0)
const euclidean = ( [ x0, y0 ]: V2, [ x1, y1 ]: V2 ) => sqrt(pow(x1 - x0, 2) + pow(y1 - y0, 2))

const Quad = <T> ( position: V2, dimension: V2 ): IQuad<T> =>
  ({ leaf: false, position, dimension, children: [ null, null, null, null ] })
const Leaf = <T> ( id: number, position: V2 ): ILeaf<T> =>
  ({ leaf: true, id, position })

function index<T> ( q: IQuad<T>, [ x, y ]: V2 ): Index {
  return x < q.position[0]
    ? y < q.position[1] ? 3 : 0
    : y < q.position[1] ? 2 : 1
}

function positionForIndex<T> ( q: IQuad<T>, i: Index ): V2 {
  var [ x, y ] = q.position
  var [ w, h ] = q.dimension

  switch ( i ) {
    case 0: return [ x - w / 2, y + h / 2 ]
    case 1: return [ x + w / 2, y + y / 2 ]
    case 2: return [ x + w / 2, y - y / 2 ]
    case 3: return [ x - w / 2, y - y / 2 ]
  }
}

function insert<T> ( q: IQuad<T>, l: ILeaf<T> ) {
  var i = index(q, l.position)
  var c = q.children[i]

  if ( c === null ) {
    q.children[i] = l
  }
  else if ( !c.leaf ) {
    insert(c, l)
  }
  else {
    var position = positionForIndex(q, i) 
    var dimension: V2 = [ q.dimension[0] / 2, q.dimension[1] / 2 ]
    var node = Quad(position, dimension)

    q.children[i] = node
    insert(node, c)
    insert(node, l)
  }
}

function nearestArray <T> ( nodes: ILeaf<T>[], dfn: DistanceFn, r: number, p: V2 ): null | ILeaf<T> {
  var found = null

  for ( var i = 0, d; i < nodes.length; i++ ) {
    d = dfn(nodes[i].position, p)
    found = found == null || d < dfn(found.position, p) ? nodes[i] : found
  }
  return found
}

function minDistToQuad <T> ( q: IQuad<T>, [ x, y ]: V2 ): number {
  var halfW = q.dimension[0] / 2
  var halfH = q.dimension[1] / 2
  var cx = q.position[0]
  var cy = q.position[1]
  var d1x = abs(x - cx + halfW)
  var d2x = abs(x - cx - halfW)
  var d1y = abs(y - cy + halfH)
  var d2y = abs(y - cy - halfH)

  return min(d1x, d2x, d1y, d2y)
}

function nearest <T> ( q: QT<T>, dfn: DistanceFn, r: number, p: V2 ): ILeaf<T> | null {
  function proximity <T>( q1: QT<T>, q2: QT<T> ): number {
    if ( q1 == null || q1.leaf ) return 1
    if ( q2 == null || q2.leaf ) return -1
   
    return dfn(q1.position, p) > dfn(q2.position, p) ? 1 : -1
  }

  function search ( w: ILeaf<T> | null, c: QT<T> ): ILeaf<T> | null {
    if ( c == null ) return w
    if ( c.leaf ) {
      if ( w == null ) return c 
      else             return dfn(c.position, p) < r ? c : w
    }

    const md = minDistToQuad(c, p)
    const wd = w == null ? r : dfn(w.position, p)

    if ( md > wd ) return w
    
    const n = nearest(c, dfn, wd, p) 

    if      ( w == null ) return n
    else if ( n == null ) return w
    else                  return dfn(n.position, p) < wd ? n : w
  }

  if      ( q == null ) return null
  else if ( q.leaf )    return dfn(q.position, p) < r ? q : null
  else                  return q.children
                                .slice(0)
                                .sort(proximity)
                                .reduce(search, null as null | ILeaf<T>) as null | ILeaf<T>
}

const MAX_NODES = pow(2, 14)
const r = Quad([ 0, 0 ], [ 1, 1 ])
const target: V2 = [ 0.5, 0.5 ]
const nodes = []

for ( var i = 0, n; i < MAX_NODES; i++ ) {
  n = Leaf(i, [ Math.random() * 2 - 1, Math.random() * 2 - 1 ])
  nodes.push(n)
  insert(r, n)
}

const pdarray = nearestArray(nodes, euclidean, Infinity, target)
const pdqt = nearest(r, euclidean, Infinity, target)
if ( pdarray != null && pdqt != null ) {
  console.log(pdarray, euclidean(pdarray.position, target))
  console.log(pdqt, euclidean(pdqt.position, target))
}
