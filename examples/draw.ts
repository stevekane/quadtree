import { V2, QT, Kind, IQuad, ILeaf, Quad, Leaf, insert } from '../src/quadtree'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

ctx.translate(0.5, 0.5)
document.body.style.margin = '0'
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.margin = '0 auto'
canvas.style.backgroundColor = 'lightgray'
document.body.appendChild(canvas)

function renderQT ( ctx: CanvasRenderingContext2D, q: QT, depth: number ) {
  switch ( q.kind ) {
    case Kind.Leaf: 
      renderLeaf(ctx, q)
      break
    case Kind.Quad: 
      renderQuad(ctx, q, depth)
      renderQT(ctx, q.children[0], depth + 1)
      renderQT(ctx, q.children[1], depth + 1)
      renderQT(ctx, q.children[2], depth + 1)
      renderQT(ctx, q.children[3], depth + 1)
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

function renderQuad ( ctx: CanvasRenderingContext2D, q: IQuad, depth: number ) {
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
  const r = 25 * depth
  
  ctx.fillStyle = `rgb(${r}, 0, 0)`
  ctx.fillRect(sx, sy, sw, sh)
}

const MAX_NODES = Math.pow(2, 12)
const r = Quad([ 0, 0 ], [ 2, 2 ])

for ( var i = 0, n: V2; i < MAX_NODES; i++ ) {
  n = [ Math.random() * 2 - 1, Math.random() * 2 - 1 ]
  insert(r, n)
}

const test = Quad([ 0, 0 ], [ 2, 2 ])

renderQT(ctx, r, 0)
