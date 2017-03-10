var test = require('tape')
var { QTNode, insert, index } = require('./src/main')
var log = n => console.log(JSON.stringify(n, null, 2))

function pp ( q ) {
  if      ( q == null ) return 'NULL'
  else if ( q.leaf )    return `LEAF: ${ q.position }`
  else                  return `QUAD: ${ q.children.map(pp) }`
}

test('playground', function (t) {
  var root = QTNode([ 0, 0 ], [ 2, 2 ], [ null, null, null, null ]) 
  var node0 = { leaf: true, position: [ -1, 1 ] }
  var node1 = { leaf: true, position: [ 1, 1 ] }
  var node2 = { leaf: true, position: [ 1, -1 ] }
  var node3 = { leaf: true, position: [ -1, -1 ] }
  var node5 = { leaf: true, position: [ -2, 2 ] }

  insert(root, node0)
  insert(root, node1)
  insert(root, node2)
  insert(root, node3)
  t.same(root.children, [ node0, node1, node2, node3 ])
  insert(root, node5)
  t.same(root.children[0].children[0], node5)
  t.same(root.children[0].children[1], node0)

  log(root)
  t.end()
})
