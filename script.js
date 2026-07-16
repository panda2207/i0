/* ==========================================
   Kiran's Birthday Website — Full Script
   Swiper • AOS • Fireworks • Typewriter
   Message Board (localStorage)
   ========================================== */

// ── Global Swiper instance ─────────────────
let swiper;
let totalSlides = 8;
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

    // Auto-pause other playing videos when one starts
    v.addEventListener('play', () => {
      videos.forEach((otherV) => {
        if (otherV !== v) {
          otherV.pause();
        }
      });
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
        // Hide Next button only on the very last slide
        const fixedBtn = document.getElementById('fixedNextBtn');
        if (fixedBtn) {
          fixedBtn.style.display = (this.activeIndex >= 7) ? 'none' : '';
        }
        if (this.activeIndex === 6) {
          startSkyReveal(); // Slide 7 (index 6)
        } else {
          stopSkyReveal();
        }
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
    else if (type === 'melody') {
      // Soft piano-like ambient chord progression: Cmaj9 -> Fmaj9 -> Am9 -> Gsus4
      const chords = [
        [130.81, 261.63, 329.63, 392.00, 493.88], // Cmaj9
        [174.61, 349.23, 440.00, 523.25, 659.25], // Fmaj9
        [220.00, 440.00, 523.25, 659.25, 783.99], // Am9
        [196.00, 392.00, 493.88, 587.33, 698.46]  // Gsus4
      ];
      chords.forEach((chord, chordIdx) => {
        chord.forEach((freq, noteIdx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          
          o.type = 'triangle'; // soft triangle wave
          o.frequency.value = freq;
          
          const start = now + chordIdx * 1.6 + noteIdx * 0.06;
          const duration = 1.8;
          
          g.gain.setValueAtTime(0, start);
          g.gain.linearRampToValueAtTime(0.05, start + 0.15); // soft attack
          g.gain.exponentialRampToValueAtTime(0.001, start + duration);
          
          o.start(start);
          o.stop(start + duration);
        });
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

/* ==========================================
   Slide 7 — Sky Wishes Cinematic Reveal Logic
   ========================================== */
let skyShapeInterval = null;
let skyCanvasAnimationFrameId = null;

function startSkyReveal() {
  const container = document.getElementById('skyFloatingContainer');
  const msgContainer = document.querySelector('.sky-message-container');
  const canvas = document.getElementById('skyCanvas');
  if (!container || !msgContainer || !canvas) return;

  // Reset CSS states
  container.innerHTML = '';
  msgContainer.classList.remove('reveal-active');

  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Create offscreen text target coordinates
  let targets = [];
  try {
    const offscreenCanvas = document.createElement('canvas');
    const offctx = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = window.innerWidth;
    offscreenCanvas.height = window.innerHeight;

    offctx.fillStyle = '#ffffff';
    offctx.textAlign = 'center';
    offctx.textBaseline = 'middle';

    let fontSize1 = Math.max(16, Math.min(30, window.innerWidth / 30));
    let fontSize2 = Math.max(18, Math.min(34, window.innerWidth / 28));
    const lineSpacing = Math.max(30, Math.min(60, window.innerWidth / 20));

    // Sample coordinates
    offctx.font = `bold ${fontSize1}px "Poppins", sans-serif`;
    offctx.fillText('Many More Happy Returns of the Day ✨🎆', offscreenCanvas.width / 2, offscreenCanvas.height / 2 - lineSpacing / 2);

    offctx.font = `italic bold ${fontSize2}px "Playfair Display", Georgia, serif`;
    offctx.fillText('Reddy Kiranmayi Sai Sri Gayathri Devi', offscreenCanvas.width / 2, offscreenCanvas.height / 2 + lineSpacing / 2);

    const imgData = offctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    const step = window.innerWidth < 768 ? 2 : 3;

    for (let y = 0; y < offscreenCanvas.height; y += step) {
      for (let x = 0; x < offscreenCanvas.width; x += step) {
        const idx = (y * offscreenCanvas.width + x) * 4;
        const alpha = imgData.data[idx + 3];
        if (alpha > 128) {
          targets.push({ x, y });
        }
      }
    }
  } catch (err) {
    console.error('Error calculating targets in startSkyReveal:', err);
  }

  // Animation variables
  let skyState = 'starry'; // starry, launch-crimson, explode-crimson, launch-hearts, explode-hearts, swirl, gather, glow
  let frameCount = 0;
  let skyParticles = [];
  let rockets = [];
  
  // 60 Tiny Golden background stars
  let canvasStars = [];
  for (let i = 0; i < 60; i++) {
    canvasStars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.8,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.015 + 0.005
    });
  }

  // Color selection
  function getRubyGoldColor() {
    const r = Math.random();
    if (r < 0.45) return '#d32f2f'; // Crimson red
    if (r < 0.8) return '#990000';  // Ruby red
    return '#ffd54f';               // Gold
  }

  class Rocket {
    constructor(x, y, tx, ty, color) {
      this.x = x;
      this.y = y;
      this.tx = tx;
      this.ty = ty;
      this.vx = (tx - x) / 50;
      this.vy = -12;
      this.color = color;
      this.history = [];
      this.exploded = false;
    }
    update() {
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > 6) this.history.shift();
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.13; // slow down due to gravity
      if (this.vy >= 0 || this.y <= this.ty) {
        this.exploded = true;
      }
    }
    draw() {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (this.history.length > 0) {
        ctx.moveTo(this.history[0].x, this.history[0].y);
        for (let pt of this.history) ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }
  }

  class Particle {
    constructor(x, y, targetX, targetY, color, isHeart = false, angleIdx = 0, totalAngles = 1) {
      this.x = x;
      this.y = y;
      this.targetX = targetX;
      this.targetY = targetY;
      this.color = color;
      
      // Explosion physics
      if (isHeart) {
        // Parametric heart formula: x = 16sin^3(t), y = -(13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t))
        const theta = (angleIdx / totalAngles) * Math.PI * 2;
        const speedFactor = Math.random() * 0.4 + 0.8;
        this.vx = 16 * Math.sin(theta) ** 3 * 0.23 * speedFactor;
        this.vy = -(13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta)) * 0.23 * speedFactor;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      }
      
      this.size = Math.random() * 1.6 + 1.2;
      this.orbitAngle = Math.random() * Math.PI * 2;
      this.orbitSpeed = (Math.random() * 0.02 + 0.015) * (Math.random() < 0.5 ? 1 : -1);
      this.orbitRadius = Math.random() * 120 + 80;
    }
    update(centerX, centerY) {
      if (skyState === 'explode-crimson' || skyState === 'launch-hearts' || skyState === 'explode-hearts') {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.vy += 0.05; // tiny gravity
      } else if (skyState === 'swirl') {
        this.orbitAngle += this.orbitSpeed;
        this.orbitRadius = this.orbitRadius * 0.985 + 3.0; // spiral inward
        const targetSwirlX = centerX + Math.cos(this.orbitAngle) * this.orbitRadius;
        const targetSwirlY = centerY + Math.sin(this.orbitAngle) * this.orbitRadius;
        
        // vortex pulling
        this.x += (targetSwirlX - this.x) * 0.08;
        this.y += (targetSwirlY - this.y) * 0.08;
      } else if (skyState === 'gather') {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.x += dx * 0.06;
        this.y += dy * 0.06;
      } else if (skyState === 'glow') {
        this.x = this.targetX + (Math.random() - 0.5) * 0.4;
        this.y = this.targetY + (Math.random() - 0.5) * 0.4;
      }
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Slicing indices for explosions
  const totalTargets = targets.length || 900;
  const slice1 = Math.floor(totalTargets / 3);
  const slice2 = Math.floor(2 * totalTargets / 3);

  // Play the soft piano-ambient melody sound
  playTone('melody');

  if (skyCanvasAnimationFrameId) cancelAnimationFrame(skyCanvasAnimationFrameId);

  function loop() {
    // Clear & leave soft trails
    ctx.fillStyle = 'rgba(10, 4, 24, 0.16)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Twinkling Golden stars
    ctx.fillStyle = '#ffd54f';
    for (let s of canvasStars) {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
      ctx.globalAlpha = Math.max(0.2, Math.min(1, s.alpha));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0; // reset

    frameCount++;

    // Timeline state machine
    if (skyState === 'starry' && frameCount > 50) {
      // 0.8s: Launch crimson rocket
      skyState = 'launch-crimson';
      rockets.push(new Rocket(canvas.width / 2, canvas.height, canvas.width / 2, canvas.height * 0.45, '#d32f2f'));
    } 
    else if (skyState === 'launch-crimson') {
      const r = rockets[0];
      if (r) {
        r.update();
        if (r.exploded) {
          skyState = 'explode-crimson';
          playTone('pop');
          rockets.shift();
          
          // Spawn Crimson particles mapped to first target slice
          for (let i = 0; i < slice1; i++) {
            const tx = targets[i] ? targets[i].x : canvas.width / 2 + (Math.random() - 0.5) * 200;
            const ty = targets[i] ? targets[i].y : canvas.height / 2 + (Math.random() - 0.5) * 100;
            skyParticles.push(new Particle(canvas.width / 2, canvas.height * 0.45, tx, ty, getRubyGoldColor()));
          }
        } else {
          r.draw();
        }
      }
    } 
    else if (skyState === 'explode-crimson' && frameCount > 135) {
      // 2.25s: Launch heart rockets
      skyState = 'launch-hearts';
      rockets.push(new Rocket(canvas.width * 0.3, canvas.height, canvas.width * 0.33, canvas.height * 0.35, '#ff4d6d'));
      rockets.push(new Rocket(canvas.width * 0.7, canvas.height, canvas.width * 0.67, canvas.height * 0.38, '#ff4d6d'));
    } 
    else if (skyState === 'launch-hearts') {
      let activeRockets = false;
      for (let r of rockets) {
        if (!r.exploded) {
          activeRockets = true;
          r.update();
          r.draw();
        }
      }
      if (!activeRockets) {
        skyState = 'explode-hearts';
        playTone('pop');
        
        // Spawn heart-shaped particles mapped to target slices 2 & 3
        const countL = slice2 - slice1;
        const countR = totalTargets - slice2;
        
        for (let i = slice1; i < slice2; i++) {
          const tx = targets[i] ? targets[i].x : canvas.width / 2 + (Math.random() - 0.5) * 200;
          const ty = targets[i] ? targets[i].y : canvas.height / 2 + (Math.random() - 0.5) * 100;
          skyParticles.push(new Particle(canvas.width * 0.33, canvas.height * 0.35, tx, ty, getRubyGoldColor(), false, i - slice1, countL));
        }
        for (let i = slice2; i < totalTargets; i++) {
          const tx = targets[i] ? targets[i].x : canvas.width / 2 + (Math.random() - 0.5) * 200;
          const ty = targets[i] ? targets[i].y : canvas.height / 2 + (Math.random() - 0.5) * 100;
          skyParticles.push(new Particle(canvas.width * 0.67, canvas.height * 0.38, tx, ty, getRubyGoldColor(), false, i - slice2, countR));
        }
        rockets = [];
      }
    } 
    else if (skyState === 'explode-hearts' && frameCount > 270) {
      // 4.5s: Swirl together like magic
      skyState = 'swirl';
    } 
    else if (skyState === 'swirl' && frameCount > 380) {
      // 6.3s: Gather to form text coordinates
      skyState = 'gather';
    } 
    else if (skyState === 'gather' && frameCount > 490) {
      // 8.1s: Fully gather, settle and glow
      skyState = 'glow';
      msgContainer.classList.add('reveal-active');
    }

    // Update and draw active particles
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    for (let p of skyParticles) {
      p.update(centerX, centerY);
      p.draw();
    }

    // Twinkling gold sparkles around letters in glow state
    if (skyState === 'glow' && Math.random() < 0.25) {
      for (let i = 0; i < 4; i++) {
        const randPt = targets[Math.floor(Math.random() * targets.length)];
        if (randPt) {
          // Add temporary gold sparkle on canvas
          ctx.fillStyle = '#ffd54f';
          ctx.beginPath();
          ctx.arc(randPt.x + (Math.random() - 0.5) * 12, randPt.y + (Math.random() - 0.5) * 12, Math.random() * 1.8 + 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    skyCanvasAnimationFrameId = requestAnimationFrame(loop);
  }

  // Spawner for floating stars and hearts in the air
  if (skyShapeInterval) clearInterval(skyShapeInterval);
  skyShapeInterval = setInterval(() => {
    if (swiper.activeIndex !== 6) {
      clearInterval(skyShapeInterval);
      skyShapeInterval = null;
      return;
    }
    spawnSkyShape(container);
  }, 350);

  loop();
}

function spawnSkyShape(container) {
  if (!container) return;
  const shape = document.createElement('div');
  shape.className = 'floating-sky-shape';
  
  const size = Math.random() * 16 + 10; // 10px to 26px
  shape.style.width = size + 'px';
  shape.style.height = size + 'px';
  shape.style.left = Math.random() * 95 + 'vw';
  
  const swayDist = (Math.random() - 0.5) * 40; // random swaying offset
  shape.style.transform = `translateX(${swayDist}px)`;
  
  // Spawn sparkling stars in the sky, no heart icons
  shape.innerHTML = '<i class="fa-solid fa-star" style="color: #ffd54f; filter: drop-shadow(0 0 5px rgba(255, 213, 79, 0.55));"></i>';
  
  const duration = Math.random() * 4 + 5; // 5s to 9s
  shape.style.animationDuration = duration + 's';
  
  container.appendChild(shape);
  
  setTimeout(() => {
    shape.remove();
  }, duration * 1000);
}

function stopSkyReveal() {
  if (skyShapeInterval) {
    clearInterval(skyShapeInterval);
    skyShapeInterval = null;
  }
  if (skyCanvasAnimationFrameId) {
    cancelAnimationFrame(skyCanvasAnimationFrameId);
    skyCanvasAnimationFrameId = null;
  }
}
