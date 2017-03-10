const QTNode = ( position, dimension, children ) => ({ 
  leaf: false,
  dimension,
  position,
  children
})

function index ( q, p ) {
  return p.position[0] < q.position[0]
    ? p.position[1] < q.position[1]
      ? 3
      : 0
    : p.position[1] < q.position[1]
      ? 2
      :1
}

function positionForIndex ( q, i ) {
  switch ( i ) {
    case 0: return [ q.position[0] - q.dimension[0] / 2, q.position[1] + q.dimension[1] / 2 ]
    case 1: return [ q.position[0] + q.dimension[0] / 2, q.position[1] + q.dimension[1] / 2 ]
    case 2: return [ q.position[0] + q.dimension[0] / 2, q.position[1] - q.dimension[1] / 2 ]
    case 3: return [ q.position[0] - q.dimension[0] / 2, q.position[1] + q.dimension[1] / 2 ]
  }
}

function insert ( q, p ) {
  var i = index(q, p)

  if ( q.children[i] == null ) {
    q.children[i] = p
  }
  else if ( !q.children[i].leaf ) {
    insert(q.children[i], p)
  }
  else {
    var position = positionForIndex(q, i) 
    var dimension = [ q.dimension[0] / 2, q.dimension[1] / 2 ]
    var children = [ null, null, null, null ]
    var node = { leaf: false, position, dimension, children }
    var oldLeaf = q.children[i]

    q.children[i] = node
    insert(node, oldLeaf)
    insert(node, p)
  }
}

module.exports.QTNode = QTNode
module.exports.insert = insert
module.exports.index = index
