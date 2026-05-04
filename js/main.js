/* ═══════════════════════════════════════
   ZIZZYBEATZ – main.js
   ═══════════════════════════════════════ */

// ── Cart State ──
let cart = [];
let currentAudio = null;
let currentPlayBtn = null;

// ══════════════════════════════
// NAVBAR – Mobile Toggle
// ══════════════════════════════
function toggleMenu() {
  const links = document.querySelector('.nav-links');
  links.classList.toggle('open');
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(22, 22, 97, 0.98)';
  } else {
    navbar.style.background = 'rgba(14, 14, 20, 0.85)';
  }
});

// Schließe Menü beim Klick auf Link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open');
  });
});

// ══════════════════════════════
// BEAT FILTER
// ══════════════════════════════
function filterBeats(genre, btn) {
  // Button aktiv setzen
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Karten filtern
  document.querySelectorAll('.beat-card').forEach(card => {
    if (genre === 'all' || card.dataset.genre === genre) {
      card.classList.remove('hidden');
      card.style.animation = 'fadeUp 0.4s ease both';
    } else {
      card.classList.add('hidden');
    }
  });
}

// ══════════════════════════════
// AUDIO PLAYER
// ══════════════════════════════
const audioEl    = document.getElementById('audioEl');
const audioPlayer = document.getElementById('audioPlayer');
const playerTitle = document.getElementById('playerTitle');
const playerPlayBtn = document.getElementById('playerPlayBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl  = document.getElementById('duration');

function playBeat(btn, src) {
  const beatCard = btn.closest('.beat-card');
  const beatName = beatCard.querySelector('h3').textContent;

  // Wenn gleicher Beat → toggle play/pause
  if (audioEl.src.endsWith(src) && !audioEl.paused) {
    pauseAudio();
    btn.innerHTML = '<i class="fas fa-play"></i>';
    btn.classList.remove('playing');
    playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    return;
  }

  // Alten Play-Button zurücksetzen
  if (currentPlayBtn && currentPlayBtn !== btn) {
    currentPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    currentPlayBtn.classList.remove('playing');
  }

  // Neuen Beat laden
  audioEl.src = src;
  audioEl.volume = document.getElementById('volumeBar').value / 100;
  audioEl.play().catch(() => {
    showToast('⚠️ Beat-Datei nicht gefunden – bitte MP3 hochladen!');
  });

  // UI updaten
  currentPlayBtn = btn;
  btn.innerHTML = '<i class="fas fa-pause"></i>';
  btn.classList.add('playing');

  playerTitle.textContent = beatName;
  playerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';

  // Player einblenden
  audioPlayer.classList.add('visible');
}

function pauseAudio() {
  audioEl.pause();
}

function togglePlay() {
  if (audioEl.paused) {
    audioEl.play();
    playerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    if (currentPlayBtn) {
      currentPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
      currentPlayBtn.classList.add('playing');
    }
  } else {
    audioEl.pause();
    playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    if (currentPlayBtn) {
      currentPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
      currentPlayBtn.classList.remove('playing');
    }
  }
}

function seekForward() {
  audioEl.currentTime = Math.min(audioEl.currentTime + 10, audioEl.duration || 0);
}

function seekBackward() {
  audioEl.currentTime = Math.max(audioEl.currentTime - 10, 0);
}

function seek(val) {
  if (audioEl.duration) {
    audioEl.currentTime = (val / 100) * audioEl.duration;
  }
}

function setVolume(val) {
  audioEl.volume = val / 100;
}

// Fortschritt aktualisieren
audioEl.addEventListener('timeupdate', () => {
  if (audioEl.duration) {
    const pct = (audioEl.currentTime / audioEl.duration) * 100;
    progressBar.value = pct;
    currentTimeEl.textContent = formatTime(audioEl.currentTime);
    durationEl.textContent = formatTime(audioEl.duration);
  }
});

// Beat zu Ende → Reset
audioEl.addEventListener('ended', () => {
  playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
  progressBar.value = 0;
  currentTimeEl.textContent = '0:00';
  if (currentPlayBtn) {
    currentPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    currentPlayBtn.classList.remove('playing');
  }
});

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ══════════════════════════════
// WARENKORB
// ══════════════════════════════
function addToCart(name, price) {
  cart.push({ name, price });
  updateCartUI();
  openCart();
  showToast(`✅ "${name}" zum Warenkorb hinzugefügt!`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.querySelector('.cart-count');

  // Count Badge
  cartCount.textContent = cart.length;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Dein Warenkorb ist leer.</p>';
    cartTotal.textContent = '0€';
    return;
  }

  // Items rendern
  cartItems.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${item.price}€</p>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${i})">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');

  // Total
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = `${total}€`;
}

function openCart() {
  document.getElementById('cartModal').classList.add('open');
  document.getElementById('cartBackdrop').classList.add('visible');
}

function closeCart() {
  document.getElementById('cartModal').classList.remove('open');
  document.getElementById('cartBackdrop').classList.remove('visible');
}

// Cart Icon Click
document.querySelector('.nav-cart').addEventListener('click', openCart);

function checkout() {
  if (cart.length === 0) {
    showToast('⚠️ Dein Warenkorb ist leer!');
    return;
  }
  showToast('🚀 Weiterleitung zur Kasse...');
  // Hier später PayPal / Stripe Integration
  setTimeout(() => {
    alert('💳 Hier kommt deine Zahlungsintegration (z.B. PayPal oder Stripe).\nBitte füge deinen Zahlungslink ein!');
  }, 1000);
}

// ══════════════════════════════
// KONTAKT FORMULAR
// ══════════════════════════════
function sendMessage(e) {
  e.preventDefault();
  showToast('📬 Nachricht gesendet! Ich melde mich bald.');
  e.target.reset();
}

// ══════════════════════════════
// TOAST NOTIFICATION
// ══════════════════════════════
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ══════════════════════════════
// SCROLL ANIMATIONS (Intersection Observer)
// ══════════════════════════════
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.beat-card, .lizenz-card, .about-card, .stat-item, .kontakt-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ══════════════════════════════
// ACTIVE NAV LINK beim Scrollen
// ══════════════════════════════
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) {
      current = sec.getAttribute('id');
    }
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.style.color = '';
    if (a.getAttribute('href') === `#${current}`) {
      a.style.color = 'var(--accent)';
    }
  });
});
