import { QT, Kind, IQuad, ILeaf, Quad, Leaf, insert } from '../src/quadtree'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

canvas.width = 600
canvas.height = 600
canvas.style.margin = '0 auto'
canvas.style.backgroundColor = 'lightgray'
document.body.appendChild(canvas)

function renderQT ( ctx: CanvasRenderingContext2D, q: QT ) {
  switch ( q.kind ) {
    case Kind.Leaf: 
      renderLeaf(ctx, q)
      break
    case Kind.Quad: 
      renderQuad(ctx, q)
      renderQT(ctx, q.children[0])
      renderQT(ctx, q.children[1])
      renderQT(ctx, q.children[2])
      renderQT(ctx, q.children[3])
      break
  } 
}

function renderLeaf ( ctx: CanvasRenderingContext2D, q: ILeaf ) {
  const { clientWidth, clientHeight } = ctx.canvas
  const halfCW = clientWidth / 2
  const halfCH = clientHeight / 2
  const [ x, y ] = q.position
  const sx = halfCW + halfCW * x
  const sy = halfCH + halfCH * y

  ctx.fillStyle = 'blue'
  ctx.fillRect(sx, sy, 2, 2)
}

function renderQuad ( ctx: CanvasRenderingContext2D, q: IQuad ) {
  const { clientWidth, clientHeight } = ctx.canvas
  const halfCW = clientWidth / 2
  const halfCH = clientHeight / 2
  const [ x, y ] = q.position
  const [ w, h ] = q.dimension
  const halfW = w / 2
  const halfH = h / 2
  const sx = halfCW + (halfCW * (x - halfW))
  const sy = halfCH + (halfCH * (y - halfH))
  const sw = halfCW * w
  const sh = halfCH * h
  
  ctx.strokeStyle = 'red'
  ctx.rect(sx, sy, sw, sh)
  ctx.stroke()
  // ctx.fillStyle = 'red'
  // ctx.font = '14px Verdana'
  // ctx.fillText(`${ q.position }, ${ q.dimension }`, sx, sy)
}

const MAX_NODES = Math.pow(2, 10)
const r = Quad([ 0, 0 ], [ 2, 2 ])

for ( var i = 0, n; i < MAX_NODES; i++ ) {
  n = Leaf([ Math.random() * 2 - 1, Math.random() * 2 - 1 ])
  insert(r, n)
}

const test = Quad([ 0, 0 ], [ 2, 2 ])

insert(test, Leaf([ -.5, .5 ]))
insert(test, Leaf([ .5, .5 ]))
insert(test, Leaf([ .5, -.5 ]))
insert(test, Leaf([ -.5, -.5 ]))
insert(test, Leaf([ -.7, -.7 ]))

renderQT(ctx, r)
// console.log(JSON.stringify(test))
