import * as test from 'tape'
import { 
  Kind, V2, DistanceFn,
  manhattan, euclidean,
  Empty, Leaf, Quad, QT,
  IEmpty, ILeaf, IQuad,
  index, positionForIndex, minDistToQuad, insideQuad,
  insert, nearest, traverse
} from './src/quadtree'

function nearestArray ( nodes: V2[], dfn: DistanceFn, r: number, p: V2 ): null | V2 {
  var i = nodes.length
  var found: null | V2 = null
  var count = 0
  var d = 0

  while ( i-- ) {
    d = dfn(nodes[i], p)
    found = found == null || d < dfn(found, p) ? nodes[i] : found
  }
  return found
}

function benchmark <T> ( COUNT: number, f: ( ...args: any[] ) => T, ...args: any[] ): { result: T, time: number } {
  var d: number = 0
  var r: any
  var s: number
  var e: number

  for ( var i = 0; i < COUNT; i++ ) {
    s = process.hrtime()[1]
    r = f(...args) 
    e = process.hrtime()[1]
    d += (e - s)
  }
  return { result: r, time: d / COUNT }
}

var MAX_POINTS = Math.pow(2, 16)
var qt = Quad([ 0, 0 ], [ 2, 2 ]) 
var points: V2[] = []

for ( var i = 0, p: V2; i < MAX_POINTS; i++ ) {
  p = [ Math.random() * 2 - 1, Math.random() * 2 - 1 ]
  points.push(p)
  insert(qt, p)
}

test('helpers', t => {
  var qOuter = Quad([ 0, 0 ], [ 2, 2 ])
  var qInner = Quad([ -.5, -.5 ], [ 1, 1 ])
  var qII = Quad([ -.75, -.75  ], [ .5, .5 ])

  t.same(index(qOuter, [ -.5, .5 ]), 0)
  t.same(index(qOuter, [ .5, .5 ]), 1)
  t.same(index(qOuter, [ -.5, -.5 ]), 2)
  t.same(index(qOuter, [ .5, -.5 ]), 3)

  t.same(minDistToQuad(qInner, [ .5, -.5 ]), .5)
  t.same(minDistToQuad(qInner, [ -.2, -.2 ]), 0)
  t.same(minDistToQuad(qInner, [ .2, .2 ]), .2 + .2)
  t.same(minDistToQuad(qInner, [ -.3, .3 ]), .3)
  t.same(minDistToQuad(qII, [ .5, .5 ]), (.5 + .5) * 2)
  t.end()
})

test('proximity', t => {
  var p = [ 0.25, -.29 ]
  var nA = benchmark(100, nearestArray, points, manhattan, Infinity, p)
  var nQT = benchmark(100, nearest, qt, manhattan, Infinity, p)

  t.same(nA.result, nQT.result)
  console.log(`Array ${ nA.time / nQT.time }x slower than QT`)
  t.end()
})

// test('traverse sanity check', t => {
//   var count = 0
//   var signs = [ 
//     [ -1, 1 ],
//     [ 1, 1 ],
//     [ 1, -1 ],
//     [ -1, -1 ]
//   ]
// 
//   function countLeaf ( qt: QT ) {
//     if ( qt.kind == Kind.Leaf ) count++ 
//   }
// 
//   function dividedProperly ( qt: QT ) {
//     if ( qt.kind !== Kind.Quad ) return
//     for ( var i = 0, c: QT; i < qt.children.length; i++ ) {
//       c = qt.children[i]
//       if ( c.kind === Kind.Quad ) {
//         t.same(c.dimension[0], qt.dimension[0] / 2)
//         t.same(c.dimension[1], qt.dimension[1] / 2)
//         t.same(c.position[0], qt.position[0] + qt.dimension[0] / 4 * signs[i][0])
//         t.same(c.position[1], qt.position[1] + qt.dimension[1] / 4 * signs[i][1])
//       }
//     } 
//   }
// 
//   traverse(countLeaf, qt)
//   traverse(dividedProperly, qt)
//   t.same(count, MAX_POINTS, 'all leaves inserted in tree')
//   t.end()
// })
