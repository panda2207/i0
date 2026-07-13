/* ==========================================
   Kiran's Birthday Website — Full Script
   Swiper • AOS • Fireworks • Typewriter
   Message Board (localStorage)
   ========================================== */

// ── Global Swiper instance ─────────────────
let swiper;
let totalSlides = 7;
let typingStarted = false;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMusic();
  AOS.init({ duration: 900, once: false, mirror: true });
  
  // Visual video error diagnostics reporter
  const videos = document.querySelectorAll('video');
  videos.forEach((v) => {
    v.addEventListener('error', () => {
      let msg = "Unknown video loading error";
      if (v.error) {
        if (v.error.code === 1) msg = "Playback aborted by browser";
        else if (v.error.code === 2) msg = "Network loading error";
        else if (v.error.code === 3) msg = "Format decoding error (Unsupported Codec)";
        else if (v.error.code === 4) msg = "Source video file not found";
      }
      
      const overlay = document.createElement('div');
      overlay.className = 'video-error-overlay';
      overlay.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i><p>${msg}</p><span>(${v.getAttribute('src')})</span>`;
      
      const parent = v.parentNode;
      if (parent) {
        parent.style.position = 'relative';
        parent.appendChild(overlay);
      }
    });
  });

  initSwiper();
  initFireworks();
  initSlide1Click();
  loadMessages();
  spawnShapes('shapes1');
  spawnShapes('shapes6');
  spawnShapes('shapes7');
  initCursorTrail();
});

/* ==========================================
   1. Theme Toggle (Light ↔ Dark)
   ========================================== */
function initTheme() {
  const btn  = document.getElementById('themeToggle');
  const body = document.body;
  const saved = localStorage.getItem('kiran_theme') || 'light-theme';
  body.className = saved;
  updateThemeIcon(btn, saved);

  btn.addEventListener('click', () => {
    playTone('pop');
    const isDark = body.classList.contains('dark-theme');
    const next = isDark ? 'light-theme' : 'dark-theme';
    body.className = next;
    localStorage.setItem('kiran_theme', next);
    updateThemeIcon(btn, next);
  });
}

function updateThemeIcon(btn, theme) {
  btn.innerHTML = theme === 'dark-theme'
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

/* ==========================================
   2. Background Music
   ========================================== */
function initMusic() {
  const btn   = document.getElementById('musicToggle');
  const audio = document.getElementById('bgMusic');

  btn.addEventListener('click', () => {
    playTone('pop');
    if (audio.paused) {
      audio.play().then(() => {
        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      }).catch(() => {});
    } else {
      audio.pause();
      btn.innerHTML = '<i class="fa-solid fa-music"></i>';
    }
  });
}

/* ==========================================
   3. Swiper — Button-Only Navigation
   ========================================== */
function initSwiper() {
  swiper = new Swiper('.mainSwiper', {
    direction:     'horizontal',
    slidesPerView: 1,
    allowTouchMove: false,
    mousewheel:    false,
    keyboard:      false,
    speed:         700,
    pagination: {
      el:        '.swiper-pagination',
      clickable: false,
    },
    on: {
      slideChange() {
        updateProgress(this.activeIndex);
        updateCounter(this.activeIndex);
        AOS.refresh();
        if (this.activeIndex === 3) startTypewriter(); // Slide 4 (index 3)
      }
    }
  });

  updateProgress(0);
  updateCounter(0);
}

window.goNext = function () {
  playTone('pop');
  swiper && swiper.slideNext();
};

function updateProgress(index) {
  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = `${((index + 1) / totalSlides) * 100}%`;
}

function updateCounter(index) {
  const el = document.getElementById('slideCounter');
  if (el) el.textContent = `${index + 1} / ${totalSlides}`;
}

/* ==========================================
   4. Typewriter — Slide 3 Full Message
      (from the screenshot you shared)
   ========================================== */
const kiranaMessage =
`Happy Birthday, Kiran!

I'm so grateful to have you in my life. You are a very special person to me, and I thank God every day for you.

There are many people in this world, but for me, there is only one Kiran. You are not just my friend — you are a very special part of my life. Your friendship means everything to me. Thank you for always being by my side, understanding me, supporting me, and making my life happier. I feel truly blessed to have you in my life.

Because you mean so much to me, every time I go to a temple, I pray for your good health, success, happiness, and a beautiful life. Whenever I pray to Sai Baba, one of my prayers is always for you.

I asked Sai Baba to bless you with good health and to keep you away from any health problems in the future. I prayed for you with all my heart, and I truly believe He listened to my prayer. I have complete faith that He will always bless you, protect you, and take care of you. I promise you that He will always be with you, and I truly believe He will answer my prayers for you and bless you with all of this.

No matter what problems you face in life, you will never have to face them alone. I believe in you, and I know you can overcome every challenge that comes your way. I will always be there for you, to support you, stand by your side, and help you in every way I can. I will always be happy to see you succeed, and I will always feel proud and happy celebrating your success.

May God always keep you safe, and give you everything that makes you happy.

Happy Birthday, Kiran! 🎂✨

— Your Friend`;

function startTypewriter() {
  if (typingStarted) return;
  typingStarted = true;

  const box    = document.getElementById('typewriterText');
  const cursor = document.querySelector('.cursor-blink');
  if (!box) return;

  box.textContent = '';
  let i = 0;

  function tick() {
    if (i >= kiranaMessage.length) {
      if (cursor) cursor.style.display = 'none';
      return;
    }
    const ch = kiranaMessage[i];
    box.textContent += ch;
    i++;

    // Sync scrolling inside the slide-inner so we can read as it types
    const inner = box.closest('.slide-inner');
    if (inner) inner.scrollTop = inner.scrollHeight;

    // Natural pacing
    let delay = 28;
    if (ch === '.' || ch === '!')        delay = 400;
    else if (ch === ',')                 delay = 180;
    else if (ch === '\n')                delay = 120;

    // Quiet click for consonants (not every char for perf)
    if (ch !== ' ' && ch !== '\n' && Math.random() < 0.4) {
      playTone('type');
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 600);
}

/* ==========================================
   5. Web-Audio Sound Engine
   ========================================== */
function playTone(type) {
  try {
    const AC  = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx  = new AC();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    if (type === 'type') {
      const osc  = ctx.createOscillator();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.012);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
      osc.start(now); osc.stop(now + 0.012);
    }
    else if (type === 'pop') {
      const osc  = ctx.createOscillator();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.09);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now); osc.stop(now + 0.09);
    }
    else if (type === 'chime') {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.07, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.22);
      });
    }
    else if (type === 'blow') {
      // Noise-based puff/whoosh sound synthesis
      const bufferSize = ctx.sampleRate * 0.22;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.22);
      filter.Q.setValueAtTime(4.0, now);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      noise.start(now);
      noise.stop(now + 0.22);
    }
    else if (type === 'celebrate') {
      // Beautiful cascading seventh arpeggio chimes
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((f, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.12, now + idx * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.4);
        o.start(now + idx * 0.07);
        o.stop(now + idx * 0.07 + 0.4);
      });
    }
  } catch (_) {}
}

/* ==========================================
   6. Slide 1 — Click-to-Confetti
   ========================================== */
function initSlide1Click() {
  const s1 = document.querySelector('.slide-1');
  if (!s1) return;
  s1.addEventListener('click', e => {
    if (e.target.closest('.next-btn') || e.target.closest('.control-btn')) return;
    playTone('pop');
    confetti({
      particleCount: 40,
      spread: 65,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
    });
  });
}

/* ==========================================
   7. Fireworks Canvas System
   ========================================== */
const fwCanvas    = document.getElementById('fireworksCanvas');
const fwCtx       = fwCanvas ? fwCanvas.getContext('2d') : null;
let   fwActive    = false;
let   fwParticles = [];
let   fwRockets   = [];

function initFireworks() {
  if (!fwCanvas || !fwCtx) return;

  const resize = () => {
    fwCanvas.width  = window.innerWidth;
    fwCanvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  function loop() {
    if (!fwActive) {
      fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
      requestAnimationFrame(loop);
      return;
    }
    fwCtx.fillStyle = 'rgba(0,0,0,0.12)';
    fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);

    // Rockets
    for (let i = fwRockets.length - 1; i >= 0; i--) {
      const r = fwRockets[i];
      r.x += r.vx; r.y += r.vy;
      fwCtx.fillStyle = '#fff';
      fwCtx.beginPath();
      fwCtx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
      fwCtx.fill();
      if (r.vy >= 0 || r.y <= r.peak) {
        burst(r.x, r.y);
        fwRockets.splice(i, 1);
      }
    }

    // Sparks
    for (let i = fwParticles.length - 1; i >= 0; i--) {
      const p = fwParticles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.045; p.alpha -= p.fade;
      fwCtx.fillStyle = `hsla(${p.hue},100%,65%,${p.alpha})`;
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      fwCtx.fill();
      if (p.alpha <= 0) fwParticles.splice(i, 1);
    }
    requestAnimationFrame(loop);
  }
  loop();
}

function launch() {
  if (!fwActive) return;
  const x = Math.random() * fwCanvas.width;
  const peak = fwCanvas.height * (0.15 + Math.random() * 0.45);
  const ang = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
  const spd = 7 + Math.random() * 5;
  fwRockets.push({ x, y: fwCanvas.height, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, peak });
  playTone('pop');
}

function burst(x, y) {
  const hue   = Math.random() * 360;
  const count = 55 + Math.random() * 40;
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 1.5 + Math.random() * 4;
    fwParticles.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      hue, alpha: 1, r: 1 + Math.random() * 2, fade: 0.012 + Math.random() * 0.012 });
  }
  playTone('chime');
}

/* ==========================================
   8. Celebration Button (Slide 5)
   ========================================== */
window.triggerCelebration = function () {
  playTone('chime');
  fwActive = true;

  // Rapid rocket launches
  let n = 0;
  const iv = setInterval(() => { launch(); if (++n >= 10) clearInterval(iv); }, 320);

  // Side-cannon confetti
  const end = Date.now() + 3000;
  (function frame() {
    confetti({ particleCount: 4, angle: 60,  spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  // Show Thank-You overlay after a short delay
  setTimeout(() => {
    document.getElementById('thankyouOverlay').classList.add('active');
  }, 2400);
};

window.closeOverlay = function () {
  playTone('pop');
  document.getElementById('thankyouOverlay').classList.remove('active');
  fwActive = false;
};

/* ==========================================
   9. Message Board (Slide 5 Form + Wall)
      Persisted in localStorage
   ========================================== */
const STORAGE_KEY = 'kiran_messages_v2';

const defaultMessages = [
  {
    name:   'Reddy Koushik',
    text:   'Happy Birthday Kiran! You are the absolute best! 🎉🐼',
    avatar: 'panda'
  }
];

function loadMessages() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const list  = (saved && saved.length) ? saved : defaultMessages;
  renderWall(list);
}

function renderWall(list) {
  const wall = document.getElementById('msgWall');
  if (!wall) return;
  wall.innerHTML = '';
  list.forEach(m => wall.appendChild(buildCard(m)));
}

function buildCard(msg) {
  const avatarMap = {
    panda:    'panda.jpg',
    doraemon: 'doraemon.jpg',
    shinchan: 'shinchan.jpg',
    tom_jerry:'tom_jerry.jpg'
  };
  const src = avatarMap[msg.avatar] || 'panda.jpg';

  const div = document.createElement('div');
  div.className = 'msg-wall-item';
  div.innerHTML = `
    <img src="${src}" alt="${msg.avatar}" class="msg-wall-avatar">
    <div class="msg-wall-body">
      <div class="msg-wall-name">${esc(msg.name)}</div>
      <div class="msg-wall-text">${esc(msg.text)}</div>
    </div>`;
  return div;
}

window.submitMessage = function (e) {
  e.preventDefault();
  playTone('chime');

  const name   = document.getElementById('msgSenderName').value.trim();
  const text   = document.getElementById('msgBody').value.trim();
  const avatar = document.querySelector('input[name="msgAvatar"]:checked')?.value || 'panda';

  if (!name || !text) return;

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultMessages;
  const newMsg = { name, text, avatar };
  saved.unshift(newMsg);   // newest at top
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

  // Insert card at the top of the wall with animation
  const wall = document.getElementById('msgWall');
  const card  = buildCard(newMsg);
  wall.insertBefore(card, wall.firstChild);

  // Mini confetti celebrate
  confetti({ particleCount: 30, spread: 55, origin: { y: 0.6 } });

  // Reset form
  document.getElementById('addMsgForm').reset();
  document.querySelector('input[name="msgAvatar"][value="panda"]').checked = true;
};

// XSS-safe escape
function esc(str) {
  return str.replace(/[&<>'"]/g, t =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[t]));
}

/* ==========================================
   10. Floating Shape Decorations
   ========================================== */
function spawnShapes(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const colours = ['#ff4d6d','#ff9800','#ff1744','#ff758f','#ffd54f','#ff5722'];
  const emojis  = ['🎂','🎈','🌹','⭐','✨','🎉'];

  setInterval(() => {
    // Coloured blob
    const blob = document.createElement('div');
    blob.className = 'shape';
    const size = 20 + Math.random() * 60;
    blob.style.cssText = `
      width:${size}px; height:${size}px;
      background:${colours[Math.floor(Math.random()*colours.length)]};
      left:${Math.random()*100}%;
      animation-duration:${10 + Math.random()*12}s;
      animation-delay:${Math.random()*2}s;`;
    container.appendChild(blob);
    setTimeout(() => blob.remove(), 25000);

    // Emoji floater
    const em = document.createElement('div');
    em.style.cssText = `
      position:absolute;
      left:${Math.random()*90}%;
      font-size:${16 + Math.random()*18}px;
      opacity:0.55;
      pointer-events:none;
      animation:floatShape ${9 + Math.random()*8}s linear ${Math.random()*2}s forwards;`;
    em.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    container.appendChild(em);
    setTimeout(() => em.remove(), 25000);
  }, 1500);
}

/* ==========================================
   11. Lightbox functions for Gallery Slide
   ========================================== */
window.openLightbox = function(type, src) {
  const modal = document.getElementById('lightboxModal');
  const imgEl = document.getElementById('lightboxImage');
  const videoEl = document.getElementById('lightboxVideo');

  if (!modal || !imgEl || !videoEl) return;

  // Reset first
  imgEl.classList.add('hidden');
  videoEl.classList.add('hidden');
  imgEl.src = '';
  videoEl.src = '';

  if (type === 'image') {
    imgEl.src = src;
    imgEl.classList.remove('hidden');
  } else if (type === 'video') {
    videoEl.src = src;
    videoEl.classList.remove('hidden');
    videoEl.play().catch(() => {});
  }

  modal.classList.add('active');
  playTone('pop');
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightboxModal');
  const imgEl = document.getElementById('lightboxImage');
  const videoEl = document.getElementById('lightboxVideo');

  if (!modal || !imgEl || !videoEl) return;

  modal.classList.remove('active');
  videoEl.pause();
  imgEl.src = '';
  videoEl.src = '';
  playTone('pop');
};

/* ==========================================
   12. Magical Cursor Trail (Sparkles & Emojis)
   ========================================== */
function initCursorTrail() {
  const canvas = document.createElement('canvas');
  canvas.className = 'trail-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  const colors = ['#ff4d6d', '#ff9800', '#ff1744', '#00bcd4', '#8bc34a', '#ffeb3b'];
  const symbols = ['✨', '❤️', '⭐', '🌹', '🎈', '🎉'];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 8 + 6;
      this.speedX = (Math.random() - 0.5) * 1.5;
      this.speedY = (Math.random() - 0.5) * 1.5 - 0.8; // drift upwards
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.symbol = Math.random() < 0.2 ? symbols[Math.floor(Math.random() * symbols.length)] : null;
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.015;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.08;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha -= this.decay;
      this.rotation += this.rotationSpeed;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      if (this.symbol) {
        ctx.font = `${this.size * 1.4}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);
      } else {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          ctx.lineTo(Math.cos(i * Math.PI / 2) * this.size, Math.sin(i * Math.PI / 2) * this.size);
          ctx.lineTo(Math.cos(i * Math.PI / 2 + Math.PI / 4) * (this.size / 3.5), Math.sin(i * Math.PI / 2 + Math.PI / 4) * (this.size / 3.5));
        }
        ctx.closePath();
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
      }
      ctx.restore();
    }
  }

  window.addEventListener('mousemove', (e) => {
    if (Math.random() < 0.85) { // slightly rate-limit to look elegant
      particles.push(new Particle(e.clientX, e.clientY));
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      particles.push(new Particle(touch.clientX, touch.clientY));
    }
  });

  // Auto-spawn drifting sparkles from the bottom of the screen periodically (no touch required)
  setInterval(() => {
    if (document.hidden) return;
    const count = Math.random() < 0.4 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight + 15;
      const p = new Particle(x, y);
      p.speedY = -Math.random() * 2 - 1.2; // drift upward
      p.speedX = (Math.random() - 0.5) * 1.0;
      particles.push(p);
    }
  }, 180);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* ==========================================
   13. Switch Video in Memory Theater
   ========================================== */
