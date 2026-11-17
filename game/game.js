
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 9;
const BRICK_WIDTH = 64;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 6;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 35;

let canvas, ctx;
let paddleX, ballX, ballY, ballDX, ballDY;
let bricks = [];
let score = 0, lives = 3;
let gameState = 'START';
let keys = new Set();

function initBricks() {
  bricks = [];
  const colors = ['#ff4444','#ff8844','#ffcc44','#44cc44','#4488ff'];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING),
        y: BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING),
        w: BRICK_WIDTH, h: BRICK_HEIGHT, alive: true,
        color: colors[r % colors.length]
      });
    }
  }
}

function resetBall() {
  paddleX = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
  ballX = CANVAS_WIDTH / 2;
  ballY = CANVAS_HEIGHT - 40;
  ballDX = (Math.random() > 0.5 ? 4 : -4);
  ballDY = -4;
}

function initGame() {
  score = 0; lives = 3;
  initBricks(); resetBall();
  gameState = 'PLAYING';
}

function drawRect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
function drawText(t,x,y,c='#fff',s=20){ctx.fillStyle=c;ctx.font=`${s}px monospace`;ctx.fillText(t,x,y);}

function update() {
  if (gameState !== 'PLAYING') return;
  const speed = 7;
  if (keys.has('ArrowLeft')||keys.has('a')) paddleX -= speed;
  if (keys.has('ArrowRight')||keys.has('d')) paddleX += speed;
  if (paddleX < 0) paddleX = 0;
  if (paddleX > CANVAS_WIDTH - PADDLE_WIDTH) paddleX = CANVAS_WIDTH - PADDLE_WIDTH;
  ballX += ballDX; ballY += ballDY;
  if (ballX <= 0 || ballX >= CANVAS_WIDTH - BALL_SIZE) ballDX = -ballDX;
  if (ballY <= 0) ballDY = -ballDY;
  if (ballY + BALL_SIZE >= CANVAS_HEIGHT - PADDLE_HEIGHT - 10 &&
      ballY <= CANVAS_HEIGHT - PADDLE_HEIGHT - 5 &&
      ballX + BALL_SIZE >= paddleX && ballX <= paddleX + PADDLE_WIDTH) {
    ballDY = -Math.abs(ballDY);
    const hitPos = (ballX + BALL_SIZE/2 - paddleX)/PADDLE_WIDTH - 0.5;
    ballDX += hitPos * 2;
  }
  for (const b of bricks) {
    if (!b.alive) continue;
    if (ballX < b.x + b.w && ballX + BALL_SIZE > b.x &&
        ballY < b.y + b.h && ballY + BALL_SIZE > b.y) {
      ballDY = -ballDY; b.alive = false; score += 10; break;
    }
  }
  if (bricks.every(b => !b.alive)) gameState = 'WIN';
  if (ballY > CANVAS_HEIGHT) {
    lives--;
    if (lives <= 0) gameState = 'LOSE';
    else resetBall();
  }
}

function draw() {
  drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT,'#0a0a1a');
  drawRect(paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT, '#44aaff');
  drawRect(ballX, ballY, BALL_SIZE, BALL_SIZE, '#fff');
  for (const b of bricks) if (b.alive) drawRect(b.x,b.y,b.w,b.h,b.color);
  drawText('Score: '+score, 10, 30, '#fff', 20);
  drawText('Lives: '+lives, CANVAS_WIDTH-100, 30, '#fff', 20);
  if (gameState==='START') {
    drawText('CLICK TO START', CANVAS_WIDTH/2-70, CANVAS_HEIGHT/2, '#0f0', 24);
    drawText('Arrows/A-D to move', CANVAS_WIDTH/2-100, CANVAS_HEIGHT/2+40, '#fff', 18);
  } else if (gameState==='WIN') {
    drawText('YOU WIN!', CANVAS_WIDTH/2-60, CANVAS_HEIGHT/2, '#0f0', 32);
    drawText('Final Score: '+score, CANVAS_WIDTH/2-70, CANVAS_HEIGHT/2+40, '#fff', 20);
    drawText('Click to restart', CANVAS_WIDTH/2-70, CANVAS_HEIGHT/2+80, '#fff', 18);
  } else if (gameState==='LOSE') {
    drawText('GAME OVER', CANVAS_WIDTH/2-80, CANVAS_HEIGHT/2, '#f44', 32);
    drawText('Final Score: '+score, CANVAS_WIDTH/2-70, CANVAS_HEIGHT/2+40, '#fff', 20);
    drawText('Click to restart', CANVAS_WIDTH/2-70, CANVAS_HEIGHT/2+80, '#fff', 18);
  }
}

function loop(){update();draw();requestAnimationFrame(loop);}

window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  window.addEventListener('keydown', e => keys.add(e.key));
  window.addEventListener('keyup', e => keys.delete(e.key));
  canvas.addEventListener('click', () => {
    if (gameState==='START') initGame();
    else if (gameState==='WIN'||gameState==='LOSE') initGame();
  });
  initGame();
  loop();
});
