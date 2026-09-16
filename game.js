/* ---------- Dreamland Run ---------- */

const SKIN_COLORS = ['#ffe0bd','#f1c27d','#c68642','#8d5524'];
const HAIR_COLORS = ['#3b2415','#ffd166','#ff6f91','#7b6cff','#2ec4b6'];
const OUTFIT_COLORS = ['#ff8fab','#8ecae6','#ffd166','#b8f2d1','#c9b6ff'];

const ISLANDS = [
  { id:0, name:'Cloud Isle',   bg:'#cdeeff', platform:'#ffffff', star:'#ffd166', speed:3.2, length:4500 },
  { id:1, name:'Candy Isle',   bg:'#ffe0f0', platform:'#ffb3d9', star:'#fff275', speed:3.8, length:5200 },
  { id:2, name:'Mint Isle',    bg:'#e2fff0', platform:'#b8f2d1', star:'#ffb703', speed:4.4, length:5800 },
  { id:3, name:'Twilight Isle',bg:'#e6e0ff', platform:'#c9b6ff', star:'#ffe066', speed:5.0, length:6500 },
];

const state = {
  character: { gender:'girl', skin:SKIN_COLORS[0], hair:HAIR_COLORS[0], outfit:OUTFIT_COLORS[0], hat:false, glasses:false },
  progress: {}, // islandId -> {completed:bool, stars:number}
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

/* ---------- character drawing ---------- */
function drawCharacter(ctx, w, h, ch, opts){
  opts = opts || {};
  ctx.clearRect(0,0,w,h);
  const cx = w/2;
  const legOffset = opts.legOffset || 0;
  const bob = opts.bob || 0;
  const baseY = h*0.55 + bob;

  // legs
  ctx.fillStyle = '#4a3f6b';
  ctx.fillRect(cx-18, baseY+40, 12, 30+legOffset);
  ctx.fillRect(cx+6, baseY+40, 12, 30-legOffset);

  // body / outfit
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

  // arms
  ctx.fillStyle = ch.skin;
  ctx.fillRect(cx-30, baseY, 10, 34);
  ctx.fillRect(cx+20, baseY, 10, 34);

  // head
  ctx.fillStyle = ch.skin;
  ctx.beginPath();
  ctx.arc(cx, baseY-30, 26, 0, Math.PI*2);
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

  // glasses
  if(ch.glasses){
    ctx.strokeStyle = '#4a3f6b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx-10, baseY-30, 8, 0, Math.PI*2);
    ctx.arc(cx+10, baseY-30, 8, 0, Math.PI*2);
    ctx.moveTo(cx-2, baseY-30);
    ctx.lineTo(cx+2, baseY-30);
    ctx.stroke();
  }

  // hat
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

  renderPreview();
}

function renderPreview(){
  const canvas = document.getElementById('charPreview');
  const ctx = canvas.getContext('2d');
  drawCharacter(ctx, canvas.width, canvas.height, state.character, {});
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

/* ---------- game logic ---------- */
let gameCtx, gameCanvas, animId;
let player, platforms, distance, stars, island, gameOver, levelComplete;

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
  gameCtx = gameCanvas.getContext('2d');
  gameCanvas.style.background = island.bg;

  player = { x:120, y:200, vy:0, w:28, h:60, onGround:false, legOffset:0 };
  distance = 0;
  stars = 0;
  gameOver = false;
  levelComplete = false;

  platforms = [];
  let px = 60;
  for(let i=0;i<6;i++){
    const py = 250 + Math.random()*80 - 40;
    platforms.push(makePlatform(px, py));
    px += 150 + Math.random()*60;
  }
  updateHud();
}

function makePlatform(x,y){
  const hasStar = Math.random() < 0.6;
  return { x, y, w:90, h:18, star: hasStar, starTaken:false };
}

function updateHud(){
  document.getElementById('hud-stars').innerHTML = '&#9733; ' + stars;
  const pct = Math.min(100, Math.round((distance/island.length)*100));
  document.getElementById('hud-progress').textContent = 'Distance: ' + pct + '%';
}

function jump(){
  if(player.onGround && !gameOver && !levelComplete){
    player.vy = -10.5;
    player.onGround = false;
  }
}

function runGameLoop(){
  cancelAnimationFrame(animId);
  const gravity = 0.55;

  function frame(){
    if(!gameOver && !levelComplete){
      distance += island.speed;

      // scroll platforms
      platforms.forEach(p=> p.x -= island.speed);
      // remove off-screen, add new ahead
      while(platforms.length && platforms[0].x + platforms[0].w < -20){
        platforms.shift();
      }
      const last = platforms[platforms.length-1];
      if(last.x < gameCanvas.width + 100 && distance < island.length){
        const gap = 130 + Math.random()*70;
        const newY = Math.max(180, Math.min(340, last.y + (Math.random()*140-70)));
        platforms.push(makePlatform(last.x + gap, newY));
      }

      // physics
      player.vy += gravity;
      player.y += player.vy;
      player.legOffset = Math.sin(distance*0.15) * 8;

      // collision (only when falling)
      let landed = false;
      if(player.vy >= 0){
        for(const p of platforms){
          const footY = player.y + player.h;
          if(player.x + player.w > p.x && player.x < p.x + p.w &&
             footY >= p.y && footY <= p.y + p.h + player.vy + 1){
            player.y = p.y - player.h;
            player.vy = 0;
            player.onGround = true;
            landed = true;
            if(p.star && !p.starTaken){
              p.starTaken = true;
              stars++;
              updateHud();
            }
          }
        }
      }
      if(!landed) player.onGround = false;

      // fell off screen
      if(player.y > gameCanvas.height + 40){
        gameOver = true;
        showOverlay('Oh no!', 'You fell into the clouds. Stars collected: ' + stars, true);
      }

      // level complete
      if(distance >= island.length && player.onGround){
        levelComplete = true;
        state.progress[island.id] = { completed:true, stars: Math.max(stars, (state.progress[island.id]||{}).stars||0) };
        saveProgress();
        const isLast = island.id === ISLANDS.length - 1;
        setTimeout(()=>{
          if(isLast){
            goFinale();
          } else {
            showOverlay('Island Complete!', 'Stars collected: ' + stars, false);
          }
        }, 400);
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
  ctx.clearRect(0,0,gameCanvas.width, gameCanvas.height);

  // platforms + stars
  platforms.forEach(p=>{
    ctx.fillStyle = island.platform;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(p.x, p.y, p.w, p.h, 9) : ctx.rect(p.x, p.y, p.w, p.h);
    ctx.fill();

    if(p.star && !p.starTaken){
      ctx.fillStyle = island.star;
      drawStar(ctx, p.x + p.w/2, p.y - 22, 10);
    }
  });

  // player
  ctx.save();
  ctx.translate(player.x - 45 + player.w/2, player.y - 70);
  drawCharacter(ctx, 90, 130, state.character, { legOffset: player.onGround ? player.legOffset : 0 });
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
  drawCharacter(canvas.getContext('2d'), canvas.width, canvas.height, state.character, {});
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

  document.getElementById('gameCanvas').addEventListener('click', jump);
  window.addEventListener('keydown', (e)=>{
    if(e.code === 'Space'){ e.preventDefault(); jump(); }
  });
});
