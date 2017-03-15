// type V2<T> = [ T, T ]
// type V4<T> = [ T, T, T, T ]
// type Index = 0 | 1 | 2 | 3
// type DistanceFn = ( v0: V2<number>, v1: V2<number> ) => number
// 
// const { sqrt, pow, abs, min, max } = Math
// 
// interface ILeaf<T> { 
//   id: number
//   leaf: true
//   position: V2<number>
// }
// 
// interface IQuad<T> {
//   leaf: false
//   position: V2<number>
//   dimension: V2<number>
//   children: V4<QT<T>>
// }
// 
// type QT<T>
//   = ILeaf<T>
//   | IQuad<T>
//   | null
// 
// const Quad = <T>( position: V2<number>, dimension: V2<number> ): IQuad<T> => ({ 
//   leaf: false,
//   position,
//   dimension,
//   children: [ null, null, null, null ]
// })
// 
// const Leaf = <T>( id: number, position: V2<number> ): ILeaf<T> => ({
//   leaf: true,
//   id,
//   position
// })
// 
// function index<T> ( q: IQuad<T>, p: V2<number> ): Index {
//   return p[0] < q.position[0]
//     ? p[1] < q.position[1] ? 3 : 0
//     : p[1] < q.position[1] ? 2 : 1
// }
// 
// function positionForIndex<T> ( q: IQuad<T>, i: Index ): V2<number> {
//   // TODO: use these for clarity?
//   var [ x, y ] = q.position
//   var [ w, h ] = q.dimension
//   var halfW = w / 2
//   var halfH = h / 2
// 
//   switch ( i ) {
//     case 0: return [ q.position[0] - q.dimension[0] / 2, q.position[1] + q.dimension[1] / 2 ]
//     case 1: return [ q.position[0] + q.dimension[0] / 2, q.position[1] + q.dimension[1] / 2 ]
//     case 2: return [ q.position[0] + q.dimension[0] / 2, q.position[1] - q.dimension[1] / 2 ]
//     case 3: return [ q.position[0] - q.dimension[0] / 2, q.position[1] - q.dimension[1] / 2 ]
//   }
// }
// 
// function insert<T> ( q: IQuad<T>, l: ILeaf<T> ) {
//   var i = index(q, l.position)
//   var c = q.children[i]
// 
//   if ( c === null ) {
//     q.children[i] = l
//   }
//   else if ( !c.leaf ){
//     insert(c, l)
//   }
//   else {
//     var position = positionForIndex(q, i) 
//     var dimension: V2<number> = [ q.dimension[0] / 2, q.dimension[1] / 2 ]
//     var node = Quad(position, dimension)
// 
//     q.children[i] = node
//     insert(node, c)
//     insert(node, l)
//   }
// }
// 
// function manhattan ( p0: V2<number>, p1: V2<number> ): number {
//   return abs(p1[0] - p0[0]) + abs(p1[1] - p0[1])
// }
// 
// function L2 ( p0: V2<number>, p1: V2<number> ): number {
//   return sqrt(pow(p1[0] - p0[0], 2) + pow(p1[1] - p0[1], 2))
// }
// 
// function nearestArray <T> ( nodes: ILeaf<T>[], dfn: DistanceFn, r: number, p: V2<number> ): null | ILeaf<T> {
//   var found = null
// 
//   for ( var i = 0, d; i < nodes.length; i++ ) {
//     d = dfn(nodes[i].position, p)
//     found = found == null || d < dfn(found.position, p) ? nodes[i] : found
//   }
//   return found
// }
// 
// function minDistToQuad <T> ( q: IQuad<T>, p: V2<number> ): number {
//   var x = p[0]
//   var y = p[1]
//   var halfW = q.dimension[0] / 2
//   var halfH = q.dimension[1] / 2
//   var cx = q.position[0]
//   var cy = q.position[1]
//   var d1x = abs(x - cx + halfW)
//   var d2x = abs(x - cx - halfW)
//   var d1y = abs(y - cy + halfH)
//   var d2y = abs(y - cy - halfH)
// 
//   return min(d1x, d2x, d1y, d2y)
// }
// 
// // TODO: JUST FOR TESTING
// var recursion = 0
// 
// function nearest <T> ( q: QT<T>, dfn: DistanceFn, r: number, p: V2<number> ): ILeaf<T> | null {
//   function proximity <T>( q1: QT<T>, q2: QT<T> ): number {
//     if ( q1 == null || q1.leaf ) return 1
//     if ( q2 == null || q2.leaf ) return -1
//    
//     return dfn(q1.position, p) > dfn(q2.position, p) ? 1 : -1
//   }
// 
//   function search ( w: ILeaf<T> | null, c: QT<T> ): ILeaf<T> | null {
//     if ( c == null ) return w
//     if ( c.leaf ) {
//       if ( w == null ) return c 
//       else             return dfn(c.position, p) < r ? c : w
//     }
// 
//     const md = minDistToQuad(c, p)
//     const wd = w == null ? r : dfn(w.position, p)
// 
//     if ( md > wd ) return w
//     
//     recursion++
//     const n = nearest(c, dfn, wd, p) 
// 
//     if      ( w == null ) return n
//     else if ( n == null ) return w
//     else                  return dfn(n.position, p) < wd ? n : w
//   }
// 
//   if      ( q == null ) return null
//   else if ( q.leaf )    return dfn(q.position, p) < r ? q : null
//   else                  return q.children
//                                 .slice(0)
//                                 .sort(proximity)
//                                 .reduce(search, null as null | ILeaf<T>) as null | ILeaf<T>
// }
// 
// const MAX_NODES = pow(2, 14)
// const r = Quad([ 0, 0 ], [ 1, 1 ])
// const target: V2<number> = [ 0.5, 0.5 ]
// const nodes = []
// 
// for ( var i = 0, n; i < MAX_NODES; i++ ) {
//   n = Leaf(i, [ Math.random() * 2 - 1, Math.random() * 2 - 1 ])
//   nodes.push(n)
//   insert(r, n)
// }
// 
// // const start_search_array = Date.now()
// // 
// // 
// // const end_search_array = Date.now()
// // const closest_array = nearestArray(nodes, manhattan, target)
// // const dt_array = end_search_array - start_search_array
// // const found_array = JSON.stringify(closest_array)
// // 
// // console.log(`SEARCHING ARRAY[${ MAX_NODES }]: ${ dt_array }ms.  FOUND ${ found_array }`)
// // 
// // const start_search_qt = Date.now()
// // const closest_qt = nearest(r, manhattan, target)
// // const end_search_qt = Date.now()
// // const dt_qt = end_search_qt - start_search_qt
// // const found_qt = JSON.stringify(closest_qt)
// // 
// // console.log(`SEARCHING QT[${ MAX_NODES }]: ${ dt_qt }ms.  FOUND ${ found_qt }`)
// // 
// // console.log(`FOUND SAME: ${ closest_array === closest_qt }`)
// 
// // var problemLeaves: ILeaf<any>[] = [ 
// //   { id: 1, leaf: true, position: [ 0.20959098742382576, -0.6049647185031937 ] },
// //   { id: 2, leaf: true, position: [ -0.15272271894029465, -0.4099223518846471 ] },
// //   { id: 3, leaf: true, position: [ -0.20917872072493626, -0.8297414166119115 ] },
// //   { id: 4, leaf: true, position: [ -0.046198461922013934, -0.687954309298973 ] },
// //   { id: 5, leaf: true, position: [ 0.5686020477613236, -0.8017516705096708 ] },
// //   { id: 6, leaf: true, position: [ -0.6986326028896657, 0.6377256037676262 ] },
// //   { id: 7, leaf: true, position: [ -0.6763076967429464, -0.18301920072377742 ] },
// //   { id: 8, leaf: true, position: [ -0.4952690427277786, -0.9748926589056364 ] }
// // ]
// // 
// // const rp = Quad([ 0, 0 ], [ 1, 1 ])
// // 
// // for ( var i = 0; i < problemLeaves.length; i++ ) {
// //   insert(rp, problemLeaves[i])
// // }
// 
// // const pmarray = nearestArray(problemLeaves, manhattan, target)
// // const pmqt = nearest(rp, manhattan, target)
// // console.log(problemLeaves.map(l => l.position))
// // if ( pmarray != null && pmqt != null ) {
// //   console.log(pmarray, manhattan(pmarray.position, target))
// //   console.log(pmqt, manhattan(pmqt.position, target))
// // }
// 
// const pdarray = nearestArray(nodes, L2, Infinity, target)
// const pdqt = nearest(r, L2, Infinity, target)
// if ( pdarray != null && pdqt != null ) {
//   console.log(recursion)
//   console.log(pdarray, L2(pdarray.position, target))
//   console.log(pdqt, L2(pdqt.position, target))
// }
