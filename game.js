/* ---------- Dreamland Run ---------- */

const SKIN_COLORS = ['#ffe0bd','#f1c27d','#c68642','#8d5524'];
const HAIR_COLORS = ['#3b2415','#ffd166','#ff6f91','#7b6cff','#2ec4b6'];
const OUTFIT_COLORS = ['#ff8fab','#8ecae6','#ffd166','#b8f2d1','#c9b6ff'];

const GRAVITY = 0.6;
const MOVE_SPEED = 4.2;
const JUMP_VELOCITY = -12.5;
const CANVAS_W = 800;
const CANVAS_H = 400;

const ISLANDS = [
  { id:0, name:'Cloud Isle',   bg:'#cdeeff', platform:'#ffffff', star:'#ffd166', platformCount:9,  gapMin:90,  gapMax:120, riseMax:60 },
  { id:1, name:'Candy Isle',   bg:'#ffe0f0', platform:'#ffb3d9', star:'#fff275', platformCount:11, gapMin:95,  gapMax:130, riseMax:75 },
  { id:2, name:'Mint Isle',    bg:'#e2fff0', platform:'#b8f2d1', star:'#ffb703', platformCount:13, gapMin:100, gapMax:135, riseMax:85 },
  { id:3, name:'Twilight Isle',bg:'#e6e0ff', platform:'#c9b6ff', star:'#ffe066', platformCount:15, gapMin:100, gapMax:140, riseMax:95 },
];

const state = {
  character: { gender:'girl', skin:SKIN_COLORS[0], hair:HAIR_COLORS[0], outfit:OUTFIT_COLORS[0], hat:false, glasses:false },
  progress: {},
  currentIsland: null,
};

/* ---------- persistence ---------- */
function loadState(){
  try{
    const c = localStorage.getItem('dr_character');
    const p = localStorage.getItem('dr_progress');
    if(c) Object.assign(state.character, JSON.parse(c));
    if(p) state.progress = JSON.parse(p);
  }catch(e){}
}
function saveCharacter(){
  localStorage.setItem('dr_character', JSON.stringify(state.character));
}
function saveProgress(){
  localStorage.setItem('dr_progress', JSON.stringify(state.progress));
}

