type V2<T> = [ T, T ]
type V4<T> = [ T, T, T, T ]
type Index = 0 | 1 | 2 | 3

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

function index<T> ( q: IQuad<T>, l: ILeaf<T> ): Index {
  return l.position[0] < q.position[0]
    ? l.position[1] < q.position[1] ? 3 : 0
    : l.position[1] < q.position[1] ? 2 : 1
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
  var i = index(q, l)
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

const r = Quad([ 0, 0 ], [ 2, 2 ])
const l0 = Leaf([ -1, 1 ])
const l1 = Leaf([ 1, 1 ])
const l2 = Leaf([ 1, -1 ])
const l3 = Leaf([ -1, -1 ])
const l4 = Leaf([ -2, -2 ])

insert(r, l0)
insert(r, l1)
insert(r, l2)
insert(r, l3)
insert(r, l4)

console.log(r)
