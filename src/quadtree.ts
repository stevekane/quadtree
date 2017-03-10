type V2<T> = [ T, T ]
type V4<T> = [ T, T, T, T ]
type Index = 0 | 1 | 2 | 3

const { sqrt, pow } = Math

interface ILeaf<T> { 
  leaf: true
  position: V2<number>
}

interface IQuad<T> {
  leaf: false
  position: V2<number>
  dimension: V2<number>
  children: V4<QT<T>>
}

type QT<T>
  = ILeaf<T>
  | IQuad<T>
  | null

const Quad = <T>( position: V2<number>, dimension: V2<number> ): IQuad<T> => ({ 
  leaf: false,
  position,
  dimension,
  children: [ null, null, null, null ]
})

const Leaf = <T>( position: V2<number> ): ILeaf<T> => ({
  leaf: true,
  position
})

function index<T> ( q: IQuad<T>, p: V2<number> ): Index {
  return p[0] < q.position[0]
    ? p[1] < q.position[1] ? 3 : 0
    : p[1] < q.position[1] ? 2 : 1
}

function positionForIndex<T> ( q: IQuad<T>, i: Index ): V2<number> {
  switch ( i ) {
    case 0: return [ q.position[0] - q.dimension[0] / 2, q.position[1] + q.dimension[1] / 2 ]
    case 1: return [ q.position[0] + q.dimension[0] / 2, q.position[1] + q.dimension[1] / 2 ]
    case 2: return [ q.position[0] + q.dimension[0] / 2, q.position[1] - q.dimension[1] / 2 ]
    case 3: return [ q.position[0] - q.dimension[0] / 2, q.position[1] + q.dimension[1] / 2 ]
  }
}

function insert<T> ( q: IQuad<T>, l: ILeaf<T> ) {
  var i = index(q, l.position)
  var c = q.children[i]

  if ( c === null ) {
    q.children[i] = l
  }
  else if ( !c.leaf ){
    insert(c, l)
  }
  else {
    var position = positionForIndex(q, i) 
    var dimension: V2<number> = [ q.dimension[0] / 2, q.dimension[1] / 2 ]
    var node = Quad(position, dimension)

    q.children[i] = node
    insert(node, c)
    insert(node, l)
  }
}

function search<T> ( q: IQuad<T>, p: V2<number> ): ILeaf<T> | null {
  var i = index(q, p)
  var r = q.children[i]
  var [ x, y ] = q.dimension
  var d = sqrt(x * x + y * y)

  if      ( r == null ) return r
  else if ( r.leaf )    return r
  else                  return search(r, p)
}

const MAX_NODES = pow(2, 15)
const r = Quad([ 0, 0 ], [ 2, 2 ])
const target: V2<number> = [ 0.5, 0.5 ]
const nodes = []

for ( var i = 0, n; i < MAX_NODES; i++ ) {
  n = Leaf([ Math.random() - .5, Math.random() - .5 ])
  nodes.push(n)
  insert(r, n)
}

const start_search_array = Date.now()

var closest = null
for ( var i = 0, dx, dy, d, old_d = 1000; i < nodes.length; i++ ) {
  dx = nodes[i].position[0] - target[0]
  dy = nodes[i].position[1] - target[1]
  d  = sqrt(dx * dx + dy * dy)

  if ( old_d > d ) {
    closest = nodes[i]
    old_d = d
  }
}
const end_search_array = Date.now()
const dt_array = end_search_array - start_search_array
const found_array = JSON.stringify(closest)

console.log(`SEARCHING ARRAY[${ MAX_NODES }]: ${ dt_array }ms.  FOUND ${ found_array }`)

const start_search_qt = Date.now()
closest = search(r, target)
const end_search_qt = Date.now()
const dt_qt = end_search_qt - start_search_qt
const found_qt = JSON.stringify(closest)

console.log(`SEARCHING QT[${ MAX_NODES }]: ${ dt_qt }ms.  FOUND ${ found_qt }`)