/* ---------- hi-dpi canvas ---------- */
function setupCanvas(canvas, cssW, cssH){
  const dpr = window.devicePixelRatio || 1;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/* ---------- character drawing ---------- */
function drawCharacter(ctx, w, h, ch, opts){
  opts = opts || {};
  ctx.clearRect(0,0,w,h);
  const cx = w/2;
  const legOffset = opts.legOffset || 0;
  const baseY = h*0.55;

  ctx.fillStyle = '#4a3f6b';
  ctx.fillRect(cx-18, baseY+40, 12, 30+legOffset);
  ctx.fillRect(cx+6, baseY+40, 12, 30-legOffset);

  ctx.fillStyle = ch.outfit;
  if(ch.gender === 'girl'){
    ctx.beginPath();
    ctx.moveTo(cx-24, baseY+50);
    ctx.lineTo(cx+24, baseY+50);
    ctx.lineTo(cx+16, baseY-5);
    ctx.lineTo(cx-16, baseY-5);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(cx-18, baseY-5, 36, 55);
  }

  ctx.fillStyle = ch.skin;
  ctx.fillRect(cx-30, baseY, 10, 34);
  ctx.fillRect(cx+20, baseY, 10, 34);

  ctx.beginPath();
  ctx.arc(cx, baseY-30, 26, 0, Math.PI*2);
  ctx.fill();

  // eyes
  ctx.fillStyle = '#4a3f6b';
  ctx.beginPath();
  ctx.arc(cx-9, baseY-30, 2.6, 0, Math.PI*2);
  ctx.arc(cx+9, baseY-30, 2.6, 0, Math.PI*2);
  ctx.fill();

  // hair
  ctx.fillStyle = ch.hair;
  if(ch.gender === 'girl'){
    ctx.beginPath();
    ctx.arc(cx, baseY-38, 27, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx-30, baseY-38, 10, 40);
    ctx.fillRect(cx+20, baseY-38, 10, 40);
  } else {
    ctx.beginPath();
    ctx.arc(cx, baseY-40, 24, Math.PI, 0);
    ctx.fill();
  }

  // glasses (drawn after hair, over the eyes)
  if(ch.glasses){
    ctx.strokeStyle = '#4a3f6b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx-9, baseY-30, 8, 0, Math.PI*2);
    ctx.moveTo(cx+17, baseY-30);
    ctx.arc(cx+9, baseY-30, 8, 0, Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx-1, baseY-30);
    ctx.lineTo(cx+1, baseY-30);
    ctx.stroke();
  }

  if(ch.hat){
    ctx.fillStyle = '#ff6f91';
    ctx.beginPath();
    ctx.moveTo(cx-22, baseY-52);
    ctx.lineTo(cx+22, baseY-52);
    ctx.lineTo(cx, baseY-85);
    ctx.closePath();
    ctx.fill();
  }
}

/* ---------- screens ---------- */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ---------- character creator setup ---------- */
function buildSwatches(containerId, colors, key){
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  colors.forEach(color=>{
    const btn = document.createElement('button');
    btn.className = 'swatch-btn';
    btn.style.background = color;
    if(state.character[key] === color) btn.classList.add('active');
    btn.addEventListener('click', ()=>{
      state.character[key] = color;
      container.querySelectorAll('.swatch-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderPreview();
      saveCharacter();
    });
    container.appendChild(btn);
  });
}

let previewCtx;
function setupCreator(){
  buildSwatches('skin-swatches', SKIN_COLORS, 'skin');
  buildSwatches('hair-swatches', HAIR_COLORS, 'hair');
  buildSwatches('outfit-swatches', OUTFIT_COLORS, 'outfit');

  const genderBtns = document.querySelectorAll('#gender-swatches .swatch-btn');
  genderBtns.forEach(btn=>{
    if(btn.dataset.value === state.character.gender) btn.classList.add('active');
    else btn.classList.remove('active');
    btn.addEventListener('click', ()=>{
      state.character.gender = btn.dataset.value;
      genderBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderPreview();
      saveCharacter();
    });
  });

  document.querySelectorAll('.swatch-btn.toggle').forEach(btn=>{
    const acc = btn.dataset.acc;
    if(state.character[acc]) btn.classList.add('active');
    btn.addEventListener('click', ()=>{
      state.character[acc] = !state.character[acc];
      btn.classList.toggle('active', state.character[acc]);
      renderPreview();
      saveCharacter();
    });
  });

  const canvas = document.getElementById('charPreview');
  previewCtx = setupCanvas(canvas, 200, 260);
  renderPreview();
}

function renderPreview(){
  drawCharacter(previewCtx, 200, 260, state.character, {});
}

/* ---------- island select ---------- */
function renderIslandMap(){
  const map = document.getElementById('riverMap');
  map.innerHTML = '';
  ISLANDS.forEach((island, idx)=>{
    const prevDone = idx === 0 || (state.progress[idx-1] && state.progress[idx-1].completed);
    const btn = document.createElement('button');
    btn.className = 'island-btn' + (prevDone ? '' : ' locked');
    btn.style.background = island.platform;
    const done = state.progress[island.id] && state.progress[island.id].completed;
    btn.innerHTML = `<span>${island.name}</span>${done ? '<span class="check">&#9989;</span>' : ''}`;
    if(prevDone){
      btn.addEventListener('click', ()=> startIsland(island.id));
    }
    map.appendChild(btn);
  });
}

/* ---------- level generation ---------- */
// Largest upward height change (px) still reachable when covering `gap` px
// horizontally, given a jump launched right at the edge of a platform.
function maxUpRiseForGap(gap){
  const v0 = -JUMP_VELOCITY;
  let lo = 0, hi = 125;
  for(let i=0;i<25;i++){
    const mid = (lo+hi)/2;
    const disc = v0*v0 - 2*GRAVITY*mid;
    if(disc < 0){ hi = mid; continue; }
    const tDescend = (v0 + Math.sqrt(disc)) / GRAVITY;
    const reach = MOVE_SPEED * tDescend;
    if(reach >= gap) lo = mid; else hi = mid;
  }
  return lo;
}

function buildLevel(island){
  const platforms = [];
  const groundW = 180;
  platforms.push({ x:0, y:320, w:groundW, h:20 });
  let x = groundW;
  let y = 320;
  for(let i=0;i<island.platformCount;i++){
    const gap = island.gapMin + Math.random()*(island.gapMax - island.gapMin);
    x += gap;
    let newY;
    if(Math.random() < 0.5){
      // going up: clamp to what's actually jumpable, with a generous safety margin
      // for jumps thrown a little early/late
      const maxUp = Math.min(island.riseMax, maxUpRiseForGap(gap) * 0.6);
      newY = y - Math.random()*maxUp;
    } else {
      // going down: always safe, no clamp needed
      newY = y + Math.random()*island.riseMax;
    }
    y = Math.max(160, Math.min(330, newY));
    const w = 90 + Math.random()*40;
    platforms.push({ x, y, w, h:20 });
    x += w;
  }
  // finish platform - clamp its height so the last jump is always safe
  x += island.gapMin;
  const maxUpFinal = maxUpRiseForGap(island.gapMin) * 0.6;
  const finishY = y - maxUpFinal > 300 ? y - maxUpFinal : 300;
  platforms.push({ x, y:finishY, w:160, h:20 });

  const stars = [];
  platforms.slice(1, -1).forEach(p=>{
    if(Math.random() < 0.65){
      stars.push({ x: p.x + p.w/2, y: p.y - 30, taken:false });
    }
  });

  const flagX = x + 100;
  const levelWidth = flagX + 120;
  return { platforms, stars, flagX, levelWidth };
}

/* ---------- game state ---------- */
let gameCtx, gameCanvas, animId;
let player, level, island, stars, starsCollected, cameraX;
let gameOver, levelComplete;
const keys = { left:false, right:false };

function startIsland(id){
  state.currentIsland = id;
  island = ISLANDS[id];
  document.getElementById('hud-island').textContent = island.name;
  showScreen('screen-game');
  resetGameState();
  hideOverlay();
  runGameLoop();
}

function resetGameState(){
  gameCanvas = document.getElementById('gameCanvas');
  gameCtx = setupCanvas(gameCanvas, CANVAS_W, CANVAS_H);
  gameCanvas.style.background = island.bg;

  level = buildLevel(island);
  stars = level.stars;
  starsCollected = 0;
  cameraX = 0;
  gameOver = false;
  levelComplete = false;

  player = { x:40, y:250, vx:0, vy:0, w:28, h:56, onGround:false, facing:1, legPhase:0 };
  updateHud();
}

function updateHud(){
  document.getElementById('hud-stars').innerHTML = '&#9733; ' + starsCollected;
  const pct = Math.min(100, Math.round((player.x/level.flagX)*100));
  document.getElementById('hud-progress').textContent = 'Distance: ' + pct + '%';
}

function jump(){
  if(player.onGround && !gameOver && !levelComplete){
    player.vy = JUMP_VELOCITY;
    player.onGround = false;
  }
}

function runGameLoop(){
  cancelAnimationFrame(animId);

  function frame(){
    if(!gameOver && !levelComplete){
      // horizontal movement
      player.vx = 0;
      if(keys.left){ player.vx = -MOVE_SPEED; player.facing = -1; }
      if(keys.right){ player.vx = MOVE_SPEED; player.facing = 1; }
      player.x += player.vx;
      if(player.x < 0) player.x = 0;

      // gravity
      player.vy += GRAVITY;
      player.y += player.vy;

      // platform collision (land on top only)
      let landed = false;
      if(player.vy >= 0){
        for(const p of level.platforms){
          const footY = player.y + player.h;
          if(player.x + player.w*0.7 > p.x && player.x + player.w*0.3 < p.x + p.w &&
             footY >= p.y && footY <= p.y + p.h + player.vy + 1){
            player.y = p.y - player.h;
            player.vy = 0;
            player.onGround = true;
            landed = true;
          }
        }
      }
      if(!landed) player.onGround = false;

      // walking animation
      if(player.onGround && player.vx !== 0){
        player.legPhase += 0.3;
      }

      // star collection
      stars.forEach(s=>{
        if(!s.taken && Math.abs((player.x+player.w/2) - s.x) < 26 && Math.abs((player.y+player.h/2) - s.y) < 26){
          s.taken = true;
          starsCollected++;
        }
      });

      // camera follow
      const targetCam = Math.max(0, player.x - CANVAS_W*0.35);
      cameraX = Math.min(targetCam, level.levelWidth - CANVAS_W);
      if(cameraX < 0) cameraX = 0;

      // fell in the water
      if(player.y > CANVAS_H + 40){
        gameOver = true;
        showOverlay('Splash!', 'You fell in the water. Stars collected: ' + starsCollected, true);
      }

      // reached the flag
      if(player.x >= level.flagX){
        levelComplete = true;
        state.progress[island.id] = { completed:true, stars: Math.max(starsCollected, (state.progress[island.id]||{}).stars||0) };
        saveProgress();
        const isLast = island.id === ISLANDS.length - 1;
        setTimeout(()=>{
          if(isLast){
            goFinale();
          } else {
            showOverlay('Island Complete!', 'Stars collected: ' + starsCollected, false);
          }
        }, 300);
      }

      updateHud();
    }

    render();
    animId = requestAnimationFrame(frame);
  }
  frame();
}

function render(){
  const ctx = gameCtx;
  ctx.clearRect(0,0,CANVAS_W,CANVAS_H);

  // water background stripes
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for(let i=0;i<5;i++){
    ctx.fillRect(-((cameraX*0.3)%80) + i*160, CANVAS_H-30, 90, 6);
  }

  // platforms
  level.platforms.forEach(p=>{
    const sx = p.x - cameraX;
    if(sx + p.w < 0 || sx > CANVAS_W) return;
    ctx.fillStyle = island.platform;
    if(ctx.roundRect){
      ctx.beginPath();
      ctx.roundRect(sx, p.y, p.w, p.h, 9);
      ctx.fill();
    } else {
      ctx.fillRect(sx, p.y, p.w, p.h);
    }
  });

  // stars
  stars.forEach(s=>{
    if(s.taken) return;
    const sx = s.x - cameraX;
    if(sx < -20 || sx > CANVAS_W+20) return;
    ctx.fillStyle = island.star;
    drawStar(ctx, sx, s.y, 11);
  });

  // flag
  const flagSx = level.flagX - cameraX;
  if(flagSx > -40 && flagSx < CANVAS_W+40){
    ctx.strokeStyle = '#4a3f6b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(flagSx, 300);
    ctx.lineTo(flagSx, 190);
    ctx.stroke();
    ctx.fillStyle = '#ff6f91';
    ctx.beginPath();
    ctx.moveTo(flagSx, 190);
    ctx.lineTo(flagSx+40, 205);
    ctx.lineTo(flagSx, 220);
    ctx.closePath();
    ctx.fill();
  }

  // player
  ctx.save();
  ctx.translate(player.x - cameraX - 45 + player.w/2, player.y - 70);
  const legOffset = player.onGround ? Math.sin(player.legPhase) * 8 : 0;
  if(player.facing === -1){
    ctx.translate(90, 0);
    ctx.scale(-1, 1);
  }
  drawCharacter(ctx, 90, 130, state.character, { legOffset });
  ctx.restore();
}

function drawStar(ctx, cx, cy, r){
  ctx.beginPath();
  for(let i=0;i<5;i++){
    const angle = (Math.PI/5)*2*i - Math.PI/2;
    const x1 = cx + r*Math.cos(angle);
    const y1 = cy + r*Math.sin(angle);
    ctx.lineTo(x1,y1);
    const angle2 = angle + Math.PI/5;
    const x2 = cx + (r/2.3)*Math.cos(angle2);
    const y2 = cy + (r/2.3)*Math.sin(angle2);
    ctx.lineTo(x2,y2);
  }
  ctx.closePath();
  ctx.fill();
}

/* ---------- overlay ---------- */
function showOverlay(title, text, isGameOver){
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-text').textContent = text;
  document.getElementById('overlay').classList.remove('hidden');
  document.getElementById('overlay-retry').style.display = isGameOver ? 'inline-block' : 'none';
}
function hideOverlay(){
  document.getElementById('overlay').classList.add('hidden');
}

function goFinale(){
  cancelAnimationFrame(animId);
  showScreen('screen-finale');
  const totalStars = Object.values(state.progress).reduce((s,p)=> s + (p.stars||0), 0);
  document.getElementById('finaleStars').textContent = 'Total stars collected: ' + totalStars;
  const canvas = document.getElementById('finaleCanvas');
  const ctx = setupCanvas(canvas, 200, 260);
  drawCharacter(ctx, 200, 260, state.character, {});
}

/* ---------- wiring ---------- */
window.addEventListener('DOMContentLoaded', ()=>{
  loadState();
  setupCreator();
  renderIslandMap();

  document.getElementById('toIslands').addEventListener('click', ()=>{
    renderIslandMap();
    showScreen('screen-islands');
  });
  document.getElementById('backToCreator').addEventListener('click', ()=> showScreen('screen-character'));

  document.getElementById('overlay-retry').addEventListener('click', ()=>{
    hideOverlay();
    startIsland(island.id);
  });
  document.getElementById('overlay-map').addEventListener('click', ()=>{
    hideOverlay();
    cancelAnimationFrame(animId);
    renderIslandMap();
    showScreen('screen-islands');
  });

  document.getElementById('finaleReplay').addEventListener('click', ()=>{
    state.progress = {};
    saveProgress();
    renderIslandMap();
    showScreen('screen-islands');
  });

  window.addEventListener('keydown', (e)=>{
    if(e.code === 'ArrowLeft' || e.code === 'KeyA'){ keys.left = true; e.preventDefault(); }
    if(e.code === 'ArrowRight' || e.code === 'KeyD'){ keys.right = true; e.preventDefault(); }
    if(e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW'){ jump(); e.preventDefault(); }
  });
  window.addEventListener('keyup', (e)=>{
    if(e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if(e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  });

  function bindHold(btnId, onDown, onUp){
    const btn = document.getElementById(btnId);
    btn.addEventListener('pointerdown', (e)=>{ e.preventDefault(); onDown(); });
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointerleave', onUp);
    btn.addEventListener('pointercancel', onUp);
  }
  bindHold('btn-left', ()=>keys.left=true, ()=>keys.left=false);
  bindHold('btn-right', ()=>keys.right=true, ()=>keys.right=false);
  document.getElementById('btn-jump').addEventListener('pointerdown', (e)=>{ e.preventDefault(); jump(); });
});