window.switchTheaterVideo = function(btn, src) {
  const player = document.getElementById('theaterPlayer');
  if (!player) return;
  
  // Fade out player
  player.style.opacity = '0';
  
  // Update active tab styling
  const tabs = document.querySelectorAll('.theater-tab');
  tabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  
  setTimeout(() => {
    player.src = src;
    player.load();
    player.style.opacity = '1';
    player.play().catch(() => {});
  }, 250);
};

/* ==========================================
   14. Interactive Birthday Cake Logic
   ========================================== */
let blownCount = 0;
const totalCandles = 5;

window.blowCandle = function(candleElem, index) {
  if (candleElem.classList.contains('blown-out')) return;

  // Add blown-out class
  candleElem.classList.add('blown-out');
  blownCount++;

  // Play blowout breath sound
  playTone('blow');

  // Trigger individual small spark confetti when a candle is blown
  confetti({
    particleCount: 15,
    angle: 90,
    spread: 30,
    origin: { 
      x: candleElem.getBoundingClientRect().left / window.innerWidth, 
      y: (candleElem.getBoundingClientRect().top - 10) / window.innerHeight 
    },
    colors: ['#ff4d6d', '#ffd54f', '#ffffff']
  });

  // Check if all candles are blown out
  if (blownCount === totalCandles) {
    setTimeout(triggerCakeCelebration, 600);
  }
};

function triggerCakeCelebration() {
  // Play grand celebration cascade chimes!
  playTone('celebrate');

  // Show screen-wide burst of fireworks
  let duration = 6 * 1000;
  let animationEnd = Date.now() + duration;
  let defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  let interval = setInterval(function() {
    let timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    let particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);

  // Trigger main celebration fireworks canvas
  if (typeof triggerCelebration === 'function') {
    triggerCelebration();
  }

  // Show the secret wish card with a fade-in animation
  const secretCard = document.getElementById('secretWishCard');
  if (secretCard) {
    secretCard.classList.remove('hidden-element');
    setTimeout(() => {
      secretCard.classList.add('show-card');
    }, 100);
  }
}

/* ==========================================
   15. Slide 3 — Interactive Badge Spark Logic
   ========================================== */
window.triggerBadgeSpark = function(cardElem) {
  // Get card position on screen
  const rect = cardElem.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  // Trigger small spark confetti burst
  confetti({
    particleCount: 15,
    angle: 90,
    spread: 45,
    origin: { x, y },
    colors: ['#ff4d6d', '#ffd54f', '#ffffff']
  });

  // Play pop sound tone
  playTone('pop');
};
