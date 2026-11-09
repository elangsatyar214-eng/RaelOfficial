/* ===================================================================
   TWO UNIVERSES, ONE ORBIT - ELANG & RACHEL ANNIVERSARY SCRIPT
   Interactive logic: Gatekeeper, Live Counter, Music Player, Quiz & Game
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // ==================== 1. CONSTANTS & STATE ====================
  const VALID_PASSCODES = ['091123', '09112023', '09-11-2023', '91123'];
  const ANNIVERSARY_DATE = new Date('2023-11-09T00:00:00');
  const STORAGE_KEY = 'anniversary_unlocked_elang_rachel';

  // Elements
  const gatekeeperScreen = document.getElementById('gatekeeper-screen');
  const appContainer = document.getElementById('app-container');
  const loginForm = document.getElementById('login-form');
  const passcodeInput = document.getElementById('passcode-input');
  const togglePasswordBtn = document.getElementById('toggle-password-btn');
  const eyeIcon = document.getElementById('eye-icon');
  const errorMessage = document.getElementById('error-message');
  const relockBtn = document.getElementById('relock-btn');

  // ==================== 2. GATEKEEPER / PASSCODE LOGIC ====================
  // Selalu kembali ke page awal (masukkan password) setiap kali refresh
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
  if (passcodeInput) passcodeInput.value = '';
  if (errorMessage) errorMessage.textContent = '';
  if (window.location.hash && window.location.hash !== '#home') {
    try { history.replaceState(null, null, ' '); } catch (e) { }
  }
  window.scrollTo(0, 0);

  // Form submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = passcodeInput.value.trim().toLowerCase();

    if (VALID_PASSCODES.includes(entered)) {
      errorMessage.textContent = '';

      // Fire celebration confetti
      if (window.confetti) {
        window.confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      unlockWebsite(true);
    } else {
      // Wrong passcode feedback
      errorMessage.textContent = 'Mantra meleset! Coba ingat tanggal kita jadian ya, Princess 🥺';
      passcodeInput.parentElement.classList.add('shake-animation');
      setTimeout(() => {
        passcodeInput.parentElement.classList.remove('shake-animation');
      }, 600);
    }
  });

  // Toggle password visibility
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passcodeInput.type === 'password';
    passcodeInput.type = isPassword ? 'text' : 'password';
    eyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
    if (window.lucide) window.lucide.createIcons();
  });

  // Relock button
  if (relockBtn) {
    relockBtn.addEventListener('click', () => {
      appContainer.classList.add('app-hidden');
      gatekeeperScreen.classList.remove('unlocked');
      if (passcodeInput) passcodeInput.value = '';
      if (errorMessage) errorMessage.textContent = '';
      pauseMusic();
      if (window.location.hash) {
        try { history.replaceState(null, null, ' '); } catch (e) { }
      }
      window.scrollTo(0, 0);
    });
  }

  function unlockWebsite(animate) {
    if (animate) {
      gatekeeperScreen.classList.add('unlocked');
      setTimeout(() => {
        appContainer.classList.remove('app-hidden');
        switchSection('home');
        if (window.lucide) window.lucide.createIcons();
      }, 400);
    } else {
      gatekeeperScreen.classList.add('unlocked');
      appContainer.classList.remove('app-hidden');
      switchSection('home');
      if (window.lucide) window.lucide.createIcons();
    }
    initAmbientParticles();
  }

  // ==================== 3. NAVIGATION (DESKTOP & MOBILE) ====================
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('.view-section');

  function switchSection(targetId) {
    sections.forEach(sec => {
      if (sec.id === targetId) {
        sec.classList.add('active-section');
      } else {
        sec.classList.remove('active-section');
      }
    });

    navLinks.forEach(link => {
      if (link.getAttribute('data-target') === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Exit arena landscape if navigating to other section
    if (targetId !== 'arena' && typeof exitGameLandscape === 'function') {
      exitGameLandscape();
    }

    // Lazy init Archives: probe foto hanya saat pertama buka menu Archives
    if (targetId === 'archives') {
      initPolaroidArchivesImages();
    }

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      if (target) {
        switchSection(target);
        history.pushState(null, null, `#${target}`);
      }
    });
  });

  // Listen to hash changes or quick jump links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').replace('#', '');
      if (['home', 'story', 'archives', 'arena', 'vault'].includes(targetId)) {
        e.preventDefault();
        switchSection(targetId);
      }
    });
  });

  // ==================== 4. LIVE RELATIONSHIP COUNTER ====================
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-minutes');
  const secondsEl = document.getElementById('count-seconds');

  function updateCounter() {
    const now = new Date();
    const diff = now - ANNIVERSARY_DATE;

    if (diff < 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysEl.textContent = days.toLocaleString('id-ID');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCounter();
  setInterval(updateCounter, 1000);

  // ==================== 5. BACKGROUND MUSIC PLAYER ("Ini Abadi" - Perunggu) ====================
  const bgAudio = document.getElementById('bg-audio');
  const mainPlayBtn = document.getElementById('main-play-btn');
  const playIcon = document.getElementById('play-icon');
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const vinylDisc = document.getElementById('vinyl-disc');
  const volumeSlider = document.getElementById('volume-slider');
  const songStatusText = document.getElementById('song-status-text');

  let isPlaying = false;
  let synthAudioCtx = null;
  let synthInterval = null;

  // Smart Candidate detection for Perunggu - Ini Abadi
  const bgmCandidates = [
    'assets/audio/ini-abadi.mp3',
    'assets/audio/Ini Abadi.mp3',
    'assets/audio/Ini-Abadi.mp3',
    'assets/audio/perunggu-ini-abadi.mp3',
    'assets/audio/Perunggu - Ini Abadi.mp3',
    'assets/audio/Perunggu-Ini-Abadi.mp3',
    'assets/audio/ini_abadi.mp3',
    'assets/audio/songs/ini-abadi.mp3',
    'assets/audio/songs/Ini Abadi.mp3',
    'assets/audio/songs/perunggu-ini-abadi.mp3',
    'assets/audio/songs/Perunggu - Ini Abadi.mp3',
    'assets/audio/lany-song.mp3',
    'assets/audio/bgm.mp3'
  ];

  let validBgmFound = false;
  bgmCandidates.forEach(path => {
    if (validBgmFound) return;
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.oncanplay = function() {
      if (!validBgmFound && bgAudio && !isPlaying) {
        validBgmFound = true;
        bgAudio.src = path;
      }
    };
    probe.src = path;
  });

  function toggleMusic() {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  }

  function playMusic() {
    isPlaying = true;
    vinylDisc.classList.add('spinning');
    musicToggleBtn.classList.add('playing');
    playIcon.setAttribute('data-lucide', 'pause');
    if (window.lucide) window.lucide.createIcons();

    // Try playing native audio element
    if (bgAudio) {
      bgAudio.volume = volumeSlider ? volumeSlider.value : 0.7;
      const playPromise = bgAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          songStatusText.textContent = 'Memutar "Ini Abadi" - Perunggu 🎵';
        }).catch(() => {
          // Fallback if no audio file is found: Play synthesized romantic chords!
          songStatusText.textContent = 'Memutar alunan melodi romantis untuk Rachel 🎶';
          playSweetSynthMusic();
        });
      }
    }
  }

  function pauseMusic() {
    isPlaying = false;
    vinylDisc.classList.remove('spinning');
    musicToggleBtn.classList.remove('playing');
    playIcon.setAttribute('data-lucide', 'play');
    if (window.lucide) window.lucide.createIcons();
    songStatusText.textContent = 'Musik dijeda. Klik play untuk memutar kembali.';

    if (bgAudio) {
      bgAudio.pause();
    }
    stopSweetSynthMusic();
  }

  // Soft romantic web audio melody fallback if user hasn't added MP3 yet
  function playSweetSynthMusic() {
    if (synthAudioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      synthAudioCtx = new AudioContext();

      const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23]; // C, E, G, C5, A, F
      let step = 0;

      synthInterval = setInterval(() => {
        if (!synthAudioCtx) return;
        const osc = synthAudioCtx.createOscillator();
        const gain = synthAudioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[step % notes.length], synthAudioCtx.currentTime);

        gain.gain.setValueAtTime(0.04 * (volumeSlider ? volumeSlider.value : 0.7), synthAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, synthAudioCtx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(synthAudioCtx.destination);

        osc.start();
        osc.stop(synthAudioCtx.currentTime + 1.8);

        step++;
      }, 700);
    } catch (e) {
      console.warn('Web Audio synthesis not supported or blocked:', e);
    }
  }

  function stopSweetSynthMusic() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
    if (synthAudioCtx) {
      synthAudioCtx.close();
      synthAudioCtx = null;
    }
  }

  if (mainPlayBtn) mainPlayBtn.addEventListener('click', toggleMusic);
  if (musicToggleBtn) musicToggleBtn.addEventListener('click', toggleMusic);

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      if (bgAudio) bgAudio.volume = e.target.value;
    });
  }

  // ==================== 5.5 OUR STORY: FUTURE PLANS & BUCKET LIST ====================
  const futurePlansList = document.getElementById('future-plans-list');
  const futurePlanForm = document.getElementById('future-plan-form');
  const futurePlanInput = document.getElementById('future-plan-input');
  const futurePlansCount = document.getElementById('future-plans-count');
  const authorPills = document.querySelectorAll('.author-pill');

  let selectedPlanAuthor = 'both';

  authorPills.forEach(pill => {
    pill.addEventListener('click', () => {
      authorPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedPlanAuthor = pill.getAttribute('data-author') || 'both';
    });
  });

  const STORAGE_KEY_PLANS = 'rayang_future_plans';

  const DEFAULT_FUTURE_PLANS = [
    { id: 1, text: "Graduate & celebrate our degrees proudly together 🎓", author: "both", completed: false, date: "Nov 2024" },
    { id: 2, text: "Trip to The Wizarding World of Harry Potter in Tokyo / London 🪄", author: "rachel", completed: false, date: "Nov 2024" },
    { id: 3, text: "Sing our hearts out in the front row of an EXO & LANY concert 🎤🎶", author: "rachel", completed: false, date: "Nov 2024" },
    { id: 4, text: "Build our dream home with a cozy kitchen for endless pasta & satay nights 🏡🍝🍢", author: "elang", completed: false, date: "Nov 2024" },
    { id: 5, text: "Reach Mythic Glory in MLBB without anyone sulking or getting tilted 🎮💖", author: "both", completed: false, date: "Nov 2024" }
  ];

  function getStoredPlans() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PLANS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return DEFAULT_FUTURE_PLANS;
  }

  function saveStoredPlans(plans) {
    try {
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
    } catch (e) { }
  }

  let futurePlans = getStoredPlans();

  function renderFuturePlans() {
    if (!futurePlansList) return;
    futurePlansList.innerHTML = '';

    const completedCount = futurePlans.filter(p => p.completed).length;
    if (futurePlansCount) {
      futurePlansCount.textContent = `${completedCount} / ${futurePlans.length} Achieved 🌟`;
    }

    if (futurePlans.length === 0) {
      futurePlansList.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.9rem;">
          No dreams added yet. Write down our first dream together above! ✨
        </div>
      `;
      return;
    }

    futurePlans.forEach(plan => {
      const card = document.createElement('div');
      card.className = `future-plan-card ${plan.completed ? 'completed' : ''}`;

      let authorLabel = 'Both of Us 💑';
      let authorClass = 'author-both';
      if (plan.author === 'rachel') {
        authorLabel = 'Rachel 🌸';
        authorClass = 'author-rachel';
      } else if (plan.author === 'elang') {
        authorLabel = 'Elang ⚡';
        authorClass = 'author-elang';
      }

      card.innerHTML = `
        <button type="button" class="plan-check-btn" title="${plan.completed ? 'Mark as in progress' : 'Mark as achieved!'}">
          <i data-lucide="check"></i>
        </button>
        <div class="plan-body">
          <div class="plan-meta">
            <span class="author-tag ${authorClass}">${authorLabel}</span>
            <span class="plan-date">${plan.date || ''}</span>
          </div>
          <div class="plan-text">${escapeHtml(plan.text)}</div>
        </div>
        <button type="button" class="plan-delete-btn" title="Delete dream">
          <i data-lucide="trash-2"></i>
        </button>
      `;

      // Check button toggle
      const checkBtn = card.querySelector('.plan-check-btn');
      checkBtn.addEventListener('click', () => {
        plan.completed = !plan.completed;
        saveStoredPlans(futurePlans);
        if (plan.completed && window.confetti) {
          window.confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 }
          });
        }
        renderFuturePlans();
      });

      // Delete button
      const delBtn = card.querySelector('.plan-delete-btn');
      delBtn.addEventListener('click', () => {
        futurePlans = futurePlans.filter(p => p.id !== plan.id);
        saveStoredPlans(futurePlans);
        renderFuturePlans();
      });

      futurePlansList.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  if (futurePlanForm) {
    futurePlanForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = futurePlanInput.value.trim();
      if (!text) return;

      const now = new Date();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateStr = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

      const newPlan = {
        id: Date.now(),
        text: text,
        author: selectedPlanAuthor,
        completed: false,
        date: dateStr
      };

      futurePlans.unshift(newPlan);
      saveStoredPlans(futurePlans);
      futurePlanInput.value = '';
      renderFuturePlans();

      if (window.confetti) {
        window.confetti({ particleCount: 40, spread: 60 });
      }
    });
  }

  renderFuturePlans();

  // ==================== 6. MEMORY ARCHIVES FILTER & MODAL ====================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const polaroidCards = document.querySelectorAll('.polaroid-card');
  const modalBackdrop = document.getElementById('photo-modal');
  const modalArtContainer = document.getElementById('modal-art-container');
  const modalDate = document.getElementById('modal-date');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const closeModalBtn = document.getElementById('close-modal-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      polaroidCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Smart auto-detector for Archives photos & Multi-Photo Sliders (2025, 2024, 2023)
  // Cache agar tidak perlu probe ulang setiap buka Archives
  const imgResolvedCache = {};
  let archivesInitialized = false;

  const ARCHIVES_EXTS = ['jpeg', 'jpg', 'png', 'webp', 'JPEG', 'JPG', 'PNG'];

  function probeSingleImage(src) {
    return new Promise(resolve => {
      const testImg = new Image();
      testImg.onload = () => resolve(src);
      testImg.onerror = () => resolve(null);
      testImg.src = src;
    });
  }

  async function findWorkingImage(candidates) {
    for (const src of candidates) {
      // Cek cache dulu sebelum probe network
      if (imgResolvedCache[src] === true) return src;
      if (imgResolvedCache[src] === false) continue;
      const ok = await probeSingleImage(src);
      if (ok) {
        imgResolvedCache[src] = true;
        return ok;
      } else {
        imgResolvedCache[src] = false;
      }
    }
    return null;
  }

  async function findPhotosForCard(card) {
    const num = card.querySelector('.polaroid-real-img')?.getAttribute('data-index') || '1';
    const year = card.getAttribute('data-year');
    const photos = [];
    let consecutiveMisses = 0;

    for (let k = 1; k <= 25; k++) {
      const candidates = [];
      if (year) {
        // Year-based filenames: 2025-1.jpeg, 2025_1.jpeg, 2025 (1).jpeg, 20251.jpeg
        ARCHIVES_EXTS.forEach(ext => {
          candidates.push(`assets/images/archives/${year}-${k}.${ext}`);
          candidates.push(`assets/images/archives/${year}_${k}.${ext}`);
          candidates.push(`assets/images/archives/${year} (${k}).${ext}`);
          candidates.push(`assets/images/archives/${year}${k}.${ext}`);
        });
      }
      // Index filenames: memory-4-1.jpeg, 4-1.jpeg
      ARCHIVES_EXTS.forEach(ext => {
        candidates.push(`assets/images/archives/memory-${num}-${k}.${ext}`);
        candidates.push(`assets/images/archives/${num}-${k}.${ext}`);
        // Backwards compatibility if user numbered memory files previously
        if (year === '2025') {
          candidates.push(`assets/images/archives/memory-4-${k}.${ext}`);
          candidates.push(`assets/images/archives/4-${k}.${ext}`);
        } else if (year === '2024') {
          candidates.push(`assets/images/archives/memory-5-${k}.${ext}`);
          candidates.push(`assets/images/archives/5-${k}.${ext}`);
        } else if (year === '2023') {
          candidates.push(`assets/images/archives/memory-6-${k}.${ext}`);
          candidates.push(`assets/images/archives/6-${k}.${ext}`);
        }
      });

      // Single photo fallbacks (checked on k === 1)
      if (k === 1) {
        ARCHIVES_EXTS.forEach(ext => {
          if (year) candidates.push(`assets/images/archives/${year}.${ext}`);
          candidates.push(`assets/images/archives/memory-${num}.${ext}`);
          candidates.push(`assets/images/archives/${num}.${ext}`);
          candidates.push(`assets/images/archives/polaroid-${num}.${ext}`);
        });
      }

      const found = await findWorkingImage(candidates);
      if (found) {
        photos.push(found);
        consecutiveMisses = 0;
      } else {
        consecutiveMisses++;
        if (k > 1 && consecutiveMisses >= 2) break;
        if (k === 1 && consecutiveMisses >= 1) break;
      }
    }
    return photos;
  }

  function setupCardSlider(card, photos) {
    card._photos = photos;
    card._currentIdx = 0;

    const imgWrapper = card.querySelector('.polaroid-img-wrapper');
    const realImg = card.querySelector('.polaroid-real-img');
    if (!imgWrapper || !realImg) return;

    realImg.src = photos[0];
    realImg.classList.add('loaded');

    if (photos.length > 1) {
      // Clean up existing controls if any
      imgWrapper.querySelectorAll('.polaroid-slider-btn, .polaroid-slider-counter, .polaroid-slider-dots').forEach(el => el.remove());

      // Counter badge
      const counter = document.createElement('span');
      counter.className = 'polaroid-slider-counter';
      counter.textContent = `1 / ${photos.length}`;
      imgWrapper.appendChild(counter);

      // Dots indicator
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'polaroid-slider-dots';
      for (let i = 0; i < photos.length; i++) {
        const dot = document.createElement('span');
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          setSlide(i);
        });
        dotsContainer.appendChild(dot);
      }
      imgWrapper.appendChild(dotsContainer);

      function setSlide(idx) {
        card._currentIdx = (idx + photos.length) % photos.length;
        realImg.src = photos[card._currentIdx];
        counter.textContent = `${card._currentIdx + 1} / ${photos.length}`;
        dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
          d.classList.toggle('active', i === card._currentIdx);
        });
      }

      // Prev Button
      const prevBtn = document.createElement('button');
      prevBtn.className = 'polaroid-slider-btn prev';
      prevBtn.setAttribute('aria-label', 'Previous photo');
      prevBtn.innerHTML = '&#8249;';
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setSlide(card._currentIdx - 1);
      });
      imgWrapper.appendChild(prevBtn);

      // Next Button
      const nextBtn = document.createElement('button');
      nextBtn.className = 'polaroid-slider-btn next';
      nextBtn.setAttribute('aria-label', 'Next photo');
      nextBtn.innerHTML = '&#8250;';
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setSlide(card._currentIdx + 1);
      });
      imgWrapper.appendChild(nextBtn);

      // Touch Swipe
      let touchStartX = 0;
      imgWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      imgWrapper.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff < 0) {
            setSlide(card._currentIdx + 1);
          } else {
            setSlide(card._currentIdx - 1);
          }
        }
      }, { passive: true });
    }
  }

  async function initPolaroidArchivesImages() {
    if (archivesInitialized) return; // Jangan probe ulang jika sudah pernah dijalankan
    archivesInitialized = true;

    const polaroidCards = document.querySelectorAll('.polaroid-card');

    // Tambahkan shimmer placeholder ke setiap wrapper sebelum foto ditemukan
    polaroidCards.forEach(card => {
      const wrapper = card.querySelector('.polaroid-img-wrapper');
      if (wrapper) wrapper.classList.add('loading');
    });

    for (const card of polaroidCards) {
      const photos = await findPhotosForCard(card);
      const wrapper = card.querySelector('.polaroid-img-wrapper');
      if (wrapper) wrapper.classList.remove('loading');

      if (photos.length > 0) {
        setupCardSlider(card, photos);
      } else {
        const img = card.querySelector('.polaroid-real-img');
        if (img) {
          img.classList.remove('loaded');
          img.removeAttribute('src');
        }
      }
    }
  }

  // Lazy init: hanya jalankan probe saat pertama kali Archives dibuka
  window.handlePolaroidImgError = function(img) {};

  // Modal Multi-Photo Viewer
  let activeModalCard = null;
  let activeModalIdx = 0;

  const modalPrevBtn = document.getElementById('modal-prev-btn');
  const modalNextBtn = document.getElementById('modal-next-btn');
  const modalCounterBadge = document.getElementById('modal-counter-badge');

  function updateModalSlide(idx) {
    if (!activeModalCard || !activeModalCard._photos || activeModalCard._photos.length === 0) return;
    const photos = activeModalCard._photos;
    activeModalIdx = (idx + photos.length) % photos.length;
    modalArtContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = photos[activeModalIdx];
    img.alt = activeModalCard.getAttribute('data-title') || 'Memory Photo';
    img.className = 'modal-img-photo';
    modalArtContainer.appendChild(img);

    if (modalCounterBadge) {
      modalCounterBadge.textContent = `${activeModalIdx + 1} / ${photos.length}`;
    }
  }

  if (modalPrevBtn) {
    modalPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateModalSlide(activeModalIdx - 1);
    });
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateModalSlide(activeModalIdx + 1);
    });
  }

  polaroidCards.forEach(card => {
    card.addEventListener('click', () => {
      activeModalCard = card;
      const title = card.getAttribute('data-title');
      const date = card.getAttribute('data-date');
      const desc = card.getAttribute('data-desc');
      const photos = card._photos || [];
      const placeholder = card.querySelector('.placeholder-art');

      modalTitle.textContent = title;
      modalDate.textContent = date;
      modalDesc.textContent = desc;
      modalArtContainer.innerHTML = '';

      if (photos.length > 0) {
        activeModalIdx = card._currentIdx || 0;
        updateModalSlide(activeModalIdx);

        if (photos.length > 1) {
          if (modalPrevBtn) modalPrevBtn.style.display = 'flex';
          if (modalNextBtn) modalNextBtn.style.display = 'flex';
          if (modalCounterBadge) modalCounterBadge.style.display = 'block';
        } else {
          if (modalPrevBtn) modalPrevBtn.style.display = 'none';
          if (modalNextBtn) modalNextBtn.style.display = 'none';
          if (modalCounterBadge) modalCounterBadge.style.display = 'none';
        }
      } else if (placeholder) {
        const art = placeholder.cloneNode(true);
        modalArtContainer.appendChild(art);
        if (modalPrevBtn) modalPrevBtn.style.display = 'none';
        if (modalNextBtn) modalNextBtn.style.display = 'none';
        if (modalCounterBadge) modalCounterBadge.style.display = 'none';
      }

      modalBackdrop.classList.add('open');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (modalBackdrop && modalBackdrop.classList.contains('open')) {
      if (e.key === 'ArrowLeft' && activeModalCard && activeModalCard._photos && activeModalCard._photos.length > 1) {
        updateModalSlide(activeModalIdx - 1);
      } else if (e.key === 'ArrowRight' && activeModalCard && activeModalCard._photos && activeModalCard._photos.length > 1) {
        updateModalSlide(activeModalIdx + 1);
      }
    }
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('open');
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('open');
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      modalBackdrop.classList.remove('open');
    }
  });

  // ==================== 7. THE ARENA: COUPLE TRIVIA QUIZ & GAMES ====================
  const tabQuizBtn = document.getElementById('tab-quiz-btn');
  const tabGameBtn = document.getElementById('tab-game-btn');
  const tabRunnerBtn = document.getElementById('tab-runner-btn');
  const tabBlockBlastBtn = document.getElementById('tab-blockblast-btn');
  const tabCookoffBtn = document.getElementById('tab-cookoff-btn');
  const tabRhythmBtn = document.getElementById('tab-rhythm-btn');
  const tabSuikaBtn = document.getElementById('tab-suika-btn');
  const tabDefenseBtn = document.getElementById('tab-defense-btn');
  const quizWrapper = document.getElementById('quiz-wrapper');
  const gameWrapper = document.getElementById('game-wrapper');
  const runnerWrapper = document.getElementById('runner-wrapper');
  const blockBlastWrapper = document.getElementById('blockblast-wrapper');
  const cookoffWrapper = document.getElementById('cookoff-wrapper');
  const rhythmWrapper = document.getElementById('rhythm-wrapper');
  const suikaWrapper = document.getElementById('suika-wrapper');
  const defenseWrapper = document.getElementById('defense-wrapper');

  // ==================== ARENA LANDSCAPE & FULLSCREEN HELPER ====================
  let activeLandscapeGame = null; // 'runner' | 'defense' | null

  function isMobileGameDevice() {
    return window.innerWidth <= 900 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  async function requestGameLandscape(gameType) {
    activeLandscapeGame = gameType;
    const targetWrapper = gameType === 'runner' ? runnerWrapper : defenseWrapper;

    if (targetWrapper) {
      targetWrapper.classList.add('game-landscape-active');
    }
    document.body.classList.add('game-landscape-lock');

    // 1. Fullscreen API
    try {
      const el = targetWrapper || document.documentElement;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        }
      }
    } catch (e) {}

    // 2. Screen Orientation Lock API (Locks physical display to landscape on supported devices)
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape').catch(() => {});
      } else if (screen.lockOrientation) {
        screen.lockOrientation('landscape');
      } else if (screen.webkitLockOrientation) {
        screen.webkitLockOrientation('landscape');
      } else if (screen.mozLockOrientation) {
        screen.mozLockOrientation('landscape');
      }
    } catch (e) {}

    // 3. Trigger canvas resize updates
    setTimeout(() => {
      if (typeof updateDefenseCanvasRect === 'function') updateDefenseCanvasRect();
    }, 200);
  }

  function exitGameLandscape() {
    if (runnerWrapper) runnerWrapper.classList.remove('game-landscape-active');
    if (defenseWrapper) defenseWrapper.classList.remove('game-landscape-active');
    document.body.classList.remove('game-landscape-lock');

    // Unlock screen orientation
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      } else if (screen.unlockOrientation) {
        screen.unlockOrientation();
      } else if (screen.webkitUnlockOrientation) {
        screen.webkitUnlockOrientation();
      }
    } catch (e) {}

    // Exit fullscreen
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch (e) {}

    activeLandscapeGame = null;
    setTimeout(() => {
      if (typeof updateDefenseCanvasRect === 'function') updateDefenseCanvasRect();
    }, 200);
  }

  function toggleGameLandscape(gameType) {
    const targetWrapper = gameType === 'runner' ? runnerWrapper : defenseWrapper;
    if (targetWrapper && targetWrapper.classList.contains('game-landscape-active')) {
      exitGameLandscape();
    } else {
      requestGameLandscape(gameType);
    }
  }

  window.addEventListener('resize', () => {
    if (typeof updateDefenseCanvasRect === 'function') updateDefenseCanvasRect();
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (typeof updateDefenseCanvasRect === 'function') updateDefenseCanvasRect();
    }, 200);
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (typeof updateDefenseCanvasRect === 'function') updateDefenseCanvasRect();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (typeof updateDefenseCanvasRect === 'function') updateDefenseCanvasRect();
    }
  });

  function switchArenaTab(activeTab) {
    exitGameLandscape();
    [tabQuizBtn, tabGameBtn, tabRunnerBtn, tabBlockBlastBtn, tabCookoffBtn, tabRhythmBtn, tabSuikaBtn, tabDefenseBtn].forEach(b => {
      if (b) b.classList.remove('active');
    });
    if (quizWrapper) quizWrapper.style.display = 'none';
    if (gameWrapper) gameWrapper.style.display = 'none';
    if (runnerWrapper) runnerWrapper.style.display = 'none';
    if (blockBlastWrapper) blockBlastWrapper.style.display = 'none';
    if (cookoffWrapper) cookoffWrapper.style.display = 'none';
    if (rhythmWrapper) rhythmWrapper.style.display = 'none';
    if (suikaWrapper) suikaWrapper.style.display = 'none';
    if (defenseWrapper) defenseWrapper.style.display = 'none';

    if (activeTab === 'quiz') {
      if (tabQuizBtn) tabQuizBtn.classList.add('active');
      if (quizWrapper) quizWrapper.style.display = 'block';
    } else if (activeTab === 'game') {
      if (tabGameBtn) tabGameBtn.classList.add('active');
      if (gameWrapper) gameWrapper.style.display = 'block';
    } else if (activeTab === 'runner') {
      if (tabRunnerBtn) tabRunnerBtn.classList.add('active');
      if (runnerWrapper) runnerWrapper.style.display = 'block';
      if (window.lucide) window.lucide.createIcons();
    } else if (activeTab === 'blockblast') {
      if (tabBlockBlastBtn) tabBlockBlastBtn.classList.add('active');
      if (blockBlastWrapper) blockBlastWrapper.style.display = 'block';
      if (typeof updateBlockBlastHighScoresUI === 'function') updateBlockBlastHighScoresUI();
      if (window.lucide) window.lucide.createIcons();
    } else if (activeTab === 'cookoff') {
      if (tabCookoffBtn) tabCookoffBtn.classList.add('active');
      if (cookoffWrapper) cookoffWrapper.style.display = 'block';
      if (typeof updateCookoffHighScoresUI === 'function') updateCookoffHighScoresUI();
      if (window.lucide) window.lucide.createIcons();
    } else if (activeTab === 'rhythm') {
      if (tabRhythmBtn) tabRhythmBtn.classList.add('active');
      if (rhythmWrapper) rhythmWrapper.style.display = 'block';
      if (typeof renderRhythmSongList === 'function') renderRhythmSongList('', (typeof activeFilterCategory !== 'undefined') ? activeFilterCategory : 'all');
      if (typeof updateRhythmHighScoresUI === 'function') updateRhythmHighScoresUI();
      if (typeof resizeRhythmCanvas === 'function') resizeRhythmCanvas();
      if (window.lucide) window.lucide.createIcons();
    } else if (activeTab === 'suika') {
      if (tabSuikaBtn) tabSuikaBtn.classList.add('active');
      if (suikaWrapper) suikaWrapper.style.display = 'block';
      if (typeof updateSuikaHighScoresUI === 'function') updateSuikaHighScoresUI();
      if (typeof resizeSuikaCanvas === 'function') resizeSuikaCanvas();
      if (window.lucide) window.lucide.createIcons();
    } else if (activeTab === 'defense') {
      if (tabDefenseBtn) tabDefenseBtn.classList.add('active');
      if (defenseWrapper) defenseWrapper.style.display = 'block';
      if (typeof updateDefenseHighScoresUI === 'function') updateDefenseHighScoresUI();
      if (typeof resizeDefenseCanvas === 'function') resizeDefenseCanvas();
      if (window.lucide) window.lucide.createIcons();
    }
  }

  if (tabQuizBtn) tabQuizBtn.addEventListener('click', () => switchArenaTab('quiz'));
  if (tabGameBtn) tabGameBtn.addEventListener('click', () => switchArenaTab('game'));
  if (tabRunnerBtn) tabRunnerBtn.addEventListener('click', () => switchArenaTab('runner'));
  if (tabBlockBlastBtn) tabBlockBlastBtn.addEventListener('click', () => switchArenaTab('blockblast'));
  if (tabCookoffBtn) tabCookoffBtn.addEventListener('click', () => switchArenaTab('cookoff'));
  if (tabRhythmBtn) tabRhythmBtn.addEventListener('click', () => switchArenaTab('rhythm'));
  if (tabSuikaBtn) tabSuikaBtn.addEventListener('click', () => switchArenaTab('suika'));
  if (tabDefenseBtn) tabDefenseBtn.addEventListener('click', () => switchArenaTab('defense'));

  const quizData = [
    {
      q: "What is Rachel's favorite food that always brings the biggest smile to her face on our dates?",
      options: ["Nasi Padang Kikil", "Delicious Variety of Pasta 🍝", "Pempek Palembang", "Jumbo Meatball Soup"],
      answer: 1,
      fact: "Spot on! Pasta is the secret key to Rachel's brightest smile!"
    },
    {
      q: "In spare time, what is Elang's favorite game to play together with Rachel?",
      options: ["Mobile Legends: Bang Bang (MLBB) 🎮", "Valorant", "Candy Crush", "Genshin Impact"],
      answer: 0,
      fact: "Spot on! The loyal duo on the Land of Dawn, Elang is always ready to tank and protect!"
    },
    {
      q: "What is Rachel's greatest dream after graduating with her degree in Biology?",
      options: ["Becoming an Inspiring Researcher & Scientist 🔬", "NASA Astronaut", "Opening a salon for Persian cats", "Professional badminton athlete"],
      answer: 0,
      fact: "So amazing! Rachel is destined to be a brilliant scientist making everyone proud!"
    },
    {
      q: "Which Harry Potter spells best describe how enchanted Elang feels whenever he looks at Rachel?",
      options: ["Avada Kedavra", "Lumos & Alohomora (Lighting Up & Unlocking the Heart) 🪄", "Expelliarmus", "Crucio"],
      answer: 1,
      fact: "Alohomora to unlock the heart, and Lumos to illuminate every night!"
    },
    {
      q: "When is the most historic date when Elang & Rachel's love story officially began?",
      options: ["17 August 1945", "9 November 2023 💖", "25 December 2023", "14 February 2024"],
      answer: 1,
      fact: "9 November 2023—the most wonderful day when our two universes aligned into one!"
    }
  ];

  let currentQuestion = 0;
  let quizScore = 0;

  const quizStepText = document.getElementById('quiz-step-text');
  const quizScoreBadge = document.getElementById('quiz-score-badge');
  const quizProgressFill = document.getElementById('quiz-progress-fill');
  const quizQuestionTitle = document.getElementById('quiz-question-title');
  const quizOptionsGrid = document.getElementById('quiz-options-grid');
  const questionContainer = document.getElementById('question-container');
  const quizResultContainer = document.getElementById('quiz-result-container');
  const resultTitle = document.getElementById('result-title');
  const resultScoreText = document.getElementById('result-score-text');
  const resultPraise = document.getElementById('result-praise');
  const restartQuizBtn = document.getElementById('restart-quiz-btn');

  function renderQuestion() {
    const q = quizData[currentQuestion];
    quizStepText.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
    quizScoreBadge.textContent = `Score: ${quizScore}`;
    quizProgressFill.style.width = `${((currentQuestion + 1) / quizData.length) * 100}%`;
    quizQuestionTitle.textContent = q.q;
    quizOptionsGrid.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.innerHTML = `<span>${opt}</span><i data-lucide="chevron-right"></i>`;
      btn.addEventListener('click', () => handleQuizAnswer(idx, btn));
      quizOptionsGrid.appendChild(btn);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function handleQuizAnswer(selectedIndex, buttonEl) {
    const q = quizData[currentQuestion];
    const allBtns = quizOptionsGrid.querySelectorAll('.quiz-opt-btn');
    allBtns.forEach(b => b.disabled = true);

    if (selectedIndex === q.answer) {
      buttonEl.classList.add('correct');
      quizScore += 20;
    } else {
      buttonEl.classList.add('wrong');
      allBtns[q.answer].classList.add('correct');
    }

    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < quizData.length) {
        renderQuestion();
      } else {
        showQuizResult();
      }
    }, 1200);
  }

  function showQuizResult() {
    questionContainer.style.display = 'none';
    quizResultContainer.style.display = 'block';
    resultScoreText.textContent = `You scored ${quizScore} out of 100!`;

    if (quizScore >= 80) {
      resultTitle.textContent = '🏆 Mythic Glory Soulmate!';
      resultPraise.textContent = 'Incredible! The two of you understand each other so deeply. This harmony between Biology & Physics is truly unmatched!';
      if (window.confetti) window.confetti({ particleCount: 120, spread: 80 });
    } else {
      resultTitle.textContent = '🌟 Lovely Duo Forever!';
      resultPraise.textContent = 'You two are still the most wonderful couple, forever complementing each other every step of the way!';
    }
  }

  restartQuizBtn.addEventListener('click', () => {
    currentQuestion = 0;
    quizScore = 0;
    questionContainer.style.display = 'block';
    quizResultContainer.style.display = 'none';
    renderQuestion();
  });

  renderQuestion();

  // ==================== 8. THE ARENA: CATCH THE GOLDEN SNITCH GAME ====================
  const snitchField = document.getElementById('snitch-field');
  const gameStartOverlay = document.getElementById('game-start-overlay');
  const startGameBtn = document.getElementById('start-game-btn');
  const gameEnergyFill = document.getElementById('game-energy-fill');
  const gameEnergyText = document.getElementById('game-energy-text');
  const gameTimer = document.getElementById('game-timer');

  let gameActive = false;
  let gameEnergy = 0;
  let timeLeft = 20;
  let gameInterval = null;
  let spawnInterval = null;

  const targetEmojis = ['🪄', '⚡', '🌌', '🔬', '🍝', '🖤'];

  startGameBtn.addEventListener('click', startGame);

  function startGame() {
    gameStartOverlay.style.display = 'none';
    gameActive = true;
    gameEnergy = 0;
    timeLeft = 20;
    updateGameUI();

    gameInterval = setInterval(() => {
      timeLeft--;
      gameTimer.textContent = `${timeLeft}s`;

      if (timeLeft <= 0 || gameEnergy >= 100) {
        endGame();
      }
    }, 1000);

    spawnInterval = setInterval(spawnTarget, 650);
  }

  function updateGameUI() {
    gameEnergyFill.style.width = `${gameEnergy}%`;
    gameEnergyText.textContent = `${gameEnergy}%`;
  }

  function spawnTarget() {
    if (!gameActive) return;

    const target = document.createElement('div');
    target.className = 'flying-target';
    target.textContent = targetEmojis[Math.floor(Math.random() * targetEmojis.length)];

    const maxX = snitchField.clientWidth - 55;
    const maxY = snitchField.clientHeight - 55;
    const x = Math.max(10, Math.floor(Math.random() * maxX));
    const y = Math.max(10, Math.floor(Math.random() * maxY));

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    target.addEventListener('click', () => {
      if (!gameActive) return;
      gameEnergy = Math.min(100, gameEnergy + 15);
      updateGameUI();

      // Mini Pop effect
      target.style.transform = 'scale(1.6)';
      target.style.opacity = '0';
      setTimeout(() => target.remove(), 150);

      if (gameEnergy >= 100) {
        endGame();
      }
    });

    snitchField.appendChild(target);

    // Auto remove after 1.8 seconds if not clicked
    setTimeout(() => {
      if (target.parentElement) target.remove();
    }, 1800);
  }

  function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    // Remove remaining targets
    snitchField.querySelectorAll('.flying-target').forEach(t => t.remove());

    const isWin = gameEnergy >= 100;
    gameStartOverlay.style.display = 'flex';
    gameStartOverlay.innerHTML = `
      <div class="game-start-modal">
        <div class="modal-icon">${isWin ? '🎉💖' : '⏱️✨'}</div>
        <h4>${isWin ? 'Misi Berhasil! Energi Cinta 100%!' : 'Waktu Habis!'}</h4>
        <p>${isWin ? 'Luar biasa cepat! Kamu berhasil mengumpulkan seluruh energi kosmik cinta kita!' : `Energi terkumpul: ${gameEnergy}%. Hebat sekali perjuangannya!`}</p>
        <button id="restart-game-btn" class="glow-button">
          <span>Mainkan Lagi 🚀</span>
        </button>
      </div>
    `;

    if (isWin && window.confetti) {
      window.confetti({ particleCount: 150, spread: 90 });
    }

    document.getElementById('restart-game-btn').addEventListener('click', () => {
      gameStartOverlay.innerHTML = `
        <div class="game-start-modal">
          <div class="modal-icon">⚡🪄</div>
          <h4>Misi: Kumpulkan 100% Energi Cinta</h4>
          <p>Klik objek sebanyak mungkin secepat jempolmu bisa!</p>
          <button id="start-game-btn" class="glow-button">
            <span>Mulai Misi 🚀</span>
          </button>
        </div>
      `;
      document.getElementById('start-game-btn').addEventListener('click', startGame);
    });
  }

  // ==================== 8.5 RUNNER GAME: LET'S REACH TO OUR ANNIVERSARY DATE ====================
  const RUNNER_TARGET_SCORE = 91123;
  let runnerScore = 0;
  let runnerBonusCount = 0;
  let runnerGameActive = false;
  let runnerSelectedChar = 'rachel';
  let runnerAnimFrameId = null;
  let runnerSpeed = 6;
  let runnerObstacles = [];
  let runnerSpawnTimer = 0;
  let runnerParticles = [];

  // DOM Elements
  const runnerCanvas = document.getElementById('runner-canvas');
  const runnerCtx = runnerCanvas ? runnerCanvas.getContext('2d') : null;
  const runnerSelectScreen = document.getElementById('runner-select-screen');
  const runnerPlayScreen = document.getElementById('runner-play-screen');
  const runnerGameoverScreen = document.getElementById('runner-gameover-screen');
  const runnerVictoryScreen = document.getElementById('runner-victory-screen');
  const startRunnerBtn = document.getElementById('start-runner-btn');
  const retryRunnerBtn = document.getElementById('retry-runner-btn');
  const runnerCurrentScoreEl = document.getElementById('runner-current-score');
  const runnerProgressBar = document.getElementById('runner-progress-bar');
  const runnerProgressText = document.getElementById('runner-progress-text');
  const runnerBonusBadge = document.getElementById('runner-bonus-badge');
  const runnerDeathReason = document.getElementById('runner-death-reason');
  const gameoverScoreEl = document.getElementById('gameover-score');
  const runnerToastContainer = document.getElementById('runner-toast-container');
  const charCards = document.querySelectorAll('.char-card');
  const mobileJumpBtn = document.getElementById('mobile-jump-btn');
  const mobileDuckBtn = document.getElementById('mobile-duck-btn');
  const runnerVictoryQuestion = document.getElementById('runner-victory-question');
  const victoryYesBtn = document.getElementById('victory-yes-btn');
  const victoryNoBtn = document.getElementById('victory-no-btn');
  const rejectionWarningBox = document.getElementById('rejection-warning-box');
  const rejectionForceYesBtn = document.getElementById('rejection-force-yes-btn');
  const royalDeclarationBox = document.getElementById('royal-declaration-box');
  const royalDeclarationText = document.getElementById('royal-declaration-text');
  const royalDeclarationSig = document.getElementById('royal-declaration-sig');
  const victoryReplayBtn = document.getElementById('victory-replay-btn');
  const victoryChangeCharBtn = document.getElementById('victory-change-char-btn');
  const victoryCornerCloseBtn = document.getElementById('victory-corner-close-btn');
  const runnerLandscapeBtn = document.getElementById('runner-landscape-btn');
  const runnerExitBtn = document.getElementById('runner-exit-btn');
  const runnerGameoverExitBtn = document.getElementById('runner-gameover-exit-btn');

  // Fast smart image loader supporting .jpeg, .jpg, .png, .webp (0ms delay fallback)
  function createSmartMultiImage(candidates, fallbackSvg, onLoadSuccess) {
    const img = new Image();
    img.src = fallbackSvg || 'assets/images/obstacle-mantan.svg';

    let idx = 0;
    function tryNext() {
      if (idx >= candidates.length) return;
      const test = new Image();
      test.onload = () => {
        img.src = candidates[idx];
        if (typeof onLoadSuccess === 'function') {
          onLoadSuccess(candidates[idx]);
        }
      };
      test.onerror = () => {
        idx++;
        tryNext();
      };
      test.src = candidates[idx];
    }
    tryNext();
    return img;
  }

  function createSmartImage(baseName, fallbackSvg) {
    const exts = ['jpeg', 'jpg', 'png', 'webp', 'JPEG', 'JPG', 'PNG'];
    const candidates = exts.map(ext => `assets/images/${baseName}.${ext}`);
    return createSmartMultiImage(candidates, fallbackSvg);
  }

  function updateAllArenaAvatars() {
    if (rachelHeadImg && rachelHeadImg.src && !rachelHeadImg.src.endsWith('.svg')) {
      document.querySelectorAll('img[src*="head-rachel"], img[alt="Rachel"]').forEach(img => {
        img.src = rachelHeadImg.src;
      });
    }
    if (elangHeadImg && elangHeadImg.src && !elangHeadImg.src.endsWith('.svg')) {
      document.querySelectorAll('img[src*="head-elang"], img[alt="Elang"]').forEach(img => {
        img.src = elangHeadImg.src;
      });
    }
  }

  const rachelCandidates = [
    'assets/images/head-rachel.jpeg',
    'assets/images/head-rachel.jpg',
    'assets/images/head-rachel.png',
    'assets/images/head-rachel.webp',
    'assets/images/rachel.jpeg',
    'assets/images/rachel.jpg',
    'assets/images/rachel.png',
    'assets/images/rachel.webp',
    'assets/images/head_rachel.jpeg',
    'assets/images/head_rachel.jpg',
    'assets/images/head_rachel.png',
    'assets/images/head-rachel.JPEG',
    'assets/images/head-rachel.JPG',
    'assets/images/head-rachel.PNG',
    'assets/images/rachel.JPEG',
    'assets/images/rachel.JPG'
  ];

  const elangCandidates = [
    'assets/images/head-elang.jpeg',
    'assets/images/head-elang.jpg',
    'assets/images/head-elang.png',
    'assets/images/head-elang.webp',
    'assets/images/elang.jpeg',
    'assets/images/elang.jpg',
    'assets/images/elang.png',
    'assets/images/elang.webp',
    'assets/images/head_elang.jpeg',
    'assets/images/head_elang.jpg',
    'assets/images/head_elang.png',
    'assets/images/head-elang.JPEG',
    'assets/images/head-elang.JPG',
    'assets/images/head-elang.PNG',
    'assets/images/elang.JPEG',
    'assets/images/elang.JPG'
  ];

  const rachelHeadImg = createSmartMultiImage(rachelCandidates, 'assets/images/head-rachel.svg', updateAllArenaAvatars);
  const elangHeadImg = createSmartMultiImage(elangCandidates, 'assets/images/head-elang.svg', updateAllArenaAvatars);
  const mantanDefaultImg = createSmartImage('obstacle-mantan', 'assets/images/obstacle-mantan.svg');

  const nadaCandidates = [
    'assets/images/mantan-nada.jpeg',
    'assets/images/mantan-nada.jpg',
    'assets/images/mantan-nada.png',
    'assets/images/mantan-nada.webp',
    'assets/images/nada.jpeg',
    'assets/images/nada.jpg',
    'assets/images/nada.png',
    'assets/images/nada.webp',
    'assets/images/mantan-elang.jpeg',
    'assets/images/mantan-elang.jpg',
    'assets/images/mantan-elang.png',
    'assets/images/mantan-nada.JPEG',
    'assets/images/mantan-nada.JPG',
    'assets/images/nada.JPEG',
    'assets/images/nada.JPG'
  ];

  const erenCandidates = [
    'assets/images/mantan-eren.jpeg',
    'assets/images/mantan-eren.jpg',
    'assets/images/mantan-eren.png',
    'assets/images/mantan-eren.webp',
    'assets/images/eren.jpeg',
    'assets/images/eren.jpg',
    'assets/images/eren.png',
    'assets/images/eren.webp',
    'assets/images/mantan-rachel.jpeg',
    'assets/images/mantan-rachel.jpg',
    'assets/images/mantan-rachel.png',
    'assets/images/mantan-eren.JPEG',
    'assets/images/mantan-eren.JPG',
    'assets/images/eren.JPEG',
    'assets/images/eren.JPG'
  ];

  const nadaImg = createSmartMultiImage(nadaCandidates, 'assets/images/obstacle-mantan.svg');
  const erenImg = createSmartMultiImage(erenCandidates, 'assets/images/obstacle-mantan.svg');
  const mantanImg = nadaImg; // default reference

  const carImg = new Image();
  carImg.src = 'assets/images/obstacle-car.svg';

  const motorImg = new Image();
  motorImg.src = 'assets/images/obstacle-motor.svg';

  // Safe Cross-Browser RoundRect helper
  function safeRoundRect(ctx, x, y, w, h, r) {
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
  }

  // Player Physics State
  const GROUND_Y = 228;
  const player = {
    x: 75,
    y: 172,
    width: 46,
    height: 56,
    duckHeight: 28,
    duckWidth: 54,
    vy: 0,
    gravity: 0.82,
    jumpForce: -14.8,
    isGrounded: true,
    isDucking: false,
    trotAngle: 0
  };

  // Character Selection Listener
  charCards.forEach(card => {
    card.addEventListener('click', () => {
      charCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      runnerSelectedChar = card.getAttribute('data-char');
    });
  });

  // Shared Singleton AudioContext for Runner Game (Prevents browser lockup / thread exhaustion on key-hold)
  let runnerAudioCtx = null;
  function getRunnerAudioContext() {
    try {
      if (!runnerAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) runnerAudioCtx = new AudioCtx();
      }
      if (runnerAudioCtx && runnerAudioCtx.state === 'suspended') {
        runnerAudioCtx.resume().catch(() => { });
      }
      return runnerAudioCtx;
    } catch (e) {
      return null;
    }
  }

  function playBeep(freq, type, duration, vol = 0.08) {
    try {
      const ctx = getRunnerAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio might be blocked by browser policy
    }
  }

  function playJumpSound() { playBeep(480, 'square', 0.15, 0.05); }
  function playDuckSound() { playBeep(240, 'triangle', 0.1, 0.04); }
  function playBonusChime() {
    playBeep(659.25, 'sine', 0.25, 0.1);
    setTimeout(() => playBeep(880, 'sine', 0.35, 0.1), 80);
    setTimeout(() => playBeep(1174.66, 'sine', 0.4, 0.12), 160);
  }
  function playHitSound() {
    playBeep(180, 'sawtooth', 0.3, 0.1);
    setTimeout(() => playBeep(90, 'sawtooth', 0.4, 0.15), 100);
  }

  // Controls Event Listeners
  function handleJump() {
    if (!runnerGameActive) return;
    if (player.isGrounded && !player.isDucking) {
      player.vy = player.jumpForce;
      player.isGrounded = false;
      playJumpSound();
    }
  }

  function handleDuckStart() {
    if (!runnerGameActive || player.isDucking) return; // Prevent repeated firing on key hold (Fixes freeze!)
    if (player.isGrounded) {
      player.isDucking = true;
      playDuckSound();
    }
  }

  function handleDuckEnd() {
    player.isDucking = false;
  }

  window.addEventListener('keydown', (e) => {
    // Only intercept when runner game is active
    if (!runnerGameActive) return;

    if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      handleJump();
    } else if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      handleDuckStart();
    } else if (e.key === '9') {
      // Secret testing key: instantly trigger the 91,123 victory proposal screen
      triggerRunnerVictory();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (!runnerGameActive) return;
    if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      handleDuckEnd();
    }
  });

  // Mobile Touch Buttons
  if (mobileJumpBtn) {
    mobileJumpBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handleJump();
    });
  }

  if (mobileDuckBtn) {
    mobileDuckBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handleDuckStart();
    });
    mobileDuckBtn.addEventListener('pointerup', handleDuckEnd);
    mobileDuckBtn.addEventListener('pointercancel', handleDuckEnd);
    mobileDuckBtn.addEventListener('pointerleave', handleDuckEnd);
  }

  // Start & Retry Handlers
  if (runnerLandscapeBtn) {
    runnerLandscapeBtn.addEventListener('click', () => toggleGameLandscape('runner'));
  }

  if (runnerExitBtn) {
    runnerExitBtn.addEventListener('click', resetToCharSelect);
  }

  if (runnerGameoverExitBtn) {
    runnerGameoverExitBtn.addEventListener('click', resetToCharSelect);
  }

  if (startRunnerBtn) {
    startRunnerBtn.addEventListener('click', () => {
      requestGameLandscape('runner');
      initRunnerGame();
    });
  }

  if (retryRunnerBtn) {
    retryRunnerBtn.addEventListener('click', () => {
      runnerGameoverScreen.style.display = 'none';
      requestGameLandscape('runner');
      initRunnerGame();
    });
  }

  // Victory Acceptance Handler (Works from both normal Yes button and emergency warning button)
  function handleVictoryAcceptance() {
    if (rejectionWarningBox) rejectionWarningBox.style.display = 'none';
    if (window.confetti) {
      window.confetti({ particleCount: 220, spread: 100, origin: { y: 0.5 } });
    }
    playBonusChime();
    if (royalDeclarationBox) {
      royalDeclarationBox.style.display = 'block';
      if (window.lucide) window.lucide.createIcons();
      royalDeclarationBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (victoryYesBtn) {
    victoryYesBtn.addEventListener('click', handleVictoryAcceptance);
  }

  if (rejectionForceYesBtn) {
    rejectionForceYesBtn.addEventListener('click', handleVictoryAcceptance);
  }

  if (victoryNoBtn) {
    victoryNoBtn.addEventListener('click', () => {
      // Play funny ngambek / buzz sound
      playBeep(180, 'sawtooth', 0.2, 0.12);
      if (royalDeclarationBox) royalDeclarationBox.style.display = 'none';
      if (rejectionWarningBox) {
        rejectionWarningBox.style.display = 'block';
        rejectionWarningBox.classList.remove('shake-active');
        void rejectionWarningBox.offsetWidth; // trigger reflow for shake animation
        rejectionWarningBox.classList.add('shake-active');
        // Ensure warning and its "Yes, always" button are in full view
        rejectionWarningBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Replay Game Handlers (Issue 3 fix: Gamenya bisa diulang kapan saja!)
  function replayRunnerGame() {
    runnerVictoryScreen.style.display = 'none';
    if (rejectionWarningBox) rejectionWarningBox.style.display = 'none';
    if (royalDeclarationBox) royalDeclarationBox.style.display = 'none';
    requestGameLandscape('runner');
    initRunnerGame();
  }

  function resetToCharSelect() {
    exitGameLandscape();
    runnerGameActive = false;
    if (runnerAnimFrameId) cancelAnimationFrame(runnerAnimFrameId);
    runnerPlayScreen.style.display = 'none';
    runnerGameoverScreen.style.display = 'none';
    runnerVictoryScreen.style.display = 'none';
    if (rejectionWarningBox) rejectionWarningBox.style.display = 'none';
    if (royalDeclarationBox) royalDeclarationBox.style.display = 'none';
    runnerSelectScreen.style.display = 'block';
    runnerScore = 0;
    runnerBonusCount = 0;
    updateRunnerHUD();
    if (window.lucide) window.lucide.createIcons();
    runnerSelectScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (victoryReplayBtn) {
    victoryReplayBtn.addEventListener('click', replayRunnerGame);
  }

  if (victoryChangeCharBtn) {
    victoryChangeCharBtn.addEventListener('click', resetToCharSelect);
  }

  if (victoryCornerCloseBtn) {
    victoryCornerCloseBtn.addEventListener('click', resetToCharSelect);
  }

  function initRunnerGame() {
    if (isMobileGameDevice()) {
      requestGameLandscape('runner');
    }
    runnerSelectScreen.style.display = 'none';
    runnerGameoverScreen.style.display = 'none';
    runnerVictoryScreen.style.display = 'none';
    if (rejectionWarningBox) rejectionWarningBox.style.display = 'none';
    if (royalDeclarationBox) royalDeclarationBox.style.display = 'none';
    runnerPlayScreen.style.display = 'block';

    runnerScore = 0;
    runnerBonusCount = 0;
    runnerSpeed = 6.2;
    runnerObstacles = [];
    runnerParticles = [];
    runnerSpawnTimer = 40;
    runnerGameActive = true;

    player.y = GROUND_Y - player.height;
    player.vy = 0;
    player.isGrounded = true;
    player.isDucking = false;

    updateRunnerHUD();

    if (runnerAnimFrameId) cancelAnimationFrame(runnerAnimFrameId);
    runnerAnimFrameId = requestAnimationFrame(runnerGameLoop);
  }

  function showToast500(x, y) {
    if (!runnerToastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'float-score-toast';
    toast.textContent = '+500 ❤️';
    toast.style.left = `${Math.max(10, Math.min(700, x))}px`;
    toast.style.top = `${Math.max(10, y)}px`;
    runnerToastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 1000);
  }

  function updateRunnerHUD() {
    if (runnerCurrentScoreEl) runnerCurrentScoreEl.textContent = runnerScore.toLocaleString('id-ID');
    const pct = Math.min(100, (runnerScore / RUNNER_TARGET_SCORE) * 100);
    if (runnerProgressBar) runnerProgressBar.style.width = `${pct}%`;
    if (runnerProgressText) runnerProgressText.textContent = `${pct.toFixed(1)}%`;
    if (runnerBonusBadge) runnerBonusBadge.textContent = `+${runnerBonusCount * 500}`;
  }

  // Canvas-native high performance Mantan Avatar (0ms GPU, 100% crash proof, no SVG dependencies)
  function drawMantanAvatar(ctx, x, y, size) {
    ctx.save();
    // Ghost cloud body
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Angry Eyebrows
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.22, y + size * 0.36);
    ctx.lineTo(x + size * 0.42, y + size * 0.44);
    ctx.moveTo(x + size * 0.78, y + size * 0.36);
    ctx.lineTo(x + size * 0.58, y + size * 0.44);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + size * 0.34, y + size * 0.48, size * 0.08, 0, Math.PI * 2);
    ctx.arc(x + size * 0.66, y + size * 0.48, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + size * 0.36, y + size * 0.48, size * 0.04, 0, Math.PI * 2);
    ctx.arc(x + size * 0.64, y + size * 0.48, size * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Frowning mouth
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.32, y + size * 0.72);
    ctx.lineTo(x + size * 0.42, y + size * 0.66);
    ctx.lineTo(x + size * 0.50, y + size * 0.72);
    ctx.lineTo(x + size * 0.58, y + size * 0.66);
    ctx.lineTo(x + size * 0.68, y + size * 0.72);
    ctx.stroke();

    // Red Badge "MANTAN"
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    safeRoundRect(ctx, x + size * 0.12, y - 5, size * 0.76, 13, 3);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MANTAN', x + size / 2, y + 2);

    ctx.restore();
  }

  // Main 60 FPS Engine Loop (Protected with top-level try-catch so it NEVER crashes)
  function runnerGameLoop() {
    if (!runnerGameActive || !runnerCtx) return;

    try {
      updateRunnerGame();
    } catch (err) {
      console.warn("Runner animation frame error caught safely:", err);
    }

    if (runnerGameActive) {
      runnerAnimFrameId = requestAnimationFrame(runnerGameLoop);
    }
  }

  function updateRunnerGame() {
    // 1. UPDATE PHYSICS
    runnerScore += Math.floor(12 + (runnerSpeed * 1.8));

    // Increase speed smoothly over time
    if (runnerSpeed < 10.5) {
      runnerSpeed += 0.0015;
    }

    // Player Jump / Gravity
    player.vy += player.gravity;
    player.y += player.vy;

    const currentH = player.isDucking ? player.duckHeight : player.height;
    if (player.y >= GROUND_Y - currentH) {
      player.y = GROUND_Y - currentH;
      player.vy = 0;
      player.isGrounded = true;
    }

    player.trotAngle += 0.25;

    // 2. SPAWN OBSTACLES
    runnerSpawnTimer--;
    if (runnerSpawnTimer <= 0) {
      spawnRunnerObstacle();
      runnerSpawnTimer = Math.floor(75 + Math.random() * 45);
    }

    // 3. UPDATE OBSTACLES & DETECT COLLISIONS
    const currentW = player.isDucking ? player.duckWidth : player.width;
    const playerBox = {
      x: player.x + 6,
      y: player.y + 6,
      w: currentW - 12,
      h: currentH - 8
    };

    for (let i = runnerObstacles.length - 1; i >= 0; i--) {
      const obs = runnerObstacles[i];
      obs.x -= runnerSpeed;

      // Check collision
      const obsBox = {
        x: obs.x + 6,
        y: obs.y + 6,
        w: obs.w - 12,
        h: obs.h - 8
      };

      const isColliding = (
        playerBox.x < obsBox.x + obsBox.w &&
        playerBox.x + playerBox.w > obsBox.x &&
        playerBox.y < obsBox.y + obsBox.h &&
        playerBox.y + playerBox.h > obsBox.y
      );

      if (isColliding) {
        if (obs.type === 'partner_bonus') {
          // BUKAN MATI! INI BONUS CINTA +500 POIN!
          runnerScore += 500;
          runnerBonusCount++;
          playBonusChime();
          showToast500(player.x + 30, player.y - 15);
          runnerObstacles.splice(i, 1);
          continue;
        } else {
          // HIT HAZARD OBSTACLE -> GAME OVER
          triggerGameOver(obs.type, obs.name);
          return;
        }
      }

      // Remove off-screen obstacles
      if (obs.x + obs.w < -20) {
        runnerObstacles.splice(i, 1);
      }
    }

    // Check Victory Condition
    if (runnerScore >= RUNNER_TARGET_SCORE) {
      triggerRunnerVictory();
      return;
    }

    updateRunnerHUD();

    // 4. RENDER LEVEL DEVIL STAGE
    renderRunnerStage();
  }

  function spawnRunnerObstacle() {
    const rand = Math.random();

    if (rand < 0.35) {
      // 1. BONUS ITEM: MUKA PASANGAN (+500 POIN!)
      const isAir = Math.random() > 0.5;
      runnerObstacles.push({
        type: 'partner_bonus',
        x: 820,
        y: isAir ? 145 : (GROUND_Y - 48),
        w: 44,
        h: 44
      });
    } else if (rand < 0.65) {
      // 2. AIR OBSTACLE: MUKA MANTAN (Harus Menunduk!)
      // Rachel chosen -> Eren (Rachel's ex) is primary, Nada also appears
      // Elang chosen -> Nada (Elang's ex) is primary, Eren also appears
      let subType = 'nada';
      let exName = 'Nada';
      if (runnerSelectedChar === 'rachel') {
        if (Math.random() < 0.75) {
          subType = 'eren';
          exName = 'Eren';
        } else {
          subType = 'nada';
          exName = 'Nada';
        }
      } else {
        if (Math.random() < 0.75) {
          subType = 'nada';
          exName = 'Nada';
        } else {
          subType = 'eren';
          exName = 'Eren';
        }
      }

      runnerObstacles.push({
        type: 'mantan',
        subType: subType,
        name: exName,
        x: 820,
        y: 154,
        w: 44,
        h: 44
      });
    } else if (rand < 0.85) {
      // 3. GROUND OBSTACLE: MOBIL (Harus Lompat!)
      runnerObstacles.push({
        type: 'car',
        x: 820,
        y: GROUND_Y - 32,
        w: 58,
        h: 32
      });
    } else {
      // 4. GROUND OBSTACLE: MOTOR (Harus Lompat!)
      runnerObstacles.push({
        type: 'motor',
        x: 820,
        y: GROUND_Y - 32,
        w: 48,
        h: 32
      });
    }
  }

  function renderRunnerStage() {
    const w = runnerCanvas.width;
    const h = runnerCanvas.height;

    // Clear Canvas with Level Devil dark background
    runnerCtx.fillStyle = '#080910';
    runnerCtx.fillRect(0, 0, w, h);

    // Retro Grid Lines in Background
    runnerCtx.strokeStyle = 'rgba(255, 230, 0, 0.05)';
    runnerCtx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      runnerCtx.beginPath();
      runnerCtx.moveTo(x, 0);
      runnerCtx.lineTo(x, GROUND_Y);
      runnerCtx.stroke();
    }

    // Hazard Level Devil Ground Platform
    runnerCtx.fillStyle = '#0f111a';
    runnerCtx.fillRect(0, GROUND_Y, w, h - GROUND_Y);

    // Hazard Stripes on top of ground (Level Devil signature)
    const stripeOffset = (Date.now() / 20) % 20;
    runnerCtx.fillStyle = '#ffe600';
    runnerCtx.fillRect(0, GROUND_Y, w, 3);

    for (let x = -20; x < w; x += 20) {
      runnerCtx.beginPath();
      runnerCtx.moveTo(x + stripeOffset, GROUND_Y + 3);
      runnerCtx.lineTo(x + stripeOffset + 8, GROUND_Y + 3);
      runnerCtx.lineTo(x + stripeOffset - 2, GROUND_Y + 14);
      runnerCtx.lineTo(x + stripeOffset - 10, GROUND_Y + 14);
      runnerCtx.closePath();
      runnerCtx.fill();
    }

    // RENDER OBSTACLES (Protected with try-catch & finally so broken images NEVER crash the canvas)
    runnerObstacles.forEach(obs => {
      if (obs.type === 'partner_bonus') {
        runnerCtx.save();
        const pulse = Math.sin(Date.now() / 150) * 3;
        runnerCtx.strokeStyle = 'rgba(255, 230, 0, 0.9)';
        runnerCtx.lineWidth = 2.5;
        runnerCtx.beginPath();
        runnerCtx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2 + 2 + pulse, 0, Math.PI * 2);
        runnerCtx.stroke();

        // Partner Image
        let drewPartner = false;
        const partnerImg = (runnerSelectedChar === 'rachel') ? elangHeadImg : rachelHeadImg;
        if (partnerImg && partnerImg.complete && partnerImg.naturalWidth > 0) {
          runnerCtx.save();
          try {
            runnerCtx.beginPath();
            runnerCtx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, 0, Math.PI * 2);
            runnerCtx.clip();
            runnerCtx.drawImage(partnerImg, obs.x - pulse / 2, obs.y - pulse / 2, obs.w + pulse, obs.h + pulse);
            drewPartner = true;
          } catch (e) {
            drewPartner = false;
          } finally {
            runnerCtx.restore();
          }
        }

        if (!drewPartner) {
          runnerCtx.fillStyle = '#ffe600';
          runnerCtx.beginPath();
          runnerCtx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, 0, Math.PI * 2);
          runnerCtx.fill();
        }

        // Tiny bonus label above
        runnerCtx.fillStyle = '#ffe600';
        runnerCtx.font = 'bold 11px sans-serif';
        runnerCtx.textAlign = 'center';
        runnerCtx.fillText('+500', obs.x + obs.w / 2, obs.y - 6);
        runnerCtx.restore();

      } else if (obs.type === 'mantan') {
        // Flying Ex Head: Red warning ring + name label + 100% crash-proof image/canvas rendering
        runnerCtx.save();
        runnerCtx.strokeStyle = '#ef4444';
        runnerCtx.lineWidth = 2.5;
        runnerCtx.beginPath();
        runnerCtx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2 + 2, 0, Math.PI * 2);
        runnerCtx.stroke();

        let targetImg = mantanDefaultImg;
        if (obs.subType === 'nada') {
          targetImg = nadaImg;
        } else if (obs.subType === 'eren') {
          targetImg = erenImg;
        }

        let drewMantan = false;
        if (targetImg && targetImg.complete && targetImg.naturalWidth > 0) {
          runnerCtx.save();
          try {
            runnerCtx.beginPath();
            runnerCtx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, 0, Math.PI * 2);
            runnerCtx.clip();
            runnerCtx.drawImage(targetImg, obs.x, obs.y, obs.w, obs.h);
            drewMantan = true;
          } catch (e) {
            drewMantan = false;
          } finally {
            runnerCtx.restore();
          }
        }

        if (!drewMantan) {
          drawMantanAvatar(runnerCtx, obs.x, obs.y, obs.w);
        }

        // Ex name badge above head
        runnerCtx.fillStyle = '#ef4444';
        runnerCtx.font = 'bold 11px sans-serif';
        runnerCtx.textAlign = 'center';
        runnerCtx.fillText(obs.name || 'Mantan', obs.x + obs.w / 2, obs.y - 6);

        runnerCtx.restore();

      } else if (obs.type === 'car') {
        let drewCar = false;
        if (carImg && carImg.complete && carImg.naturalWidth > 0) {
          try {
            runnerCtx.drawImage(carImg, obs.x, obs.y, obs.w, obs.h);
            drewCar = true;
          } catch (e) { drewCar = false; }
        }
        if (!drewCar) {
          runnerCtx.fillStyle = '#f59e0b';
          runnerCtx.fillRect(obs.x, obs.y, obs.w, obs.h);
        }

      } else if (obs.type === 'motor') {
        let drewMotor = false;
        if (motorImg && motorImg.complete && motorImg.naturalWidth > 0) {
          try {
            runnerCtx.drawImage(motorImg, obs.x, obs.y, obs.w, obs.h);
            drewMotor = true;
          } catch (e) { drewMotor = false; }
        }
        if (!drewMotor) {
          runnerCtx.fillStyle = '#06b6d4';
          runnerCtx.fillRect(obs.x, obs.y, obs.w, obs.h);
        }
      }
    });

    // RENDER PLAYER (LEVEL DEVIL CHARACTER)
    runnerCtx.save();
    const curW = player.isDucking ? player.duckWidth : player.width;
    const curH = player.isDucking ? player.duckHeight : player.height;

    // Body Color based on character
    const bodyColor = (runnerSelectedChar === 'rachel') ? '#701a75' : '#0f172a';
    const borderOutline = (runnerSelectedChar === 'rachel') ? '#ec4899' : '#38bdf8';

    // Devil Body (Squircle Box)
    runnerCtx.fillStyle = bodyColor;
    runnerCtx.strokeStyle = borderOutline;
    runnerCtx.lineWidth = 2.5;
    runnerCtx.beginPath();
    safeRoundRect(runnerCtx, player.x, player.y, curW, curH, player.isDucking ? 6 : 10);
    runnerCtx.fill();
    runnerCtx.stroke();

    // Horns
    runnerCtx.fillStyle = '#ff2a6d';
    if (!player.isDucking) {
      // Left Horn
      runnerCtx.beginPath();
      runnerCtx.moveTo(player.x + 8, player.y);
      runnerCtx.lineTo(player.x + 2, player.y - 10);
      runnerCtx.lineTo(player.x + 14, player.y);
      runnerCtx.closePath();
      runnerCtx.fill();

      // Right Horn
      runnerCtx.beginPath();
      runnerCtx.moveTo(player.x + curW - 8, player.y);
      runnerCtx.lineTo(player.x + curW - 2, player.y - 10);
      runnerCtx.lineTo(player.x + curW - 14, player.y);
      runnerCtx.closePath();
      runnerCtx.fill();
    }

    // Player Face / Head Image
    const headImg = (runnerSelectedChar === 'rachel') ? rachelHeadImg : elangHeadImg;
    const headSize = player.isDucking ? 24 : 34;
    const headX = player.x + (curW - headSize) / 2;
    const headY = player.isDucking ? (player.y + 2) : (player.y + 6);

    let drewPlayerHead = false;
    if (headImg && headImg.complete && headImg.naturalWidth > 0) {
      runnerCtx.save();
      try {
        runnerCtx.beginPath();
        runnerCtx.arc(headX + headSize / 2, headY + headSize / 2, headSize / 2, 0, Math.PI * 2);
        runnerCtx.clip();
        runnerCtx.drawImage(headImg, headX, headY, headSize, headSize);
        drewPlayerHead = true;
      } catch (e) {
        drewPlayerHead = false;
      } finally {
        runnerCtx.restore();
      }
    }

    if (!drewPlayerHead) {
      runnerCtx.fillStyle = '#ffe600';
      runnerCtx.beginPath();
      runnerCtx.arc(headX + headSize / 2, headY + headSize / 2, headSize / 2, 0, Math.PI * 2);
      runnerCtx.fill();
    }

    // Animated Feet (Trot)
    if (player.isGrounded && !player.isDucking) {
      const legOffset = Math.sin(player.trotAngle) * 5;
      runnerCtx.fillStyle = '#000';
      runnerCtx.fillRect(player.x + 10, player.y + curH - 2, 7, 7 + legOffset);
      runnerCtx.fillRect(player.x + curW - 17, player.y + curH - 2, 7, 7 - legOffset);
    }

    runnerCtx.restore();
  }

  function triggerGameOver(hitType, hitName) {
    runnerGameActive = false;
    if (runnerAnimFrameId) cancelAnimationFrame(runnerAnimFrameId);
    playHitSound();

    let reasonMsg = "Kamu menabrak obstacle di jalan!";
    if (hitType === 'mantan') {
      const exName = hitName || 'Mantan';
      reasonMsg = `Tertabrak ${exName} yang melayang! 😱 Gunakan tombol Panah Bawah ⬇️ untuk menunduk!`;
    } else if (hitType === 'car') {
      reasonMsg = "Tertabrak Mobil! Gunakan tombol Spasi / Panah Atas ⬆️ untuk melompat!";
    } else if (hitType === 'motor') {
      reasonMsg = "Tertabrak Motor! Gunakan tombol Spasi / Panah Atas ⬆️ untuk melompat!";
    }

    if (runnerDeathReason) runnerDeathReason.textContent = reasonMsg;
    if (gameoverScoreEl) gameoverScoreEl.textContent = runnerScore.toLocaleString('id-ID');
    if (runnerGameoverScreen) runnerGameoverScreen.style.display = 'flex';
  }

  function triggerRunnerVictory() {
    runnerGameActive = false;
    if (runnerAnimFrameId) cancelAnimationFrame(runnerAnimFrameId);
    runnerScore = RUNNER_TARGET_SCORE;
    updateRunnerHUD();

    // Reset modals inside victory screen
    if (rejectionWarningBox) rejectionWarningBox.style.display = 'none';
    if (royalDeclarationBox) royalDeclarationBox.style.display = 'none';

    // Dynamic question and pledge based on chosen character
    if (runnerSelectedChar === 'elang') {
      // Case Elang chosen: Question is "Will you let me be your forever Queen?"
      if (runnerVictoryQuestion) {
        runnerVictoryQuestion.textContent = '"Will you let me be your forever Queen?"';
      }
      if (royalDeclarationText) {
        royalDeclarationText.textContent = '"Mulai hari ini, esok, dan selamanya, aku berjanji akan menjadi raja yang selalu menjagamu, melindungimu, mendukung riset biologi hebatmu, mentraktir pasta terbaik untukmu, dan mendampingimu di setiap bab kehidupan kita. Selamat Anniversary, Elang!"';
      }
      if (royalDeclarationSig) {
        royalDeclarationSig.textContent = '— Rachel, Your Forever Queen';
      }
    } else {
      // Case Rachel chosen: Question is "Will you let me be your forever King?"
      if (runnerVictoryQuestion) {
        runnerVictoryQuestion.textContent = '"Will you let me be your forever King?"';
      }
      if (royalDeclarationText) {
        royalDeclarationText.textContent = '"Mulai hari ini, esok, dan selamanya, aku berjanji akan menjadi raja yang selalu menjagamu, melindungimu, mendukung riset biologi hebatmu, mentraktir pasta terbaik untukmu, dan mendampingimu di setiap bab kehidupan kita. Selamat Anniversary, Rachel!"';
      }
      if (royalDeclarationSig) {
        royalDeclarationSig.textContent = '— Elang, Your Forever King';
      }
    }

    if (window.confetti) {
      window.confetti({ particleCount: 250, spread: 120, origin: { y: 0.4 } });
    }

    playBonusChime();
    setTimeout(playBonusChime, 300);

    if (runnerVictoryScreen) {
      runnerVictoryScreen.style.display = 'flex';
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // ==================== 8.6 LOVE BLOCK BLAST: 8x8 PUZZLE GAME ====================
  const BB_KEY_RACHEL = 'love_bb_highscore_rachel';
  const BB_KEY_ELANG = 'love_bb_highscore_elang';

  let bbScore = 0;
  let bbCombo = 0;
  let bbPlayer = 'rachel'; // 'rachel' or 'elang'
  let bbBoardState = Array(8).fill(null).map(() => Array(8).fill(null));
  let bbCurrentPieces = [null, null, null];
  let bbSelectedPieceIdx = null; // for tap selection
  let bbIsGameOver = false;

  // DOM Elements
  const bbSelectScreen = document.getElementById('bb-select-screen');
  const bbPlayScreen = document.getElementById('bb-play-screen');
  const bbGameoverModal = document.getElementById('bb-gameover-modal');
  const bbBoardEl = document.getElementById('bb-board');
  const bbDockEl = document.getElementById('bb-dock');
  const bbCurrentScoreEl = document.getElementById('bb-current-score');
  const bbComboBanner = document.getElementById('bb-combo-banner');
  const bbComboText = document.getElementById('bb-combo-text');
  const bbHudPlayerImg = document.getElementById('bb-hud-player-img');
  const bbHudPlayerName = document.getElementById('bb-hud-player-name');
  const bbHudTargetRecord = document.getElementById('bb-hud-target-record');
  const bbStartBtn = document.getElementById('bb-start-btn');
  const bbBackBtn = document.getElementById('bb-back-btn');
  const bbRetryBtn = document.getElementById('bb-retry-btn');
  const bbChangePlayerBtn = document.getElementById('bb-change-player-btn');
  const bbSecretResetBtn = document.getElementById('bb-secret-reset-btn');
  const bbToastContainer = document.getElementById('bb-toast-container');
  const bbChooseRachel = document.getElementById('bb-choose-rachel');
  const bbChooseElang = document.getElementById('bb-choose-elang');
  const bbHighscoreRachelEl = document.getElementById('bb-highscore-rachel');
  const bbHighscoreElangEl = document.getElementById('bb-highscore-elang');
  const bbCrownRachel = document.getElementById('bb-crown-rachel');
  const bbCrownElang = document.getElementById('bb-crown-elang');
  const bbLeadStatus = document.getElementById('bb-lead-status');
  const bbModalFinalScore = document.getElementById('bb-modal-final-score');
  const bbModalRecordLabel = document.getElementById('bb-modal-record-label');
  const bbModalHighscoreVal = document.getElementById('bb-modal-highscore-val');
  const bbNewRecordBadge = document.getElementById('bb-new-record-badge');

  // Block Blast Polyomino Shapes
  const BB_SHAPES = [
    // 1-block
    { name: '1x1', matrix: [[1]] },
    // 2-blocks
    { name: '1x2', matrix: [[1, 1]] },
    { name: '2x1', matrix: [[1], [1]] },
    // 3-blocks
    { name: '1x3', matrix: [[1, 1, 1]] },
    { name: '3x1', matrix: [[1], [1], [1]] },
    { name: 'L2_1', matrix: [[1, 0], [1, 1]] },
    { name: 'L2_2', matrix: [[0, 1], [1, 1]] },
    { name: 'L2_3', matrix: [[1, 1], [1, 0]] },
    { name: 'L2_4', matrix: [[1, 1], [0, 1]] },
    // 4-blocks
    { name: '1x4', matrix: [[1, 1, 1, 1]] },
    { name: '4x1', matrix: [[1], [1], [1], [1]] },
    { name: '2x2', matrix: [[1, 1], [1, 1]] },
    { name: 'L3_1', matrix: [[1, 0], [1, 0], [1, 1]] },
    { name: 'L3_2', matrix: [[0, 1], [0, 1], [1, 1]] },
    { name: 'L3_3', matrix: [[1, 1, 1], [1, 0, 0]] },
    { name: 'L3_4', matrix: [[1, 1, 1], [0, 0, 1]] },
    { name: 'T_1', matrix: [[1, 1, 1], [0, 1, 0]] },
    { name: 'T_2', matrix: [[0, 1, 0], [1, 1, 1]] },
    { name: 'T_3', matrix: [[1, 0], [1, 1], [1, 0]] },
    { name: 'T_4', matrix: [[0, 1], [1, 1], [0, 1]] },
    { name: 'Z_1', matrix: [[1, 1, 0], [0, 1, 1]] },
    { name: 'Z_2', matrix: [[0, 1, 1], [1, 1, 0]] },
    // 5-blocks & Bigger
    { name: '1x5', matrix: [[1, 1, 1, 1, 1]] },
    { name: '5x1', matrix: [[1], [1], [1], [1], [1]] },
    { name: '3x3', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
    { name: 'Plus', matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]] }
  ];

  function getBBHighScore(char) {
    try {
      const val = parseInt(localStorage.getItem(char === 'rachel' ? BB_KEY_RACHEL : BB_KEY_ELANG), 10);
      return isNaN(val) ? 0 : val;
    } catch (e) {
      return 0;
    }
  }

  function setBBHighScore(char, score) {
    try {
      const current = getBBHighScore(char);
      if (score > current) {
        localStorage.setItem(char === 'rachel' ? BB_KEY_RACHEL : BB_KEY_ELANG, score.toString());
        return true;
      }
    } catch (e) { }
    return false;
  }

  function updateBlockBlastHighScoresUI() {
    const rachelScore = getBBHighScore('rachel');
    const elangScore = getBBHighScore('elang');

    if (bbHighscoreRachelEl) bbHighscoreRachelEl.textContent = rachelScore.toLocaleString('id-ID');
    if (bbHighscoreElangEl) bbHighscoreElangEl.textContent = elangScore.toLocaleString('id-ID');

    if (rachelScore > elangScore) {
      if (bbCrownRachel) bbCrownRachel.style.display = 'block';
      if (bbCrownElang) bbCrownElang.style.display = 'none';
      if (bbLeadStatus) bbLeadStatus.innerHTML = `<span>👑 Rachel Memimpin! (+${(rachelScore - elangScore).toLocaleString('id-ID')})</span>`;
    } else if (elangScore > rachelScore) {
      if (bbCrownRachel) bbCrownRachel.style.display = 'none';
      if (bbCrownElang) bbCrownElang.style.display = 'block';
      if (bbLeadStatus) bbLeadStatus.innerHTML = `<span>👑 Elang Memimpin! (+${(elangScore - rachelScore).toLocaleString('id-ID')})</span>`;
    } else {
      if (bbCrownRachel) bbCrownRachel.style.display = 'none';
      if (bbCrownElang) bbCrownElang.style.display = 'none';
      if (bbLeadStatus) bbLeadStatus.innerHTML = `<span>🤝 Skor Seimbang!</span>`;
    }

    // Update target record in HUD if in game
    if (bbHudTargetRecord) {
      bbHudTargetRecord.textContent = getBBHighScore(bbPlayer).toLocaleString('id-ID');
    }
  }

  // Secret reset high scores function
  function resetBlockBlastScores() {
    try {
      localStorage.setItem(BB_KEY_RACHEL, '0');
      localStorage.setItem(BB_KEY_ELANG, '0');
    } catch (e) { }
    updateBlockBlastHighScoresUI();
    showBBToast("🔧 Rekor skor Elang & Rachel di-reset ke 0!");
    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    playBonusChime();
  }

  if (bbSecretResetBtn) {
    bbSecretResetBtn.addEventListener('click', resetBlockBlastScores);
  }

  // Secret shortcut: Press '0' anywhere when in blockblast tab
  window.addEventListener('keydown', (e) => {
    if (e.key === '0' && document.activeElement && document.activeElement.tagName !== 'INPUT') {
      const isBlockBlastVisible = blockBlastWrapper && blockBlastWrapper.style.display !== 'none';
      if (isBlockBlastVisible) {
        resetBlockBlastScores();
      }
    }
  });

  // Character selection in pre-game screen
  if (bbChooseRachel) {
    bbChooseRachel.addEventListener('click', () => {
      bbPlayer = 'rachel';
      bbChooseRachel.classList.add('active');
      if (bbChooseElang) bbChooseElang.classList.remove('active');
    });
  }

  if (bbChooseElang) {
    bbChooseElang.addEventListener('click', () => {
      bbPlayer = 'elang';
      bbChooseElang.classList.add('active');
      if (bbChooseRachel) bbChooseRachel.classList.remove('active');
    });
  }

  // Start Game Button
  if (bbStartBtn) {
    bbStartBtn.addEventListener('click', startBlockBlastGame);
  }

  if (bbBackBtn) {
    bbBackBtn.addEventListener('click', () => {
      bbPlayScreen.style.display = 'none';
      bbGameoverModal.style.display = 'none';
      bbSelectScreen.style.display = 'block';
      updateBlockBlastHighScoresUI();
    });
  }

  if (bbRetryBtn) {
    bbRetryBtn.addEventListener('click', () => {
      bbGameoverModal.style.display = 'none';
      startBlockBlastGame();
    });
  }

  if (bbChangePlayerBtn) {
    bbChangePlayerBtn.addEventListener('click', () => {
      bbPlayScreen.style.display = 'none';
      bbGameoverModal.style.display = 'none';
      bbSelectScreen.style.display = 'block';
      updateBlockBlastHighScoresUI();
    });
  }

  function startBlockBlastGame() {
    bbSelectScreen.style.display = 'none';
    bbGameoverModal.style.display = 'none';
    bbPlayScreen.style.display = 'block';

    bbScore = 0;
    bbCombo = 0;
    bbIsGameOver = false;
    bbSelectedPieceIdx = null;
    bbBoardState = Array(8).fill(null).map(() => Array(8).fill(null));

    if (bbCurrentScoreEl) bbCurrentScoreEl.textContent = '0';
    if (bbComboBanner) bbComboBanner.style.display = 'none';

    // Set HUD Player avatar & name
    if (bbHudPlayerName) bbHudPlayerName.textContent = (bbPlayer === 'rachel' ? 'Rachel' : 'Elang');
    if (bbHudPlayerImg) {
      bbHudPlayerImg.src = (bbPlayer === 'rachel' ? rachelHeadImg.src : elangHeadImg.src);
    }
    if (bbHudTargetRecord) {
      bbHudTargetRecord.textContent = getBBHighScore(bbPlayer).toLocaleString('id-ID');
    }

    renderBBBoard();
    generateBBPieces();
    playBeep(520, 'sine', 0.12, 0.08);
  }

  function showBBToast(text) {
    if (!bbToastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'bb-toast';
    toast.textContent = text;
    bbToastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 900);
  }

  // Render 8x8 Board Grid
  function renderBBBoard() {
    if (!bbBoardEl) return;
    bbBoardEl.innerHTML = '';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        cell.className = 'bb-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        const tileData = bbBoardState[r][c];
        if (tileData) {
          cell.classList.add('filled');
          const tile = document.createElement('div');
          tile.className = `bb-tile tile-${tileData.type}`;
          const img = document.createElement('img');
          img.className = 'bb-tile-avatar';
          img.src = tileData.img;
          img.alt = tileData.type;
          tile.appendChild(img);
          cell.appendChild(tile);
        }

        // Tap-to-place click handler
        cell.addEventListener('click', () => {
          if (bbSelectedPieceIdx !== null) {
            tryPlaceSelectedPiece(r, c);
          }
        });

        bbBoardEl.appendChild(cell);
      }
    }
  }

  // Generate 3 new pieces with mixed / alternating / full avatars
  function generateBBPieces() {
    bbCurrentPieces = [createBBPiece(), createBBPiece(), createBBPiece()];
    renderBBDock();
    checkBBDockFit();
  }

  function createBBPiece() {
    const shapeObj = BB_SHAPES[Math.floor(Math.random() * BB_SHAPES.length)];
    const matrix = shapeObj.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;

    // Pick avatar style for this piece:
    // 'mixed', 'alternating', 'full_rachel', 'full_elang'
    const modes = ['mixed', 'mixed', 'alternating', 'full_rachel', 'full_elang'];
    const chosenMode = modes[Math.floor(Math.random() * modes.length)];

    let altToggle = Math.random() > 0.5;
    const cells = [];

    for (let r = 0; r < rows; r++) {
      cells[r] = [];
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c] === 1) {
          let charType = 'rachel';
          if (chosenMode === 'mixed') {
            charType = Math.random() > 0.5 ? 'rachel' : 'elang';
          } else if (chosenMode === 'alternating') {
            charType = altToggle ? 'rachel' : 'elang';
            altToggle = !altToggle;
          } else if (chosenMode === 'full_rachel') {
            charType = 'rachel';
          } else if (chosenMode === 'full_elang') {
            charType = 'elang';
          }

          cells[r][c] = {
            type: charType,
            img: (charType === 'rachel' ? rachelHeadImg.src : elangHeadImg.src)
          };
        } else {
          cells[r][c] = null;
        }
      }
    }

    return {
      matrix,
      cells,
      rows,
      cols
    };
  }

  // Render 3 pieces in dock
  function renderBBDock() {
    if (!bbDockEl) return;
    bbDockEl.innerHTML = '';

    bbCurrentPieces.forEach((piece, idx) => {
      const slot = document.createElement('div');
      slot.className = 'bb-dock-slot';

      if (piece) {
        const pieceEl = document.createElement('div');
        pieceEl.className = 'bb-piece';
        pieceEl.dataset.idx = idx;
        pieceEl.style.gridTemplateColumns = `repeat(${piece.cols}, 1fr)`;

        if (bbSelectedPieceIdx === idx) {
          pieceEl.classList.add('selected');
        }

        // Render piece cells
        for (let r = 0; r < piece.rows; r++) {
          for (let c = 0; c < piece.cols; c++) {
            const cellData = piece.cells[r][c];
            const cellDiv = document.createElement('div');
            cellDiv.className = 'bb-piece-cell';

            if (cellData) {
              cellDiv.classList.add(`cell-${cellData.type}`);
              const img = document.createElement('img');
              img.className = 'bb-piece-avatar';
              img.src = cellData.img;
              img.alt = cellData.type;
              cellDiv.appendChild(img);
            } else {
              cellDiv.classList.add('empty');
            }

            pieceEl.appendChild(cellDiv);
          }
        }

        // Attach unified pointer events for Drag & Drop + Tap Selection
        setupPieceDragAndTap(pieceEl, idx);
        slot.appendChild(pieceEl);
      }

      bbDockEl.appendChild(slot);
    });
  }

  // Setup Drag & Drop + Tap-to-place on each piece
  function setupPieceDragAndTap(pieceEl, pieceIdx) {
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let dragClone = null;
    let hoveredRow = null;
    let hoveredCol = null;

    pieceEl.addEventListener('pointerdown', (e) => {
      const piece = bbCurrentPieces[pieceIdx];
      if (!piece || pieceEl.classList.contains('unplaceable')) return;

      startX = e.clientX;
      startY = e.clientY;
      isDragging = false;

      pieceEl.setPointerCapture(e.pointerId);

      function onPointerMove(moveEvent) {
        const dist = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
        if (!isDragging && dist > 7) {
          isDragging = true;
          bbSelectedPieceIdx = null;
          document.querySelectorAll('.bb-piece').forEach(p => p.classList.remove('selected'));

          dragClone = pieceEl.cloneNode(true);
          dragClone.className = 'bb-drag-clone';
          dragClone.style.gridTemplateColumns = `repeat(${piece.cols}, 1fr)`;
          document.body.appendChild(dragClone);
          pieceEl.classList.add('dragging');
        }

        if (isDragging && dragClone) {
          const isTouch = moveEvent.pointerType === 'touch';
          const posY = moveEvent.clientY - (isTouch ? 55 : 0);
          dragClone.style.left = `${moveEvent.clientX}px`;
          dragClone.style.top = `${posY}px`;

          clearBoardHighlights();
          const elem = document.elementFromPoint(moveEvent.clientX, posY);
          const cell = elem ? elem.closest('.bb-cell') : null;

          if (cell) {
            hoveredRow = parseInt(cell.dataset.r, 10);
            hoveredCol = parseInt(cell.dataset.c, 10);

            const targetR = hoveredRow - Math.floor(piece.rows / 2);
            const targetC = hoveredCol - Math.floor(piece.cols / 2);

            highlightBoardPreview(piece.matrix, targetR, targetC);
          } else {
            hoveredRow = null;
            hoveredCol = null;
          }
        }
      }

      function onPointerUp(upEvent) {
        pieceEl.releasePointerCapture(upEvent.pointerId);
        pieceEl.removeEventListener('pointermove', onPointerMove);
        pieceEl.removeEventListener('pointerup', onPointerUp);
        pieceEl.removeEventListener('pointercancel', onPointerUp);

        clearBoardHighlights();

        if (isDragging) {
          pieceEl.classList.remove('dragging');
          if (dragClone) {
            dragClone.remove();
            dragClone = null;
          }

          if (hoveredRow !== null && hoveredCol !== null) {
            const targetR = hoveredRow - Math.floor(piece.rows / 2);
            const targetC = hoveredCol - Math.floor(piece.cols / 2);

            if (canPlacePiece(piece.matrix, targetR, targetC)) {
              placePiece(pieceIdx, targetR, targetC);
              return;
            }
          }
          playBeep(220, 'sawtooth', 0.08, 0.04);
        } else {
          // Simple Tap / Click -> Toggle selection for tap-to-place
          if (bbSelectedPieceIdx === pieceIdx) {
            bbSelectedPieceIdx = null;
            pieceEl.classList.remove('selected');
          } else {
            bbSelectedPieceIdx = pieceIdx;
            document.querySelectorAll('.bb-piece').forEach(p => p.classList.remove('selected'));
            pieceEl.classList.add('selected');
            playBeep(440, 'triangle', 0.08, 0.05);
          }
        }
      }

      pieceEl.addEventListener('pointermove', onPointerMove);
      pieceEl.addEventListener('pointerup', onPointerUp);
      pieceEl.addEventListener('pointercancel', onPointerUp);
    });
  }

  // Tap-to-Place handler on board cells
  function tryPlaceSelectedPiece(r, c) {
    if (bbSelectedPieceIdx === null) return;
    const piece = bbCurrentPieces[bbSelectedPieceIdx];
    if (!piece) return;

    const targetR = r - Math.floor(piece.rows / 2);
    const targetC = c - Math.floor(piece.cols / 2);

    if (canPlacePiece(piece.matrix, targetR, targetC)) {
      const idx = bbSelectedPieceIdx;
      bbSelectedPieceIdx = null;
      placePiece(idx, targetR, targetC);
    } else {
      if (canPlacePiece(piece.matrix, r, c)) {
        const idx = bbSelectedPieceIdx;
        bbSelectedPieceIdx = null;
        placePiece(idx, r, c);
      } else {
        playBeep(200, 'sawtooth', 0.1, 0.05);
      }
    }
  }

  function clearBoardHighlights() {
    document.querySelectorAll('.bb-cell').forEach(c => {
      c.classList.remove('hover-valid', 'hover-invalid');
    });
  }

  function highlightBoardPreview(matrix, startR, startC) {
    const valid = canPlacePiece(matrix, startR, startC);
    const cls = valid ? 'hover-valid' : 'hover-invalid';

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          const br = startR + r;
          const bc = startC + c;
          if (br >= 0 && br < 8 && bc >= 0 && bc < 8) {
            const cellEl = bbBoardEl.querySelector(`[data-r="${br}"][data-c="${bc}"]`);
            if (cellEl) cellEl.classList.add(cls);
          }
        }
      }
    }
  }

  function canPlacePiece(matrix, startR, startC) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c] === 1) {
          const br = startR + r;
          const bc = startC + c;
          if (br < 0 || br >= 8 || bc < 0 || bc >= 8) return false;
          if (bbBoardState[br][bc] !== null) return false;
        }
      }
    }
    return true;
  }

  function canPieceFitAnywhere(matrix) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (canPlacePiece(matrix, r, c)) {
          return true;
        }
      }
    }
    return false;
  }

  function placePiece(pieceIdx, startR, startC) {
    const piece = bbCurrentPieces[pieceIdx];
    if (!piece) return;

    let placedBlockCount = 0;

    for (let r = 0; r < piece.rows; r++) {
      for (let c = 0; c < piece.cols; c++) {
        if (piece.matrix[r][c] === 1) {
          bbBoardState[startR + r][startC + c] = piece.cells[r][c];
          placedBlockCount++;
        }
      }
    }

    bbScore += placedBlockCount * 10;
    playBeep(360, 'sine', 0.08, 0.05);

    bbCurrentPieces[pieceIdx] = null;
    bbSelectedPieceIdx = null;

    renderBBBoard();
    renderBBDock();

    const fullRows = [];
    const fullCols = [];

    for (let r = 0; r < 8; r++) {
      let isFull = true;
      for (let c = 0; c < 8; c++) {
        if (bbBoardState[r][c] === null) {
          isFull = false;
          break;
        }
      }
      if (isFull) fullRows.push(r);
    }

    for (let c = 0; c < 8; c++) {
      let isFull = true;
      for (let r = 0; r < 8; r++) {
        if (bbBoardState[r][c] === null) {
          isFull = false;
          break;
        }
      }
      if (isFull) fullCols.push(c);
    }

    const totalLines = fullRows.length + fullCols.length;

    if (totalLines > 0) {
      bbCombo++;

      let linePoints = 100;
      if (totalLines === 2) linePoints = 300;
      else if (totalLines === 3) linePoints = 600;
      else if (totalLines >= 4) linePoints = 1000;

      const comboMultiplier = 1 + (bbCombo - 1) * 0.5;
      const earned = Math.floor(linePoints * comboMultiplier);
      bbScore += earned;

      playBlastSound(totalLines, bbCombo);

      const cellsToBlast = new Set();
      fullRows.forEach(r => {
        for (let c = 0; c < 8; c++) cellsToBlast.add(`${r},${c}`);
      });
      fullCols.forEach(c => {
        for (let r = 0; r < 8; r++) cellsToBlast.add(`${r},${c}`);
      });

      cellsToBlast.forEach(pos => {
        const [r, c] = pos.split(',').map(Number);
        const cellEl = bbBoardEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
        if (cellEl) cellEl.classList.add('blasting');
        bbBoardState[r][c] = null;
      });

      if (bbCombo > 1) {
        showBBToast(`+${earned} • COMBO x${bbCombo}! 🔥`);
        if (bbComboBanner) {
          bbComboBanner.style.display = 'block';
          if (bbComboText) bbComboText.textContent = `COMBO x${bbCombo}! 🔥`;
        }
      } else {
        showBBToast(`+${earned} BLAST! 💥`);
      }

      setTimeout(() => {
        renderBBBoard();
        afterMoveChecks();
      }, 300);

    } else {
      bbCombo = 0;
      if (bbComboBanner) bbComboBanner.style.display = 'none';
      afterMoveChecks();
    }

    if (bbCurrentScoreEl) {
      bbCurrentScoreEl.textContent = bbScore.toLocaleString('id-ID');
    }
  }

  function playBlastSound(lines, combo) {
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const pitchOffset = Math.min(combo * 40, 200);

    freqs.slice(0, Math.min(lines + 1, 5)).forEach((f, i) => {
      setTimeout(() => {
        playBeep(f + pitchOffset, 'triangle', 0.22, 0.08);
      }, i * 65);
    });
  }

  function afterMoveChecks() {
    const remaining = bbCurrentPieces.filter(p => p !== null);
    if (remaining.length === 0) {
      generateBBPieces();
      playBeep(659.25, 'sine', 0.15, 0.06);
    } else {
      checkBBDockFit();
    }
  }

  function checkBBDockFit() {
    let anyFits = false;

    bbCurrentPieces.forEach((piece, idx) => {
      if (piece) {
        const fits = canPieceFitAnywhere(piece.matrix);
        const slotEl = bbDockEl.children[idx];
        const pieceEl = slotEl ? slotEl.querySelector('.bb-piece') : null;

        if (pieceEl) {
          if (!fits) {
            pieceEl.classList.add('unplaceable');
          } else {
            pieceEl.classList.remove('unplaceable');
            anyFits = true;
          }
        }
      }
    });

    const activePieces = bbCurrentPieces.filter(p => p !== null);
    if (activePieces.length > 0 && !anyFits) {
      triggerBBGameOver();
    }
  }

  function triggerBBGameOver() {
    bbIsGameOver = true;
    playBeep(330, 'sawtooth', 0.2, 0.08);
    setTimeout(() => playBeep(220, 'sawtooth', 0.35, 0.1), 150);

    const isNewHigh = setBBHighScore(bbPlayer, bbScore);
    const currentHigh = getBBHighScore(bbPlayer);

    if (bbModalFinalScore) bbModalFinalScore.textContent = bbScore.toLocaleString('id-ID');
    if (bbModalRecordLabel) bbModalRecordLabel.textContent = `Rekor ${bbPlayer === 'rachel' ? 'Rachel' : 'Elang'}:`;
    if (bbModalHighscoreVal) bbModalHighscoreVal.textContent = currentHigh.toLocaleString('id-ID');

    if (bbNewRecordBadge) {
      if (isNewHigh && bbScore > 0) {
        bbNewRecordBadge.style.display = 'inline-block';
        if (window.confetti) {
          window.confetti({ particleCount: 180, spread: 90, origin: { y: 0.5 } });
        }
        playBonusChime();
      } else {
        bbNewRecordBadge.style.display = 'none';
      }
    }

    if (bbGameoverModal) {
      bbGameoverModal.style.display = 'flex';
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // Initial load of High Scores
  updateBlockBlastHighScoresUI();

  // ==================== 8.7 DATE NIGHT COOK-OFF: RESTAURANT & RECIPE BOOK ====================
  const COOKOFF_KEY_HIGHSCORE = 'love_cookoff_highscore';

  const COOKOFF_RECIPES = [
    // Rachel's Pasta Favorites
    {
      id: 'pasta_1',
      target: 'rachel',
      name: 'Spaghetti Aglio Olio Al Funghi',
      quote: 'Sayang, aku laper banget... masakin Spaghetti Aglio Olio pakai jamur truffle ya! 🥺',
      base: 'spaghetti',
      sauce: 'aglio_olio',
      topping: 'jamur',
      note: 'Pasta klasik favorit Rachel dengan aroma bawang putih gurih dan jamur lezat.'
    },
    {
      id: 'pasta_2',
      target: 'rachel',
      name: 'Creamy Penne Carbonara',
      quote: 'Pengen yang creamy dan gurih keju... Penne Carbonara tabur Keju Parmesan ya sayang! 🍝',
      base: 'penne',
      sauce: 'carbonara',
      topping: 'keju',
      note: 'Saus krim lembut berpadu taburan keju parmesan melimpah.'
    },
    {
      id: 'pasta_3',
      target: 'rachel',
      name: 'Classic Bolognese Royale',
      quote: 'Lagi pengen saus tomat daging cincang nih, buatin Spaghetti Bolognese tabur keju! 🍅',
      base: 'spaghetti',
      sauce: 'bolognese',
      topping: 'keju',
      note: 'Kombinasi klasik saus tomat daging cincang dan parutan parmesan gurih.'
    },
    {
      id: 'pasta_4',
      target: 'rachel',
      name: 'Penne Truffle Aglio Olio',
      quote: 'Mau Penne Aglio Olio wangi jamur truffle ya cintaku, biar semangat riset biologi! 🍄',
      base: 'penne',
      sauce: 'aglio_olio',
      topping: 'jamur',
      note: 'Penne al dente dengan minyak zaitun cabai dan jamur gurih wangi.'
    },
    // Elang's Sate Madura Favorites
    {
      id: 'sate_1',
      target: 'elang',
      name: 'Sate Ayam Bumbu Kacang Madura',
      quote: 'Fisikawan ini butuh asupan protein! Tolong Sate Ayam bumbu kacang tabur bawang goreng ya! 🍢',
      base: 'sate_ayam',
      sauce: 'bumbu_kacang',
      topping: 'bawang_goreng',
      note: 'Sate ayam bakar khas Madura dengan bumbu kacang kental legit dan bawang renyah.'
    },
    {
      id: 'sate_2',
      target: 'elang',
      name: 'Sate Kambing Kecap Pedas',
      quote: 'Mau Sate Kambing bumbu kecap pedas cabai rawit dong sayang, mantap banget itu! 🥩',
      base: 'sate_kambing',
      sauce: 'kecap_pedas',
      topping: 'irisan_cabe',
      note: 'Daging kambing empuk disiram kecap manis pedas dan irisan bawang cabai segar.'
    },
    {
      id: 'sate_3',
      target: 'elang',
      name: 'Sate Ayam Komplit Lontong',
      quote: 'Biar kenyang seharian, buatin Sate Ayam bumbu kacang plus Lontong ya Princess! 🍚',
      base: 'sate_ayam',
      sauce: 'bumbu_kacang',
      topping: 'lontong',
      note: 'Paket kencan komplit: sate ayam bumbu kacang dipadukan lontong pulen.'
    },
    {
      id: 'sate_4',
      target: 'elang',
      name: 'Sate Kambing Bumbu Kacang Gurih',
      quote: 'Sate Kambing bumbu kacang tabur bawang goreng dong sayang, aroma bakarnya ngangenin! 🍢',
      base: 'sate_kambing',
      sauce: 'bumbu_kacang',
      topping: 'bawang_goreng',
      note: 'Perpaduan gurih daging kambing bakar dengan kentalnya bumbu kacang Madura.'
    }
  ];

  const INGREDIENTS_META = {
    spaghetti: { name: 'Spaghetti', icon: '🍝', cat: 'base' },
    penne: { name: 'Penne', icon: '🥟', cat: 'base' },
    sate_ayam: { name: 'Sate Ayam', icon: '🍢', cat: 'base' },
    sate_kambing: { name: 'Sate Kambing', icon: '🥩', cat: 'base' },
    aglio_olio: { name: 'Saus Aglio Olio', icon: '🧄', cat: 'sauce' },
    carbonara: { name: 'Saus Carbonara', icon: '🥛', cat: 'sauce' },
    bolognese: { name: 'Saus Bolognese', icon: '🍅', cat: 'sauce' },
    bumbu_kacang: { name: 'Bumbu Kacang', icon: '🥜', cat: 'sauce' },
    kecap_pedas: { name: 'Kecap Pedas', icon: '🌶️', cat: 'sauce' },
    keju: { name: 'Keju Parmesan', icon: '🧀', cat: 'topping' },
    jamur: { name: 'Jamur Truffle', icon: '🍄', cat: 'topping' },
    bawang_goreng: { name: 'Bawang Goreng', icon: '🧅', cat: 'topping' },
    irisan_cabe: { name: 'Irisan Cabe & Bawang', icon: '🥗', cat: 'topping' },
    lontong: { name: 'Lontong', icon: '🍚', cat: 'topping' }
  };

  // State
  let cookoffScore = 0;
  let cookoffCombo = 0;
  let cookoffDishesServed = 0;
  let cookoffTimeLeft = 90;
  let cookoffTimerInterval = null;
  let cookoffPatienceInterval = null;
  let cookoffCurrentOrder = null;
  let cookoffOrderPatience = 5;
  let cookoffPlateState = { base: null, sauce: null, topping: null };
  let cookoffLastCustomer = null;

  // DOM Elements
  const cookoffRecipeScreen = document.getElementById('cookoff-recipe-screen');
  const cookoffPlayScreen = document.getElementById('cookoff-play-screen');
  const cookoffPeekModal = document.getElementById('cookoff-peek-modal');
  const cookoffResultModal = document.getElementById('cookoff-result-modal');
  const cookoffRecipeCardsList = document.getElementById('cookoff-recipe-cards-list');
  const cookoffPeekCardsList = document.getElementById('cookoff-peek-cards');
  const cookoffHighscoreDisplay = document.getElementById('cookoff-highscore-display');
  const cookoffRatingDisplay = document.getElementById('cookoff-rating-display');
  const cookoffStartBtn = document.getElementById('cookoff-start-btn');
  const cookoffSecretResetBtn = document.getElementById('cookoff-secret-reset-btn');
  const cookoffTimerText = document.getElementById('cookoff-timer-text');
  const cookoffCurrentScore = document.getElementById('cookoff-current-score');
  const cookoffComboTag = document.getElementById('cookoff-combo-tag');
  const cookoffComboTagText = document.getElementById('cookoff-combo-tag-text');
  const cookoffPeekBtn = document.getElementById('cookoff-peek-btn');
  const cookoffPeekCloseBtn = document.getElementById('cookoff-peek-close-btn');
  const cookoffPeekBackdrop = document.getElementById('cookoff-peek-backdrop');
  const cookoffQuitBtn = document.getElementById('cookoff-quit-btn');
  const cookoffCustomerHalo = document.getElementById('cookoff-customer-halo');
  const cookoffCustomerImg = document.getElementById('cookoff-customer-img');
  const cookoffCustomerName = document.getElementById('cookoff-customer-name');
  const cookoffCustomerHearts = document.getElementById('cookoff-customer-hearts');
  const cookoffOrderBubble = document.getElementById('cookoff-order-bubble');
  const cookoffOrderDishName = document.getElementById('cookoff-order-dish-name');
  const cookoffOrderQuote = document.getElementById('cookoff-order-quote');
  const cookoffOrderIngredientsHint = document.getElementById('cookoff-order-ingredients-hint');
  const cookoffServeBtn = document.getElementById('cookoff-serve-btn');
  const cookoffClearPlateBtn = document.getElementById('cookoff-clear-plate-btn');
  const cookoffToast = document.getElementById('cookoff-toast');
  const slotBase = document.getElementById('slot-base');
  const slotSauce = document.getElementById('slot-sauce');
  const slotTopping = document.getElementById('slot-topping');
  const cookoffFinalScore = document.getElementById('cookoff-final-score');
  const cookoffFinalDishes = document.getElementById('cookoff-final-dishes');
  const cookoffModalHighscore = document.getElementById('cookoff-modal-highscore');
  const cookoffResultStars = document.getElementById('cookoff-result-stars');
  const cookoffResultTitle = document.getElementById('cookoff-result-title');
  const cookoffResultVerdict = document.getElementById('cookoff-result-verdict');
  const cookoffRetryBtn = document.getElementById('cookoff-retry-btn');
  const cookoffBackToBookBtn = document.getElementById('cookoff-back-to-book-btn');

  // Render Recipe Cards in Recipe Book and Peek Modal
  function renderRecipeCards(container, filter = 'all') {
    if (!container) return;
    container.innerHTML = '';

    const filtered = COOKOFF_RECIPES.filter(r => {
      if (filter === 'all') return true;
      return r.target === filter;
    });

    filtered.forEach(recipe => {
      const card = document.createElement('div');
      card.className = `recipe-card-item for-${recipe.target}`;

      const baseMeta = INGREDIENTS_META[recipe.base];
      const sauceMeta = INGREDIENTS_META[recipe.sauce];
      const toppingMeta = INGREDIENTS_META[recipe.topping];

      card.innerHTML = `
        <div class="recipe-item-top">
          <span class="recipe-item-name">${recipe.name}</span>
          <span class="recipe-item-badge ${recipe.target}-badge">${recipe.target === 'rachel' ? '👸🏻 Rachel' : '🤴🏻 Elang'}</span>
        </div>
        <div class="recipe-ingredients-formula">
          <span class="formula-chip">${baseMeta.icon} ${baseMeta.name}</span>
          <span class="formula-plus">+</span>
          <span class="formula-chip">${sauceMeta.icon} ${sauceMeta.name}</span>
          <span class="formula-plus">+</span>
          <span class="formula-chip">${toppingMeta.icon} ${toppingMeta.name}</span>
        </div>
        <div class="recipe-item-note">${recipe.note}</div>
      `;

      container.appendChild(card);
    });
  }

  // Filter Pills inside Recipe Book
  const recipeFilterPills = document.querySelectorAll('.recipe-pill-btn');
  recipeFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      recipeFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter || 'all';
      renderRecipeCards(cookoffRecipeCardsList, filter);
    });
  });

  // Get & Set High Score
  function getCookoffHighScore() {
    try {
      const val = localStorage.getItem(COOKOFF_KEY_HIGHSCORE);
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  function setCookoffHighScore(score) {
    try {
      const cur = getCookoffHighScore();
      if (score > cur) {
        localStorage.setItem(COOKOFF_KEY_HIGHSCORE, score.toString());
        return true;
      }
    } catch (e) { }
    return false;
  }

  function updateCookoffHighScoresUI() {
    const high = getCookoffHighScore();
    if (cookoffHighscoreDisplay) cookoffHighscoreDisplay.textContent = high.toLocaleString('id-ID');

    let ratingStr = '⭐⭐⭐⭐⭐';
    if (high >= 1000) ratingStr = '⭐⭐⭐⭐⭐ (Bintang 5)';
    else if (high >= 700) ratingStr = '⭐⭐⭐⭐ (Bintang 4)';
    else if (high >= 400) ratingStr = '⭐⭐⭐ (Bintang 3)';
    else if (high > 0) ratingStr = '⭐⭐ (Bintang 2)';
    else ratingStr = '— Belum Ada Rekor —';

    if (cookoffRatingDisplay) cookoffRatingDisplay.textContent = ratingStr;
  }

  // Secret Reset Cookoff Scores
  function resetCookoffScores() {
    try {
      localStorage.setItem(COOKOFF_KEY_HIGHSCORE, '0');
    } catch (e) { }
    updateCookoffHighScoresUI();
    showCookoffToast("🔧 Rekor Memasak di-reset ke 0!", false);
    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    playBonusChime();
  }

  if (cookoffSecretResetBtn) {
    cookoffSecretResetBtn.addEventListener('click', resetCookoffScores);
  }

  // Global secret shortcut key '0' when in cookoff tab
  window.addEventListener('keydown', (e) => {
    if (e.key === '0' && document.activeElement && document.activeElement.tagName !== 'INPUT') {
      const isCookoffVisible = cookoffWrapper && cookoffWrapper.style.display !== 'none';
      if (isCookoffVisible) {
        resetCookoffScores();
      }
    }
  });

  // Start Date Night Cook-off Game
  function startCookoffGame() {
    if (cookoffRecipeScreen) cookoffRecipeScreen.style.display = 'none';
    if (cookoffResultModal) cookoffResultModal.style.display = 'none';
    if (cookoffPeekModal) cookoffPeekModal.style.display = 'none';
    if (cookoffPlayScreen) cookoffPlayScreen.style.display = 'block';

    cookoffScore = 0;
    cookoffCombo = 0;
    cookoffDishesServed = 0;
    cookoffTimeLeft = 90;
    clearPlate();

    if (cookoffCurrentScore) cookoffCurrentScore.textContent = '0';
    if (cookoffComboTag) cookoffComboTag.style.display = 'none';

    updateTimerDisplay();
    spawnNextOrder();

    // Start 1-second countdown clock
    if (cookoffTimerInterval) clearInterval(cookoffTimerInterval);
    cookoffTimerInterval = setInterval(() => {
      cookoffTimeLeft--;
      updateTimerDisplay();

      if (cookoffTimeLeft <= 0) {
        endCookoffGame();
      }
    }, 1000);

    playBonusChime();
  }

  function updateTimerDisplay() {
    if (!cookoffTimerText) return;
    const m = Math.floor(cookoffTimeLeft / 60);
    const s = cookoffTimeLeft % 60;
    cookoffTimerText.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    const timerBox = cookoffTimerText.closest('.cookoff-hud-timer-box');
    if (timerBox) {
      if (cookoffTimeLeft <= 20) {
        timerBox.classList.add('hurry');
      } else {
        timerBox.classList.remove('hurry');
      }
    }
  }

  // Spawn Next Customer Order
  function spawnNextOrder() {
    if (cookoffTimeLeft <= 0) return;

    // Pick customer opposite of last if possible, else random
    let nextTarget = 'rachel';
    if (cookoffLastCustomer === 'rachel') {
      nextTarget = Math.random() > 0.3 ? 'elang' : 'rachel';
    } else if (cookoffLastCustomer === 'elang') {
      nextTarget = Math.random() > 0.3 ? 'rachel' : 'elang';
    } else {
      nextTarget = Math.random() > 0.5 ? 'rachel' : 'elang';
    }
    cookoffLastCustomer = nextTarget;

    const targetRecipes = COOKOFF_RECIPES.filter(r => r.target === nextTarget);
    cookoffCurrentOrder = targetRecipes[Math.floor(Math.random() * targetRecipes.length)];
    cookoffOrderPatience = 5;

    // Update customer UI
    if (cookoffCustomerName) cookoffCustomerName.textContent = (nextTarget === 'rachel' ? 'Rachel' : 'Elang');
    if (cookoffCustomerImg) {
      cookoffCustomerImg.src = (nextTarget === 'rachel' ? rachelHeadImg.src : elangHeadImg.src);
    }
    if (cookoffCustomerHalo) {
      if (nextTarget === 'elang') {
        cookoffCustomerHalo.classList.add('halo-elang');
      } else {
        cookoffCustomerHalo.classList.remove('halo-elang');
      }
    }

    renderPatienceHearts();

    // Update Speech Bubble
    if (cookoffOrderDishName) cookoffOrderDishName.textContent = cookoffCurrentOrder.name;
    if (cookoffOrderQuote) cookoffOrderQuote.textContent = `"${cookoffCurrentOrder.quote}"`;

    // Ingredients hint preview
    if (cookoffOrderIngredientsHint) {
      const b = INGREDIENTS_META[cookoffCurrentOrder.base];
      const s = INGREDIENTS_META[cookoffCurrentOrder.sauce];
      const t = INGREDIENTS_META[cookoffCurrentOrder.topping];
      cookoffOrderIngredientsHint.innerHTML = `
        <span class="order-hint-tag">${b.icon} ${b.name}</span>
        <span class="order-hint-tag">${s.icon} ${s.name}</span>
        <span class="order-hint-tag">${t.icon} ${t.name}</span>
      `;
    }

    // Patience depletion loop (every 3.6s loses 1 heart)
    if (cookoffPatienceInterval) clearInterval(cookoffPatienceInterval);
    cookoffPatienceInterval = setInterval(() => {
      cookoffOrderPatience--;
      renderPatienceHearts();

      if (cookoffOrderPatience <= 0) {
        clearInterval(cookoffPatienceInterval);
        handleOrderTimeout();
      }
    }, 3600);
  }

  function renderPatienceHearts() {
    if (!cookoffCustomerHearts) return;
    const filled = Math.max(0, cookoffOrderPatience);
    const empty = 5 - filled;
    cookoffCustomerHearts.innerHTML = '💖'.repeat(filled) + '🤍'.repeat(empty);

    if (filled <= 2) {
      cookoffCustomerHearts.classList.add('shaking');
    } else {
      cookoffCustomerHearts.classList.remove('shaking');
    }
  }

  function handleOrderTimeout() {
    playBeep(200, 'sawtooth', 0.25, 0.08);
    cookoffCombo = 0;
    if (cookoffComboTag) cookoffComboTag.style.display = 'none';

    showCookoffToast("Yah keburu dingin makanannya... 🥺", true);
    if (cookoffOrderQuote) {
      cookoffOrderQuote.textContent = '"Yah, makanannya kelamaan nih sayang... 🥺"';
    }

    clearPlate();
    setTimeout(() => {
      spawnNextOrder();
    }, 1000);
  }

  // Ingredient Selection Handlers
  const pantryButtons = document.querySelectorAll('.cookoff-ing-btn');
  pantryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      const id = btn.dataset.id;
      if (!cat || !id) return;

      cookoffPlateState[cat] = id;
      updatePlateUI();
      playBeep(480, 'sine', 0.06, 0.04);
    });
  });

  function updatePlateUI() {
    // Update Slot Base
    if (slotBase) {
      if (cookoffPlateState.base) {
        const meta = INGREDIENTS_META[cookoffPlateState.base];
        slotBase.className = 'plate-slot filled';
        slotBase.innerHTML = `<span>${meta.icon} ${meta.name}</span>`;
      } else {
        slotBase.className = 'plate-slot empty';
        slotBase.innerHTML = '<span>Pilih Dasar</span>';
      }
    }

    // Update Slot Sauce
    if (slotSauce) {
      if (cookoffPlateState.sauce) {
        const meta = INGREDIENTS_META[cookoffPlateState.sauce];
        slotSauce.className = 'plate-slot filled';
        slotSauce.innerHTML = `<span>${meta.icon} ${meta.name}</span>`;
      } else {
        slotSauce.className = 'plate-slot empty';
        slotSauce.innerHTML = '<span>Pilih Saus</span>';
      }
    }

    // Update Slot Topping
    if (slotTopping) {
      if (cookoffPlateState.topping) {
        const meta = INGREDIENTS_META[cookoffPlateState.topping];
        slotTopping.className = 'plate-slot filled';
        slotTopping.innerHTML = `<span>${meta.icon} ${meta.name}</span>`;
      } else {
        slotTopping.className = 'plate-slot empty';
        slotTopping.innerHTML = '<span>Pilih Pelengkap</span>';
      }
    }

    // Highlight selected pantry buttons
    pantryButtons.forEach(b => {
      const id = b.dataset.id;
      const isSelected = (
        cookoffPlateState.base === id ||
        cookoffPlateState.sauce === id ||
        cookoffPlateState.topping === id
      );
      if (isSelected) {
        b.classList.add('selected-on-plate');
      } else {
        b.classList.remove('selected-on-plate');
      }
    });
  }

  function clearPlate() {
    cookoffPlateState = { base: null, sauce: null, topping: null };
    updatePlateUI();
  }

  if (cookoffClearPlateBtn) {
    cookoffClearPlateBtn.addEventListener('click', () => {
      clearPlate();
      playBeep(240, 'triangle', 0.08, 0.04);
    });
  }

  // Serve Dish Handler
  function serveDish() {
    if (!cookoffCurrentOrder) return;

    // Check if plate has all 3 slots filled
    if (!cookoffPlateState.base || !cookoffPlateState.sauce || !cookoffPlateState.topping) {
      showCookoffToast("Piring belum lengkap! Pilih 1 Dasar, 1 Saus, dan 1 Pelengkap ya!", true);
      playBeep(180, 'sawtooth', 0.15, 0.06);
      return;
    }

    const isMatch = (
      cookoffPlateState.base === cookoffCurrentOrder.base &&
      cookoffPlateState.sauce === cookoffCurrentOrder.sauce &&
      cookoffPlateState.topping === cookoffCurrentOrder.topping
    );

    if (isMatch) {
      // SUCCESS!
      clearInterval(cookoffPatienceInterval);
      cookoffCombo++;
      cookoffDishesServed++;

      const speedBonus = cookoffOrderPatience * 12;
      const comboMultiplier = 1 + (cookoffCombo - 1) * 0.3;
      const earnedPoints = Math.floor((100 + speedBonus) * comboMultiplier);
      cookoffScore += earnedPoints;

      if (cookoffCurrentScore) cookoffCurrentScore.textContent = cookoffScore.toLocaleString('id-ID');

      if (cookoffCombo > 1) {
        if (cookoffComboTag) {
          cookoffComboTag.style.display = 'block';
          if (cookoffComboTagText) cookoffComboTagText.textContent = `COMBO x${cookoffCombo}! 🔥`;
        }
        showCookoffToast(`+${earnedPoints} • COMBO x${cookoffCombo}! 🔥`, false);
      } else {
        showCookoffToast(`+${earnedPoints} LEZAT SEMPURNA! 💖`, false);
      }

      playSizzleSound();

      // Happy customer reaction
      if (cookoffOrderQuote) {
        if (cookoffCurrentOrder.target === 'rachel') {
          cookoffOrderQuote.textContent = '"Aaa enak banget sayang! Juara deh masakanmu! 🥰❤️"';
        } else {
          cookoffOrderQuote.textContent = '"Wah mantap betul! Energi fisikaku langsung 100%! Love you! 😋❤️"';
        }
      }

      if (cookoffCombo >= 3 && window.confetti) {
        window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      }

      clearPlate();
      setTimeout(() => {
        spawnNextOrder();
      }, 700);

    } else {
      // WRONG RECIPE
      playBeep(160, 'sawtooth', 0.25, 0.1);
      cookoffCombo = 0;
      if (cookoffComboTag) cookoffComboTag.style.display = 'none';

      // Drop 2 hearts
      cookoffOrderPatience = Math.max(1, cookoffOrderPatience - 2);
      renderPatienceHearts();

      // Funny ngambek dialogues
      if (cookoffOrderQuote) {
        if (cookoffCurrentOrder.target === 'rachel' && (cookoffPlateState.sauce === 'bumbu_kacang' || cookoffPlateState.base.includes('sate'))) {
          cookoffOrderQuote.textContent = '"Sayang... masa pastaku dikasih bumbu sate sih? 😂"';
        } else if (cookoffCurrentOrder.target === 'elang' && (cookoffPlateState.sauce === 'carbonara' || cookoffPlateState.topping === 'keju')) {
          cookoffOrderQuote.textContent = '"Hah? Sate Madura rasa keju? Kamu lagi ngelindur ya sayang? 🤣"';
        } else {
          cookoffOrderQuote.textContent = '"Resepnya kayaknya ada yang ketuker deh! Coba intip buku resep ya! 🥺"';
        }
      }

      showCookoffToast("Resep belum cocok! Coba racik lagi ya 🥺", true);
      clearPlate();
    }
  }

  function playSizzleSound() {
    playBeep(523.25, 'sine', 0.12, 0.08);
    setTimeout(() => playBeep(659.25, 'sine', 0.15, 0.08), 70);
    setTimeout(() => playBeep(783.99, 'triangle', 0.22, 0.1), 140);
  }

  if (cookoffServeBtn) {
    cookoffServeBtn.addEventListener('click', serveDish);
  }

  function showCookoffToast(msg, isWrong = false) {
    if (!cookoffToast) return;
    cookoffToast.textContent = msg;
    if (isWrong) {
      cookoffToast.classList.add('wrong');
    } else {
      cookoffToast.classList.remove('wrong');
    }
    cookoffToast.style.display = 'block';
    setTimeout(() => {
      cookoffToast.style.display = 'none';
    }, 850);
  }

  // End Date Night Cookoff Game
  function endCookoffGame() {
    if (cookoffTimerInterval) clearInterval(cookoffTimerInterval);
    if (cookoffPatienceInterval) clearInterval(cookoffPatienceInterval);

    playBonusChime();
    setCookoffHighScore(cookoffScore);
    const high = getCookoffHighScore();

    if (cookoffFinalScore) cookoffFinalScore.textContent = cookoffScore.toLocaleString('id-ID');
    if (cookoffFinalDishes) cookoffFinalDishes.textContent = `${cookoffDishesServed} Hidangan`;
    if (cookoffModalHighscore) cookoffModalHighscore.textContent = high.toLocaleString('id-ID');

    // Rating & Verdict
    let stars = '⭐⭐⭐⭐⭐';
    let title = 'Masterchef Cinta Sejati!';
    let verdict = 'Rachel dan Elang kenyang dan bahagia sekali! Kencan malam paling sempurna di semesta ini! ❤️';

    if (cookoffScore >= 1000) {
      stars = '⭐⭐⭐⭐⭐';
      title = 'Masterchef Cinta Sejati! 👑';
      verdict = 'Kalian berdua benar-benar pasangan kuliner legendaris! Setiap hidangan disajikan dengan cinta maksimal!';
    } else if (cookoffScore >= 700) {
      stars = '⭐⭐⭐⭐';
      title = 'Koki Kencan Romantis! 🍝🍢';
      verdict = 'Dapur kencan penuh tawa dan kelezatan! Rachel dan Elang puas banget sama masakanmu!';
    } else if (cookoffScore >= 400) {
      stars = '⭐⭐⭐';
      title = 'Koki Pemula Penuh Cinta! 💕';
      verdict = 'Sedikit terburu-buru, tapi rasa cintanya tetap terasa hangat di setiap suapan!';
    } else {
      stars = '⭐⭐';
      title = 'Yang Penting Makannya Bareng! 🥰';
      verdict = 'Bumbu boleh salah sedikit, yang penting kencannya tetap romantis dan penuh tawa!';
    }

    if (cookoffResultStars) cookoffResultStars.textContent = stars;
    if (cookoffResultTitle) cookoffResultTitle.textContent = title;
    if (cookoffResultVerdict) cookoffResultVerdict.textContent = verdict;

    if (window.confetti) {
      window.confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
    }

    if (cookoffResultModal) {
      cookoffResultModal.style.display = 'flex';
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // Peek Recipe Modal Handlers
  if (cookoffPeekBtn) {
    cookoffPeekBtn.addEventListener('click', () => {
      renderRecipeCards(cookoffPeekCardsList, 'all');
      if (cookoffPeekModal) cookoffPeekModal.style.display = 'flex';
    });
  }

  if (cookoffPeekCloseBtn) {
    cookoffPeekCloseBtn.addEventListener('click', () => {
      if (cookoffPeekModal) cookoffPeekModal.style.display = 'none';
    });
  }

  if (cookoffPeekBackdrop) {
    cookoffPeekBackdrop.addEventListener('click', () => {
      if (cookoffPeekModal) cookoffPeekModal.style.display = 'none';
    });
  }

  // Quit & Retry Handlers
  if (cookoffQuitBtn) {
    cookoffQuitBtn.addEventListener('click', () => {
      if (cookoffTimerInterval) clearInterval(cookoffTimerInterval);
      if (cookoffPatienceInterval) clearInterval(cookoffPatienceInterval);
      cookoffPlayScreen.style.display = 'none';
      cookoffResultModal.style.display = 'none';
      cookoffPeekModal.style.display = 'none';
      cookoffRecipeScreen.style.display = 'block';
      updateCookoffHighScoresUI();
      if (window.lucide) window.lucide.createIcons();
    });
  }

  if (cookoffRetryBtn) {
    cookoffRetryBtn.addEventListener('click', () => {
      cookoffResultModal.style.display = 'none';
      startCookoffGame();
    });
  }

  if (cookoffBackToBookBtn) {
    cookoffBackToBookBtn.addEventListener('click', () => {
      cookoffResultModal.style.display = 'none';
      cookoffPlayScreen.style.display = 'none';
      cookoffRecipeScreen.style.display = 'block';
      updateCookoffHighScoresUI();
      if (window.lucide) window.lucide.createIcons();
    });
  }

  if (cookoffStartBtn) {
    cookoffStartBtn.addEventListener('click', startCookoffGame);
  }

  // Initial render of Recipe Book and High Score
  renderRecipeCards(cookoffRecipeCardsList, 'all');
  updateCookoffHighScoresUI();

  // ==================== 8.8 COSMIC BEATS: PIANO TILES RHYTHM MINI GAME ====================
  // Storage key prefix: rhythm_rec_{songId}_{mode}_{player}
  // Mode: 'full' or 'endless' | Player: 'rachel' or 'elang'

  // 10 Curated Songs with Metadata, Difficulty, and Multiple Filename Options
  const RHYTHM_SONGS = [
    {
      id: 'lany_ilysb',
      title: 'ILYSB (I Love You So Bad)',
      artist: 'LANY',
      tag: 'LANY Favorite',
      category: 'lany',
      file: 'lany-ilysb.mp3',
      altFile: 'ILYSB.mp3',
      bpm: 100,
      offset: 1.2,
      duration: 209,
      difficulty: 'Normal',
      stars: 2,
      icon: '🎵',
      desc: 'Lagu cinta ikonik LANY favorit Rachel dengan alunan synthpop manis.'
    },
    {
      id: 'lany_malibu',
      title: 'Malibu Nights',
      artist: 'LANY',
      tag: 'LANY Classic',
      category: 'lany',
      file: 'lany-malibu-nights.mp3',
      altFile: 'Malibu Nights.mp3',
      bpm: 74,
      offset: 0.9,
      duration: 281,
      difficulty: 'Normal',
      stars: 2,
      icon: '🎹',
      desc: 'Melodi piano syahdu yang menemani malam-malam tenang kalian berdua.'
    },
    {
      id: 'lany_dna',
      title: 'dna',
      artist: 'LANY',
      tag: 'Biologist x LANY',
      category: 'lany',
      file: 'lany-dna.mp3',
      altFile: 'dna.mp3',
      bpm: 100,
      offset: 1.4,
      duration: 176,
      difficulty: 'Normal',
      stars: 3,
      icon: '🧬',
      desc: '"It\'s in our DNA" — sangat pas untuk sang peneliti biologi tersayang.'
    },
    {
      id: 'exo_love_shot',
      title: 'Love Shot',
      artist: 'EXO',
      tag: 'EXO Cosmic',
      category: 'exo',
      file: 'exo-love-shot.mp3',
      altFile: 'Love Shot.mp3',
      bpm: 146,
      offset: 0.8,
      duration: 205,
      difficulty: 'Hard',
      stars: 3,
      icon: '🪐',
      desc: 'Beat bass adiktif dari galaksi EXO yang membakar semangat!'
    },
    {
      id: 'exo_universe',
      title: 'Universe',
      artist: 'EXO',
      tag: 'Two Universes',
      category: 'exo',
      file: 'exo-universe.mp3',
      altFile: 'Universe.mp3',
      bpm: 70,
      offset: 1.6,
      duration: 263,
      difficulty: 'Easy',
      stars: 1,
      icon: '🌌',
      desc: '"I\'ll search the universe" — lirik penuh makna menyatukan dua semesta.'
    },
    {
      id: 'exo_monster',
      title: 'Monster',
      artist: 'EXO',
      tag: 'EXO Energetic',
      category: 'exo',
      file: 'exo-monster.mp3',
      altFile: 'Monster.mp3',
      bpm: 150,
      offset: 0.6,
      duration: 221,
      difficulty: 'Expert',
      stars: 4,
      icon: '⚡',
      desc: 'Tempo cepat dan ketukan intensif untuk menguji kelincahan jari!'
    },
    {
      id: 'exo_mama',
      title: 'MAMA',
      artist: 'EXO',
      tag: 'EXO Epic Debut',
      category: 'exo',
      file: 'exo-mama.mp3',
      altFile: 'Mama.mp3',
      bpm: 90,
      offset: 3.8,
      duration: 273,
      difficulty: 'Hard',
      stars: 3,
      icon: '🪐',
      desc: 'Lagu debut legendaris EXO dengan paduan choir orkestra megah dan beat bertenaga!'
    },
    {
      id: 'batas_senja_nanti_kita_seperti_ini',
      title: 'Nanti Kita Seperti Ini',
      artist: 'Batas Senja',
      tag: 'Future With You',
      category: 'pop',
      file: 'batas-senja-nanti-kita-seperti-ini.mp3',
      altFile: 'Nanti Kita Seperti Ini.mp3',
      bpm: 85,
      offset: 2.0,
      duration: 210,
      difficulty: 'Easy',
      stars: 2,
      icon: '🏡',
      desc: '"Ingin punya rumah tuk tempat pulang..." — doa dan mimpi indah menua bersama Rachel.'
    },
    {
      id: 'exo_growl',
      title: 'Growl',
      artist: 'EXO',
      tag: 'EXO Masterpiece',
      category: 'exo',
      file: 'exo-growl.mp3',
      altFile: 'Growl.mp3',
      bpm: 90,
      offset: 1.2,
      duration: 207,
      difficulty: 'Hard',
      stars: 4,
      icon: '🐺',
      desc: 'Karya mahakarya EXO yang tak lekang oleh waktu, dengan ritme dance groove yang adiktif!'
    },
    {
      id: 'sal_priadi_nanti_kita_usahakan_rumah_itu',
      title: 'Nanti Kita Usahakan Rumah Itu',
      artist: 'Sal Priadi',
      tag: 'Rumah Impian Kita',
      category: 'pop',
      file: 'sal-priadi-nanti-kita-usahakan-rumah-itu.mp3',
      altFile: 'Nanti Kita Usahakan Rumah Itu.mp3',
      bpm: 95,
      offset: 2.2,
      duration: 211,
      difficulty: 'Easy',
      stars: 2,
      icon: '🏡',
      desc: '"Nanti kita usahakan rumah itu..." — janji hangat dan impian masa depan berdua bersama Rachel.'
    }
  ];

  // Rhythm Game State
  let rhythmPlayer = 'rachel'; // 'rachel' or 'elang'
  let rhythmMode = 'full'; // 'full' (Mode Lagu Penuh) or 'endless' (Mode Tanpa Batas)
  let rhythmSelectedSongId = 'lany_ilysb';
  let activeFilterCategory = 'all';
  let rhythmScore = 0;
  let rhythmCombo = 0;
  let rhythmMaxCombo = 0;
  let rhythmCountPerfect = 0;
  let rhythmCountGreat = 0;
  let rhythmCountGood = 0;
  let rhythmCountMiss = 0;
  let rhythmTotalNotes = 0;
  let rhythmEndlessLives = 3;
  let rhythmEndlessSpeed = 1.0;
  let rhythmEndlessLoopCount = 0;
  let rhythmEndlessLastAudioTime = 0;
  let rhythmGameActive = false;
  let rhythmAnimFrameId = null;
  let rhythmChartNotes = []; // Scheduled time-synchronized notes
  let rhythmAudioCtxStartTime = 0;
  let rhythmAudioBaseTime = 0;
  const RHYTHM_LATENCY_COMPENSATION = 0.040; // 40ms default hardware buffer latency
  let rhythmParticles = [];
  let rhythmAudio = null;
  let rhythmIsUsingRealAudio = false;
  let rhythmSynthInterval = null;
  let rhythmSynthAudioCtx = null;
  let rhythmSongStartTime = 0;
  let rhythmSongElapsed = 0;
  let rhythmSpawnTimer = 0;
  let rhythmPatternIndex = 0;

  // DOM Elements
  const rhythmSelectScreen = document.getElementById('rhythm-select-screen');
  const rhythmPlayScreen = document.getElementById('rhythm-play-screen');
  const rhythmResultModal = document.getElementById('rhythm-result-modal');
  const vsCurrentSongBadge = document.getElementById('vs-current-song-badge');
  const vsCurrentModeBadge = document.getElementById('vs-current-mode-badge');
  const rhythmLeadStatus = document.getElementById('rhythm-lead-status');
  const rhythmCrownRachel = document.getElementById('rhythm-crown-rachel');
  const rhythmCrownElang = document.getElementById('rhythm-crown-elang');
  const rhythmHighscoreRachelEl = document.getElementById('rhythm-highscore-rachel');
  const rhythmHighscoreElangEl = document.getElementById('rhythm-highscore-elang');
  const rhythmSecretResetBtn = document.getElementById('rhythm-secret-reset-btn');
  const rhythmChooseRachel = document.getElementById('rhythm-choose-rachel');
  const rhythmChooseElang = document.getElementById('rhythm-choose-elang');
  const modeFullSong = document.getElementById('mode-full-song');
  const modeEndless = document.getElementById('mode-endless');
  const rhythmSongCount = document.getElementById('rhythm-song-count');
  const rhythmSearchInput = document.getElementById('rhythm-search-input');
  const rhythmClearSearchBtn = document.getElementById('rhythm-clear-search-btn');
  const rhythmFilterPills = document.querySelectorAll('.rhythm-pill-btn');
  const rhythmSongsGrid = document.getElementById('rhythm-songs-grid');
  const rhythmStartBtn = document.getElementById('rhythm-start-btn');

  // Play Screen HUD Elements
  const rhythmHudPlayerHalo = document.getElementById('rhythm-hud-player-halo');
  const rhythmHudPlayerImg = document.getElementById('rhythm-hud-player-img');
  const rhythmHudPlayerName = document.getElementById('rhythm-hud-player-name');
  const rhythmHudModeBadge = document.getElementById('rhythm-hud-mode-badge');
  const rhythmHudSongTitle = document.getElementById('rhythm-hud-song-title');
  const rhythmCurrentScoreEl = document.getElementById('rhythm-current-score');
  const rhythmTargetRecordEl = document.getElementById('rhythm-target-record');
  const rhythmFullProgressWrap = document.getElementById('rhythm-full-progress-wrap');
  const rhythmProgressFill = document.getElementById('rhythm-progress-fill');
  const rhythmProgressText = document.getElementById('rhythm-progress-text');
  const rhythmEndlessLivesWrap = document.getElementById('rhythm-endless-lives-wrap');
  const rhythmHeartsEl = document.getElementById('rhythm-hearts');
  const rhythmSpeedTagEl = document.getElementById('rhythm-speed-tag');
  const rhythmQuitBtn = document.getElementById('rhythm-quit-btn');
  const rhythmComboBanner = document.getElementById('rhythm-combo-banner');
  const rhythmComboCountEl = document.getElementById('rhythm-combo-count');
  const rhythmJudgmentPop = document.getElementById('rhythm-judgment-pop');
  const rhythmCanvas = document.getElementById('rhythm-canvas');
  const rhythmCtx = rhythmCanvas ? rhythmCanvas.getContext('2d') : null;
  const rhythmLaneBtns = [
    document.getElementById('rhythm-btn-0'),
    document.getElementById('rhythm-btn-1'),
    document.getElementById('rhythm-btn-2'),
    document.getElementById('rhythm-btn-3')
  ];
  const rhythmToast = document.getElementById('rhythm-toast');

  // Result Modal Elements
  const rhythmResultStars = document.getElementById('rhythm-result-stars');
  const rhythmResultTitle = document.getElementById('rhythm-result-title');
  const rhythmResultVerdict = document.getElementById('rhythm-result-verdict');
  const rhythmFinalScore = document.getElementById('rhythm-final-score');
  const rhythmNewRecordBadge = document.getElementById('rhythm-new-record-badge');
  const rhythmFinalCombo = document.getElementById('rhythm-final-combo');
  const rhythmFinalAccuracy = document.getElementById('rhythm-final-accuracy');
  const rhythmModalHighscore = document.getElementById('rhythm-modal-highscore');
  const rhythmCountPerfectEl = document.getElementById('rhythm-count-perfect');
  const rhythmCountGreatEl = document.getElementById('rhythm-count-great');
  const rhythmCountGoodEl = document.getElementById('rhythm-count-good');
  const rhythmCountMissEl = document.getElementById('rhythm-count-miss');
  const rhythmRetryBtn = document.getElementById('rhythm-retry-btn');
  const rhythmBackToMenuBtn = document.getElementById('rhythm-back-to-menu-btn');

  // Per-Song & Per-Mode High Score Storage Functions
  function getRhythmSongHighScore(songId, mode, player) {
    try {
      const key = `rhythm_rec_${songId}_${mode}_${player}`;
      const val = parseInt(localStorage.getItem(key), 10);
      return isNaN(val) ? 0 : val;
    } catch (e) {
      return 0;
    }
  }

  function setRhythmSongHighScore(songId, mode, player, score) {
    try {
      const current = getRhythmSongHighScore(songId, mode, player);
      if (score > current) {
        const key = `rhythm_rec_${songId}_${mode}_${player}`;
        localStorage.setItem(key, score.toString());
        return true;
      }
    } catch (e) { }
    return false;
  }

  function updateRhythmHighScoresUI() {
    const curSong = RHYTHM_SONGS.find(s => s.id === rhythmSelectedSongId) || RHYTHM_SONGS[0];

    // Update Versus Header Badge (Active Song & Mode)
    if (vsCurrentSongBadge) {
      vsCurrentSongBadge.textContent = `${curSong.icon} ${curSong.title}`;
    }
    if (vsCurrentModeBadge) {
      vsCurrentModeBadge.textContent = (rhythmMode === 'full' ? 'Mode Lagu Penuh 🎵' : 'Mode Tanpa Batas ♾️');
    }

    // Read per-song & per-mode high scores
    const rachelScore = getRhythmSongHighScore(curSong.id, rhythmMode, 'rachel');
    const elangScore = getRhythmSongHighScore(curSong.id, rhythmMode, 'elang');

    if (rhythmHighscoreRachelEl) rhythmHighscoreRachelEl.textContent = rachelScore.toLocaleString('id-ID');
    if (rhythmHighscoreElangEl) rhythmHighscoreElangEl.textContent = elangScore.toLocaleString('id-ID');

    // Crown & Lead Status
    if (rachelScore > elangScore && rachelScore > 0) {
      if (rhythmCrownRachel) rhythmCrownRachel.style.display = 'block';
      if (rhythmCrownElang) rhythmCrownElang.style.display = 'none';
      if (rhythmLeadStatus) {
        rhythmLeadStatus.innerHTML = `<span>👑 Rachel Memimpin! (+${(rachelScore - elangScore).toLocaleString('id-ID')})</span>`;
      }
    } else if (elangScore > rachelScore && elangScore > 0) {
      if (rhythmCrownRachel) rhythmCrownRachel.style.display = 'none';
      if (rhythmCrownElang) rhythmCrownElang.style.display = 'block';
      if (rhythmLeadStatus) {
        rhythmLeadStatus.innerHTML = `<span>👑 Elang Memimpin! (+${(elangScore - rachelScore).toLocaleString('id-ID')})</span>`;
      }
    } else {
      if (rhythmCrownRachel) rhythmCrownRachel.style.display = 'none';
      if (rhythmCrownElang) rhythmCrownElang.style.display = 'none';
      if (rhythmLeadStatus) {
        rhythmLeadStatus.innerHTML = (rachelScore === 0 && elangScore === 0)
          ? `<span>⏳ Belum Ada Rekor</span>`
          : `<span>🤝 Skor Seimbang!</span>`;
      }
    }

    // Update HUD target record if game is running
    if (rhythmTargetRecordEl) {
      rhythmTargetRecordEl.textContent = getRhythmSongHighScore(curSong.id, rhythmMode, rhythmPlayer).toLocaleString('id-ID');
    }
  }

  // Character Picker Radio Handlers (Fix 1: checkmark reliably moves)
  function updateRhythmCharPickerUI() {
    if (!rhythmChooseRachel || !rhythmChooseElang) return;
    const rachelRadio = rhythmChooseRachel.querySelector('.char-radio-icon');
    const elangRadio = rhythmChooseElang.querySelector('.char-radio-icon');

    if (rhythmPlayer === 'rachel') {
      rhythmChooseRachel.classList.add('active');
      rhythmChooseElang.classList.remove('active');
      if (rachelRadio) rachelRadio.innerHTML = '<i data-lucide="check-circle-2"></i>';
      if (elangRadio) elangRadio.innerHTML = '<i data-lucide="circle"></i>';
    } else {
      rhythmChooseRachel.classList.remove('active');
      rhythmChooseElang.classList.add('active');
      if (rachelRadio) rachelRadio.innerHTML = '<i data-lucide="circle"></i>';
      if (elangRadio) elangRadio.innerHTML = '<i data-lucide="check-circle-2"></i>';
    }
    if (window.lucide) window.lucide.createIcons();
    updateRhythmHighScoresUI();
  }

  if (rhythmChooseRachel) {
    rhythmChooseRachel.addEventListener('click', () => {
      rhythmPlayer = 'rachel';
      updateRhythmCharPickerUI();
      playPianoTileSound(0);
    });
  }

  if (rhythmChooseElang) {
    rhythmChooseElang.addEventListener('click', () => {
      rhythmPlayer = 'elang';
      updateRhythmCharPickerUI();
      playPianoTileSound(3);
    });
  }

  // Mode Picker Radio Handlers (Fix 1: checkmark moves & Fix 2 & 3: updates scoreboard and records)
  function updateRhythmModePickerUI() {
    if (!modeFullSong || !modeEndless) return;
    const fullRadio = modeFullSong.querySelector('.mode-radio-icon');
    const endlessRadio = modeEndless.querySelector('.mode-radio-icon');

    if (rhythmMode === 'full') {
      modeFullSong.classList.add('active');
      modeEndless.classList.remove('active');
      if (fullRadio) fullRadio.innerHTML = '<i data-lucide="check-circle-2"></i>';
      if (endlessRadio) endlessRadio.innerHTML = '<i data-lucide="circle"></i>';
    } else {
      modeFullSong.classList.remove('active');
      modeEndless.classList.add('active');
      if (fullRadio) fullRadio.innerHTML = '<i data-lucide="circle"></i>';
      if (endlessRadio) endlessRadio.innerHTML = '<i data-lucide="check-circle-2"></i>';
    }
    if (window.lucide) window.lucide.createIcons();

    // Re-render song cards so their mini-record tags update to the active mode!
    const searchVal = rhythmSearchInput ? rhythmSearchInput.value : '';
    renderRhythmSongList(searchVal, activeFilterCategory);
    updateRhythmHighScoresUI();
  }

  if (modeFullSong) {
    modeFullSong.addEventListener('click', () => {
      rhythmMode = 'full';
      updateRhythmModePickerUI();
      playPianoTileSound(1);
    });
  }

  if (modeEndless) {
    modeEndless.addEventListener('click', () => {
      rhythmMode = 'endless';
      updateRhythmModePickerUI();
      playPianoTileSound(2);
    });
  }

  // Secret reset scores function (Per-Song & Per-Mode)
  function resetRhythmScores() {
    const curSong = RHYTHM_SONGS.find(s => s.id === rhythmSelectedSongId) || RHYTHM_SONGS[0];
    try {
      localStorage.setItem(`rhythm_rec_${curSong.id}_${rhythmMode}_rachel`, '0');
      localStorage.setItem(`rhythm_rec_${curSong.id}_${rhythmMode}_elang`, '0');
    } catch (e) { }

    const searchVal = rhythmSearchInput ? rhythmSearchInput.value : '';
    renderRhythmSongList(searchVal, activeFilterCategory);
    updateRhythmHighScoresUI();

    showRhythmToast(`🔧 Rekor "${curSong.title}" (${rhythmMode === 'full' ? 'Lagu Penuh' : 'Endless'}) di-reset ke 0!`);
    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    playBonusChime();
  }

  if (rhythmSecretResetBtn) {
    rhythmSecretResetBtn.addEventListener('click', resetRhythmScores);
  }

  // Global secret shortcut key '0' when in rhythm tab
  window.addEventListener('keydown', (e) => {
    if (e.key === '0' && document.activeElement && document.activeElement.tagName !== 'INPUT') {
      const isRhythmVisible = rhythmWrapper && rhythmWrapper.style.display !== 'none';
      if (isRhythmVisible) {
        resetRhythmScores();
      }
    }
  });

  // Song Selection with Moving Checkmark (Fix 1) & Updating Versus Board (Fix 4)
  function selectRhythmSong(songId) {
    rhythmSelectedSongId = songId;
    document.querySelectorAll('.rhythm-song-card').forEach(c => {
      const isSelected = (c.dataset.songId === songId);
      const radio = c.querySelector('.song-radio-select');
      if (isSelected) {
        c.classList.add('selected');
        if (radio) radio.innerHTML = '<i data-lucide="check-circle-2"></i>';
      } else {
        c.classList.remove('selected');
        if (radio) radio.innerHTML = '<i data-lucide="circle"></i>';
      }
    });
    if (window.lucide) window.lucide.createIcons();
    updateRhythmHighScoresUI();
    playPianoTileSound(2);
  }

  // Render Song Cards Grid with Live Search & Mini Records
  function renderRhythmSongList(searchQuery = '', filterCategory = 'all') {
    if (!rhythmSongsGrid) return;
    rhythmSongsGrid.innerHTML = '';

    const query = searchQuery.trim().toLowerCase();

    const filtered = RHYTHM_SONGS.filter(song => {
      const matchesCategory = (filterCategory === 'all' || song.category === filterCategory);
      if (!matchesCategory) return false;

      if (!query) return true;
      const haystack = `${song.title} ${song.artist} ${song.tag} ${song.category} ${song.desc}`.toLowerCase();
      return haystack.includes(query);
    });

    if (rhythmSongCount) {
      rhythmSongCount.textContent = filtered.length;
    }

    if (filtered.length === 0) {
      rhythmSongsGrid.innerHTML = `
        <div class="no-songs-found">
          <p>🔍 Tidak ada lagu yang cocok dengan pencarian "<strong>${escapeHtml(searchQuery)}</strong>".</p>
        </div>
      `;
      return;
    }

    filtered.forEach(song => {
      const card = document.createElement('div');
      const isSelected = (song.id === rhythmSelectedSongId);
      card.className = `rhythm-song-card ${isSelected ? 'selected' : ''}`;
      card.dataset.songId = song.id;

      // Show high score for this song in the current mode
      const rachelSongHigh = getRhythmSongHighScore(song.id, rhythmMode, 'rachel');
      const elangSongHigh = getRhythmSongHighScore(song.id, rhythmMode, 'elang');

      card.innerHTML = `
        <div class="song-icon-badge">${song.icon}</div>
        <div class="song-card-info">
          <span class="song-meta-pill">${song.tag}</span>
          <div class="song-card-title">${song.title}</div>
          <div class="song-card-artist">${song.artist}</div>
          <div class="song-card-stats">
            <span class="song-stat-item diff-stars">${'★'.repeat(song.stars)}${'☆'.repeat(4 - song.stars)}</span>
            <span class="song-stat-item">• ${song.bpm} BPM</span>
            <span class="song-stat-item">• ${formatMinutes(song.duration)}</span>
          </div>
          <div class="song-card-records">
            <span class="record-mini-tag rachel-rec">👸🏻 ${rachelSongHigh.toLocaleString('id-ID')}</span>
            <span class="record-mini-tag elang-rec">🤴🏻 ${elangSongHigh.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div class="song-radio-select">
          <i data-lucide="${isSelected ? 'check-circle-2' : 'circle'}"></i>
        </div>
      `;

      card.addEventListener('click', () => {
        selectRhythmSong(song.id);
      });

      rhythmSongsGrid.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatMinutes(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Live Search Input Handler
  activeFilterCategory = 'all';

  if (rhythmSearchInput) {
    rhythmSearchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (rhythmClearSearchBtn) {
        rhythmClearSearchBtn.style.display = val ? 'flex' : 'none';
      }
      renderRhythmSongList(val, activeFilterCategory);
    });
  }

  if (rhythmClearSearchBtn) {
    rhythmClearSearchBtn.addEventListener('click', () => {
      if (rhythmSearchInput) {
        rhythmSearchInput.value = '';
        rhythmSearchInput.focus();
      }
      rhythmClearSearchBtn.style.display = 'none';
      renderRhythmSongList('', activeFilterCategory);
    });
  }

  // Category Filter Pills Handlers
  rhythmFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      rhythmFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilterCategory = pill.dataset.filter || 'all';
      const searchVal = rhythmSearchInput ? rhythmSearchInput.value : '';
      renderRhythmSongList(searchVal, activeFilterCategory);
    });
  });

  // Toast Helper
  function showRhythmToast(msg) {
    if (!rhythmToast) return;
    rhythmToast.textContent = msg;
    rhythmToast.style.display = 'block';
    setTimeout(() => {
      rhythmToast.style.display = 'none';
    }, 1400);
  }

  // Web Audio Synth & Piano Tile Sound Generator
  function getRhythmAudioContext() {
    try {
      if (!rhythmSynthAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) rhythmSynthAudioCtx = new AudioCtx();
      }
      if (rhythmSynthAudioCtx && rhythmSynthAudioCtx.state === 'suspended') {
        rhythmSynthAudioCtx.resume().catch(() => { });
      }
      return rhythmSynthAudioCtx;
    } catch (e) {
      return null;
    }
  }

  // Harmonic Pentatonic Scale for the 4 Lanes (Zero Disharmony!)
  const LANE_PENTATONIC_FREQS = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

  function playPianoTileSound(laneIndex, pitchShift = 0) {
    // FULLY SILENT when real MP3 is playing — pure music experience, zero key-press audio
    if (rhythmIsUsingRealAudio) return;
    try {
      const ctx = getRhythmAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Lobby preview or Synth Fallback Mode (only when real MP3 audio is not active)
      const baseFreq = LANE_PENTATONIC_FREQS[laneIndex] || 329.63;
      const freq = baseFreq * Math.pow(2, pitchShift / 12);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Warm piano-like timbre for lobby
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) { }
  }

  function playMissSound() {
    // Silent during real MP3 music playback to preserve pure audio listening
    if (rhythmIsUsingRealAudio) return;
    try {
      const ctx = getRhythmAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) { }
  }

  // Fallback Background Chords when MP3 is not yet added to assets/audio/songs/
  function startBackgroundSynthChords(bpm) {
    stopBackgroundSynthChords();
    const intervalMs = (60 / bpm) * 1000;
    const chords = [
      [261.63, 329.63, 392.00], // C
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66]  // G
    ];
    let chordIdx = 0;

    rhythmSynthInterval = setInterval(() => {
      if (!rhythmGameActive) return;
      try {
        const ctx = getRhythmAudioContext();
        if (!ctx) return;
        const currentChord = chords[chordIdx % chords.length];
        chordIdx++;

        currentChord.forEach(f => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          gain.gain.setValueAtTime(0.02, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (intervalMs / 1000) * 1.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + (intervalMs / 1000) * 1.5);
        });
      } catch (e) { }
    }, intervalMs);
  }

  function stopBackgroundSynthChords() {
    if (rhythmSynthInterval) {
      clearInterval(rhythmSynthInterval);
      rhythmSynthInterval = null;
    }
  }

  // Canvas Geometry & Resize
  function resizeRhythmCanvas() {
    if (!rhythmCanvas) return;
    const container = rhythmCanvas.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      const w = Math.min(440, Math.max(300, rect.width || 440));
      rhythmCanvas.width = w;
      rhythmCanvas.height = 520;
    }
  }

  window.addEventListener('resize', () => {
    if (rhythmGameActive) resizeRhythmCanvas();
  });

  // START RHYTHM GAME
  function startRhythmGame() {
    const selectedSong = RHYTHM_SONGS.find(s => s.id === rhythmSelectedSongId) || RHYTHM_SONGS[0];

    // Switch UI Screens
    if (rhythmSelectScreen) rhythmSelectScreen.style.display = 'none';
    if (rhythmResultModal) rhythmResultModal.style.display = 'none';
    if (rhythmPlayScreen) rhythmPlayScreen.style.display = 'block';

    resizeRhythmCanvas();

    // Reset Game Stats
    rhythmScore = 0;
    rhythmCombo = 0;
    rhythmMaxCombo = 0;
    rhythmCountPerfect = 0;
    rhythmCountGreat = 0;
    rhythmCountGood = 0;
    rhythmCountMiss = 0;
    rhythmTotalNotes = 0;
    rhythmEndlessLives = 3;
    rhythmEndlessSpeed = 1.0;
    rhythmGameActive = true;
    rhythmChartNotes = [];
    rhythmParticles = [];
    rhythmSongStartTime = Date.now();
    rhythmSongElapsed = 0;
    rhythmEndlessLoopCount = 0;
    rhythmEndlessLastAudioTime = 0;
    rhythmAudioCtxStartTime = 0;
    rhythmAudioBaseTime = 0;
    const initialDur = selectedSong.actualDuration || selectedSong.duration;
    generateSongBeatChart(selectedSong, initialDur);

    // Update HUD
    if (rhythmHudPlayerName) {
      rhythmHudPlayerName.textContent = (rhythmPlayer === 'rachel' ? 'Rachel' : 'Elang');
    }
    if (rhythmHudPlayerImg) {
      rhythmHudPlayerImg.src = (rhythmPlayer === 'rachel' ? rachelHeadImg.src : elangHeadImg.src);
    }
    if (rhythmHudPlayerHalo) {
      if (rhythmPlayer === 'elang') {
        rhythmHudPlayerHalo.classList.add('halo-elang');
      } else {
        rhythmHudPlayerHalo.classList.remove('halo-elang');
      }
    }
    if (rhythmHudModeBadge) {
      rhythmHudModeBadge.textContent = (rhythmMode === 'full' ? 'Lagu Penuh 🎵' : 'Tanpa Batas ♾️');
    }
    if (rhythmHudSongTitle) {
      rhythmHudSongTitle.textContent = `${selectedSong.title} — ${selectedSong.artist}`;
    }
    if (rhythmCurrentScoreEl) rhythmCurrentScoreEl.textContent = '0';
    if (rhythmTargetRecordEl) {
      rhythmTargetRecordEl.textContent = getRhythmSongHighScore(selectedSong.id, rhythmMode, rhythmPlayer).toLocaleString('id-ID');
    }

    if (rhythmMode === 'full') {
      if (rhythmFullProgressWrap) rhythmFullProgressWrap.style.display = 'flex';
      if (rhythmEndlessLivesWrap) rhythmEndlessLivesWrap.style.display = 'none';
      if (rhythmProgressFill) rhythmProgressFill.style.width = '0%';
      if (rhythmProgressText) rhythmProgressText.textContent = `0:00 / ${formatMinutes(selectedSong.duration)}`;
    } else {
      if (rhythmFullProgressWrap) rhythmFullProgressWrap.style.display = 'none';
      if (rhythmEndlessLivesWrap) rhythmEndlessLivesWrap.style.display = 'flex';
      if (rhythmHeartsEl) rhythmHeartsEl.textContent = '❤️❤️❤️';
      if (rhythmSpeedTagEl) rhythmSpeedTagEl.textContent = 'Kecepatan: 1.0x';
    }

    if (rhythmComboBanner) rhythmComboBanner.style.display = 'none';
    if (rhythmJudgmentPop) rhythmJudgmentPop.style.display = 'none';

    // Start Audio (with auto fallback)
    startAudioForSong(selectedSong);

    // Start 60 FPS Loop
    if (rhythmAnimFrameId) cancelAnimationFrame(rhythmAnimFrameId);
    rhythmAnimFrameId = requestAnimationFrame(rhythmGameLoop);

    playBonusChime();
  }

  function startAudioForSong(song) {
    stopRhythmAudio();

    // Check multiple candidate filenames in assets/audio/songs/
    // Extremely forgiving: supports normal .mp3, accidental double .mp3.mp3, and extensionless
    const baseNames = [
      song.file.replace(/\.mp3$/i, ''),
      song.altFile ? song.altFile.replace(/\.mp3$/i, '') : '',
      song.id,
      song.title,
      song.title.toLowerCase(),
      song.title.toUpperCase()
    ].filter(Boolean);

    const candidateFiles = [];
    baseNames.forEach(name => {
      const f1 = `assets/audio/songs/${name}.mp3`;
      const f2 = `assets/audio/songs/${name}.mp3.mp3`;
      const f3 = `assets/audio/songs/${name}`;
      if (!candidateFiles.includes(f1)) candidateFiles.push(f1);
      if (!candidateFiles.includes(f2)) candidateFiles.push(f2);
      if (!candidateFiles.includes(f3)) candidateFiles.push(f3);
    });

    rhythmAudio = new Audio();
    rhythmAudio.preload = 'auto';
    rhythmIsUsingRealAudio = false;

    let tryIndex = 0;
    function attemptPlay() {
      if (tryIndex >= candidateFiles.length) {
        // Fallback: Real MP3 not found -> Use gentle Web Audio synth chords in background!
        rhythmIsUsingRealAudio = false;
        startBackgroundSynthChords(song.bpm);
        return;
      }

      rhythmAudio.src = candidateFiles[tryIndex];
      rhythmAudio.addEventListener('playing', () => {
        rhythmIsUsingRealAudio = true;
        stopBackgroundSynthChords();
        const ctx = getRhythmAudioContext();
        if (ctx) {
          if (ctx.state === 'suspended') ctx.resume().catch(() => { });
          rhythmAudioCtxStartTime = ctx.currentTime;
          rhythmAudioBaseTime = rhythmAudio.currentTime || 0;
        }
        rhythmSongStartTime = Date.now() - ((rhythmAudio.currentTime || 0) * 1000);
      });
      rhythmAudio.addEventListener('loadedmetadata', () => {
        if (rhythmAudio && rhythmAudio.duration && !isNaN(rhythmAudio.duration) && rhythmAudio.duration > 10) {
          const realDur = Math.floor(rhythmAudio.duration);
          song.actualDuration = realDur;
          song.duration = realDur;
          if (rhythmGameActive && rhythmMode === 'full' && rhythmChartNotes.length === 0) {
            generateSongBeatChart(song, realDur);
          }
        }
      });
      const playPromise = rhythmAudio.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          rhythmIsUsingRealAudio = true;
          stopBackgroundSynthChords();
          const ctx = getRhythmAudioContext();
          if (ctx) {
            if (ctx.state === 'suspended') ctx.resume().catch(() => { });
            if (rhythmAudioCtxStartTime === 0) {
              rhythmAudioCtxStartTime = ctx.currentTime;
              rhythmAudioBaseTime = rhythmAudio.currentTime || 0;
            }
          }
          // Precise clock synchronization: anchor wall clock to audio hardware playback
          rhythmSongStartTime = Date.now() - ((rhythmAudio.currentTime || 0) * 1000);
          if (rhythmAudio && rhythmAudio.duration && !isNaN(rhythmAudio.duration) && rhythmAudio.duration > 10) {
            const realDur = Math.floor(rhythmAudio.duration);
            song.actualDuration = realDur;
            song.duration = realDur;
            if (rhythmGameActive && rhythmMode === 'full' && rhythmChartNotes.length === 0) {
              generateSongBeatChart(song, realDur);
            }
          }
          if (rhythmMode === 'endless') {
            rhythmAudio.loop = true;
          }
        }).catch(() => {
          tryIndex++;
          attemptPlay();
        });
      } else {
        tryIndex++;
        attemptPlay();
      }
    }

    attemptPlay();
  }

  function stopRhythmAudio() {
    if (rhythmAudio) {
      try {
        rhythmAudio.pause();
        rhythmAudio.currentTime = 0;
      } catch (e) { }
      rhythmAudio = null;
    }
    stopBackgroundSynthChords();
    rhythmIsUsingRealAudio = false;
    rhythmAudioCtxStartTime = 0;
    rhythmAudioBaseTime = 0;
  }

  // QUIT TO SONG LIST
  function quitRhythmGame() {
    rhythmGameActive = false;
    if (rhythmAnimFrameId) cancelAnimationFrame(rhythmAnimFrameId);
    stopRhythmAudio();

    if (rhythmPlayScreen) rhythmPlayScreen.style.display = 'none';
    if (rhythmResultModal) rhythmResultModal.style.display = 'none';
    if (rhythmSelectScreen) rhythmSelectScreen.style.display = 'block';

    const searchVal = rhythmSearchInput ? rhythmSearchInput.value : '';
    renderRhythmSongList(searchVal, activeFilterCategory);
    updateRhythmHighScoresUI();
    if (window.lucide) window.lucide.createIcons();
  }

  if (rhythmQuitBtn) rhythmQuitBtn.addEventListener('click', quitRhythmGame);
  if (rhythmBackToMenuBtn) rhythmBackToMenuBtn.addEventListener('click', quitRhythmGame);
  if (rhythmStartBtn) rhythmStartBtn.addEventListener('click', startRhythmGame);
  if (rhythmRetryBtn) {
    rhythmRetryBtn.addEventListener('click', () => {
      if (rhythmResultModal) rhythmResultModal.style.display = 'none';
      startRhythmGame();
    });
  }

  // 60 FPS MAIN GAME ENGINE LOOP
  function rhythmGameLoop() {
    if (!rhythmGameActive || !rhythmCtx) return;

    try {
      updateRhythmPhysics();
      renderRhythmStage();
    } catch (e) {
      console.warn("Rhythm game loop error caught safely:", e);
    }

    if (rhythmGameActive) {
      rhythmAnimFrameId = requestAnimationFrame(rhythmGameLoop);
    }
  }

  // Pre-charted musical sequences: natural arpeggio curves that feel like playing real piano keys
  const MELODIC_SEQUENCES = [
    [0, 1, 2, 3],
    [3, 2, 1, 0],
    [0, 2, 1, 3],
    [1, 3, 2, 0],
    [0, 1, 0, 2],
    [3, 2, 3, 1],
    [1, 2, 1, 3],
    [2, 0, 3, 1]
  ];

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // SONG_CHARTS: Handcrafted true Piano Tiles beatmaps for all songs!
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ============================================================
  // SONG_CHARTS — Hand-crafted beatmap data for each song.
  // Format per entry: [timeInSeconds, laneIndex]
  // Lane 0=D (bass/kick), 1=F (snare/mid), 2=J (melody hi), 3=K (accent/top)
  // Times are relative to audio start (second 0 of the MP3 file).
  // All times must be >= song.offset so first note appears after intro.
  // ============================================================
  const SONG_CHARTS = {

    // ─────────────────────────────────────────────────────────
    // LANY - ILYSB  |  100 BPM  |  beatSec=0.6s  |  offset=1.2s
    // Structure: synth arpeggio intro → verse → pre-chorus → big chorus (×2) → outro
    // Notes follow the C-major pentatonic arpeggio + kick/snare feel
    // ─────────────────────────────────────────────────────────
    lany_ilysb: (function () {
      const B = 0.6; // one beat
      const H = 0.3; // half beat (8th note)
      const notes = [];
      // Helper: push note
      function n(t, lane) { notes.push({ time: parseFloat(t.toFixed(3)), note: lane }); }

      // INTRO: synth arpeggio (sparse, every 2 beats) 1.2–12s
      // Arpeggio pattern: 0,2,1,3 → ascending then top
      const intro = [
        [1.2, 0], [2.4, 2], [3.6, 1], [4.8, 3],
        [6.0, 0], [7.2, 2], [8.4, 1], [9.6, 3],
        [10.8, 0], [12.0, 2]
      ];
      intro.forEach(([t, l]) => n(t, l));

      // VERSE 1: ~13s–36s — vocal melody quarter notes with snare on 2&4
      // "I love you so bad" melody rhythm pattern (100 BPM, 4/4)
      let t = 13.2;
      const verse1Pattern = [
        [0, 2], [B, 0], [B * 2, 2], [B * 3, 1],   // "I love you"
        [B * 4, 2], [B * 5, 0], [B * 6, 3], [B * 7, 1], // "so bad"
        [B * 8, 2], [B * 9, 0], [B * 10, 2], [B * 11, 1], // melodic fill
        [B * 12, 3], [B * 13, 0], [B * 14, 2], [B * 15, 1], // "you said"
        [B * 16, 2], [B * 17, 0], [B * 18, 1], [B * 19, 2], // vocal hold
        [B * 20, 0], [B * 21, 3], [B * 22, 1], [B * 23, 2], // end phrase
        [B * 24, 0], [B * 25, 2], [B * 26, 1], [B * 27, 3], // connect to pre-chorus
      ];
      verse1Pattern.forEach(([dt, l]) => n(t + dt, l));

      // PRE-CHORUS: ~29.4s–36s — buildup, every beat + upbeats
      t = 29.4;
      for (let i = 0; i < 11; i++) {
        n(t + i * B, [2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3][i]);
        if (i >= 4) n(t + i * B + H, [1, 3, 0, 2, 1, 0, 3][i - 4]); // 8th-note fills
      }

      // CHORUS 1: ~36s–64.8s — every beat, melodic contour of "ohhh baby"
      t = 36.0;
      // Chorus pattern repeats every 4 beats (1 measure)
      // Pattern follows the iconic synth hook melody
      const chPattern = [0, H, B, B + H, B * 2, B * 3, B * 3 + H]; // 7 events per measure
      const chLanes = [2, 3, 0, 2, 3, 1, 2];
      for (let m = 0; m < 12; m++) {
        chPattern.forEach((dt, i) => {
          const lane = chLanes[(i + m) % 4 === 0 && m % 2 === 0 ? i : (i + 1) % chLanes.length];
          n(t + m * B * 4 + dt, lane);
        });
      }

      // INTERLUDE: ~84.8s–96s — back to sparse
      t = 84.8;
      for (let i = 0; i < 10; i++) n(t + i * B * 2, [0, 2, 1, 3, 0, 2, 1, 3, 2, 0][i]);

      // VERSE 2: ~96s–120s — same feel as verse 1
      t = 96.0;
      verse1Pattern.forEach(([dt, l]) => n(t + dt, l));

      // PRE-CHORUS 2:
      t = 112.2;
      for (let i = 0; i < 11; i++) {
        n(t + i * B, [2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3][i]);
        if (i >= 4) n(t + i * B + H, [1, 3, 0, 2, 1, 0, 3][i - 4]);
      }

      // CHORUS 2: ~118.8s–148s — same pattern
      t = 118.8;
      for (let m = 0; m < 12; m++) {
        chPattern.forEach((dt, i) => {
          const lane = chLanes[(i + m) % 4 === 0 && m % 2 === 0 ? i : (i + 1) % chLanes.length];
          n(t + m * B * 4 + dt, lane);
        });
      }

      // BRIDGE: ~148s–168s — emotional, half-time feel
      t = 148.8;
      for (let i = 0; i < 20; i++) {
        n(t + i * B * 2, [0, 2, 1, 3, 2, 0, 3, 1, 2, 1, 0, 3, 2, 1, 3, 0, 2, 1, 0, 3][i]);
      }

      // FINAL CHORUS: ~168s–196s — densest part
      t = 168.0;
      for (let m = 0; m < 10; m++) {
        chPattern.forEach((dt, i) => {
          n(t + m * B * 4 + dt, chLanes[(i + m) % chLanes.length]);
        });
        // Extra 16th-note accents in final chorus
        n(t + m * B * 4 + B * 1.5, [3, 1, 2, 0, 3, 1, 2, 0, 3, 0][m]);
      }

      // OUTRO: ~196s–206s sparse fade
      t = 196.8;
      for (let i = 0; i < 6; i++) n(t + i * B * 2, [2, 0, 3, 1, 2, 0][i]);

      notes.sort((a, b) => (a.time || a[0]) - (b.time || b[0]));
      return notes;
    })(),

    // ─────────────────────────────────────────────────────────
    // LANY - Malibu Nights  |  74 BPM  |  beatSec≈0.811s  |  offset=0.9s
    // Slow melancholic piano ballad. Quarter notes + some 8ths in chorus.
    // ─────────────────────────────────────────────────────────
    lany_malibu: (function () {
      const B = 60 / 74;
      const H = B / 2;
      const notes = [];
      function n(t, lane) { notes.push({ time: parseFloat(t.toFixed(3)), note: lane }); }

      // INTRO piano chords — very sparse, every 2 beats: 0.9–13s
      const introT = [0.9, 2.5, 4.1, 5.7, 7.3, 8.9, 10.5, 12.1];
      const introL = [0, 2, 1, 3, 0, 2, 1, 3];
      introT.forEach((t, i) => n(t, introL[i]));

      // VERSE 1: ~13.5s–55s — piano melody quarter notes
      let t = 13.5;
      const vPat = [0, 2, 1, 3, 2, 0, 3, 1, 2, 0, 2, 3, 1, 0, 3, 2];
      for (let i = 0; i < 50; i++) {
        n(t + i * B, vPat[i % vPat.length]);
        if (i > 0 && i % 4 === 3) i++; // skip one beat as "breath" every phrase
      }

      // PRE-CHORUS buildup: ~54s–65s
      t = 54.0;
      for (let i = 0; i < 14; i++) {
        n(t + i * B, [2, 0, 3, 1, 2, 3, 0, 1, 2, 0, 3, 2, 1, 0][i]);
        if (i >= 8) n(t + i * B + H, [0, 2, 1, 3, 0, 3][i - 8]);
      }

      // CHORUS: ~65s–105s — every beat + 8th upbeats on strong beats
      t = 65.0;
      for (let m = 0; m < 12; m++) {
        n(t + m * B * 4, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + H, [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2][m]);
        n(t + m * B * 4 + B, [0, 1, 0, 3, 0, 1, 0, 3, 0, 1, 0, 3][m]);
        n(t + m * B * 4 + B * 2, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + B * 3, [1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 2][m]);
      }

      // VERSE 2: ~105s–147s
      t = 105.0;
      for (let i = 0; i < 50; i++) {
        n(t + i * B, vPat[i % vPat.length]);
        if (i > 0 && i % 4 === 3) i++;
      }

      // CHORUS 2: ~147s–191s
      t = 147.0;
      for (let m = 0; m < 12; m++) {
        n(t + m * B * 4, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + H, [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2][m]);
        n(t + m * B * 4 + B, [0, 1, 0, 3, 0, 1, 0, 3, 0, 1, 0, 3][m]);
        n(t + m * B * 4 + B * 2, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + B * 3, [1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 2][m]);
      }

      // OUTRO: ~191s–278s — fade with sparse piano
      t = 191.0;
      for (let i = 0; i < 50; i++) n(t + i * B * 2, [0, 2, 1, 3, 2, 0, 3, 1, 2, 0, 2, 3, 1, 0, 3, 2, 2, 1, 0, 3, 2, 3, 0, 1, 2, 3, 1, 0, 3, 2, 2, 0, 1, 3, 2, 0, 3, 1, 0, 2, 2, 3, 1, 0, 3, 2, 2, 1, 0, 3][i]);

      notes.sort((a, b) => (a.time || a[0]) - (b.time || b[0]));
      return notes;
    })(),

    // ─────────────────────────────────────────────────────────
    // LANY - dna  |  100 BPM  |  beatSec=0.6s  |  offset=1.4s
    // Upbeat synth-pop. Moderate density.
    // ─────────────────────────────────────────────────────────
    lany_dna: (function () {
      const B = 0.6;
      const H = 0.3;
      const notes = [];
      function n(t, lane) { notes.push({ time: parseFloat(t.toFixed(3)), note: lane }); }

      // INTRO: 1.4–12s sparse
      const introSeq = [[1.4, 2], [2.6, 0], [3.8, 3], [5.0, 1], [6.2, 2], [7.4, 0], [8.6, 3], [10.4, 2]];
      introSeq.forEach(([t, l]) => n(t, l));

      // VERSE 1: ~12s–36s
      let t = 12.0;
      const vpat = [2, 0, 3, 1, 2, 1, 0, 3, 2, 0, 2, 3, 1, 0, 3, 2];
      for (let i = 0; i < 40; i++) {
        n(t + i * B, vpat[i % vpat.length]);
      }

      // PRE-CHORUS: ~36s–43.2s
      t = 36.0;
      for (let i = 0; i < 12; i++) {
        n(t + i * B, [2, 3, 0, 1, 2, 3, 0, 1, 3, 2, 1, 0][i]);
        if (i > 6) n(t + i * B + H, [1, 2, 3, 0, 3][i - 7]);
      }

      // CHORUS 1: ~43.2–72s — "It's in our DNA"
      t = 43.2;
      for (let m = 0; m < 10; m++) {
        n(t + m * B * 4, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0][m]);
        n(t + m * B * 4 + H, [3, 2, 3, 2, 3, 2, 3, 2, 3, 2][m]);
        n(t + m * B * 4 + B, [0, 3, 0, 3, 0, 3, 0, 3, 0, 3][m]);
        n(t + m * B * 4 + B * 2, [2, 1, 2, 1, 2, 1, 2, 1, 2, 1][m]);
        n(t + m * B * 4 + B * 2 + H, [3, 0, 3, 0, 3, 0, 3, 0, 3, 0][m]);
        n(t + m * B * 4 + B * 3, [1, 2, 1, 2, 1, 2, 1, 2, 1, 2][m]);
      }

      // VERSE 2: ~72s–96s
      t = 72.0;
      for (let i = 0; i < 40; i++) n(t + i * B, vpat[i % vpat.length]);

      // PRE-CHORUS 2:
      t = 108.0;
      for (let i = 0; i < 12; i++) {
        n(t + i * B, [2, 3, 0, 1, 2, 3, 0, 1, 3, 2, 1, 0][i]);
        if (i > 6) n(t + i * B + H, [1, 2, 3, 0, 3][i - 7]);
      }

      // CHORUS 2: ~115.2–148s
      t = 115.2;
      for (let m = 0; m < 12; m++) {
        n(t + m * B * 4, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + H, [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2][m]);
        n(t + m * B * 4 + B, [0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3][m]);
        n(t + m * B * 4 + B * 2, [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1][m]);
        n(t + m * B * 4 + B * 2 + H, [3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0][m]);
        n(t + m * B * 4 + B * 3, [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2][m]);
      }

      // OUTRO: ~148s–173s
      t = 148.0;
      for (let i = 0; i < 20; i++) n(t + i * B * 1.5, [2, 0, 1, 3, 2, 0, 3, 1, 2, 1, 0, 3, 2, 1, 3, 0, 2, 1, 0, 3][i]);

      notes.sort((a, b) => (a.time || a[0]) - (b.time || b[0]));
      return notes;
    })(),

    // ─────────────────────────────────────────────────────────
    // EXO - Love Shot  |  146 BPM  |  beatSec≈0.411s  |  offset=0.8s
    // EDM/Pop. Heavy bass drops. Dense rhythmic hits.
    // ─────────────────────────────────────────────────────────
    exo_love_shot: (function () {
      const B = 60 / 146;
      const H = B / 2;
      const notes = [];
      function n(t, lane) { notes.push({ time: parseFloat(t.toFixed(3)), note: lane }); }

      // INTRO spoken/synth: 0.8–9.6s very sparse
      [[0.8, 0], [1.6, 2], [2.5, 1], [3.3, 3], [4.9, 0], [6.2, 2], [7.4, 1], [8.6, 3]].forEach(([t, l]) => n(t, l));

      // VERSE 1 (half-time EDM feel): ~9.6s–28s
      let t = 9.6;
      for (let i = 0; i < 22; i++) {
        n(t + i * B * 2, [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2][i]);
        n(t + i * B * 2 + B, [2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0][i]);
      }

      // PRE-CHORUS: ~28s–35.5s — building
      t = 28.0;
      for (let i = 0; i < 18; i++) {
        n(t + i * B, [2, 0, 3, 1, 2, 3, 0, 1, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1][i]);
        if (i >= 12) n(t + i * B + H, [0, 3, 2, 1, 3, 0][i - 12]);
      }

      // DROP / CHORUS 1: ~35.5–55s — fast and dense
      t = 35.5;
      for (let m = 0; m < 12; m++) {
        n(t + m * B * 4, [0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1][m]);
        n(t + m * B * 4 + H, [3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3, 2][m]);
        n(t + m * B * 4 + B, [2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2, 3][m]);
        n(t + m * B * 4 + B + H, [1, 3, 1, 0, 1, 3, 1, 0, 1, 3, 1, 0][m]);
        n(t + m * B * 4 + B * 2, [0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1][m]);
        n(t + m * B * 4 + B * 3, [3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0][m]);
        n(t + m * B * 4 + B * 3 + H, [2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2, 3][m]);
      }

      // VERSE 2: ~55s–74s (same as verse 1)
      t = 55.0;
      for (let i = 0; i < 22; i++) {
        n(t + i * B * 2, [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2][i]);
        n(t + i * B * 2 + B, [2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0][i]);
      }

      // PRE-CHORUS 2:
      t = 74.0;
      for (let i = 0; i < 18; i++) {
        n(t + i * B, [2, 0, 3, 1, 2, 3, 0, 1, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1][i]);
        if (i >= 12) n(t + i * B + H, [0, 3, 2, 1, 3, 0][i - 12]);
      }

      // CHORUS 2 (same): ~81.5s–101s
      t = 81.5;
      for (let m = 0; m < 12; m++) {
        n(t + m * B * 4, [0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1][m]);
        n(t + m * B * 4 + H, [3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3, 2][m]);
        n(t + m * B * 4 + B, [2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2, 3][m]);
        n(t + m * B * 4 + B + H, [1, 3, 1, 0, 1, 3, 1, 0, 1, 3, 1, 0][m]);
        n(t + m * B * 4 + B * 2, [0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1][m]);
        n(t + m * B * 4 + B * 3, [3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0][m]);
        n(t + m * B * 4 + B * 3 + H, [2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2, 3][m]);
      }

      // BRIDGE: ~101s–120s — slightly calmer
      t = 101.0;
      for (let i = 0; i < 28; i++) {
        n(t + i * B * 1.5, [2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1][i]);
      }

      // FINAL DROP: ~120s–146s — densest
      t = 120.0;
      for (let m = 0; m < 15; m++) {
        n(t + m * B * 4, [0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0][m]);
        n(t + m * B * 4 + H, [3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3][m]);
        n(t + m * B * 4 + B, [2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2][m]);
        n(t + m * B * 4 + B + H, [1, 3, 1, 0, 1, 3, 1, 0, 1, 3, 1, 0, 1, 3, 1][m]);
        n(t + m * B * 4 + B * 2, [3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3][m]);
        n(t + m * B * 4 + B * 2 + H, [0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0][m]);
        n(t + m * B * 4 + B * 3, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2][m]);
        n(t + m * B * 4 + B * 3 + H, [3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3][m]);
      }

      // OUTRO: ~146s–202s sparse
      t = 146.0;
      const loveShotOutro = [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1];
      for (let i = 0; i < 68; i++) n(t + i * B * 2, loveShotOutro[i % loveShotOutro.length]);

      notes.sort((a, b) => (a.time || a[0]) - (b.time || b[0]));
      return notes;
    })(),

    // ─────────────────────────────────────────────────────────
    // EXO - Universe  |  70 BPM  |  beatSec≈0.857s  |  offset=1.6s
    // Slow majestic orchestral. Only downbeats in verse, fuller chorus.
    // ─────────────────────────────────────────────────────────
    exo_universe: (function () {
      const B = 60 / 70;
      const H = B / 2;
      const notes = [];
      function n(t, lane) { notes.push({ time: parseFloat(t.toFixed(3)), note: lane }); }

      // INTRO orchestral swell: 1.6–17s, only beats 1 & 3
      let t = 1.6;
      for (let i = 0; i < 9; i++) n(t + i * B * 2, [0, 2, 1, 3, 0, 2, 1, 3, 2][i]);

      // VERSE 1: ~17s–51s — sparse, beats 1 and 3 of each measure
      t = 17.0;
      const vpat = [2, 0, 3, 1, 2, 0, 2, 3];
      for (let i = 0; i < 20; i++) {
        n(t + i * B * 2, vpat[i % vpat.length]);
        // occasional accent on beat 2
        if (i % 4 === 1) n(t + i * B * 2 + B, [3, 1][Math.floor(i / 4) % 2]);
      }

      // PRE-CHORUS: ~51s–59s — all 4 beats
      t = 51.0;
      for (let i = 0; i < 10; i++) n(t + i * B, [2, 0, 3, 1, 2, 0, 3, 1, 2, 3][i]);

      // CHORUS: ~59s–97s — every beat + some 8ths
      t = 59.0;
      for (let m = 0; m < 12; m++) {
        n(t + m * B * 4, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + B, [0, 3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2][m]);
        n(t + m * B * 4 + B * 2, [3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0][m]);
        n(t + m * B * 4 + B * 3, [1, 2, 1, 3, 1, 2, 1, 3, 1, 2, 1, 3][m]);
        if (m % 2 === 1) n(t + m * B * 4 + H, [3, 1][m % 2]);
      }

      // VERSE 2: ~97s–131s
      t = 97.0;
      for (let i = 0; i < 20; i++) {
        n(t + i * B * 2, vpat[i % vpat.length]);
        if (i % 4 === 1) n(t + i * B * 2 + B, [3, 1][Math.floor(i / 4) % 2]);
      }

      // PRE-CHORUS 2:
      t = 131.0;
      for (let i = 0; i < 10; i++) n(t + i * B, [2, 0, 3, 1, 2, 0, 3, 1, 2, 3][i]);

      // CHORUS 2: ~139s–180s
      t = 139.0;
      for (let m = 0; m < 12; m++) {
        n(t + m * B * 4, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + B, [0, 3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2][m]);
        n(t + m * B * 4 + B * 2, [3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0][m]);
        n(t + m * B * 4 + B * 3, [1, 2, 1, 3, 1, 2, 1, 3, 1, 2, 1, 3][m]);
        if (m % 2 === 1) n(t + m * B * 4 + H, [3, 1][m % 2]);
      }

      // OUTRO: ~180s–260s very sparse
      t = 180.0;
      for (let i = 0; i < 40; i++) n(t + i * B * 2, [0, 2, 1, 3, 2, 0, 3, 1, 2, 1, 0, 3, 2, 1, 3, 0, 2, 1, 0, 3, 2, 3, 0, 1, 2, 3, 1, 0, 3, 2, 2, 0, 1, 3, 2, 0, 3, 1, 0, 2][i]);

      notes.sort((a, b) => (a.time || a[0]) - (b.time || b[0]));
      return notes;
    })(),

    // ─────────────────────────────────────────────────────────
    // EXO - Monster  |  150 BPM  |  beatSec=0.4s  |  offset=0.6s
    // Fast aggressive hiphop/EDM. Dense all the way through.
    // ─────────────────────────────────────────────────────────
    exo_monster: (function () {
      const B = 0.4;
      const H = 0.2;
      const notes = [];
      function n(t, lane) { notes.push({ time: parseFloat(t.toFixed(3)), note: lane }); }

      // INTRO: 0.6–9.6s — dramatic build
      [[0.6, 0], [1.2, 2], [1.8, 1], [2.4, 3], [3.0, 0], [3.6, 2], [4.2, 3], [4.8, 1], [5.4, 0], [6.0, 2], [6.4, 3], [6.8, 1], [7.2, 0], [7.6, 2], [7.9, 3], [8.2, 0]].forEach(([t, l]) => n(t, l));

      // VERSE 1: ~9.6s–36s — every beat with offbeats
      let t = 9.6;
      const vp = [0, 2, 1, 3, 0, 2, 3, 1, 2, 0, 3, 1, 0, 2, 1, 3];
      for (let i = 0; i < 65; i++) {
        n(t + i * B, vp[i % vp.length]);
        if (i % 2 === 1) n(t + i * B + H, vp[(i + 2) % vp.length]);
      }

      // PRE-CHORUS: ~36s–44s
      t = 36.0;
      for (let i = 0; i < 20; i++) {
        n(t + i * B, [2, 3, 0, 1, 3, 2, 0, 1, 2, 3, 1, 0, 3, 2, 1, 0, 2, 3, 0, 1][i]);
        n(t + i * B + H, [0, 1, 3, 2, 1, 0, 3, 2, 0, 1, 2, 3, 1, 0, 2, 3, 0, 1, 3, 2][i]);
      }

      // CHORUS 1: ~44s–70s — maximum density
      t = 44.0;
      for (let m = 0; m < 15; m++) {
        n(t + m * B * 4, [0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0][m]);
        n(t + m * B * 4 + H, [3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3][m]);
        n(t + m * B * 4 + B, [2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2][m]);
        n(t + m * B * 4 + B + H, [1, 3, 1, 0, 1, 3, 1, 0, 1, 3, 1, 0, 1, 3, 1][m]);
        n(t + m * B * 4 + B * 2, [3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3][m]);
        n(t + m * B * 4 + B * 2 + H, [0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0][m]);
        n(t + m * B * 4 + B * 3, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2][m]);
        n(t + m * B * 4 + B * 3 + H, [1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1][m]);
      }

      // VERSE 2: ~70s–96s
      t = 70.0;
      for (let i = 0; i < 65; i++) {
        n(t + i * B, vp[i % vp.length]);
        if (i % 2 === 1) n(t + i * B + H, vp[(i + 2) % vp.length]);
      }

      // CHORUS 2: ~96s–124s
      t = 96.0;
      for (let m = 0; m < 18; m++) {
        n(t + m * B * 4, [0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2][m]);
        n(t + m * B * 4 + H, [3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3, 2, 3, 1][m]);
        n(t + m * B * 4 + B, [2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2, 3, 2, 0][m]);
        n(t + m * B * 4 + B + H, [1, 3, 1, 0, 1, 3, 1, 0, 1, 3, 1, 0, 1, 3, 1, 0, 1, 3][m]);
        n(t + m * B * 4 + B * 2, [3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0, 3, 1][m]);
        n(t + m * B * 4 + B * 2 + H, [0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2][m]);
        n(t + m * B * 4 + B * 3, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0][m]);
        n(t + m * B * 4 + B * 3 + H, [1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 2, 1, 3][m]);
      }

      // BRIDGE: ~124s–138s — half time
      t = 124.0;
      for (let i = 0; i < 22; i++) n(t + i * B * 1.5, [2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0][i]);

      // FINAL SECTION: ~138s–215s — back to max density
      t = 138.0;
      const finalPat0 = [0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1];
      const finalPatH = [3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3, 2, 3, 1, 3, 2];
      const finalPat1 = [2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2, 3, 2, 0, 2, 3];
      const finalPat1H = [1, 3, 1, 0, 1, 3, 1, 0, 1, 3, 1, 0, 1, 3, 1, 0, 1, 3, 1, 0];
      const finalPat2 = [3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0];
      const finalPat3 = [0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1];
      for (let m = 0; m < 48; m++) {
        n(t + m * B * 4, finalPat0[m % finalPat0.length]);
        n(t + m * B * 4 + H, finalPatH[m % finalPatH.length]);
        n(t + m * B * 4 + B, finalPat1[m % finalPat1.length]);
        n(t + m * B * 4 + B + H, finalPat1H[m % finalPat1H.length]);
        n(t + m * B * 4 + B * 2, finalPat2[m % finalPat2.length]);
        n(t + m * B * 4 + B * 3, finalPat3[m % finalPat3.length]);
      }

      notes.sort((a, b) => (a.time || a[0]) - (b.time || b[0]));
      return notes;
    })(),

    // ─────────────────────────────────────────────────────────
    // EXO - MAMA  |  90 BPM  |  beatSec≈0.667s  |  offset=3.8s
    // Epic orchestral debut. Complex rhythm changes. choir intro.
    // ─────────────────────────────────────────────────────────
    exo_mama: (function () {
      const B = 60 / 90;
      const H = B / 2;
      const notes = [];
      function n(t, lane) { notes.push({ time: parseFloat(t.toFixed(3)), note: lane }); }

      // CHOIR INTRO: 3.8–20s — slow majestic, every 2 beats
      let t = 3.8;
      for (let i = 0; i < 12; i++) n(t + i * B * 2, [0, 2, 1, 3, 2, 0, 3, 1, 2, 1, 0, 3][i]);

      // ORCHESTRAL BUILD: ~20s–36s
      t = 20.0;
      for (let i = 0; i < 20; i++) {
        n(t + i * B, [2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1][i]);
      }

      // VERSE 1 RAP/SING: ~36s–72s — kick on 1&3, snare on 2&4
      t = 36.0;
      for (let m = 0; m < 14; m++) {
        n(t + m * B * 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][m]); // kick on 1
        n(t + m * B * 4 + B, [2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3][m]); // snare feel
        n(t + m * B * 4 + B * 2, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][m]); // kick on 3
        n(t + m * B * 4 + B * 3, [1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3][m]); // snare on 4
        // melody fill in between
        n(t + m * B * 4 + H, [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1][m]);
        n(t + m * B * 4 + B * 1 + H, [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2][m]);
      }

      // PRE-CHORUS: ~72s–81s
      t = 72.0;
      for (let i = 0; i < 14; i++) {
        n(t + i * B, [2, 3, 0, 1, 3, 2, 1, 0, 2, 3, 0, 1, 3, 2][i]);
        if (i > 8) n(t + i * B + H, [1, 2, 0, 3, 2][i - 9]);
      }

      // CHORUS 1: ~81s–110s
      t = 81.0;
      for (let m = 0; m < 12; m++) {
        n(t + m * B * 4, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + H, [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2][m]);
        n(t + m * B * 4 + B, [0, 3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2][m]);
        n(t + m * B * 4 + B + H, [1, 0, 1, 3, 1, 0, 1, 3, 1, 0, 1, 3][m]);
        n(t + m * B * 4 + B * 2, [3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0][m]);
        n(t + m * B * 4 + B * 3, [0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1][m]);
      }

      // VERSE 2: ~110s–146s
      t = 110.0;
      for (let m = 0; m < 14; m++) {
        n(t + m * B * 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][m]);
        n(t + m * B * 4 + B, [2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3][m]);
        n(t + m * B * 4 + B * 2, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][m]);
        n(t + m * B * 4 + B * 3, [1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3][m]);
        n(t + m * B * 4 + H, [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1][m]);
        n(t + m * B * 4 + B * 1 + H, [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2][m]);
      }

      // CHORUS 2: ~146s–178s
      t = 146.0;
      for (let m = 0; m < 12; m++) {
        n(t + m * B * 4, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + H, [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2][m]);
        n(t + m * B * 4 + B, [0, 3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2][m]);
        n(t + m * B * 4 + B + H, [1, 0, 1, 3, 1, 0, 1, 3, 1, 0, 1, 3][m]);
        n(t + m * B * 4 + B * 2, [3, 1, 3, 0, 3, 1, 3, 0, 3, 1, 3, 0][m]);
        n(t + m * B * 4 + B * 3, [0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1][m]);
      }

      // EPIC BRIDGE/OUTRO: ~178s–270s — grand finale
      t = 178.0;
      for (let m = 0; m < 34; m++) {
        n(t + m * B * 4, [2, 0, 2, 1][m % 4]);
        n(t + m * B * 4 + B, [0, 3, 0, 2][m % 4]);
        n(t + m * B * 4 + B * 2, [3, 1, 3, 0][m % 4]);
        n(t + m * B * 4 + B * 3, [1, 2, 1, 3][m % 4]);
        if (m > 10) {
          n(t + m * B * 4 + H, [3, 1, 3, 2][m % 4]);
          n(t + m * B * 4 + B + H, [0, 2, 0, 1][m % 4]);
        }
      }

      notes.sort((a, b) => (a.time || a[0]) - (b.time || b[0]));
      return notes;
    })(),

    // ─────────────────────────────────────────────────────────
    // Batas Senja - Nanti Kita Seperti Ini  |  85 BPM  |  beatSec≈0.706s  |  offset=2.0s
    // Indie pop, moderate tempo, melodic guitar feel
    // ─────────────────────────────────────────────────────────
    batas_senja_nanti_kita_seperti_ini: (function () {
      const B = 60 / 85;
      const H = B / 2;
      const notes = [];
      function n(t, lane) { notes.push({ time: parseFloat(t.toFixed(3)), note: lane }); }

      // INTRO guitar: 2.0–14s sparse
      let t = 2.0;
      for (let i = 0; i < 8; i++) n(t + i * B * 2, [0, 2, 1, 3, 0, 2, 1, 3][i]);

      // VERSE 1: ~14s–50s — quarter notes following melody
      t = 14.0;
      const vp = [2, 0, 3, 1, 2, 1, 0, 3, 2, 0, 2, 3, 1, 0, 3, 2];
      for (let i = 0; i < 50; i++) {
        n(t + i * B, vp[i % vp.length]);
        if (i % 4 === 3) { i++; } // breath after each phrase
      }

      // PRE-CHORUS: ~50s–59s
      t = 50.0;
      for (let i = 0; i < 12; i++) n(t + i * B, [2, 0, 3, 1, 2, 3, 0, 1, 2, 0, 3, 1][i]);

      // CHORUS 1: ~59s–96s — "Nanti kita..."
      t = 59.0;
      for (let m = 0; m < 13; m++) {
        n(t + m * B * 4, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2][m]);
        n(t + m * B * 4 + H, [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3][m]);
        n(t + m * B * 4 + B, [0, 1, 0, 3, 0, 1, 0, 3, 0, 1, 0, 3, 0][m]);
        n(t + m * B * 4 + B * 2, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2][m]);
        n(t + m * B * 4 + B * 3, [1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 2, 1][m]);
      }

      // VERSE 2: ~96s–133s
      t = 96.0;
      for (let i = 0; i < 50; i++) {
        n(t + i * B, vp[i % vp.length]);
        if (i % 4 === 3) { i++; }
      }

      // CHORUS 2: ~133s–170s
      t = 133.0;
      for (let m = 0; m < 13; m++) {
        n(t + m * B * 4, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2][m]);
        n(t + m * B * 4 + H, [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3][m]);
        n(t + m * B * 4 + B, [0, 1, 0, 3, 0, 1, 0, 3, 0, 1, 0, 3, 0][m]);
        n(t + m * B * 4 + B * 2, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2][m]);
        n(t + m * B * 4 + B * 3, [1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 2, 1][m]);
      }

      // OUTRO: ~170s–207s
      t = 170.0;
      for (let i = 0; i < 28; i++) n(t + i * B * 2, [0, 2, 1, 3, 2, 0, 3, 1, 2, 1, 0, 3, 2, 1, 3, 0, 2, 1, 0, 3, 2, 3, 0, 1, 2, 3, 1, 0][i]);

      notes.sort((a, b) => (a.time || a[0]) - (b.time || b[0]));
      return notes;
    })(),

    // ─────────────────────────────────────────────────────────
    // EXO - Growl  |  90 BPM  |  beatSec≈0.667s  |  offset=1.2s
    // Funky groove. Kick on 1&3, snare on 2&4, melodic fill between.
    // ─────────────────────────────────────────────────────────
    exo_growl: (function () {
      const B = 60 / 90;
      const H = B / 2;
      const notes = [];
      function n(t, lane) { notes.push({ time: parseFloat(t.toFixed(3)), note: lane }); }

      // INTRO groove: 1.2–13s — kick/snare pattern
      let t = 1.2;
      for (let m = 0; m < 4; m++) {
        n(t + m * B * 4, 0); // kick on 1
        n(t + m * B * 4 + B, 2); // melody
        n(t + m * B * 4 + B * 2, 1); // kick on 3 (snare side)
        n(t + m * B * 4 + B * 3, 3); // snare on 4
      }

      // VERSE 1: ~13s–51s — full groove pattern
      t = 13.0;
      for (let m = 0; m < 15; m++) {
        n(t + m * B * 4, 0); // kick 1
        n(t + m * B * 4 + H, 2); // 8th upbeat
        n(t + m * B * 4 + B, 1); // snare 2
        n(t + m * B * 4 + B + H, 3); // upbeat
        n(t + m * B * 4 + B * 2, 0); // kick 3
        n(t + m * B * 4 + B * 2 + H, 2);// upbeat
        n(t + m * B * 4 + B * 3, 1); // snare 4
      }

      // PRE-CHORUS: ~51s–59s
      t = 51.0;
      for (let i = 0; i < 12; i++) {
        n(t + i * B, [2, 0, 3, 1, 2, 3, 0, 1, 3, 2, 1, 0][i]);
        n(t + i * B + H, [0, 3, 1, 2, 0, 1, 3, 2, 1, 0, 2, 3][i]);
      }

      // CHORUS 1: ~59s–89s
      t = 59.0;
      for (let m = 0; m < 13; m++) {
        n(t + m * B * 4, 0);
        n(t + m * B * 4 + H, 2);
        n(t + m * B * 4 + B, 3);
        n(t + m * B * 4 + B + H, 1);
        n(t + m * B * 4 + B * 2, 0);
        n(t + m * B * 4 + B * 2 + H, 3);
        n(t + m * B * 4 + B * 3, 2);
        n(t + m * B * 4 + B * 3 + H, 1);
      }

      // VERSE 2: ~89s–127s
      t = 89.0;
      for (let m = 0; m < 15; m++) {
        n(t + m * B * 4, 0);
        n(t + m * B * 4 + H, 2);
        n(t + m * B * 4 + B, 1);
        n(t + m * B * 4 + B + H, 3);
        n(t + m * B * 4 + B * 2, 0);
        n(t + m * B * 4 + B * 2 + H, 2);
        n(t + m * B * 4 + B * 3, 1);
      }

      // CHORUS 2: ~127s–159s
      t = 127.0;
      for (let m = 0; m < 13; m++) {
        n(t + m * B * 4, 0);
        n(t + m * B * 4 + H, 2);
        n(t + m * B * 4 + B, 3);
        n(t + m * B * 4 + B + H, 1);
        n(t + m * B * 4 + B * 2, 0);
        n(t + m * B * 4 + B * 2 + H, 3);
        n(t + m * B * 4 + B * 3, 2);
        n(t + m * B * 4 + B * 3 + H, 1);
      }

      // BRIDGE/RAP: ~159s–175s
      t = 159.0;
      for (let i = 0; i < 24; i++) n(t + i * B, [0, 2, 1, 3, 0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2, 0, 1, 3, 0, 2, 3, 1][i]);

      // OUTRO CHORUS: ~175s–204s
      t = 175.0;
      for (let m = 0; m < 12; m++) {
        n(t + m * B * 4, 0);
        n(t + m * B * 4 + H, 2);
        n(t + m * B * 4 + B, 3);
        n(t + m * B * 4 + B + H, 1);
        n(t + m * B * 4 + B * 2, 0);
        n(t + m * B * 4 + B * 2 + H, 3);
        n(t + m * B * 4 + B * 3, 2);
        n(t + m * B * 4 + B * 3 + H, 1);
      }

      notes.sort((a, b) => (a.time || a[0]) - (b.time || b[0]));
      return notes;
    })(),

    // ─────────────────────────────────────────────────────────
    // Sal Priadi - Nanti Kita Usahakan Rumah Itu  |  95 BPM  |  beatSec≈0.632s  |  offset=2.2s
    // Mellow indie. Soft guitar + vocal melody.
    // ─────────────────────────────────────────────────────────
    sal_priadi_nanti_kita_usahakan_rumah_itu: (function () {
      const B = 60 / 95;
      const H = B / 2;
      const notes = [];
      function n(t, lane) { notes.push({ time: parseFloat(t.toFixed(3)), note: lane }); }

      // INTRO guitar: 2.2–14s sparse
      let t = 2.2;
      for (let i = 0; i < 8; i++) n(t + i * B * 2, [0, 2, 1, 3, 2, 0, 3, 1][i]);

      // VERSE 1: ~14s–50s — soft quarter notes
      t = 14.0;
      const vp = [2, 0, 3, 1, 2, 1, 0, 3];
      for (let i = 0; i < 56; i++) {
        n(t + i * B, vp[i % vp.length]);
        if (i % 4 === 3) { i++; } // breath
      }

      // PRE-CHORUS: ~50s–58s
      t = 50.0;
      for (let i = 0; i < 12; i++) n(t + i * B, [2, 0, 3, 1, 2, 3, 0, 1, 2, 0, 3, 1][i]);

      // CHORUS 1: ~58s–92s — "Nanti kita usahakan rumah itu"
      t = 58.0;
      for (let m = 0; m < 12; m++) {
        n(t + m * B * 4, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + H, [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2][m]);
        n(t + m * B * 4 + B, [0, 1, 0, 3, 0, 1, 0, 3, 0, 1, 0, 3][m]);
        n(t + m * B * 4 + B * 2, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + B * 3, [1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 2][m]);
      }

      // VERSE 2: ~92s–128s
      t = 92.0;
      for (let i = 0; i < 56; i++) {
        n(t + i * B, vp[i % vp.length]);
        if (i % 4 === 3) { i++; }
      }

      // CHORUS 2: ~128s–162s
      t = 128.0;
      for (let m = 0; m < 12; m++) {
        n(t + m * B * 4, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + H, [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2][m]);
        n(t + m * B * 4 + B, [0, 1, 0, 3, 0, 1, 0, 3, 0, 1, 0, 3][m]);
        n(t + m * B * 4 + B * 2, [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1][m]);
        n(t + m * B * 4 + B * 3, [1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 2][m]);
      }

      // OUTRO: ~162s–208s
      t = 162.0;
      for (let i = 0; i < 36; i++) n(t + i * B * 2, [0, 2, 1, 3, 2, 0, 3, 1, 2, 1, 0, 3, 2, 1, 3, 0, 2, 1, 0, 3, 2, 3, 0, 1, 2, 3, 1, 0, 3, 2, 2, 0, 1, 3, 2, 1][i]);

      notes.sort((a, b) => (a.time || a[0]) - (b.time || b[0]));
      return notes;
    })()

  };


  function generateSongBeatChart(song, totalDuration) {
    rhythmChartNotes = [];

    // 1. Handcrafted True Piano Tiles beatmap (aligned with vocal melody, beats, and chords)
    if (typeof SONG_CHARTS !== 'undefined' && SONG_CHARTS[song.id] && SONG_CHARTS[song.id].length > 0) {
      const chartData = SONG_CHARTS[song.id];
      const maxTime = Math.max(song.offset || 1.0, totalDuration - 2.5);

      chartData.forEach((entry, idx) => {
        const time = (typeof entry.time === 'number') ? entry.time : entry[0];
        const lane = (typeof entry.note === 'number') ? entry.note : ((typeof entry.lane === 'number') ? entry.lane : entry[1]);
        if (time < maxTime) {
          rhythmChartNotes.push({
            id: idx,
            lane: lane,
            targetTime: parseFloat(time.toFixed(3)),
            hit: false,
            missed: false,
            y: -100,
            height: 38
          });
        }
      });

      // Sort chronologically and re-index
      rhythmChartNotes.sort((a, b) => a.targetTime - b.targetTime);
      rhythmChartNotes.forEach((n, idx) => { n.id = idx; });
      rhythmTotalNotes = rhythmChartNotes.length;
      return;
    }

    // 2. Fallback: algorithmic generation
    const bpm = song.bpm || 100;
    const beatSec = 60 / bpm;
    const startSec = song.offset || 1.0;
    const endSec = Math.max(startSec + 10, totalDuration - 3.5);

    let patternIdx = 0;
    let seqIdx = 0;
    let lastLane = -1;
    let noteId = 0;
    let t = startSec;
    let measureIndex = 0;

    const isHighEnergy = (song.difficulty === 'Hard' || song.difficulty === 'Expert');

    while (t < endSec) {
      for (let b = 0; b < 4; b++) {
        const beatTime = t + (b * beatSec);
        if (beatTime >= endSec) break;

        if (measureIndex < 2) {
          if (b !== 0 && b !== 2) continue;
        }

        const isPhraseRest = (!isHighEnergy && measureIndex % 4 === 3 && b === 3);
        if (isPhraseRest) continue;

        const currentSeq = MELODIC_SEQUENCES[patternIdx % MELODIC_SEQUENCES.length];
        let lane = currentSeq[seqIdx % currentSeq.length];
        seqIdx++;
        if (seqIdx >= currentSeq.length) {
          seqIdx = 0;
          patternIdx++;
        }

        if (lane === lastLane) {
          lane = (lane + 1) % 4;
        }
        lastLane = lane;

        rhythmChartNotes.push({
          id: noteId++,
          lane: lane,
          targetTime: parseFloat(beatTime.toFixed(3)),
          hit: false,
          missed: false,
          y: -100,
          height: 38
        });

        const isChorus = (measureIndex % 8 >= 4);
        if ((isHighEnergy || isChorus) && (b === 1 || b === 2) && Math.random() < (isHighEnergy ? 0.45 : 0.25)) {
          const offBeatTime = beatTime + (beatSec * 0.5);
          if (offBeatTime < endSec) {
            const secondLane = (lane + 2) % 4;
            rhythmChartNotes.push({
              id: noteId++,
              lane: secondLane,
              targetTime: parseFloat(offBeatTime.toFixed(3)),
              hit: false,
              missed: false,
              y: -100,
              height: 38
            });
            lastLane = secondLane;
          }
        }
      }

      measureIndex++;
      t += beatSec * 4;
    }

    rhythmChartNotes.sort((a, b) => a.targetTime - b.targetTime);
    rhythmChartNotes.forEach((n, idx) => { n.id = idx; });
    rhythmTotalNotes = rhythmChartNotes.length;
  }

  function appendEndlessBeatNotes(song, fromTime) {
    const bpm = song.bpm || 100;
    const beatSec = 60 / bpm;
    let t = fromTime + beatSec;
    const horizon = fromTime + 15.0; // 15 seconds ahead
    let noteId = rhythmChartNotes.length;
    let lastLane = (rhythmChartNotes.length > 0) ? rhythmChartNotes[rhythmChartNotes.length - 1].lane : 0;

    let pIdx = Math.floor(Math.random() * MELODIC_SEQUENCES.length);
    let sIdx = 0;

    while (t < horizon) {
      const seq = MELODIC_SEQUENCES[pIdx % MELODIC_SEQUENCES.length];
      let lane = seq[sIdx % seq.length];
      sIdx++;
      if (sIdx >= seq.length) {
        sIdx = 0;
        pIdx++;
      }
      if (lane === lastLane) lane = (lane + 1) % 4;
      lastLane = lane;

      rhythmChartNotes.push({
        id: noteId++,
        lane: lane,
        targetTime: parseFloat(t.toFixed(3)),
        hit: false,
        missed: false,
        y: -100,
        height: 38
      });

      t += beatSec;
    }
  }

  // =========================================================================
  // HIGH-PRECISION AUDIO CLOCK & HARDWARE LATENCY CALIBRATION (Web Audio API)
  // =========================================================================
  function getCalibratedRhythmAudioTime() {
    const ctx = getRhythmAudioContext();
    if (rhythmIsUsingRealAudio && rhythmAudio && !rhythmAudio.paused) {
      let rawTime = rhythmAudio.currentTime || 0;

      // Ultra-smooth hardware clock tied directly to AudioContext sample clock
      if (ctx && rhythmAudioCtxStartTime > 0) {
        const ctxElapsed = ctx.currentTime - rhythmAudioCtxStartTime;
        const estimatedTime = rhythmAudioBaseTime + ctxElapsed;

        // Auto drift-correction: keep Web Audio clock aligned with audio stream position
        if (Math.abs(estimatedTime - rawTime) < 0.050) {
          rawTime = estimatedTime;
        } else {
          rhythmAudioCtxStartTime = ctx.currentTime;
          rhythmAudioBaseTime = rhythmAudio.currentTime || 0;
          rawTime = rhythmAudio.currentTime || 0;
        }
      }

      // Output buffer latency compensation (audioContext.outputLatency)
      const hardwareLatency = (ctx && typeof ctx.outputLatency === 'number' && ctx.outputLatency > 0)
        ? ctx.outputLatency
        : RHYTHM_LATENCY_COMPENSATION;
      const compensatedTime = Math.max(0, rawTime - hardwareLatency);

      if (rhythmMode === 'endless') {
        const selectedSong = RHYTHM_SONGS.find(s => s.id === rhythmSelectedSongId) || RHYTHM_SONGS[0];
        const loopDur = selectedSong.actualDuration || selectedSong.duration || 180;
        return (rhythmEndlessLoopCount * loopDur) + compensatedTime;
      }
      return compensatedTime;
    }

    // Fallback: Web Audio Synth or countdown
    if (ctx && rhythmAudioCtxStartTime > 0) {
      return Math.max(0, ctx.currentTime - rhythmAudioCtxStartTime);
    }
    return (Date.now() - rhythmSongStartTime) / 1000;
  }

  function updateRhythmPhysics() {
    const selectedSong = RHYTHM_SONGS.find(s => s.id === rhythmSelectedSongId) || RHYTHM_SONGS[0];
    const now = Date.now();

    // Track endless mode audio loop transitions
    if (rhythmMode === 'endless' && rhythmAudio) {
      const rawAudioTime = rhythmAudio.currentTime || 0;
      if (rawAudioTime < rhythmEndlessLastAudioTime - 3.0) {
        rhythmEndlessLoopCount++;
      }
      rhythmEndlessLastAudioTime = rawAudioTime;
    }

    // Master High-Resolution Calibrated Audio Clock
    const currentAudioSec = getCalibratedRhythmAudioTime();

    rhythmSongElapsed = currentAudioSec;
    const actualDuration = selectedSong.actualDuration || selectedSong.duration;

    // Approach Time (falling duration in seconds)
    // 1.5s gives a comfortable, natural reading tempo (matching Piano Tiles)
    let approachTime = 1.5;
    if (selectedSong.difficulty === 'Easy') approachTime = 1.65;
    else if (selectedSong.difficulty === 'Hard') approachTime = 1.35;
    else if (selectedSong.difficulty === 'Expert') approachTime = 1.2;

    if (rhythmMode === 'endless') {
      approachTime = Math.max(0.75, approachTime / rhythmEndlessSpeed);
    }

    const judgmentY = rhythmCanvas.height - 70;
    const startY = -45;
    const travelDistance = judgmentY - startY;

    // Synchronize note positions with audio clock
    for (let i = 0; i < rhythmChartNotes.length; i++) {
      const note = rhythmChartNotes[i];
      if (note.hit) continue;

      const timeUntilHit = note.targetTime - currentAudioSec;

      // Note hasn't entered visible area yet
      if (timeUntilHit > approachTime) {
        continue;
      }

      // Exact mathematical position: the bottom leading edge lands precisely on judgmentY at timeUntilHit = 0!
      const progress = (approachTime - timeUntilHit) / approachTime;
      note.y = (startY + (progress * travelDistance)) - note.height;

      // Miss Detection: Passed line by more than 0.20s (~200ms)
      if (!note.missed && timeUntilHit < -0.20) {
        note.missed = true;
        handleNoteMiss();
      }
    }

    // Endless mode lookahead expansion
    if (rhythmMode === 'endless') {
      const lastNote = rhythmChartNotes[rhythmChartNotes.length - 1];
      if (!lastNote || (lastNote.targetTime - currentAudioSec) < 8.0) {
        appendEndlessBeatNotes(selectedSong, lastNote ? lastNote.targetTime : currentAudioSec);
      }
      rhythmEndlessSpeed = 1.0 + Math.min(1.8, Math.floor(rhythmScore / 150) * 0.08);
      if (rhythmSpeedTagEl) {
        rhythmSpeedTagEl.textContent = `Kecepatan: ${rhythmEndlessSpeed.toFixed(1)}x`;
      }
    }

    // Update Particles
    for (let i = rhythmParticles.length - 1; i >= 0; i--) {
      const p = rhythmParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.alpha -= 0.025;
      if (p.alpha <= 0) rhythmParticles.splice(i, 1);
    }

    // Update HUD Progress & Time
    if (rhythmMode === 'full') {
      const pct = Math.min(100, (currentAudioSec / actualDuration) * 100);
      if (rhythmProgressFill) rhythmProgressFill.style.width = `${pct}%`;
      if (rhythmProgressText) {
        rhythmProgressText.textContent = `${formatMinutes(currentAudioSec)} / ${formatMinutes(actualDuration)}`;
      }

      // Check if all notes are done
      const lastNote = rhythmChartNotes[rhythmChartNotes.length - 1];
      const allNotesFinished = lastNote && (currentAudioSec >= lastNote.targetTime + 1.2);

      // Victory Condition: All notes cleared and audio ended/near completion
      if ((currentAudioSec >= actualDuration - 0.5) || (rhythmAudio && rhythmAudio.ended) || allNotesFinished) {
        triggerRhythmVictory();
        return;
      }
    }
  }

  // RENDER RHYTHM STAGE
  function renderRhythmStage() {
    const w = rhythmCanvas.width;
    const h = rhythmCanvas.height;
    const laneWidth = w / 4;
    const judgmentY = h - 70;

    // 1. Dark Gradient Cosmic Background
    const bgGrad = rhythmCtx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#060810');
    bgGrad.addColorStop(1, '#0e1222');
    rhythmCtx.fillStyle = bgGrad;
    rhythmCtx.fillRect(0, 0, w, h);

    // 2. 4 Vertical Lanes with Neon Divider Lines
    rhythmCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    rhythmCtx.lineWidth = 1.5;

    for (let i = 1; i < 4; i++) {
      const lx = i * laneWidth;
      rhythmCtx.beginPath();
      rhythmCtx.moveTo(lx, 0);
      rhythmCtx.lineTo(lx, h);
      rhythmCtx.stroke();
    }

    // Lane Subtle Track Glow
    for (let i = 0; i < 4; i++) {
      const lx = i * laneWidth;
      const isPressed = rhythmLaneBtns[i] && rhythmLaneBtns[i].classList.contains('pressed');
      if (isPressed) {
        rhythmCtx.fillStyle = (rhythmPlayer === 'rachel') ? 'rgba(236, 72, 153, 0.15)' : 'rgba(56, 189, 248, 0.15)';
        rhythmCtx.fillRect(lx, 0, laneWidth, h);
      }
    }

    // 3. Glowing Judgment Line with subtle beat pulse!
    const selectedSong = RHYTHM_SONGS.find(s => s.id === rhythmSelectedSongId) || RHYTHM_SONGS[0];
    const beatSec = 60 / (selectedSong.bpm || 110);
    const timeSinceOffset = Math.max(0, rhythmSongElapsed - (selectedSong.offset || 0));
    const beatPhase = (timeSinceOffset % beatSec) / beatSec;
    const isBeatPulse = (beatPhase < 0.22);

    rhythmCtx.save();
    rhythmCtx.strokeStyle = isBeatPulse ? 'rgba(255, 225, 80, 0.95)' : 'rgba(245, 197, 24, 0.75)';
    rhythmCtx.lineWidth = isBeatPulse ? 4.5 : 3;
    rhythmCtx.shadowColor = '#f5c518';
    rhythmCtx.shadowBlur = isBeatPulse ? 20 : 12;
    rhythmCtx.beginPath();
    rhythmCtx.moveTo(0, judgmentY);
    rhythmCtx.lineTo(w, judgmentY);
    rhythmCtx.stroke();
    rhythmCtx.restore();

    // Small targets on judgment line for each lane
    for (let i = 0; i < 4; i++) {
      const cx = (i * laneWidth) + (laneWidth / 2);
      rhythmCtx.save();
      rhythmCtx.fillStyle = isBeatPulse ? 'rgba(255, 230, 100, 0.95)' : 'rgba(245, 197, 24, 0.5)';
      rhythmCtx.beginPath();
      rhythmCtx.arc(cx, judgmentY, isBeatPulse ? 7 : 5, 0, Math.PI * 2);
      rhythmCtx.fill();
      rhythmCtx.restore();
    }

    // 4. Render Falling Piano Tiles from rhythmChartNotes
    rhythmChartNotes.forEach(note => {
      if (note.hit || note.y < -45 || note.y > h + 45) return;

      const lx = (note.lane * laneWidth) + 4;
      const tileW = laneWidth - 8;
      const tileH = note.height;

      rhythmCtx.save();

      // Tile Gradient based on Player Character
      const tileGrad = rhythmCtx.createLinearGradient(lx, note.y, lx, note.y + tileH);
      if (rhythmPlayer === 'rachel') {
        tileGrad.addColorStop(0, '#ec4899');
        tileGrad.addColorStop(0.5, '#a855f7');
        tileGrad.addColorStop(1, '#581c87');
        rhythmCtx.strokeStyle = '#f472b6';
        rhythmCtx.shadowColor = 'rgba(236, 72, 153, 0.6)';
      } else {
        tileGrad.addColorStop(0, '#38bdf8');
        tileGrad.addColorStop(0.5, '#2563eb');
        tileGrad.addColorStop(1, '#1e3a8a');
        rhythmCtx.strokeStyle = '#60a5fa';
        rhythmCtx.shadowColor = 'rgba(56, 189, 248, 0.6)';
      }

      rhythmCtx.shadowBlur = 8;
      rhythmCtx.fillStyle = tileGrad;
      rhythmCtx.lineWidth = 2;

      // Rounded Capsule Tile
      rhythmCtx.beginPath();
      safeRoundRect(rhythmCtx, lx, note.y, tileW, tileH, 8);
      rhythmCtx.fill();
      rhythmCtx.stroke();

      // Sleek Inner Highlight Line
      rhythmCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      rhythmCtx.beginPath();
      safeRoundRect(rhythmCtx, lx + 4, note.y + 4, tileW - 8, 4, 2);
      rhythmCtx.fill();

      // Glowing Leading Hit Edge at bottom of tile
      rhythmCtx.fillStyle = '#ffffff';
      rhythmCtx.shadowColor = '#ffffff';
      rhythmCtx.shadowBlur = 6;
      rhythmCtx.fillRect(lx + 4, note.y + tileH - 3, tileW - 8, 3);

      // Mini symbol in center of tile
      rhythmCtx.fillStyle = '#ffffff';
      rhythmCtx.font = 'bold 12px sans-serif';
      rhythmCtx.textAlign = 'center';
      rhythmCtx.textBaseline = 'middle';
      const tileIcon = (note.lane === 0) ? '🎵' : (note.lane === 1) ? '✨' : (note.lane === 2) ? '💖' : '🌟';
      rhythmCtx.fillText(tileIcon, lx + tileW / 2, note.y + tileH / 2);

      rhythmCtx.restore();
    });

    // 5. Render Hit Particles
    rhythmParticles.forEach(p => {
      rhythmCtx.save();
      rhythmCtx.globalAlpha = Math.max(0, p.alpha);
      rhythmCtx.fillStyle = p.color;
      rhythmCtx.beginPath();
      rhythmCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      rhythmCtx.fill();
      rhythmCtx.restore();
    });
  }

  // HIT DETECTION & JUDGMENT LOGIC (Fix 5: Good +1, Great +2, Perfect +3 & Fix 6: Combo addition)
  function handleLanePress(laneIndex) {
    if (!rhythmGameActive) return;

    // Animate lane button pressed state
    const btn = rhythmLaneBtns[laneIndex];
    if (btn) {
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 120);
    }

    // Read calibrated audio clock for exact sample-accurate hit judgment
    const currentAudioSec = getCalibratedRhythmAudioTime();

    const judgmentY = rhythmCanvas.height - 70;
    const laneWidth = rhythmCanvas.width / 4;
    const hitX = (laneIndex * laneWidth) + (laneWidth / 2);

    // Find the closest unhit note in this lane within the hit window
    let closestNote = null;
    let minTimeDiff = Infinity;

    for (let i = 0; i < rhythmChartNotes.length; i++) {
      const note = rhythmChartNotes[i];
      if (note.lane === laneIndex && !note.hit && !note.missed) {
        const timeDiff = Math.abs(currentAudioSec - note.targetTime);
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestNote = note;
        }
      }
    }

    // Hit Window: up to 0.24s (240ms)
    if (closestNote && minTimeDiff <= 0.24) {
      // NOTE HIT!
      closestNote.hit = true;
      playPianoTileSound(laneIndex, Math.min(12, Math.floor(rhythmCombo / 10)));

      let basePoints = 0;
      let judgment = '';
      let color = '#fbbf24';

      if (minTimeDiff <= 0.075) {
        // PERFECT! (within 75ms of beat) -> +3 points
        basePoints = 3;
        judgment = 'PERFECT!';
        color = '#fbbf24';
        rhythmCountPerfect++;
        spawnHitParticles(hitX, judgmentY, '#fbbf24', 16);
      } else if (minTimeDiff <= 0.150) {
        // GREAT! (within 150ms of beat) -> +2 points
        basePoints = 2;
        judgment = 'GREAT!';
        color = '#ec4899';
        rhythmCountGreat++;
        spawnHitParticles(hitX, judgmentY, '#ec4899', 10);
      } else {
        // GOOD! (within 240ms of beat) -> +1 point
        basePoints = 1;
        judgment = 'GOOD!';
        color = '#38bdf8';
        rhythmCountGood++;
        spawnHitParticles(hitX, judgmentY, '#38bdf8', 6);
      }

      rhythmCombo++;
      if (rhythmCombo > rhythmMaxCombo) rhythmMaxCombo = rhythmCombo;

      // Score formula: Base points (+1/+2/+3) + current combo bonus (if combo > 1)
      const comboBonus = (rhythmCombo > 1) ? rhythmCombo : 0;
      const earnedPoints = basePoints + comboBonus;
      rhythmScore += earnedPoints;

      if (rhythmCurrentScoreEl) rhythmCurrentScoreEl.textContent = rhythmScore.toLocaleString('id-ID');
      showJudgmentPop(`${judgment} +${earnedPoints} ✨`, color);
      updateComboDisplay();

    } else {
      // Ghost tap on empty track (silent to avoid discordant noises)
    }
  }

  function handleNoteMiss() {
    playMissSound();
    rhythmCountMiss++;
    rhythmCombo = 0;
    updateComboDisplay();
    showJudgmentPop('MISS! ❌', '#ef4444');

    if (rhythmMode === 'endless') {
      rhythmEndlessLives--;
      if (rhythmHeartsEl) {
        rhythmHeartsEl.textContent = '❤️'.repeat(Math.max(0, rhythmEndlessLives)) + '💔'.repeat(Math.max(0, 3 - rhythmEndlessLives));
      }

      if (rhythmEndlessLives <= 0) {
        triggerRhythmGameOver();
      }
    }
  }

  function showJudgmentPop(text, color) {
    if (!rhythmJudgmentPop) return;
    rhythmJudgmentPop.textContent = text;
    rhythmJudgmentPop.className = 'rhythm-judgment-pop';
    if (text.includes('PERFECT')) rhythmJudgmentPop.classList.add('perfect');
    else if (text.includes('GREAT')) rhythmJudgmentPop.classList.add('great');
    else if (text.includes('GOOD')) rhythmJudgmentPop.classList.add('good');
    else if (text.includes('MISS')) rhythmJudgmentPop.classList.add('miss');

    rhythmJudgmentPop.style.display = 'block';
    setTimeout(() => {
      if (rhythmJudgmentPop) rhythmJudgmentPop.style.display = 'none';
    }, 450);
  }

  function updateComboDisplay() {
    if (!rhythmComboBanner || !rhythmComboCountEl) return;
    if (rhythmCombo >= 2) {
      rhythmComboBanner.style.display = 'flex';
      rhythmComboCountEl.textContent = rhythmCombo;
    } else {
      rhythmComboBanner.style.display = 'none';
    }
  }

  function spawnHitParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      rhythmParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color: color,
        alpha: 1.0,
        radius: Math.random() * 3 + 1.5
      });
    }
  }

  // Keyboard Controls (D, F, J, K / A, S, K, L / 1, 2, 3, 4)
  window.addEventListener('keydown', (e) => {
    if (!rhythmGameActive) return;

    if (e.code === 'KeyD' || e.code === 'KeyA' || e.code === 'Digit1') {
      e.preventDefault();
      handleLanePress(0);
    } else if (e.code === 'KeyF' || e.code === 'KeyS' || e.code === 'Digit2') {
      e.preventDefault();
      handleLanePress(1);
    } else if (e.code === 'KeyJ' || e.code === 'Digit3') {
      e.preventDefault();
      handleLanePress(2);
    } else if (e.code === 'KeyK' || e.code === 'KeyL' || e.code === 'Digit4') {
      e.preventDefault();
      handleLanePress(3);
    }
  });

  // Touch Buttons Handlers
  rhythmLaneBtns.forEach((btn, idx) => {
    if (btn) {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        handleLanePress(idx);
      });
    }
  });

  // Canvas Direct Click / Touch Fallback
  if (rhythmCanvas) {
    rhythmCanvas.addEventListener('pointerdown', (e) => {
      if (!rhythmGameActive) return;
      const rect = rhythmCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const laneWidth = rhythmCanvas.width / 4;
      const lane = Math.min(3, Math.max(0, Math.floor(x / laneWidth)));
      handleLanePress(lane);
    });
  }

  // VICTORY & GAME OVER MODALS (Fix 4: records stored per song & per mode)
  function triggerRhythmVictory() {
    endRhythmSession(true);
  }

  function triggerRhythmGameOver() {
    endRhythmSession(false);
  }

  function endRhythmSession(isCompleted) {
    rhythmGameActive = false;
    if (rhythmAnimFrameId) cancelAnimationFrame(rhythmAnimFrameId);
    stopRhythmAudio();

    const curSong = RHYTHM_SONGS.find(s => s.id === rhythmSelectedSongId) || RHYTHM_SONGS[0];
    const isNewHigh = setRhythmSongHighScore(curSong.id, rhythmMode, rhythmPlayer, rhythmScore);
    const high = getRhythmSongHighScore(curSong.id, rhythmMode, rhythmPlayer);

    // Calculate Accuracy
    const totalHits = rhythmCountPerfect + rhythmCountGreat + rhythmCountGood;
    const totalJudged = totalHits + rhythmCountMiss;
    let accuracyPct = 100;
    if (totalJudged > 0) {
      const accuracyPoints = (rhythmCountPerfect * 1.0) + (rhythmCountGreat * 0.7) + (rhythmCountGood * 0.4);
      accuracyPct = ((accuracyPoints / totalJudged) * 100);
    }

    if (rhythmFinalScore) rhythmFinalScore.textContent = rhythmScore.toLocaleString('id-ID');
    if (rhythmFinalCombo) rhythmFinalCombo.textContent = `${rhythmMaxCombo}x`;
    if (rhythmFinalAccuracy) rhythmFinalAccuracy.textContent = `${accuracyPct.toFixed(1)}%`;
    if (rhythmModalHighscore) rhythmModalHighscore.textContent = high.toLocaleString('id-ID');

    if (rhythmCountPerfectEl) rhythmCountPerfectEl.textContent = rhythmCountPerfect;
    if (rhythmCountGreatEl) rhythmCountGreatEl.textContent = rhythmCountGreat;
    if (rhythmCountGoodEl) rhythmCountGoodEl.textContent = rhythmCountGood;
    if (rhythmCountMissEl) rhythmCountMissEl.textContent = rhythmCountMiss;

    // Stars & Verdict
    let stars = '⭐⭐⭐⭐⭐';
    let title = 'Virtuoso Cinta Sejati! 🌟';
    let verdict = '';

    if (isCompleted) {
      if (accuracyPct >= 95) {
        stars = '⭐⭐⭐⭐⭐';
        title = 'Virtuoso Cinta Sejati! 👑✨';
        verdict = (rhythmPlayer === 'rachel')
          ? `Luar biasa sempurna! Sihir melodi biologi & aura kosmik EXO milik Rachel memikat semesta cinta kita di lagu ${curSong.title}!`
          : `Refleks fisikawan tanpa tandingan! Elang memainkan alunan melodi cinta di lagu ${curSong.title} dengan presisi sempurna!`;
      } else if (accuracyPct >= 85) {
        stars = '⭐⭐⭐⭐';
        title = 'Pemusik Cinta Berbakat! 🎹💖';
        verdict = `Permainan musik yang begitu manis dan memukau di lagu ${curSong.title}! Harmoni dua semesta mengalun indah!`;
      } else {
        stars = '⭐⭐⭐';
        title = 'Alunan Penuh Cinta! 🎶';
        verdict = `Lagu ${curSong.title} berhasil diselesaikan dengan baik! Yang terpenting alunan musiknya mengisi hati kita!`;
      }
    } else {
      stars = '⭐⭐';
      title = 'Bertahan dengan Gagah! ⚡';
      verdict = `Kecepatan ubin lagu ${curSong.title} tanpa batas memang menantang! Semangat pantang menyerahmu sungguh mengagumkan!`;
    }

    if (rhythmResultStars) rhythmResultStars.textContent = stars;
    if (rhythmResultTitle) rhythmResultTitle.textContent = title;
    if (rhythmResultVerdict) rhythmResultVerdict.textContent = verdict;

    if (rhythmNewRecordBadge) {
      if (isNewHigh && rhythmScore > 0) {
        rhythmNewRecordBadge.style.display = 'inline-block';
        if (window.confetti) {
          window.confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } });
        }
        playBonusChime();
      } else {
        rhythmNewRecordBadge.style.display = 'none';
      }
    }

    if (rhythmResultModal) {
      rhythmResultModal.style.display = 'flex';
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // Initial render of Cosmic Beats
  renderRhythmSongList('', 'all');
  updateRhythmHighScoresUI();

  // ==================== 8. COSMIC DROP: LOVE SYNTHESIS (SUIKA PLANET DROP & MERGE) ====================
  const SUIKA_PLANETS = [
    {
      level: 0,
      name: 'Merkurius',
      symbol: '⚪',
      radius: 17,
      color: '#94a3b8',
      secondaryColor: '#cbd5e1',
      score: 2,
      desc: 'Planet terkecil & terdekat dengan surya'
    },
    {
      level: 1,
      name: 'Mars',
      symbol: '🔴',
      radius: 24,
      color: '#ef4444',
      secondaryColor: '#f87171',
      score: 4,
      desc: 'Planet merah gurun berdebu'
    },
    {
      level: 2,
      name: 'Venus',
      symbol: '🟡',
      radius: 32,
      color: '#f59e0b',
      secondaryColor: '#fbbf24',
      score: 8,
      desc: 'Bintang kejora dengan atmosfer emas'
    },
    {
      level: 3,
      name: 'Bumi',
      symbol: '🌍',
      radius: 41,
      color: '#3b82f6',
      secondaryColor: '#10b981',
      score: 14,
      desc: 'Samudra biru & benua hijau rumah cinta kita'
    },
    {
      level: 4,
      name: 'Neptunus',
      symbol: '🔵',
      radius: 52,
      color: '#2563eb',
      secondaryColor: '#06b6d4',
      score: 22,
      desc: 'Raksasa es biru kobalt misterius'
    },
    {
      level: 5,
      name: 'Uranus',
      symbol: '🌐',
      radius: 64,
      color: '#06b6d4',
      secondaryColor: '#a5f3fc',
      score: 32,
      desc: 'Planet pirus es dingin'
    },
    {
      level: 6,
      name: 'Saturnus',
      symbol: '🪐',
      radius: 77,
      color: '#eab308',
      secondaryColor: '#fef08a',
      hasRing: true,
      score: 44,
      desc: 'Pesona cincin orbital kosmik yang agung'
    },
    {
      level: 7,
      name: 'Jupiter',
      symbol: '🟠',
      radius: 92,
      color: '#ea580c',
      secondaryColor: '#fed7aa',
      hasSpot: true,
      score: 60,
      desc: 'Raksasa gas terbesar pengawal tata surya'
    },
    {
      level: 8,
      name: 'Matahari',
      symbol: '☀️',
      radius: 108,
      color: '#ffd700',
      secondaryColor: '#f97316',
      isSun: true,
      score: 100,
      desc: 'Puncak sintesis kosmik: kehangatan abadi cinta sejati!'
    }
  ];

  // Game Settings & State
  let suikaPlayer = 'rachel'; // 'rachel' or 'elang'
  let suikaMode = 'target'; // 'target' (Mode Target) or 'endless' (Mode Tanpa Batas)
  let suikaDiff = 'medium'; // 'easy', 'medium', or 'hard'
  let suikaScore = 0;
  let suikaMergesCount = 0;
  let suikaHighestPlanetLevel = 0;
  let suikaCombo = 0;
  let suikaComboTimer = null;

  let suikaBodies = [];
  let suikaParticles = [];
  let suikaPopups = [];
  let suikaCurrentPlanetLevel = 0;
  let suikaNextPlanetLevel = 0;
  let suikaDropperX = 220;
  const suikaDropperY = 44;
  let suikaIsDropCooling = false;
  let suikaDangerTimer = 3.0;
  let suikaDangerActive = false;
  let suikaGameActive = false;
  let suikaAnimFrameId = null;
  let suikaSynthCtx = null;
  let suikaNextBodyId = 1;

  // DOM Elements
  const suikaSelectScreen = document.getElementById('suika-select-screen');
  const suikaPlayScreen = document.getElementById('suika-play-screen');
  const suikaResultModal = document.getElementById('suika-result-modal');

  const suikaCurrentModeLabel = document.getElementById('suika-current-mode-label');
  const suikaCurrentDiffLabel = document.getElementById('suika-current-diff-label');
  const suikaLeadStatus = document.getElementById('suika-lead-status');
  const suikaCrownRachel = document.getElementById('suika-crown-rachel');
  const suikaCrownElang = document.getElementById('suika-crown-elang');
  const suikaHighscoreRachelEl = document.getElementById('suika-highscore-rachel');
  const suikaHighscoreElangEl = document.getElementById('suika-highscore-elang');

  const suikaChooseRachel = document.getElementById('suika-choose-rachel');
  const suikaChooseElang = document.getElementById('suika-choose-elang');
  const suikaModeTarget = document.getElementById('suika-mode-target');
  const suikaModeEndless = document.getElementById('suika-mode-endless');

  const suikaDiffCards = document.querySelectorAll('.suika-diff-card');
  const suikaStartBtn = document.getElementById('suika-start-btn');
  const suikaSecretResetBtn = document.getElementById('suika-secret-reset-btn');

  // In-Game Play Screen Elements
  const suikaHudPlayerHalo = document.getElementById('suika-hud-player-halo');
  const suikaHudPlayerImg = document.getElementById('suika-hud-player-img');
  const suikaHudPlayerName = document.getElementById('suika-hud-player-name');
  const suikaHudModeBadge = document.getElementById('suika-hud-mode-badge');
  const suikaHudDiffBadge = document.getElementById('suika-hud-diff-badge');
  const suikaCurrentScoreEl = document.getElementById('suika-current-score');
  const suikaTargetRecordEl = document.getElementById('suika-target-record');
  const suikaHudTargetLabel = document.getElementById('suika-hud-target-label');
  const suikaQuitBtn = document.getElementById('suika-quit-btn');

  const suikaCurrentPreviewCanvas = document.getElementById('suika-current-preview-canvas');
  const suikaNextPreviewCanvas = document.getElementById('suika-next-preview-canvas');
  const suikaCanvas = document.getElementById('suika-canvas');
  const suikaCtx = suikaCanvas ? suikaCanvas.getContext('2d') : null;
  const suikaDangerAlert = document.getElementById('suika-danger-alert');
  const suikaDangerTimerEl = document.getElementById('suika-danger-timer');

  const suikaCtrlLeft = document.getElementById('suika-ctrl-left');
  const suikaCtrlRight = document.getElementById('suika-ctrl-right');
  const suikaCtrlDrop = document.getElementById('suika-ctrl-drop');

  // Result Modal Elements
  const suikaResultStars = document.getElementById('suika-result-stars');
  const suikaResultTitle = document.getElementById('suika-result-title');
  const suikaResultVerdict = document.getElementById('suika-result-verdict');
  const suikaFinalScore = document.getElementById('suika-final-score');
  const suikaNewRecordBadge = document.getElementById('suika-new-record-badge');
  const suikaFinalPlanet = document.getElementById('suika-final-planet');
  const suikaFinalMerges = document.getElementById('suika-final-merges');
  const suikaModalHighscore = document.getElementById('suika-modal-highscore');
  const suikaRetryBtn = document.getElementById('suika-retry-btn');
  const suikaBackToMenuBtn = document.getElementById('suika-back-to-menu-btn');

  // Audio Synth Helper for Cosmic Drop
  function getSuikaAudioContext() {
    try {
      if (!suikaSynthCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) suikaSynthCtx = new AudioCtx();
      }
      if (suikaSynthCtx && suikaSynthCtx.state === 'suspended') {
        suikaSynthCtx.resume();
      }
      return suikaSynthCtx;
    } catch (e) {
      return null;
    }
  }

  function playSuikaDropSound() {
    try {
      const ctx = getSuikaAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) { }
  }

  let suikaLastMergeSoundTime = 0;

  function playSuikaMergeSound(level) {
    try {
      const ctx = getSuikaAudioContext();
      if (!ctx) return;

      const baseFrequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
      const freq = baseFrequencies[Math.min(level, baseFrequencies.length - 1)];

      const now = ctx.currentTime;
      const startTime = Math.max(now, suikaLastMergeSoundTime + 0.04);
      suikaLastMergeSoundTime = startTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = (level >= 6) ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.18);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.20);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.20);

      // Extra fanfare for Sun (Matahari)
      if (level === 8) {
        setTimeout(() => playBonusChime(), 100);
      }
    } catch (e) { }
  }

  // LocalStorage Highscore Utilities (Mode x Difficulty x Player)
  function getSuikaHighScore(mode, diff, player) {
    try {
      const key = `suika_rec_${mode}_${diff}_${player}`;
      const val = localStorage.getItem(key);
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  function setSuikaHighScore(mode, diff, player, score) {
    try {
      const cur = getSuikaHighScore(mode, diff, player);
      if (score > cur) {
        const key = `suika_rec_${mode}_${diff}_${player}`;
        localStorage.setItem(key, score.toString());
        return true;
      }
    } catch (e) { }
    return false;
  }

  // Target Mode: Highest Planet Level achieved per difficulty & player (Requirement 1)
  function getSuikaTargetMaxPlanet(diff, player) {
    try {
      const key = `suika_target_planet_${diff}_${player}`;
      const val = localStorage.getItem(key);
      return val !== null ? parseInt(val, 10) : -1;
    } catch (e) {
      return -1;
    }
  }

  function setSuikaTargetMaxPlanet(diff, player, level) {
    try {
      const cur = getSuikaTargetMaxPlanet(diff, player);
      if (level > cur) {
        const key = `suika_target_planet_${diff}_${player}`;
        localStorage.setItem(key, level.toString());
        return true;
      }
    } catch (e) { }
    return false;
  }

  // Target Goal Planet in Target Mode (Always Matahari ☀️ Level 8 for all difficulties)
  function getTargetPlanetLevelForDiff(diff) {
    return 8; // Matahari ☀️ (Puncak sintesis kosmik untuk menang di semua level)
  }

  // Update Versus Header UI
  function updateSuikaHighScoresUI() {
    if (suikaCurrentModeLabel) {
      suikaCurrentModeLabel.textContent = (suikaMode === 'target') ? 'Mode Target 🎯' : 'Mode Tanpa Batas ♾️';
    }

    if (suikaCurrentDiffLabel) {
      let diffText = 'Tingkat Sedang (Medium) 🟡';
      if (suikaDiff === 'easy') diffText = 'Tingkat Mudah (Easy) 🟢';
      else if (suikaDiff === 'hard') diffText = 'Tingkat Ahli (Hard) 🔴';
      suikaCurrentDiffLabel.textContent = diffText;
    }

    const rachelScoreLabel = document.getElementById('suika-score-label-rachel');
    const elangScoreLabel = document.getElementById('suika-score-label-elang');

    if (suikaMode === 'target') {
      // TARGET MODE: Tampilkan nama planet tertinggi yang berhasil dicapai (Requirement 1)
      if (rachelScoreLabel) rachelScoreLabel.textContent = 'Planet Tertinggi';
      if (elangScoreLabel) elangScoreLabel.textContent = 'Planet Tertinggi';

      const rachelLvl = getSuikaTargetMaxPlanet(suikaDiff, 'rachel');
      const elangLvl = getSuikaTargetMaxPlanet(suikaDiff, 'elang');

      if (suikaHighscoreRachelEl) {
        suikaHighscoreRachelEl.classList.add('is-planet');
        if (rachelLvl >= 0) {
          const p = SUIKA_PLANETS[rachelLvl] || SUIKA_PLANETS[0];
          suikaHighscoreRachelEl.textContent = `${p.name} ${p.symbol}`;
        } else {
          suikaHighscoreRachelEl.textContent = '—';
        }
      }

      if (suikaHighscoreElangEl) {
        suikaHighscoreElangEl.classList.add('is-planet');
        if (elangLvl >= 0) {
          const p = SUIKA_PLANETS[elangLvl] || SUIKA_PLANETS[0];
          suikaHighscoreElangEl.textContent = `${p.name} ${p.symbol}`;
        } else {
          suikaHighscoreElangEl.textContent = '—';
        }
      }

      // Crown & Lead Status for Target Mode
      if (rachelLvl > elangLvl && rachelLvl >= 0) {
        if (suikaCrownRachel) suikaCrownRachel.style.display = 'block';
        if (suikaCrownElang) suikaCrownElang.style.display = 'none';
        if (suikaLeadStatus) {
          const p = SUIKA_PLANETS[rachelLvl];
          suikaLeadStatus.innerHTML = `<span>👑 Rachel Memimpin! (${p.name} ${p.symbol})</span>`;
        }
      } else if (elangLvl > rachelLvl && elangLvl >= 0) {
        if (suikaCrownRachel) suikaCrownRachel.style.display = 'none';
        if (suikaCrownElang) suikaCrownElang.style.display = 'block';
        if (suikaLeadStatus) {
          const p = SUIKA_PLANETS[elangLvl];
          suikaLeadStatus.innerHTML = `<span>👑 Elang Memimpin! (${p.name} ${p.symbol})</span>`;
        }
      } else if (rachelLvl >= 0 && rachelLvl === elangLvl) {
        if (suikaCrownRachel) suikaCrownRachel.style.display = (rachelLvl === 8) ? 'block' : 'none';
        if (suikaCrownElang) suikaCrownElang.style.display = (elangLvl === 8) ? 'block' : 'none';
        if (suikaLeadStatus) {
          if (rachelLvl === 8) {
            suikaLeadStatus.innerHTML = `<span>☀️ Keduanya Telah Menaklukkan Matahari!</span>`;
          } else {
            const p = SUIKA_PLANETS[rachelLvl];
            suikaLeadStatus.innerHTML = `<span>🤝 Seimbang! Sama-sama mencapai ${p.name} ${p.symbol}</span>`;
          }
        }
      } else {
        if (suikaCrownRachel) suikaCrownRachel.style.display = 'none';
        if (suikaCrownElang) suikaCrownElang.style.display = 'none';
        if (suikaLeadStatus) {
          suikaLeadStatus.innerHTML = `<span>⏳ Belum Ada Rekor</span>`;
        }
      }
    } else {
      // ENDLESS MODE: Tampilkan angka skor tertinggi
      if (rachelScoreLabel) rachelScoreLabel.textContent = 'Rekor Tertinggi';
      if (elangScoreLabel) elangScoreLabel.textContent = 'Rekor Tertinggi';

      const rachelScore = getSuikaHighScore(suikaMode, suikaDiff, 'rachel');
      const elangScore = getSuikaHighScore(suikaMode, suikaDiff, 'elang');

      if (suikaHighscoreRachelEl) {
        suikaHighscoreRachelEl.classList.remove('is-planet');
        suikaHighscoreRachelEl.textContent = rachelScore.toLocaleString('id-ID');
      }
      if (suikaHighscoreElangEl) {
        suikaHighscoreElangEl.classList.remove('is-planet');
        suikaHighscoreElangEl.textContent = elangScore.toLocaleString('id-ID');
      }

      // Crown & Lead Status for Endless Mode
      if (rachelScore > elangScore && rachelScore > 0) {
        if (suikaCrownRachel) suikaCrownRachel.style.display = 'block';
        if (suikaCrownElang) suikaCrownElang.style.display = 'none';
        if (suikaLeadStatus) {
          suikaLeadStatus.innerHTML = `<span>👑 Rachel Memimpin! (+${(rachelScore - elangScore).toLocaleString('id-ID')})</span>`;
        }
      } else if (elangScore > rachelScore && elangScore > 0) {
        if (suikaCrownRachel) suikaCrownRachel.style.display = 'none';
        if (suikaCrownElang) suikaCrownElang.style.display = 'block';
        if (suikaLeadStatus) {
          suikaLeadStatus.innerHTML = `<span>👑 Elang Memimpin! (+${(elangScore - rachelScore).toLocaleString('id-ID')})</span>`;
        }
      } else if (rachelScore > 0 && rachelScore === elangScore) {
        if (suikaCrownRachel) suikaCrownRachel.style.display = 'none';
        if (suikaCrownElang) suikaCrownElang.style.display = 'none';
        if (suikaLeadStatus) {
          suikaLeadStatus.innerHTML = `<span>🤝 Skor Seimbang!</span>`;
        }
      } else {
        if (suikaCrownRachel) suikaCrownRachel.style.display = 'none';
        if (suikaCrownElang) suikaCrownElang.style.display = 'none';
        if (suikaLeadStatus) {
          suikaLeadStatus.innerHTML = `<span>⏳ Belum Ada Rekor</span>`;
        }
      }
    }
  }

  // Track recently dropped planets to power smart patterns
  let suikaRecentDrops = [];

  // Random Planet Generator based on Difficulty
  // All difficulty levels feature Merkurius (0) to Bumi (3).
  // Easy: Pola sangat masuk akal & membantu (sering memberi pasangan kembar / cocok dengan papan).
  // Medium: Pola lebih acak & dinamis.
  // Hard: Pola paling acak (chaos entropy maksimal, sering muncul Bumi/Venus tanpa bantuan kembar).
  function getRandomSuikaPlanetLevel(diff) {
    const lastLevel = (suikaRecentDrops.length > 0) ? suikaRecentDrops[suikaRecentDrops.length - 1] : null;
    let chosenLevel = 0;

    if (diff === 'easy') {
      // EASY: Pola Masuk Akal & Membantu Kombo
      // 1. Peluang tinggi (55%) untuk mengulang planet yang baru dijatuhkan (pasangan kembar)
      const matchCandidate = (lastLevel !== null && lastLevel <= 3) ? lastLevel : null;
      const boardLevels = (suikaBodies && suikaBodies.length > 0)
        ? suikaBodies.filter(b => !b.isMerged && b.level <= 2).map(b => b.level)
        : [];

      const rand = Math.random();
      if (matchCandidate !== null && rand < 0.55) {
        chosenLevel = matchCandidate;
      } else if (boardLevels.length > 0 && rand < 0.80) {
        // Ambil salah satu level planet yang sedang menunggu di toples agar bisa digabung
        chosenLevel = boardLevels[Math.floor(Math.random() * boardLevels.length)];
      } else {
        // Pola distribusi bersahabat: mayoritas planet kecil
        const p = Math.random();
        if (p < 0.50) chosenLevel = 0;      // Merkurius 50%
        else if (p < 0.80) chosenLevel = 1; // Mars 30%
        else if (p < 0.94) chosenLevel = 2; // Venus 14%
        else chosenLevel = 3;               // Bumi 6%
      }
    } else if (diff === 'medium') {
      // MEDIUM: Pola Lebih Acak (Variasi Seimbang Moderat)
      const rand = Math.random();
      // 22% peluang memberi pasangan kembar
      if (lastLevel !== null && lastLevel <= 3 && rand < 0.22) {
        chosenLevel = lastLevel;
      } else {
        const p = Math.random();
        if (p < 0.38) chosenLevel = 0;      // Merkurius 38%
        else if (p < 0.70) chosenLevel = 1; // Mars 32%
        else if (p < 0.88) chosenLevel = 2; // Venus 18%
        else chosenLevel = 3;               // Bumi 12%
      }
    } else {
      // HARD: Pola Paling Acak (Chaos Entropy Maksimal)
      // Keacakan murni tanpa pola bantuan pasangan kembar!
      // Bumi dan Venus sering muncul sehingga cepat memadati toples.
      const p = Math.random();
      if (p < 0.26) chosenLevel = 0;      // Merkurius 26%
      else if (p < 0.52) chosenLevel = 1; // Mars 26%
      else if (p < 0.76) chosenLevel = 2; // Venus 24%
      else chosenLevel = 3;               // Bumi 24%
    }

    // Catat riwayat untuk pola selanjutnya
    suikaRecentDrops.push(chosenLevel);
    if (suikaRecentDrops.length > 10) suikaRecentDrops.shift();

    return chosenLevel;
  }

  // Draw Planet Preview in Mini Canvases
  function renderPlanetPreview(canvas, level) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const planet = SUIKA_PLANETS[level] || SUIKA_PLANETS[0];
    const previewScale = Math.min(1.0, 16 / planet.radius);
    const r = Math.max(10, Math.min(18, planet.radius * previewScale));

    ctx.save();
    ctx.translate(w / 2, h / 2);
    drawSinglePlanetBody(ctx, 0, 0, planet, r);
    ctx.restore();
  }

  // Draw Single Planet with authentic celestial gradient, textures & kawaii sparkle
  function drawSinglePlanetBody(ctx, x, y, planet, r) {
    ctx.save();

    // 1. Saturn Ring (drawn behind and in front of body)
    if (planet.hasRing) {
      ctx.save();
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
      ctx.lineWidth = Math.max(3, r * 0.18);
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.5, r * 0.4, -Math.PI / 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Solar Flare Glow for Sun (Matahari)
    if (planet.isSun) {
      ctx.save();
      const sunPulse = 1.0 + Math.sin(Date.now() / 200) * 0.08;
      const sunGlow = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 1.35 * sunPulse);
      sunGlow.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
      sunGlow.addColorStop(0.5, 'rgba(249, 115, 22, 0.4)');
      sunGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.35 * sunPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Planet Main Sphere (Hardware Accelerated Without Expensive ShadowBlur)
    const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, planet.color);
    grad.addColorStop(1, planet.secondaryColor || '#000000');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Fast luminous celestial atmosphere rim
    ctx.strokeStyle = planet.color;
    ctx.lineWidth = Math.max(1.2, r * 0.08);
    ctx.globalAlpha = 0.55;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 4. Special Celestial Textures / Continents / Bands
    if (planet.name === 'Bumi') {
      // Earth Continents
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(x - r * 0.25, y - r * 0.1, r * 0.4, 0, Math.PI * 2);
      ctx.arc(x + r * 0.25, y + r * 0.25, r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Soft swirling clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(x + r * 0.1, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else if (planet.name === 'Jupiter' || planet.hasSpot) {
      // Jupiter Banded Stripes
      ctx.fillStyle = 'rgba(254, 215, 170, 0.35)';
      ctx.fillRect(x - r * 0.9, y - r * 0.25, r * 1.8, r * 0.2);
      ctx.fillRect(x - r * 0.85, y + r * 0.15, r * 1.7, r * 0.22);
      // Great Red Spot
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.ellipse(x + r * 0.35, y + r * 0.25, r * 0.22, r * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (planet.name === 'Mars') {
      // Mars Polar Ice Cap
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y - r * 0.8, r * 0.22, 0, Math.PI);
      ctx.fill();
    } else if (planet.name === 'Merkurius') {
      // Craters
      ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y + r * 0.2, r * 0.18, 0, Math.PI * 2);
      ctx.arc(x + r * 0.25, y - r * 0.25, r * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Kawaii Cute Shine Reflections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.35, Math.max(2, r * 0.16), 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - r * 0.18, y - r * 0.48, Math.max(1, r * 0.08), 0, Math.PI * 2);
    ctx.fill();

    // 6. Name Label / Symbol inside planet if large enough
    if (r >= 38) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.floor(r * 0.32)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(planet.name, x, y + r * 0.2);
    }

    ctx.restore();
  }

  // Lobby Interactions & Selectors
  if (suikaChooseRachel) {
    suikaChooseRachel.addEventListener('click', () => {
      suikaPlayer = 'rachel';
      suikaChooseRachel.classList.add('active');
      if (suikaChooseElang) suikaChooseElang.classList.remove('active');
      const rIcon = suikaChooseRachel.querySelector('.suika-char-radio-icon');
      const eIcon = suikaChooseElang ? suikaChooseElang.querySelector('.suika-char-radio-icon') : null;
      if (rIcon) rIcon.innerHTML = '<i data-lucide="check-circle-2"></i>';
      if (eIcon) eIcon.innerHTML = '<i data-lucide="circle"></i>';
      if (window.lucide) window.lucide.createIcons();
    });
  }

  if (suikaChooseElang) {
    suikaChooseElang.addEventListener('click', () => {
      suikaPlayer = 'elang';
      suikaChooseElang.classList.add('active');
      if (suikaChooseRachel) suikaChooseRachel.classList.remove('active');
      const rIcon = suikaChooseRachel ? suikaChooseRachel.querySelector('.suika-char-radio-icon') : null;
      const eIcon = suikaChooseElang.querySelector('.suika-char-radio-icon');
      if (eIcon) eIcon.innerHTML = '<i data-lucide="check-circle-2"></i>';
      if (rIcon) rIcon.innerHTML = '<i data-lucide="circle"></i>';
      if (window.lucide) window.lucide.createIcons();
    });
  }

  if (suikaModeTarget) {
    suikaModeTarget.addEventListener('click', () => {
      suikaMode = 'target';
      suikaModeTarget.classList.add('active');
      if (suikaModeEndless) suikaModeEndless.classList.remove('active');
      const tIcon = suikaModeTarget.querySelector('.suika-mode-radio-icon');
      const eIcon = suikaModeEndless ? suikaModeEndless.querySelector('.suika-mode-radio-icon') : null;
      if (tIcon) tIcon.innerHTML = '<i data-lucide="check-circle-2"></i>';
      if (eIcon) eIcon.innerHTML = '<i data-lucide="circle"></i>';
      updateSuikaHighScoresUI();
      if (window.lucide) window.lucide.createIcons();
    });
  }

  if (suikaModeEndless) {
    suikaModeEndless.addEventListener('click', () => {
      suikaMode = 'endless';
      suikaModeEndless.classList.add('active');
      if (suikaModeTarget) suikaModeTarget.classList.remove('active');
      const tIcon = suikaModeTarget ? suikaModeTarget.querySelector('.suika-mode-radio-icon') : null;
      const eIcon = suikaModeEndless.querySelector('.suika-mode-radio-icon');
      if (eIcon) eIcon.innerHTML = '<i data-lucide="check-circle-2"></i>';
      if (tIcon) tIcon.innerHTML = '<i data-lucide="circle"></i>';
      updateSuikaHighScoresUI();
      if (window.lucide) window.lucide.createIcons();
    });
  }

  suikaDiffCards.forEach(card => {
    card.addEventListener('click', () => {
      suikaDiffCards.forEach(c => {
        c.classList.remove('active');
        const icon = c.querySelector('.suika-diff-radio-icon');
        if (icon) icon.innerHTML = '<i data-lucide="circle"></i>';
      });
      card.classList.add('active');
      const icon = card.querySelector('.suika-diff-radio-icon');
      if (icon) icon.innerHTML = '<i data-lucide="check-circle-2"></i>';

      suikaDiff = card.getAttribute('data-diff') || 'medium';
      updateSuikaHighScoresUI();
      if (window.lucide) window.lucide.createIcons();
    });
  });

  // START SUIKA GAME
  function startSuikaGame() {
    if (suikaSelectScreen) suikaSelectScreen.style.display = 'none';
    if (suikaResultModal) suikaResultModal.style.display = 'none';
    if (suikaPlayScreen) suikaPlayScreen.style.display = 'block';

    resizeSuikaCanvas();

    // Reset State
    suikaScore = 0;
    suikaMergesCount = 0;
    suikaHighestPlanetLevel = 0;
    suikaCombo = 0;
    suikaBodies = [];
    suikaParticles = [];
    suikaPopups = [];
    suikaRecentDrops = [];
    suikaDangerTimer = 3.0;
    suikaDangerActive = false;
    suikaIsDropCooling = false;
    suikaGameActive = true;

    if (suikaDangerAlert) suikaDangerAlert.style.display = 'none';

    // Pick Initial Droppable Planets
    suikaCurrentPlanetLevel = getRandomSuikaPlanetLevel(suikaDiff);
    suikaNextPlanetLevel = getRandomSuikaPlanetLevel(suikaDiff);

    // Initial Dropper X
    suikaDropperX = 220;

    // Update In-Game HUD
    if (suikaHudPlayerName) {
      suikaHudPlayerName.textContent = (suikaPlayer === 'rachel' ? 'Rachel' : 'Elang');
    }
    if (suikaHudPlayerImg) {
      suikaHudPlayerImg.src = (suikaPlayer === 'rachel' ? rachelHeadImg.src : elangHeadImg.src);
    }
    if (suikaHudPlayerHalo) {
      if (suikaPlayer === 'elang') suikaHudPlayerHalo.classList.add('halo-elang');
      else suikaHudPlayerHalo.classList.remove('halo-elang');
    }

    if (suikaHudModeBadge) {
      suikaHudModeBadge.textContent = (suikaMode === 'target') ? 'Target 🎯' : 'Endless ♾️';
    }
    if (suikaHudDiffBadge) {
      let dStr = 'Medium 🟡';
      if (suikaDiff === 'easy') dStr = 'Easy 🟢';
      else if (suikaDiff === 'hard') dStr = 'Hard 🔴';
      suikaHudDiffBadge.textContent = dStr;
    }

    if (suikaCurrentScoreEl) suikaCurrentScoreEl.textContent = '0';

    if (suikaTargetRecordEl) {
      if (suikaMode === 'target') {
        const targetLvl = getTargetPlanetLevelForDiff(suikaDiff);
        const pTarget = SUIKA_PLANETS[targetLvl];
        if (suikaHudTargetLabel) suikaHudTargetLabel.textContent = 'Misi Target';
        suikaTargetRecordEl.textContent = `${pTarget.name} ${pTarget.symbol}`;
      } else {
        if (suikaHudTargetLabel) suikaHudTargetLabel.textContent = 'Rekor Tertinggi';
        const high = getSuikaHighScore(suikaMode, suikaDiff, suikaPlayer);
        suikaTargetRecordEl.textContent = high.toLocaleString('id-ID');
      }
    }

    // Render Preview Canvases
    renderPlanetPreview(suikaCurrentPreviewCanvas, suikaCurrentPlanetLevel);
    renderPlanetPreview(suikaNextPreviewCanvas, suikaNextPlanetLevel);

    // Start 60 FPS Loop
    if (suikaAnimFrameId) cancelAnimationFrame(suikaAnimFrameId);
    suikaAnimFrameId = requestAnimationFrame(suikaGameLoop);

    playBonusChime();
  }

  function resizeSuikaCanvas() {
    if (!suikaCanvas) return;
    suikaCanvas.width = 440;
    suikaCanvas.height = 600;
  }

  // DROP PLANET FROM DROPPER
  function dropCurrentPlanet() {
    if (!suikaGameActive || suikaIsDropCooling) return;

    suikaIsDropCooling = true;
    playSuikaDropSound();

    const planet = SUIKA_PLANETS[suikaCurrentPlanetLevel];
    const r = planet.radius;
    const clampedX = Math.max(r + 6, Math.min(suikaCanvas.width - r - 6, suikaDropperX));

    // Spawn new physics body
    suikaBodies.push({
      id: suikaNextBodyId++,
      level: suikaCurrentPlanetLevel,
      x: clampedX,
      y: suikaDropperY,
      vx: (Math.random() - 0.5) * 0.4,
      vy: 1.5,
      radius: r,
      mass: r * r,
      isMerged: false,
      angle: 0,
      vAngle: (Math.random() - 0.5) * 0.04
    });

    // Advance queue
    suikaCurrentPlanetLevel = suikaNextPlanetLevel;
    suikaNextPlanetLevel = getRandomSuikaPlanetLevel(suikaDiff);

    renderPlanetPreview(suikaCurrentPreviewCanvas, suikaCurrentPlanetLevel);
    renderPlanetPreview(suikaNextPreviewCanvas, suikaNextPlanetLevel);

    // Cooldown 0.45s
    setTimeout(() => {
      suikaIsDropCooling = false;
    }, 450);
  }

  // 60 FPS SUIKA ENGINE LOOP
  function suikaGameLoop() {
    if (!suikaGameActive || !suikaCtx) return;

    try {
      updateSuikaPhysics();
      renderSuikaStage();
    } catch (e) {
      console.warn("Suika loop error caught safely:", e);
    }

    if (suikaGameActive) {
      suikaAnimFrameId = requestAnimationFrame(suikaGameLoop);
    }
  }

  // PHYSICS SIMULATION STEP (5 optimized sub-steps for butter-smooth 60 FPS non-lagging collisions)
  function updateSuikaPhysics() {
    const W = suikaCanvas.width;
    const H = suikaCanvas.height;
    const gravity = 0.32;
    const subSteps = 5;
    const dt = 1.0 / subSteps;
    const dangerLineY = 85;
    const floorLimit = H - 8;
    let scoreChanged = false;

    for (let step = 0; step < subSteps; step++) {
      // 1. Integrate position & apply gravity
      for (let i = 0; i < suikaBodies.length; i++) {
        const b = suikaBodies[i];
        if (b.isMerged) continue;

        b.vy += gravity * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.angle += b.vAngle * dt;

        // Damping / air friction
        b.vx *= Math.pow(0.995, dt);
        b.vy *= Math.pow(0.995, dt);
        b.vAngle *= Math.pow(0.98, dt);

        // Wall collisions
        if (b.x < b.radius + 4) {
          b.x = b.radius + 4;
          b.vx = -b.vx * 0.2;
        } else if (b.x > W - b.radius - 4) {
          b.x = W - b.radius - 4;
          b.vx = -b.vx * 0.2;
        }

        // Floor collision (resting exactly on top of glowing floor line at H - 8)
        if (b.y > floorLimit - b.radius) {
          b.y = floorLimit - b.radius;
          b.vy = -b.vy * 0.15;
          b.vx *= 0.94; // floor rolling friction
        }
      }

      // 2. Circle-to-Circle Collision & Queue Merges
      const pendingMerges = [];

      for (let i = 0; i < suikaBodies.length; i++) {
        const b1 = suikaBodies[i];
        if (b1.isMerged) continue;

        for (let j = i + 1; j < suikaBodies.length; j++) {
          const b2 = suikaBodies[j];
          if (b2.isMerged) continue;

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const distSq = (dx * dx) + (dy * dy);
          const rSum = b1.radius + b2.radius;

          if (distSq < (rSum * rSum) && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);

            // SAME LEVEL PLANETS -> QUEUE MERGE!
            if (b1.level === b2.level && !b1.isMerged && !b2.isMerged) {
              b1.isMerged = true;
              b2.isMerged = true;
              pendingMerges.push({ b1, b2, level: b1.level });
              break;
            }

            // Normal Circle Push Separation
            const overlap = rSum - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            const mTotal = b1.mass + b2.mass;
            const ratio1 = b2.mass / mTotal;
            const ratio2 = b1.mass / mTotal;

            b1.x -= nx * overlap * ratio1 * 0.85;
            b1.y -= ny * overlap * ratio1 * 0.85;
            b2.x += nx * overlap * ratio2 * 0.85;
            b2.y += ny * overlap * ratio2 * 0.85;

            // Velocity impulse
            const rvx = b2.vx - b1.vx;
            const rvy = b2.vy - b1.vy;
            const velNorm = (rvx * nx) + (rvy * ny);

            if (velNorm < 0) {
              const restitution = 0.2;
              const jImpulse = -(1 + restitution) * velNorm / ((1 / b1.mass) + (1 / b2.mass));

              b1.vx -= (jImpulse / b1.mass) * nx;
              b1.vy -= (jImpulse / b1.mass) * ny;
              b2.vx += (jImpulse / b2.mass) * nx;
              b2.vy += (jImpulse / b2.mass) * ny;

              // Tangential friction
              const tx = -ny;
              const ty = nx;
              const velTan = (rvx * tx) + (rvy * ty);
              const frictionImpulse = -velTan * 0.15 / ((1 / b1.mass) + (1 / b2.mass));

              b1.vx -= (frictionImpulse / b1.mass) * tx;
              b1.vy -= (frictionImpulse / b1.mass) * ty;
              b2.vx += (frictionImpulse / b2.mass) * tx;
              b2.vy += (frictionImpulse / b2.mass) * ty;
            }
          }
        }
      }

      // Process queued merges between sub-steps safely
      if (pendingMerges.length > 0) {
        suikaBodies = suikaBodies.filter(b => !b.isMerged);
        for (let m = 0; m < pendingMerges.length; m++) {
          const { b1, b2 } = pendingMerges[m];
          executePlanetMerge(b1, b2);
          scoreChanged = true;
        }
      }
    }

    // Clean up any remaining merged bodies
    suikaBodies = suikaBodies.filter(b => !b.isMerged);

    // Single DOM update for score if changed
    if (scoreChanged && suikaCurrentScoreEl) {
      suikaCurrentScoreEl.textContent = suikaScore.toLocaleString('id-ID');
    }

    // Update Particles
    for (let i = suikaParticles.length - 1; i >= 0; i--) {
      const p = suikaParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.alpha -= 0.028;
      if (p.alpha <= 0) suikaParticles.splice(i, 1);
    }

    // Update Popups
    for (let i = suikaPopups.length - 1; i >= 0; i--) {
      const pop = suikaPopups[i];
      pop.y -= 0.9;
      pop.alpha -= 0.022;
      if (pop.alpha <= 0) suikaPopups.splice(i, 1);
    }

    // 3. Danger Line Overflow Detection
    let hasSettledOverflow = false;
    for (let i = 0; i < suikaBodies.length; i++) {
      const b = suikaBodies[i];
      const speed = Math.sqrt((b.vx * b.vx) + (b.vy * b.vy));
      // Only count if settled (not while initially dropping through the top)
      if (speed < 0.6 && b.y > suikaDropperY + 30 && (b.y - b.radius) < dangerLineY) {
        hasSettledOverflow = true;
        break;
      }
    }

    if (hasSettledOverflow) {
      suikaDangerTimer -= (1 / 60);
      if (suikaDangerAlert) {
        suikaDangerAlert.style.display = 'block';
        if (suikaDangerTimerEl) suikaDangerTimerEl.textContent = Math.max(0, suikaDangerTimer).toFixed(1);
      }
      if (suikaDangerTimer <= 0) {
        triggerSuikaGameOver();
      }
    } else {
      suikaDangerTimer = 3.0;
      if (suikaDangerAlert) suikaDangerAlert.style.display = 'none';
    }
  }

  // EXECUTE MERGE OF TWO IDENTICAL PLANETS
  function executePlanetMerge(b1, b2) {
    const mx = (b1.x + b2.x) / 2;
    const my = (b1.y + b2.y) / 2;
    const nextLevel = Math.min(8, b1.level + 1);
    const newPlanet = SUIKA_PLANETS[nextLevel];

    suikaMergesCount++;
    if (nextLevel > suikaHighestPlanetLevel) suikaHighestPlanetLevel = nextLevel;

    // Combo streak multiplier
    suikaCombo++;
    if (suikaComboTimer) clearTimeout(suikaComboTimer);
    suikaComboTimer = setTimeout(() => { suikaCombo = 0; }, 1800);

    const comboBonus = (suikaCombo > 1) ? Math.floor(suikaCombo * 3) : 0;
    const ptsEarned = newPlanet.score + comboBonus;
    suikaScore += ptsEarned;

    // Spawn New Synthesized Planet
    suikaBodies.push({
      id: suikaNextBodyId++,
      level: nextLevel,
      x: mx,
      y: my,
      vx: (b1.vx + b2.vx) * 0.25,
      vy: -1.2, // cute bounce pop upwards
      radius: newPlanet.radius,
      mass: newPlanet.radius * newPlanet.radius,
      isMerged: false,
      angle: 0,
      vAngle: (Math.random() - 0.5) * 0.05
    });

    // Audio & Shockwave Effects (debounced / anti-lag)
    playSuikaMergeSound(nextLevel);
    spawnSuikaMergeEffect(mx, my, newPlanet.color, ptsEarned, newPlanet.name, nextLevel === 8);

    // Target Mode Victory Check!
    if (suikaMode === 'target') {
      const targetLvl = getTargetPlanetLevelForDiff(suikaDiff);
      if (nextLevel >= targetLvl) {
        setTimeout(() => {
          triggerSuikaVictory();
        }, 600);
      }
    }
  }

  // Spawn visual shockwave and sparkles (capped to prevent GPU stutter)
  function spawnSuikaMergeEffect(x, y, color, pts, name, isSun) {
    // 1. Floating Score Popup
    suikaPopups.push({
      text: isSun ? `☀️ SINTESIS MATAHARI! +${pts}` : `+${pts} ✨`,
      x: x,
      y: y - 10,
      color: isSun ? '#ffd700' : color,
      alpha: 1.0
    });
    if (suikaPopups.length > 8) suikaPopups.shift();

    // 2. Sparkle Particles (8 for regular, 18 for Sun)
    const pCount = isSun ? 18 : 8;
    for (let i = 0; i < pCount; i++) {
      const ang = (Math.PI * 2 / pCount) * i + (Math.random() * 0.3);
      const spd = Math.random() * 2.8 + 1.2;
      suikaParticles.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: color,
        alpha: 1.0,
        radius: Math.random() * 2.5 + 1.5
      });
    }

    if (suikaParticles.length > 50) {
      suikaParticles.splice(0, suikaParticles.length - 50);
    }

    if (isSun && window.confetti) {
      window.confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
  }

  // RENDER SUIKA CANVAS STAGE
  function renderSuikaStage() {
    const W = suikaCanvas.width;
    const H = suikaCanvas.height;
    const dangerLineY = 85;

    // 1. Dark Cosmic Nebula Background
    suikaCtx.clearRect(0, 0, W, H);
    const bgGrad = suikaCtx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#060810');
    bgGrad.addColorStop(0.5, '#0b0e1e');
    bgGrad.addColorStop(1, '#12162e');
    suikaCtx.fillStyle = bgGrad;
    suikaCtx.fillRect(0, 0, W, H);

    // Subtle cosmic stars
    suikaCtx.save();
    suikaCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 20; i++) {
      const sx = ((i * 37) + 15) % W;
      const sy = ((i * 47) + 25) % H;
      suikaCtx.beginPath();
      suikaCtx.arc(sx, sy, (i % 3 === 0) ? 1.5 : 0.8, 0, Math.PI * 2);
      suikaCtx.fill();
    }
    suikaCtx.restore();

    // 2. Illuminated Container Floor (Dasar Toples Kosmik)
    suikaCtx.save();
    const floorGrad = suikaCtx.createLinearGradient(0, H - 24, 0, H);
    floorGrad.addColorStop(0, 'rgba(245, 197, 24, 0.08)');
    floorGrad.addColorStop(0.5, 'rgba(30, 41, 59, 0.4)');
    floorGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
    suikaCtx.fillStyle = floorGrad;
    suikaCtx.fillRect(0, H - 24, W, 24);

    // Glowing Floor Surface Line
    suikaCtx.strokeStyle = 'rgba(245, 197, 24, 0.85)';
    suikaCtx.lineWidth = 3;
    suikaCtx.beginPath();
    suikaCtx.moveTo(0, H - 8);
    suikaCtx.lineTo(W, H - 8);
    suikaCtx.stroke();

    // Floor Alignment Notch Grid
    suikaCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    suikaCtx.lineWidth = 1.5;
    for (let xTick = 20; xTick < W; xTick += 40) {
      suikaCtx.beginPath();
      suikaCtx.moveTo(xTick, H - 8);
      suikaCtx.lineTo(xTick, H - 3);
      suikaCtx.stroke();
    }

    // Center Docking Marker
    suikaCtx.fillStyle = '#f5c518';
    suikaCtx.beginPath();
    suikaCtx.moveTo(W / 2 - 6, H - 2);
    suikaCtx.lineTo(W / 2 + 6, H - 2);
    suikaCtx.lineTo(W / 2, H - 8);
    suikaCtx.closePath();
    suikaCtx.fill();

    suikaCtx.fillStyle = 'rgba(245, 197, 24, 0.7)';
    suikaCtx.font = 'bold 9px sans-serif';
    suikaCtx.textAlign = 'center';
    suikaCtx.fillText('— DASAR ORBIT KOSMIK —', W / 2, H - 12);
    suikaCtx.restore();

    // 3. Danger Overflow Line
    suikaCtx.save();
    suikaCtx.setLineDash([8, 6]);
    suikaCtx.strokeStyle = suikaDangerActive ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.4)';
    suikaCtx.lineWidth = 2;
    suikaCtx.beginPath();
    suikaCtx.moveTo(0, dangerLineY);
    suikaCtx.lineTo(W, dangerLineY);
    suikaCtx.stroke();

    suikaCtx.fillStyle = 'rgba(239, 68, 68, 0.6)';
    suikaCtx.font = '10px sans-serif';
    suikaCtx.textAlign = 'right';
    suikaCtx.fillText('BATAS BAHAYA (OVERFLOW)', W - 12, dangerLineY - 6);
    suikaCtx.restore();

    // 4. Drop Guide Beam & Ghost Landing Projection
    const currentPlanet = SUIKA_PLANETS[suikaCurrentPlanetLevel];
    const r = currentPlanet ? currentPlanet.radius : 18;
    const clampedDropperX = Math.max(r + 6, Math.min(W - r - 6, suikaDropperX));
    const floorY = H - r - 8;

    // Calculate exact landing Y based on floor and stacked obstacles
    let landingY = floorY;
    for (let i = 0; i < suikaBodies.length; i++) {
      const b = suikaBodies[i];
      if (b.isMerged) continue;
      const hDist = Math.abs(b.x - clampedDropperX);
      const combinedR = r + b.radius;
      if (hDist < combinedR) {
        const vDiff = Math.sqrt((combinedR * combinedR) - (hDist * hDist));
        const hitY = b.y - vDiff;
        if (hitY < landingY) {
          landingY = hitY;
        }
      }
    }
    landingY = Math.max(suikaDropperY + r + 15, Math.min(floorY, landingY));

    // A. Vertical Light Column Guide Zone (Width of planet diameter)
    suikaCtx.save();
    const beamGrad = suikaCtx.createLinearGradient(clampedDropperX - r, 0, clampedDropperX + r, 0);
    const beamColor = (suikaPlayer === 'rachel') ? '236, 72, 153' : '56, 189, 248';
    beamGrad.addColorStop(0, `rgba(${beamColor}, 0)`);
    beamGrad.addColorStop(0.5, `rgba(${beamColor}, 0.12)`);
    beamGrad.addColorStop(1, `rgba(${beamColor}, 0)`);
    suikaCtx.fillStyle = beamGrad;
    suikaCtx.fillRect(clampedDropperX - r, suikaDropperY + r, r * 2, landingY - suikaDropperY - r);

    // B. Center Laser Guide
    suikaCtx.setLineDash([6, 6]);
    suikaCtx.strokeStyle = `rgba(${beamColor}, 0.75)`;
    suikaCtx.lineWidth = 2;
    suikaCtx.beginPath();
    suikaCtx.moveTo(clampedDropperX, suikaDropperY + r);
    suikaCtx.lineTo(clampedDropperX, landingY);
    suikaCtx.stroke();
    suikaCtx.restore();

    // C. Ghost Landing Circle (Bayangan Titik Pendaratan)
    if (!suikaIsDropCooling && currentPlanet) {
      suikaCtx.save();
      suikaCtx.setLineDash([4, 4]);
      suikaCtx.strokeStyle = currentPlanet.color;
      suikaCtx.lineWidth = 2;
      suikaCtx.fillStyle = `rgba(${beamColor}, 0.16)`;
      suikaCtx.beginPath();
      suikaCtx.arc(clampedDropperX, landingY, r, 0, Math.PI * 2);
      suikaCtx.fill();
      suikaCtx.stroke();

      // Center Crosshair Reticle inside ghost circle
      suikaCtx.setLineDash([]);
      suikaCtx.strokeStyle = `rgba(255, 255, 255, 0.6)`;
      suikaCtx.lineWidth = 1.2;
      suikaCtx.beginPath();
      suikaCtx.moveTo(clampedDropperX - 5, landingY);
      suikaCtx.lineTo(clampedDropperX + 5, landingY);
      suikaCtx.moveTo(clampedDropperX, landingY - 5);
      suikaCtx.lineTo(clampedDropperX, landingY + 5);
      suikaCtx.stroke();

      // Target Landing Label (Dynamic Planet Name: Merkurius / Mars / Venus / Bumi)
      suikaCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      suikaCtx.font = 'bold 10px sans-serif';
      suikaCtx.textAlign = 'center';
      suikaCtx.fillText(`▼ ${currentPlanet.name}`, clampedDropperX, landingY + r + 12);
      suikaCtx.restore();
    }

    // 5. Render All Fallen Physics Planets
    suikaBodies.forEach(b => {
      if (b.isMerged) return;
      const planet = SUIKA_PLANETS[b.level];
      if (!planet) return;
      drawSinglePlanetBody(suikaCtx, b.x, b.y, planet, b.radius);
    });

    // 6. Render Hovering Ready Planet in Dropper
    if (!suikaIsDropCooling && currentPlanet) {
      drawSinglePlanetBody(suikaCtx, clampedDropperX, suikaDropperY, currentPlanet, r);

      // Dropper arrow indicator
      suikaCtx.save();
      suikaCtx.fillStyle = (suikaPlayer === 'rachel') ? '#ec4899' : '#38bdf8';
      suikaCtx.beginPath();
      suikaCtx.moveTo(clampedDropperX, suikaDropperY - r - 6);
      suikaCtx.lineTo(clampedDropperX - 6, suikaDropperY - r - 14);
      suikaCtx.lineTo(clampedDropperX + 6, suikaDropperY - r - 14);
      suikaCtx.fill();
      suikaCtx.restore();
    }

    // 7. Render Particles (Batched without context save/restore per particle)
    if (suikaParticles.length > 0) {
      suikaCtx.save();
      for (let i = 0; i < suikaParticles.length; i++) {
        const p = suikaParticles[i];
        suikaCtx.globalAlpha = Math.max(0, p.alpha);
        suikaCtx.fillStyle = p.color;
        suikaCtx.beginPath();
        suikaCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        suikaCtx.fill();
      }
      suikaCtx.restore();
    }

    // 8. Render Floating Text Popups
    suikaPopups.forEach(pop => {
      suikaCtx.save();
      suikaCtx.globalAlpha = Math.max(0, pop.alpha);
      suikaCtx.fillStyle = pop.color;
      suikaCtx.font = 'bold 14px var(--font-cinzel), sans-serif';
      suikaCtx.textAlign = 'center';
      suikaCtx.shadowColor = '#000000';
      suikaCtx.shadowBlur = 6;
      suikaCtx.fillText(pop.text, pop.x, pop.y);
      suikaCtx.restore();
    });
  }

  // Dropper Pointer Events on Canvas
  if (suikaCanvas) {
    function updateDropperPosFromClient(clientX) {
      if (!suikaGameActive) return;
      const rect = suikaCanvas.getBoundingClientRect();
      const scaleX = suikaCanvas.width / rect.width;
      const x = (clientX - rect.left) * scaleX;
      suikaDropperX = x;
    }

    suikaCanvas.addEventListener('pointermove', (e) => {
      updateDropperPosFromClient(e.clientX);
    });

    suikaCanvas.addEventListener('pointerdown', (e) => {
      updateDropperPosFromClient(e.clientX);
      dropCurrentPlanet();
    });
  }

  // Keyboard Controls (Arrow Keys & Space)
  window.addEventListener('keydown', (e) => {
    if (!suikaGameActive) return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      suikaDropperX = Math.max(25, suikaDropperX - 25);
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      suikaDropperX = Math.min(suikaCanvas.width - 25, suikaDropperX + 25);
    } else if (e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'KeyS') {
      e.preventDefault();
      dropCurrentPlanet();
    }
  });

  // Mobile Controller Buttons
  if (suikaCtrlLeft) {
    suikaCtrlLeft.addEventListener('click', () => {
      if (suikaGameActive) suikaDropperX = Math.max(25, suikaDropperX - 35);
    });
  }

  if (suikaCtrlRight) {
    suikaCtrlRight.addEventListener('click', () => {
      if (suikaGameActive) suikaDropperX = Math.min(suikaCanvas.width - 25, suikaDropperX + 35);
    });
  }

  if (suikaCtrlDrop) {
    suikaCtrlDrop.addEventListener('click', dropCurrentPlanet);
  }

  // Start & Quit Actions
  if (suikaStartBtn) {
    suikaStartBtn.addEventListener('click', startSuikaGame);
  }

  if (suikaQuitBtn) {
    suikaQuitBtn.addEventListener('click', () => {
      endSuikaSession(false, false);
      if (suikaPlayScreen) suikaPlayScreen.style.display = 'none';
      if (suikaResultModal) suikaResultModal.style.display = 'none';
      if (suikaSelectScreen) suikaSelectScreen.style.display = 'block';
      updateSuikaHighScoresUI();
    });
  }

  if (suikaRetryBtn) {
    suikaRetryBtn.addEventListener('click', () => {
      if (suikaResultModal) suikaResultModal.style.display = 'none';
      startSuikaGame();
    });
  }

  if (suikaBackToMenuBtn) {
    suikaBackToMenuBtn.addEventListener('click', () => {
      if (suikaPlayScreen) suikaPlayScreen.style.display = 'none';
      if (suikaResultModal) suikaResultModal.style.display = 'none';
      if (suikaSelectScreen) suikaSelectScreen.style.display = 'block';
      updateSuikaHighScoresUI();
    });
  }

  // Reset Suika Scores for active mode and difficulty
  function resetSuikaScores() {
    try {
      localStorage.setItem(`suika_rec_${suikaMode}_${suikaDiff}_rachel`, '0');
      localStorage.setItem(`suika_rec_${suikaMode}_${suikaDiff}_elang`, '0');
      localStorage.removeItem(`suika_target_planet_${suikaDiff}_rachel`);
      localStorage.removeItem(`suika_target_planet_${suikaDiff}_elang`);
    } catch (e) { }
    updateSuikaHighScoresUI();
    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    playBonusChime();
  }

  if (suikaSecretResetBtn) {
    suikaSecretResetBtn.addEventListener('click', resetSuikaScores);
  }

  // Secret shortcut: Press '0' anywhere when in suika tab
  window.addEventListener('keydown', (e) => {
    if (e.key === '0' && document.activeElement && document.activeElement.tagName !== 'INPUT') {
      const isSuikaVisible = suikaWrapper && suikaWrapper.style.display !== 'none';
      if (isSuikaVisible) {
        resetSuikaScores();
      }
    }
  });

  // VICTORY & GAME OVER MODALS
  function triggerSuikaVictory() {
    endSuikaSession(true, true);
  }

  function triggerSuikaGameOver() {
    endSuikaSession(false, false);
  }

  function endSuikaSession(isCompleted, isVictory) {
    suikaGameActive = false;
    if (suikaAnimFrameId) cancelAnimationFrame(suikaAnimFrameId);

    const highestPlanet = SUIKA_PLANETS[suikaHighestPlanetLevel] || SUIKA_PLANETS[0];
    let isNewHigh = false;

    if (suikaMode === 'target') {
      const isNewPlanet = setSuikaTargetMaxPlanet(suikaDiff, suikaPlayer, suikaHighestPlanetLevel);
      setSuikaHighScore(suikaMode, suikaDiff, suikaPlayer, suikaScore);
      isNewHigh = isNewPlanet;

      const bestPlanetLvl = getSuikaTargetMaxPlanet(suikaDiff, suikaPlayer);
      const bestPlanet = SUIKA_PLANETS[bestPlanetLvl] || highestPlanet;
      if (suikaModalHighscore) suikaModalHighscore.textContent = `${bestPlanet.name} ${bestPlanet.symbol}`;
    } else {
      isNewHigh = setSuikaHighScore(suikaMode, suikaDiff, suikaPlayer, suikaScore);
      const high = getSuikaHighScore(suikaMode, suikaDiff, suikaPlayer);
      if (suikaModalHighscore) suikaModalHighscore.textContent = high.toLocaleString('id-ID');
    }

    if (suikaFinalScore) suikaFinalScore.textContent = suikaScore.toLocaleString('id-ID');
    if (suikaFinalPlanet) suikaFinalPlanet.textContent = `${highestPlanet.name} ${highestPlanet.symbol}`;
    if (suikaFinalMerges) suikaFinalMerges.textContent = suikaMergesCount.toString();

    if (suikaNewRecordBadge) {
      suikaNewRecordBadge.style.display = isNewHigh ? 'inline-block' : 'none';
    }

    if (isVictory) {
      if (suikaResultStars) suikaResultStars.textContent = '⭐⭐⭐⭐⭐';
      if (suikaResultTitle) suikaResultTitle.textContent = 'Sintesis Kosmik Sempurna! ☀️✨';
      if (suikaResultVerdict) {
        suikaResultVerdict.textContent = (suikaPlayer === 'rachel')
          ? `Luar biasa sempurna! Kelembutan & ketelitian Rachel berhasil mensintesiskan ${highestPlanet.name} hingga galaksi cinta kita bersinar terang!`
          : `Kalkulasi gravitasi fisikawan Elang sungguh presisi! Berhasil mensintesiskan ${highestPlanet.name} dengan harmoni sempurna!`;
      }
      if (window.confetti) {
        window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 } });
      }
    } else {
      if (suikaResultStars) suikaResultStars.textContent = (suikaScore > 500) ? '⭐⭐⭐⭐' : '⭐⭐⭐';
      if (suikaResultTitle) suikaResultTitle.textContent = (suikaScore > 500) ? 'Eksplorasi Kosmik Hebat! 🪐' : 'Toples Penuh! Coba Lagi 🚀';
      if (suikaResultVerdict) {
        suikaResultVerdict.textContent = `Planet-planet cinta sudah memadati toples! Kamu berhasil menciptakan ${highestPlanet.name} dengan total ${suikaMergesCount} penggabungan!`;
      }
    }

    if (suikaResultModal) {
      suikaResultModal.style.display = 'flex';
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // Initial render of Cosmic Drop lobby
  updateSuikaHighScoresUI();

  // =========================================================================
  // 8. LOVE DEFENSE: PERTAHANAN CINTA (PLANTS VS ZOMBIES THEMED ARENA)
  // =========================================================================

  /**
   * JUDUL TUGAS AKHIR DAPAT DIEDIT SECARA LANGSUNG DI BAWAH INI:
   * String judul ini akan otomatis muncul pada "Buku Besar Berjalan"
   * saat Bos Mr. Manuscript mengeluarkan serangan spesial di detik ke-30!
   */
  const DEFENSE_THESIS_TITLES = {
    // Judul Tugas Akhir Elang (muncul saat Rachel bermain melindungi Elang)
    elang: "Analisis Rekayasa Kuantum & Instrumentasi Gelombang Akustik",
    // Judul Tugas Akhir Rachel (muncul saat Elang bermain melindungi Rachel)
    rachel: "Isolasi & Uji Karakteristik Molekuler Senyawa Aktif Biosintesis"
  };

  // State & Record Management
  const DEFENSE_STORAGE_KEY = 'rayang_defense_records_v1';
  let defenseRecords = {
    rachelWins: 0,
    rachelBestTime: null,
    elangWins: 0,
    elangBestTime: null
  };

  try {
    const savedDefense = localStorage.getItem(DEFENSE_STORAGE_KEY);
    if (savedDefense) {
      defenseRecords = Object.assign(defenseRecords, JSON.parse(savedDefense));
    }
  } catch (e) {
    console.warn('Could not read defense records from storage:', e);
  }

  function saveDefenseRecords() {
    try {
      localStorage.setItem(DEFENSE_STORAGE_KEY, JSON.stringify(defenseRecords));
    } catch (e) {
      console.warn('Could not save defense records:', e);
    }
  }

  // DOM Elements for Love Defense
  const defenseSelectScreen = document.getElementById('defense-select-screen');
  const defenseGameScreen = document.getElementById('defense-game-screen');
  const defenseResultModal = document.getElementById('defense-result-modal');
  const defenseCardRachel = document.getElementById('defense-card-rachel');
  const defenseCardElang = document.getElementById('defense-card-elang');
  const defenseStartBtn = document.getElementById('defense-start-btn');
  const defenseLandscapeBtn = document.getElementById('defense-landscape-btn');
  const defenseSecretResetBtn = document.getElementById('defense-secret-reset-btn');
  const defensePauseBtn = document.getElementById('defense-pause-btn');
  const defenseExitBtn = document.getElementById('defense-exit-btn');
  const defenseRetryBtn = document.getElementById('defense-retry-btn');
  const defenseBackToMenuBtn = document.getElementById('defense-back-to-menu-btn');
  const defenseSeedBank = document.getElementById('defense-seed-bank');
  const defenseShovelBtn = document.getElementById('defense-shovel-btn');
  const defenseCanvas = document.getElementById('defense-canvas');
  const defenseCtx = defenseCanvas ? defenseCanvas.getContext('2d') : null;

  // HUD Elements
  const defenseEnergyContainer = document.getElementById('defense-energy-container');
  const defenseEnergyIcon = document.getElementById('defense-energy-icon');
  const defenseEnergyLabel = document.getElementById('defense-energy-label');
  const defenseEnergyVal = document.getElementById('defense-energy-val');
  const defenseBossTitle = document.getElementById('defense-boss-title');
  const defenseBossPhaseBadge = document.getElementById('defense-boss-phase-badge');
  const defenseBossHpFill = document.getElementById('defense-boss-hp-fill');
  const defenseBossHpText = document.getElementById('defense-boss-hp-text');
  const defenseAlertBanner = document.getElementById('defense-alert-banner');
  const defenseAlertText = document.getElementById('defense-alert-text');
  const defensePartnerAvatarIndicator = document.getElementById('defense-partner-avatar-indicator');
  const defensePartnerNameIndicator = document.getElementById('defense-partner-name-indicator');
  const defensePartnerHearts = document.getElementById('defense-partner-hearts');

  // Result Elements
  const defenseBestRachelEl = document.getElementById('defense-best-rachel');
  const defenseBestRachelTimeEl = document.getElementById('defense-best-rachel-time');
  const defenseBestElangEl = document.getElementById('defense-best-elang');
  const defenseBestElangTimeEl = document.getElementById('defense-best-elang-time');
  const defenseResultIcon = document.getElementById('defense-result-icon');
  const defenseResultTitle = document.getElementById('defense-result-title');
  const defenseResultVerdict = document.getElementById('defense-result-verdict');
  const defenseFinalOutcome = document.getElementById('defense-final-outcome');
  const defenseFinalKills = document.getElementById('defense-final-kills');
  const defenseFinalTime = document.getElementById('defense-final-time');
  const defenseFinalEnergy = document.getElementById('defense-final-energy');

  // Singleton Audio Context for Love Defense
  let defenseSynthCtx = null;
  function getDefenseAudioContext() {
    try {
      if (!defenseSynthCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) defenseSynthCtx = new AudioCtx();
      }
      if (defenseSynthCtx && defenseSynthCtx.state === 'suspended') {
        defenseSynthCtx.resume();
      }
      return defenseSynthCtx;
    } catch (e) {
      return null;
    }
  }

  function playDefenseSound(type) {
    const ctx = getDefenseAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'plant') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'shoot') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'freeze') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'boom') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'collect') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.06);
        osc.frequency.setValueAtTime(783.99, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'crush') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.linearRampToValueAtTime(45, now + 0.2);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'alert') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.15);
        osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + idx * 0.1);
          g.gain.setValueAtTime(0.18, now + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.35);
          o.start(now + idx * 0.1);
          o.stop(now + idx * 0.1 + 0.35);
        });
      } else if (type === 'lose') {
        const notes = [440, 392, 349.23, 293.66];
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + idx * 0.15);
          g.gain.setValueAtTime(0.18, now + idx * 0.15);
          g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.4);
          o.start(now + idx * 0.15);
          o.stop(now + idx * 0.15 + 0.4);
        });
      }
    } catch (e) {
      // Audio catch
    }
  }

  // Preload Images & Fallback System
  const defenseImages = {};
  const DEFENSE_IMAGE_SOURCES = {
    'protect-elang': ['assets/images/defense/protect-elang.jpeg', 'assets/images/defense/protect-elang.png', 'assets/images/defense/protect-elang.jpg', 'assets/images/head-elang.jpeg', 'assets/images/head-elang.jpg', 'assets/images/head-elang.png', 'assets/images/head-elang.svg'],
    'protect-rachel': ['assets/images/defense/protect-rachel.jpeg', 'assets/images/defense/protect-rachel.png', 'assets/images/defense/protect-rachel.jpg', 'assets/images/head-rachel.jpeg', 'assets/images/head-rachel.jpg', 'assets/images/head-rachel.png', 'assets/images/head-rachel.svg'],
    // Teknik Fisika Dosen
    'suyanto': ['assets/images/defense/suyanto.png', 'assets/images/defense/suyanto.jpg'],
    'bambang': ['assets/images/defense/bambang.png', 'assets/images/defense/bambang.jpg'],
    'syamsul': ['assets/images/defense/syamsul.png', 'assets/images/defense/syamsul.jpg'],
    'katherin': ['assets/images/defense/katherin.png', 'assets/images/defense/katherin.jpg'],
    'ridho': ['assets/images/defense/ridho.png', 'assets/images/defense/ridho.jpg'],
    // Biologi Dosen
    'arif': ['assets/images/defense/arif.png', 'assets/images/defense/arif.jpg'],
    'eni': ['assets/images/defense/eni.png', 'assets/images/defense/eni.jpg'],
    'maya': ['assets/images/defense/maya.png', 'assets/images/defense/maya.jpg'],
    'kamal': ['assets/images/defense/kamal.png', 'assets/images/defense/kamal.jpg'],
    'iska': ['assets/images/defense/iska.png', 'assets/images/defense/iska.jpg']
  };

  function preloadDefenseImage(key) {
    if (defenseImages[key]) return;
    const sources = DEFENSE_IMAGE_SOURCES[key] || [];
    let currentIdx = 0;

    const imgObj = {
      img: new Image(),
      loaded: false
    };
    defenseImages[key] = imgObj;

    function tryNext() {
      if (currentIdx >= sources.length) {
        imgObj.loaded = false;
        return;
      }
      imgObj.img.src = sources[currentIdx];
      imgObj.img.onload = () => {
        imgObj.loaded = true;
      };
      imgObj.img.onerror = () => {
        currentIdx++;
        tryNext();
      };
    }
    tryNext();
  }

  Object.keys(DEFENSE_IMAGE_SOURCES).forEach(key => preloadDefenseImage(key));

  // Game Board & Dimensions
  const DEFENSE_ROWS = 5;
  const DEFENSE_COLS = 9;
  const DEFENSE_CELL_W = 68;
  const DEFENSE_CELL_H = 72;
  const DEFENSE_GRID_X = 118;
  const DEFENSE_GRID_Y = 32;

  // Plant / Tower Definitions
  const DEFENSE_PLANTS = {
    rachel: [
      {
        id: 'fotosintesis',
        name: 'Fotosintesis',
        unitName: 'Bunga Matahari Bio',
        icon: '🌻',
        cost: 50,
        cooldown: 5.5,
        hp: 300,
        type: 'producer',
        produceInterval: 8.0,
        desc: 'Menghasilkan 25 ATP secara berkala.'
      },
      {
        id: 'mandragora',
        name: 'Mandragora',
        unitName: 'Tunas Penembak Bio',
        icon: '🌱',
        cost: 100,
        cooldown: 3.5,
        hp: 300,
        type: 'shooter',
        shootInterval: 1.4,
        damage: 24,
        bulletColor: '#4ade80',
        desc: 'Menembakkan spora bio berkecepatan tinggi.'
      },
      {
        id: 'dindingsel',
        name: 'Dinding Sel',
        unitName: 'Dinding Selulosa',
        icon: '🛡️',
        cost: 50,
        cooldown: 14.0,
        hp: 3500,
        type: 'wall',
        desc: 'Membran sel yang sangat tebal untuk menahan laju musuh.'
      },
      {
        id: 'kriogenik',
        name: 'Kriogenik Enzim',
        unitName: 'Tunas Es Bio',
        icon: '❄️',
        cost: 175,
        cooldown: 7.5,
        hp: 300,
        type: 'slow_shooter',
        shootInterval: 1.5,
        damage: 22,
        bulletColor: '#38bdf8',
        desc: 'Menembakkan kristal es yang memperlambat zombie 50%.'
      },
      {
        id: 'spora',
        name: 'Spora Bom',
        unitName: 'Jamur Spora Meledak',
        icon: '🍄',
        cost: 150,
        cooldown: 20.0,
        hp: 300,
        type: 'bomb',
        fuse: 1.1,
        damage: 1200,
        desc: 'Meledakkan area 3x3 petak dalam sekejap!'
      }
    ],
    elang: [
      {
        id: 'panel',
        name: 'Panel Surya',
        unitName: 'Kolektor Fotovoltaik',
        icon: '☀️',
        cost: 50,
        cooldown: 5.5,
        hp: 300,
        type: 'producer',
        produceInterval: 8.0,
        desc: 'Memanen 25 Photon kuantum secara berkala.'
      },
      {
        id: 'photon',
        name: 'Photon Blaster',
        unitName: 'Laser Dioda TF',
        icon: '⚡',
        cost: 100,
        cooldown: 3.5,
        hp: 300,
        type: 'shooter',
        shootInterval: 1.4,
        damage: 24,
        bulletColor: '#06b6d4',
        desc: 'Menembakkan pulsa laser foton presisi tinggi.'
      },
      {
        id: 'timbal',
        name: 'Perisai Timbal',
        unitName: 'Dinding Timbal Graphene',
        icon: '🧱',
        cost: 50,
        cooldown: 14.0,
        hp: 3500,
        type: 'wall',
        desc: 'Pelindung radiasi berat yang menyerap hantaman musuh.'
      },
      {
        id: 'cryolaser',
        name: 'Cryo Cooler',
        unitName: 'Laser Nitrogen Cair',
        icon: '🧊',
        cost: 175,
        cooldown: 7.5,
        hp: 300,
        type: 'slow_shooter',
        shootInterval: 1.5,
        damage: 22,
        bulletColor: '#7dd3fc',
        desc: 'Membekukan zombie dan memangkas kecepatannya 50%.'
      },
      {
        id: 'plasma',
        name: 'Reaktor Arc',
        unitName: 'Tesla Arc Overload',
        icon: '💥',
        cost: 150,
        cooldown: 20.0,
        hp: 300,
        type: 'bomb',
        fuse: 1.1,
        damage: 1200,
        desc: 'Melepaskan busur plasma 3x3 yang meluluhlantakkan musuh!'
      }
    ]
  };

  // Enemy Types Definitions
  // Dosen HP from lowest to highest:
  // Teknik Fisika: Pak Suyanto < Pak Bambang < Pak Syamsul < Bu Katherin < Pak Ridho
  // Biologi: Pak Arif < Bu Eni < Pak Maya < Pak Kamal < Bu Iska
  // Mata Kuliah are weaker than all lecturers (HP 85 - 150)
  const DEFENSE_ENEMIES = {
    // Mode Rachel: Protecting Elang against Teknik Fisika Enemies
    rachel: {
      courses: [
        { id: 'fisika_bahan', name: 'Fisika Bahan', hp: 90, speed: 0.38, damage: 16, color: '#f59e0b', icon: '📐' },
        { id: 'rekayasa_bahan', name: 'Rekayasa Bahan', hp: 105, speed: 0.36, damage: 16, color: '#f97316', icon: '⚙️' },
        { id: 'fisika_kuantum', name: 'Fisika Kuantum', hp: 120, speed: 0.42, damage: 18, color: '#8b5cf6', icon: '⚛️' },
        { id: 'fisika_bangunan', name: 'Fisika Bangunan', hp: 140, speed: 0.32, damage: 18, color: '#0284c7', icon: '🏛️' },
        { id: 'identifikasi_estimasi', name: 'Identifikasi Estimasi', hp: 160, speed: 0.34, damage: 20, color: '#10b981', icon: '📊' }
      ],
      lecturers: [
        { id: 'suyanto', name: 'Pak Suyanto', hp: 280, speed: 0.28, damage: 24, badge: 'Dosen TF #1', color: '#38bdf8', initials: 'SY' },
        { id: 'bambang', name: 'Pak Bambang', hp: 460, speed: 0.26, damage: 28, badge: 'Dosen TF #2', color: '#60a5fa', initials: 'BB' },
        { id: 'syamsul', name: 'Pak Syamsul', hp: 680, speed: 0.24, damage: 32, badge: 'Dosen TF #3', color: '#818cf8', initials: 'SM' },
        { id: 'katherin', name: 'Bu Katherin', hp: 920, speed: 0.22, damage: 36, badge: 'Dosen TF #4', color: '#ec4899', initials: 'KT' },
        { id: 'ridho', name: 'Pak Ridho', hp: 1250, speed: 0.20, damage: 42, badge: 'Dosen TF #5 (Kuat)', color: '#ef4444', initials: 'RD' }
      ]
    },
    // Mode Elang: Protecting Rachel against Biologi Enemies
    elang: {
      courses: [
        { id: 'bio_molekuler', name: 'Biologi Molekuler', hp: 90, speed: 0.38, damage: 16, color: '#10b981', icon: '🧬' },
        { id: 'bio_sel', name: 'Biologi Sel', hp: 105, speed: 0.36, damage: 16, color: '#22c55e', icon: '🔬' },
        { id: 'bioteknologi', name: 'Bioteknologi', hp: 120, speed: 0.42, damage: 18, color: '#14b8a6', icon: '🧫' },
        { id: 'sistematika_mikroba', name: 'Sistematika Mikroba', hp: 140, speed: 0.32, damage: 18, color: '#84cc16', icon: '🧫' },
        { id: 'fisiologi_hewan', name: 'Fisiologi Hewan', hp: 160, speed: 0.34, damage: 20, color: '#06b6d4', icon: '🐾' }
      ],
      lecturers: [
        { id: 'arif', name: 'Pak Arif', hp: 280, speed: 0.28, damage: 24, badge: 'Dosen Bio #1', color: '#34d399', initials: 'AR' },
        { id: 'eni', name: 'Bu Eni', hp: 460, speed: 0.26, damage: 28, badge: 'Dosen Bio #2', color: '#10b981', initials: 'EN' },
        { id: 'maya', name: 'Pak Maya', hp: 680, speed: 0.24, damage: 32, badge: 'Dosen Bio #3', color: '#059669', initials: 'MY' },
        { id: 'kamal', name: 'Pak Kamal', hp: 920, speed: 0.22, damage: 36, badge: 'Dosen Bio #4', color: '#047857', initials: 'KM' },
        { id: 'iska', name: 'Bu Iska', hp: 1250, speed: 0.20, damage: 42, badge: 'Dosen Bio #5 (Kuat)', color: '#ef4444', initials: 'IS' }
      ]
    }
  };

  // Live Game State Variables
  let defenseCommander = 'rachel'; // 'rachel' or 'elang'
  let defenseState = 'lobby'; // 'lobby', 'playing', 'paused', 'ended'
  let defenseEnergy = 150;
  let defenseSelectedSeed = null;
  let defenseShovelActive = false;
  let defenseSeedCooldowns = [0, 0, 0, 0, 0];
  let defenseHoverCell = null;

  let defenseGrid = []; // [5][9]
  let defenseProjectiles = [];
  let defenseEnemies = [];
  let defenseEnergyDrops = [];
  let defenseParticles = [];
  let defenseLawnMowers = []; // [5]
  let defenseHearts = 3;

  let defenseGameTime = 0; // seconds elapsed
  let defenseLastFrameTime = 0;
  let defenseAnimFrameId = null;
  let defenseSpawnTimer = 0;
  let defenseSkyEnergyTimer = 0;

  // Boss & Walking Book State
  const BOSS_MAX_HP = 12000;
  let defenseBoss = {
    x: 755,
    y: 195,
    hp: BOSS_MAX_HP,
    maxHp: BOSS_MAX_HP,
    invulnerable: true,
    invulnTimer: 90.0, // 90 seconds invulnerable & spawning (first cycle)
    bookPhaseActive: false,
    bookPhaseTimer: 10.0, // 10 seconds stop spawning & giant walking book
    bookSpawned: false,
    vulnerableActive: false,
    vulnerableTimer: 10.0, // 10 seconds vulnerable window per cycle
    cycleCount: 0,        // how many full cycles completed
    hoverOffsetY: 0,
    hitFlash: 0
  };

  let defenseStats = {
    kills: 0,
    energyCollected: 0,
    startTime: 0
  };

  // Update Lobby High Score UI
  function updateDefenseHighScoresUI() {
    if (defenseBestRachelEl) {
      defenseBestRachelEl.textContent = `${defenseRecords.rachelWins || 0} Kemenangan`;
    }
    if (defenseBestRachelTimeEl) {
      defenseBestRachelTimeEl.textContent = defenseRecords.rachelBestTime
        ? `Waktu Tercepat: ${formatDefenseTime(defenseRecords.rachelBestTime)}`
        : 'Waktu Tercepat: --';
    }
    if (defenseBestElangEl) {
      defenseBestElangEl.textContent = `${defenseRecords.elangWins || 0} Kemenangan`;
    }
    if (defenseBestElangTimeEl) {
      defenseBestElangTimeEl.textContent = defenseRecords.elangBestTime
        ? `Waktu Tercepat: ${formatDefenseTime(defenseRecords.elangBestTime)}`
        : 'Waktu Tercepat: --';
    }
  }

  function formatDefenseTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Character Select Card Handlers
  if (defenseCardRachel) {
    defenseCardRachel.addEventListener('click', () => {
      defenseCommander = 'rachel';
      defenseCardRachel.classList.add('active');
      if (defenseCardElang) defenseCardElang.classList.remove('active');
      playDefenseSound('plant');
    });
  }

  if (defenseCardElang) {
    defenseCardElang.addEventListener('click', () => {
      defenseCommander = 'elang';
      defenseCardElang.classList.add('active');
      if (defenseCardRachel) defenseCardRachel.classList.remove('active');
      playDefenseSound('plant');
    });
  }

  // Render Seed Bank toolbar based on commander
  let defenseCachedCards = [];
  let defenseLastEnergyVal = -1;

  function renderDefenseSeedBank() {
    if (!defenseSeedBank) return;
    defenseSeedBank.innerHTML = '';
    defenseCachedCards = [];
    const plants = DEFENSE_PLANTS[defenseCommander];
    const unitCurrency = defenseCommander === 'rachel' ? 'ATP' : '⚡';

    plants.forEach((plant, idx) => {
      const card = document.createElement('div');
      card.className = `seed-card ${defenseSelectedSeed === idx ? 'selected' : ''}`;
      card.dataset.index = idx;

      card.innerHTML = `
        <div class="seed-cooldown-overlay" id="defense-cd-overlay-${idx}"></div>
        <div class="seed-card-icon">${plant.icon}</div>
        <div class="seed-card-name" title="${plant.unitName}">${plant.name}</div>
        <div class="seed-card-cost">${plant.cost} ${unitCurrency}</div>
      `;

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        if (defenseState !== 'playing') return;
        if (defenseEnergy < plant.cost) {
          playDefenseSound('hit');
          return;
        }
        if (defenseSeedCooldowns[idx] > 0) return;

        defenseShovelActive = false;
        if (defenseShovelBtn) defenseShovelBtn.classList.remove('active');

        if (defenseSelectedSeed === idx) {
          defenseSelectedSeed = null;
        } else {
          defenseSelectedSeed = idx;
          playDefenseSound('plant');
        }
        updateSeedBankState();
      });

      defenseSeedBank.appendChild(card);
      defenseCachedCards.push({
        card: card,
        overlay: card.querySelector('.seed-cooldown-overlay'),
        cost: plant.cost,
        cooldown: plant.cooldown,
        lastCdPct: -1,
        notEnough: false
      });
    });
    updateSeedBankState();
  }

  function updateSeedBankState() {
    if (!defenseSeedBank || !defenseCachedCards.length) return;
    const plants = DEFENSE_PLANTS[defenseCommander];

    for (let idx = 0; idx < defenseCachedCards.length; idx++) {
      const item = defenseCachedCards[idx];
      const plant = plants[idx];
      const cdRemaining = defenseSeedCooldowns[idx] || 0;
      const isNotEnough = (defenseEnergy < plant.cost || cdRemaining > 0);

      if (item.notEnough !== isNotEnough) {
        item.notEnough = isNotEnough;
        item.card.classList.toggle('not-enough-energy', isNotEnough);
      }

      const isSelected = (defenseSelectedSeed === idx);
      if (item.card.classList.contains('selected') !== isSelected) {
        item.card.classList.toggle('selected', isSelected);
      }

      if (item.overlay) {
        const pct = cdRemaining > 0 ? Math.min(100, Math.max(0, (cdRemaining / plant.cooldown) * 100)) : 0;
        const roundedPct = Math.round(pct);
        if (item.lastCdPct !== roundedPct) {
          item.lastCdPct = roundedPct;
          item.overlay.style.height = `${roundedPct}%`;
        }
      }
    }

    const currentFloorEnergy = Math.floor(defenseEnergy);
    if (defenseLastEnergyVal !== currentFloorEnergy) {
      defenseLastEnergyVal = currentFloorEnergy;
      if (defenseEnergyVal) defenseEnergyVal.textContent = currentFloorEnergy;
    }
  }

  // Shovel Button Event
  if (defenseShovelBtn) {
    defenseShovelBtn.addEventListener('click', () => {
      if (defenseState !== 'playing') return;
      defenseShovelActive = !defenseShovelActive;
      defenseSelectedSeed = null;
      defenseShovelBtn.classList.toggle('active', defenseShovelActive);
      updateSeedBankState();
      playDefenseSound('plant');
    });
  }

  // Start / Init Love Defense Match
  function startDefenseGame() {
    if (isMobileGameDevice()) {
      requestGameLandscape('defense');
    }
    defenseState = 'playing';
    defenseEnergy = 225; // Modal awal dinaikkan agar pemain dapat langsung menanam 1-2 tanaman awal!
    defenseSelectedSeed = null;
    defenseShovelActive = false;
    defenseSeedCooldowns = [0, 0, 0, 0, 0];
    defenseHoverCell = null;
    defenseHearts = 3;

    // Reset Board Grid
    defenseGrid = [];
    for (let r = 0; r < DEFENSE_ROWS; r++) {
      defenseGrid[r] = [];
      for (let c = 0; c < DEFENSE_COLS; c++) {
        defenseGrid[r][c] = null;
      }
    }

    defenseProjectiles = [];
    defenseEnemies = [];
    defenseEnergyDrops = [];
    defenseParticles = [];
    defenseLawnMowers = [true, true, true, true, true]; // 5 lanes active mowers

    defenseGameTime = 0;
    defenseLastFrameTime = performance.now();
    defenseSpawnTimer = 12.0; // FASE PERSIAPAN: Musuh pertama baru muncul di detik ke-12!
    defenseSkyEnergyTimer = 5.0;

    // Reset Boss State
    defenseBoss = {
      x: 755,
      y: 195,
      hp: BOSS_MAX_HP,
      maxHp: BOSS_MAX_HP,
      invulnerable: true,
      invulnTimer: 90.0,
      bookPhaseActive: false,
      bookPhaseTimer: 10.0,
      bookSpawned: false,
      vulnerableActive: false,
      vulnerableTimer: 10.0, // 10 seconds vulnerable window per cycle
      cycleCount: 0,        // how many full cycles completed
      hoverOffsetY: 0,
      hitFlash: 0
    };

    defenseStats = {
      kills: 0,
      energyCollected: 0,
      startTime: Date.now()
    };

    // Update HUD display elements
    const isRachel = defenseCommander === 'rachel';
    if (defenseEnergyIcon) defenseEnergyIcon.textContent = isRachel ? '🧬' : '⚡';
    if (defenseEnergyLabel) defenseEnergyLabel.textContent = isRachel ? 'ATP' : 'PHOTON';
    if (defenseBossTitle) defenseBossTitle.textContent = 'BOS: MR. MANUSCRIPT (TUGAS AKHIR)';
    if (defenseBossPhaseBadge) {
      defenseBossPhaseBadge.textContent = 'PERSIAPAN (12s) 🌱';
      defenseBossPhaseBadge.style.background = 'rgba(34, 197, 94, 0.2)';
      defenseBossPhaseBadge.style.color = '#86efac';
    }
    if (defenseBossHpFill) defenseBossHpFill.style.width = '100%';
    if (defenseBossHpText) defenseBossHpText.textContent = `${BOSS_MAX_HP} / ${BOSS_MAX_HP} HP`;

    if (defensePartnerAvatarIndicator) {
      defensePartnerAvatarIndicator.textContent = isRachel ? '🛡️👨‍🔬' : '🛡️👩‍🔬';
    }
    if (defensePartnerNameIndicator) {
      defensePartnerNameIndicator.innerHTML = isRachel
        ? 'Melindungi: <strong>Elang (Teknik Fisika)</strong>'
        : 'Melindungi: <strong>Rachel (Biologi)</strong>';
    }
    updateDefenseHeartsUI();

    // Tampilkan banner panduan persiapan awal agar pemain tenang menanam
    if (defenseAlertBanner && defenseAlertText) {
      defenseAlertText.textContent = '🌱 FASE PERSIAPAN: Tanam pembela cintamu!';
      defenseAlertBanner.style.display = 'block';
      setTimeout(() => {
        if (defenseAlertBanner && defenseGameTime < 11.5) {
          defenseAlertBanner.style.display = 'none';
        }
      }, 2000);
    }

    // Show Game Screen, Hide Select Screen & Modal
    if (defenseSelectScreen) defenseSelectScreen.style.display = 'none';
    if (defenseGameScreen) defenseGameScreen.style.display = 'block';
    if (defenseResultModal) defenseResultModal.style.display = 'none';

    updateDefenseCanvasRect();
    renderDefenseSeedBank();
    if (window.lucide) window.lucide.createIcons();

    if (defenseAnimFrameId) cancelAnimationFrame(defenseAnimFrameId);
    defenseAnimFrameId = requestAnimationFrame(defenseGameLoop);
  }

  function updateDefenseHeartsUI() {
    if (!defensePartnerHearts) return;
    let html = '';
    for (let i = 0; i < 3; i++) {
      if (i < defenseHearts) {
        html += '<span class="heart-icon">❤️</span>';
      } else {
        html += '<span class="heart-icon" style="filter: grayscale(1); opacity: 0.35;">🖤</span>';
      }
    }
    defensePartnerHearts.innerHTML = html;
  }

  // Spawn Enemy Logic
  function spawnDefenseEnemy() {
    const isRachel = defenseCommander === 'rachel';
    const enemyData = isRachel ? DEFENSE_ENEMIES.rachel : DEFENSE_ENEMIES.elang;
    const lane = Math.floor(Math.random() * DEFENSE_ROWS);

    // Di awal (sebelum 24 detik), musuh HANYA mata kuliah lemah agar pemain tidak kaget!
    let spawnLecturer = false;
    if (defenseGameTime >= 24.0) {
      const progress = Math.min(1, (defenseGameTime - 24.0) / 40.0);
      spawnLecturer = Math.random() < (0.2 + progress * 0.45);
    }

    let template;
    let isLecturer = false;

    if (spawnLecturer) {
      isLecturer = true;
      const progress = Math.min(1, (defenseGameTime - 24.0) / 50.0);
      let maxIdx = Math.min(4, Math.floor(progress * 5));
      const chosenIdx = Math.floor(Math.random() * (maxIdx + 1));
      template = enemyData.lecturers[chosenIdx] || enemyData.lecturers[0];
    } else {
      const chosenIdx = Math.floor(Math.random() * enemyData.courses.length);
      template = enemyData.courses[chosenIdx];
    }

    const enemy = {
      id: template.id,
      name: template.name,
      isLecturer: isLecturer,
      badge: template.badge || 'Mata Kuliah',
      icon: template.icon || '📚',
      initials: template.initials || 'MK',
      color: template.color || '#38bdf8',
      lane: lane,
      x: 770,
      y: DEFENSE_GRID_Y + lane * DEFENSE_CELL_H + DEFENSE_CELL_H / 2,
      hp: template.hp,
      maxHp: template.hp,
      speed: template.speed,
      baseSpeed: template.speed,
      damage: template.damage,
      slowTimer: 0,
      eatTimer: 0,
      stepAnim: 0,
      hitFlash: 0
    };

    defenseEnemies.push(enemy);
  }

  // Spawn Giant Walking Thesis Book (Spesial Bos di Detik ke-30)
  function spawnGiantWalkingBook() {
    const partnerKey = defenseCommander === 'rachel' ? 'elang' : 'rachel';
    const thesisTitle = DEFENSE_THESIS_TITLES[partnerKey] || 'Tugas Akhir Cinta';

    // Pick a lane with plants or random
    let targetLane = Math.floor(Math.random() * DEFENSE_ROWS);
    let mostPlantsCount = -1;
    for (let r = 0; r < DEFENSE_ROWS; r++) {
      let count = 0;
      for (let c = 0; c < DEFENSE_COLS; c++) {
        if (defenseGrid[r][c]) count++;
      }
      if (count > mostPlantsCount) {
        mostPlantsCount = count;
        targetLane = r;
      }
    }

    const bookEnemy = {
      id: 'thesis_book',
      name: `Tugas Akhir: ${thesisTitle}`,
      shortTitle: thesisTitle,
      isBook: true,
      isLecturer: true,
      color: '#fbbf24',
      lane: targetLane,
      x: 780,
      y: DEFENSE_GRID_Y + targetLane * DEFENSE_CELL_H + DEFENSE_CELL_H / 2,
      hp: 750,
      maxHp: 750,
      speed: 0.38,
      baseSpeed: 0.38,
      damage: 9999, // Crushes anything instantly!
      slowTimer: 0,
      stepAnim: 0,
      hitFlash: 0
    };

    defenseEnemies.push(bookEnemy);
    playDefenseSound('alert');
    playDefenseSound('crush');

    // Show on-screen alert banner
    if (defenseAlertBanner && defenseAlertText) {
      defenseAlertText.textContent = `⚠️ BUKU BESAR TUGAS AKHIR! (Jalur ${targetLane + 1})`;
      defenseAlertBanner.style.display = 'block';
      setTimeout(() => {
        if (defenseAlertBanner) defenseAlertBanner.style.display = 'none';
      }, 1800);
    }
  }

  // Main Game Loop (60 FPS)
  let defenseUiThrottleTimer = 0;

  function defenseGameLoop(timestamp) {
    if (defenseState !== 'playing') return;

    const dt = Math.min(0.08, (timestamp - defenseLastFrameTime) / 1000);
    defenseLastFrameTime = timestamp;
    defenseGameTime += dt;

    // Update Boss State & Phases
    updateDefenseBoss(dt);

    // Update Plants & Attack
    updateDefensePlants(dt);

    // Update Projectiles & Collisions
    updateDefenseProjectiles(dt);

    // Update Enemies & Crushing mechanics
    updateDefenseEnemies(dt);

    // Update Lawnmowers (Cinta Darurat)
    updateDefenseLawnMowers(dt);

    // Update Energy Drops & Particles
    updateDefenseEnergyDrops(dt);
    updateDefenseParticles(dt);

    // Update Seed Bank Cooldowns
    let hasActiveCooldowns = false;
    for (let i = 0; i < defenseSeedCooldowns.length; i++) {
      if (defenseSeedCooldowns[i] > 0) {
        defenseSeedCooldowns[i] = Math.max(0, defenseSeedCooldowns[i] - dt);
        hasActiveCooldowns = true;
      }
    }

    // Throttle DOM cooldown updates to avoid 60fps layout thrashing & stutter
    defenseUiThrottleTimer += dt;
    if (defenseUiThrottleTimer >= 0.06 || hasActiveCooldowns) {
      defenseUiThrottleTimer = 0;
      updateSeedBankState();
    }

    // Spawn falling energy from sky every 6.5s
    defenseSkyEnergyTimer -= dt;
    if (defenseSkyEnergyTimer <= 0) {
      defenseSkyEnergyTimer = 6.5 + Math.random() * 2;
      spawnSkyEnergy();
    }

    // Render Canvas
    renderDefenseCanvas();

    // Continue Loop
    defenseAnimFrameId = requestAnimationFrame(defenseGameLoop);
  }

  // Update Boss Mechanics
  function updateDefenseBoss(dt) {
    defenseBoss.hoverOffsetY = Math.sin(defenseGameTime * 2.2) * 8;
    if (defenseBoss.hitFlash > 0) defenseBoss.hitFlash -= dt * 4;

    // PHASE 1: Invulnerable — first cycle uses game-time threshold (90s), repeat cycles use countdown timer
    if (defenseBoss.invulnerable) {
      // For cycle 0 (first cycle): count down from 90s using game time
      // For repeat cycles: count down invulnTimer directly
      if (defenseBoss.cycleCount === 0) {
        defenseBoss.invulnTimer = Math.max(0, 90.0 - defenseGameTime);
      } else {
        defenseBoss.invulnTimer = Math.max(0, defenseBoss.invulnTimer - dt);
      }

      if (defenseBossPhaseBadge) {
        if (defenseGameTime < 12.0) {
          const prepRem = Math.ceil(12.0 - defenseGameTime);
          defenseBossPhaseBadge.textContent = `PERSIAPAN (${prepRem}s) 🌱`;
          defenseBossPhaseBadge.style.background = 'rgba(34, 197, 94, 0.2)';
          defenseBossPhaseBadge.style.color = '#86efac';
        } else {
          const remaining = Math.ceil(defenseBoss.invulnTimer);
          defenseBossPhaseBadge.textContent = `BOS KEBAL (${remaining}s) 🛡️`;
          defenseBossPhaseBadge.style.background = 'rgba(239, 68, 68, 0.2)';
          defenseBossPhaseBadge.style.color = '#f87171';
        }
      }

      // Selama fase persiapan (12 detik pertama), musuh BELUM spawn agar pemain dapat memasang pertahanan awal!
      if (defenseGameTime >= 12.0) {
        defenseSpawnTimer -= dt;
        if (defenseSpawnTimer <= 0) {
          spawnDefenseEnemy();
          // Jeda spawn di awal lebih santai (6.5s) lalu bertahap lebih menantang
          const baseInterval = defenseGameTime < 24.0 ? 6.5 : 4.0;
          defenseSpawnTimer = baseInterval + Math.random() * 1.5;
        }
      }

      // Transition to PHASE 2 when invuln timer expires
      // Cycle 0: at 90s mark; repeat cycles: when invulnTimer hits 0
      const phase1Done = defenseBoss.cycleCount === 0
        ? (defenseGameTime >= 90.0)
        : (defenseBoss.invulnTimer <= 0);

      if (phase1Done && !defenseBoss.bookPhaseActive) {
        defenseBoss.invulnerable = false;
        defenseBoss.bookPhaseActive = true;
        defenseBoss.bookPhaseTimer = 10.0;
        defenseBoss.bookSpawned = true;

        if (defenseBossPhaseBadge) {
          defenseBossPhaseBadge.textContent = 'BUKU BESAR BERJALAN 📖 (10s)';
          defenseBossPhaseBadge.style.background = 'rgba(245, 197, 24, 0.25)';
          defenseBossPhaseBadge.style.color = '#fef08a';
        }

        spawnGiantWalkingBook();
      }
    }
    // PHASE 2: Walking Thesis Book (90s to 100s) — STOP regular spawns for 10s!
    else if (defenseBoss.bookPhaseActive) {
      defenseBoss.bookPhaseTimer -= dt;

      if (defenseBossPhaseBadge) {
        const rem = Math.max(0, Math.ceil(defenseBoss.bookPhaseTimer));
        defenseBossPhaseBadge.textContent = `BUKU BESAR BERJALAN 📖 (${rem}s)`;
      }

      // After 10s book phase, transition to PHASE 3: Vulnerable
      if (defenseBoss.bookPhaseTimer <= 0) {
        defenseBoss.bookPhaseActive = false;
        defenseBoss.vulnerableActive = true;
        defenseBoss.vulnerableTimer = 10.0; // reset 10-second attack window

        if (defenseBossPhaseBadge) {
          defenseBossPhaseBadge.textContent = 'RENTAN (SERANG BOS!) ⚡';
          defenseBossPhaseBadge.style.background = 'rgba(34, 197, 94, 0.25)';
          defenseBossPhaseBadge.style.color = '#86efac';
        }

        playDefenseSound('alert');
        if (defenseAlertBanner && defenseAlertText) {
          defenseAlertText.textContent = '⚡ PERISAI HANCUR! SERANG BOS! ⚡';
          defenseAlertBanner.style.display = 'block';
          setTimeout(() => {
            if (defenseAlertBanner) defenseAlertBanner.style.display = 'none';
          }, 1800);
        }
      }
    }
    // PHASE 3: Vulnerable Boss Battle! (10 seconds window, then loop back to Phase 1)
    else if (defenseBoss.vulnerableActive) {
      // Countdown the 10-second vulnerable window
      defenseBoss.vulnerableTimer -= dt;

      // Update badge with countdown
      if (defenseBossPhaseBadge) {
        const rem = Math.max(0, Math.ceil(defenseBoss.vulnerableTimer));
        defenseBossPhaseBadge.textContent = `RENTAN — SERANG! ⚡ (${rem}s)`;
        defenseBossPhaseBadge.style.background = 'rgba(34, 197, 94, 0.25)';
        defenseBossPhaseBadge.style.color = '#86efac';
      }

      // Periodically spawn enemies every 6 to 8 seconds to defend himself
      defenseSpawnTimer -= dt;
      if (defenseSpawnTimer <= 0) {
        spawnDefenseEnemy();
        defenseSpawnTimer = 6.0 + Math.random() * 2.0;
      }

      // After 10s vulnerable window, loop back to PHASE 1 (invulnerable + spawning for 30s)
      if (defenseBoss.vulnerableTimer <= 0) {
        defenseBoss.cycleCount += 1;
        defenseBoss.vulnerableActive = false;
        defenseBoss.invulnerable = true;
        defenseBoss.invulnTimer = 30.0; // repeat cycles: 30 seconds invuln
        defenseBoss.bookPhaseActive = false;
        defenseBoss.bookSpawned = false;
        defenseBoss.bookPhaseTimer = 10.0;
        defenseBoss.vulnerableTimer = 10.0;

        if (defenseBossPhaseBadge) {
          defenseBossPhaseBadge.textContent = `BOS KEBAL (30s) 🛡️`;
          defenseBossPhaseBadge.style.background = 'rgba(239, 68, 68, 0.2)';
          defenseBossPhaseBadge.style.color = '#f87171';
        }

        // Alert: shield recharged
        if (defenseAlertBanner && defenseAlertText) {
          defenseAlertText.textContent = '🛡️ PERISAI PULIH! BERTAHAN!';
          defenseAlertBanner.style.display = 'block';
          setTimeout(() => {
            if (defenseAlertBanner) defenseAlertBanner.style.display = 'none';
          }, 1800);
        }
      }
    }

    // Update Boss HP HUD Bar
    if (defenseBossHpFill) {
      const pct = Math.max(0, Math.min(100, (defenseBoss.hp / defenseBoss.maxHp) * 100));
      defenseBossHpFill.style.width = `${pct}%`;
    }
    if (defenseBossHpText) {
      defenseBossHpText.textContent = `${Math.max(0, Math.ceil(defenseBoss.hp))} / ${defenseBoss.maxHp} HP`;
    }

    // Check Boss Defeat (Victory!)
    if (defenseBoss.hp <= 0) {
      endDefenseGame(true);
    }
  }

  // Update Plants
  function updateDefensePlants(dt) {
    for (let r = 0; r < DEFENSE_ROWS; r++) {
      // Check if any enemies exist in this lane (or boss vulnerable)
      const enemiesInLane = defenseEnemies.some(e => e.lane === r && e.x > DEFENSE_GRID_X && e.x < 770);
      const canHitBoss = defenseBoss.vulnerableActive;

      for (let c = 0; c < DEFENSE_COLS; c++) {
        const plant = defenseGrid[r][c];
        if (!plant) continue;

        plant.animTimer = (plant.animTimer || 0) + dt;

        // Producer (Sunflower / Solar Panel)
        if (plant.type === 'producer') {
          plant.produceTimer = (plant.produceTimer || 0) + dt;
          if (plant.produceTimer >= plant.produceInterval) {
            plant.produceTimer = 0;
            spawnProducedEnergy(
              DEFENSE_GRID_X + c * DEFENSE_CELL_W + DEFENSE_CELL_W / 2,
              DEFENSE_GRID_Y + r * DEFENSE_CELL_H + DEFENSE_CELL_H / 2
            );
          }
        }
        // Shooters (Peashooter / Photon Blaster / Cryo)
        else if (plant.type === 'shooter' || plant.type === 'slow_shooter') {
          plant.shootTimer = (plant.shootTimer || 0) + dt;
          if (plant.shootTimer >= plant.shootInterval) {
            if (enemiesInLane || canHitBoss) {
              plant.shootTimer = 0;
              spawnProjectile(r, c, plant);
            }
          }
        }
        // Bombs (Spora / Plasma Bomb)
        else if (plant.type === 'bomb') {
          plant.fuseTimer = (plant.fuseTimer || 0) + dt;
          if (plant.fuseTimer >= plant.fuse) {
            triggerBombExplosion(r, c, plant);
            defenseGrid[r][c] = null;
          }
        }
      }
    }
  }

  // Spawn Projectile
  function spawnProjectile(row, col, plant) {
    const startX = DEFENSE_GRID_X + col * DEFENSE_CELL_W + DEFENSE_CELL_W - 8;
    const startY = DEFENSE_GRID_Y + row * DEFENSE_CELL_H + DEFENSE_CELL_H / 2;

    defenseProjectiles.push({
      lane: row,
      x: startX,
      y: startY,
      speed: 360,
      damage: plant.damage || 24,
      isSlow: plant.type === 'slow_shooter',
      color: plant.bulletColor || '#38bdf8'
    });

    playDefenseSound(plant.type === 'slow_shooter' ? 'freeze' : 'shoot');
  }

  // Trigger Bomb Explosion (3x3 Tiles)
  function triggerBombExplosion(centerRow, centerCol, plant) {
    const centerX = DEFENSE_GRID_X + centerCol * DEFENSE_CELL_W + DEFENSE_CELL_W / 2;
    const centerY = DEFENSE_GRID_Y + centerRow * DEFENSE_CELL_H + DEFENSE_CELL_H / 2;

    playDefenseSound('boom');

    // Spawn massive explosion particles
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 160;
      defenseParticles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        color: plant.id === 'spora' ? '#ef4444' : '#06b6d4',
        alpha: 1,
        life: 0.6 + Math.random() * 0.4
      });
    }

    // Damage all enemies within row +-1, col +-1
    const minX = DEFENSE_GRID_X + (centerCol - 1) * DEFENSE_CELL_W;
    const maxX = DEFENSE_GRID_X + (centerCol + 2) * DEFENSE_CELL_W;

    defenseEnemies.forEach(e => {
      if (Math.abs(e.lane - centerRow) <= 1 && e.x >= minX && e.x <= maxX) {
        e.hp -= plant.damage;
        e.hitFlash = 1;
        createHitSparks(e.x, e.y, '#f59e0b', 8);
      }
    });

    // Also damage boss if in vicinity and vulnerable
    if (defenseBoss.vulnerableActive && Math.abs(centerRow - 2) <= 1 && centerCol >= 7) {
      defenseBoss.hp -= plant.damage;
      defenseBoss.hitFlash = 1;
    }
  }

  // Update Projectiles
  function updateDefenseProjectiles(dt) {
    for (let i = defenseProjectiles.length - 1; i >= 0; i--) {
      const p = defenseProjectiles[i];
      p.x += p.speed * dt;

      // Check collision with enemies in the same lane
      let hit = false;
      for (let j = 0; j < defenseEnemies.length; j++) {
        const e = defenseEnemies[j];
        if (e.lane === p.lane && p.x >= e.x - 25 && p.x <= e.x + 25) {
          e.hp -= p.damage;
          e.hitFlash = 1;
          createHitSparks(p.x, p.y, p.color, 4);

          if (p.isSlow) {
            e.slowTimer = 3.5;
            e.speed = e.baseSpeed * 0.5;
            playDefenseSound('freeze');
          } else {
            playDefenseSound('hit');
          }

          hit = true;
          break;
        }
      }

      // Check collision with Boss at right boundary
      if (!hit && p.x >= 740) {
        if (defenseBoss.vulnerableActive) {
          defenseBoss.hp -= p.damage;
          defenseBoss.hitFlash = 1;
          createHitSparks(p.x, p.y, '#ef4444', 6);
          playDefenseSound('hit');
        } else {
          // Bounces off forcefield
          createHitSparks(740, p.y, '#c084fc', 5);
        }
        hit = true;
      }

      if (hit || p.x > 860) {
        defenseProjectiles.splice(i, 1);
      }
    }
  }

  // Update Enemies
  function updateDefenseEnemies(dt) {
    for (let i = defenseEnemies.length - 1; i >= 0; i--) {
      const e = defenseEnemies[i];

      // Update Slow Timer
      if (e.slowTimer > 0) {
        e.slowTimer -= dt;
        if (e.slowTimer <= 0) {
          e.speed = e.baseSpeed;
        }
      }

      if (e.hitFlash > 0) e.hitFlash -= dt * 4;
      e.stepAnim = (e.stepAnim || 0) + dt * 4;

      // Check if hitting a plant in front
      const col = Math.floor((e.x - DEFENSE_GRID_X) / DEFENSE_CELL_W);
      let eatingPlant = null;

      if (col >= 0 && col < DEFENSE_COLS) {
        const plant = defenseGrid[e.lane][col];
        if (plant) {
          // Check collision distance
          const plantCenterX = DEFENSE_GRID_X + col * DEFENSE_CELL_W + DEFENSE_CELL_W / 2;
          if (Math.abs(e.x - plantCenterX) < 26) {
            eatingPlant = plant;
          }
        }
      }

      // SPECIAL MECHANIC: Giant Walking Thesis Book CRUSHES plants instantly!
      if (e.isBook && eatingPlant) {
        eatingPlant.crushed = true;
        createHitSparks(eatingPlant.x || e.x, e.y, '#ef4444', 16);
        playDefenseSound('crush');
        defenseGrid[e.lane][col] = null; // Instantly squashed!
        eatingPlant = null;
      }

      if (eatingPlant) {
        // Normal enemy eating plant
        eatingPlant.hp -= e.damage * dt;
        eatingPlant.hitFlash = 1;

        if (eatingPlant.hp <= 0) {
          createHitSparks(DEFENSE_GRID_X + col * DEFENSE_CELL_W + DEFENSE_CELL_W / 2, e.y, '#22c55e', 8);
          defenseGrid[e.lane][col] = null;
        }
      } else {
        // Walk forward to the left
        e.x -= e.speed * dt * 60;
      }

      // Check Enemy Death
      if (e.hp <= 0) {
        defenseStats.kills++;
        createDeathParticles(e.x, e.y, e.color);

        if (e.isBook) {
          // Bonus energy when destroying the giant book!
          for (let k = 0; k < 4; k++) {
            spawnProducedEnergy(e.x - 30 + k * 20, e.y);
          }
          playDefenseSound('boom');
        }

        defenseEnemies.splice(i, 1);
        continue;
      }

      // Check Breach (Lawn Mower Trigger or Partner Damage)
      if (e.x <= 85) {
        if (defenseLawnMowers[e.lane]) {
          // Trigger Emergency Love Cart / Lawnmower in this lane!
          triggerLawnMower(e.lane);
        } else if (e.x <= 40) {
          // Enemy breaks through and hits Protected Partner!
          defenseHearts--;
          updateDefenseHeartsUI();
          playDefenseSound('boom');
          createHitSparks(e.x, e.y, '#ef4444', 20);
          defenseEnemies.splice(i, 1);

          if (defenseHearts <= 0) {
            endDefenseGame(false);
            return;
          }
        }
      }
    }
  }

  // Lawnmower / Cinta Darurat System
  let activeMowerRunners = []; // { lane, x, speed }

  function triggerLawnMower(lane) {
    if (!defenseLawnMowers[lane]) return;
    defenseLawnMowers[lane] = false;
    activeMowerRunners.push({
      lane: lane,
      x: 80,
      y: DEFENSE_GRID_Y + lane * DEFENSE_CELL_H + DEFENSE_CELL_H / 2,
      speed: 520
    });
    playDefenseSound('boom');
  }

  function updateDefenseLawnMowers(dt) {
    for (let i = activeMowerRunners.length - 1; i >= 0; i--) {
      const m = activeMowerRunners[i];
      m.x += m.speed * dt;

      // Crush all enemies in this lane
      for (let j = defenseEnemies.length - 1; j >= 0; j--) {
        const e = defenseEnemies[j];
        if (e.lane === m.lane && Math.abs(e.x - m.x) < 40) {
          e.hp = 0;
          createDeathParticles(e.x, e.y, '#ef4444');
          playDefenseSound('crush');
          defenseStats.kills++;
          defenseEnemies.splice(j, 1);
        }
      }

      // Remove after passing screen
      if (m.x > 860) {
        activeMowerRunners.splice(i, 1);
      }
    }
  }

  // Energy System (Falling from Sky & Produced by Plants)
  function spawnSkyEnergy() {
    const isRachel = defenseCommander === 'rachel';
    defenseEnergyDrops.push({
      x: DEFENSE_GRID_X + Math.random() * (DEFENSE_COLS * DEFENSE_CELL_W - 40),
      y: 0,
      targetY: DEFENSE_GRID_Y + Math.random() * (DEFENSE_ROWS * DEFENSE_CELL_H - 30),
      speed: 60,
      type: isRachel ? 'atp' : 'photon',
      value: 25,
      animTimer: 0,
      collected: false
    });
  }

  function spawnProducedEnergy(x, y) {
    const isRachel = defenseCommander === 'rachel';
    defenseEnergyDrops.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y,
      targetY: y + (Math.random() - 0.5) * 15,
      speed: 30,
      type: isRachel ? 'atp' : 'photon',
      value: 25,
      animTimer: 0,
      collected: false
    });
  }

  function updateDefenseEnergyDrops(dt) {
    for (let i = defenseEnergyDrops.length - 1; i >= 0; i--) {
      const drop = defenseEnergyDrops[i];
      drop.animTimer += dt;

      if (drop.collected) {
        // Fly towards top energy badge
        drop.x += (40 - drop.x) * dt * 10;
        drop.y += (20 - drop.y) * dt * 10;
        if (drop.y < 35) {
          defenseEnergy += drop.value;
          defenseStats.energyCollected += drop.value;
          playDefenseSound('collect');
          updateSeedBankState();
          defenseEnergyDrops.splice(i, 1);
        }
      } else {
        if (drop.y < drop.targetY) {
          drop.y += drop.speed * dt;
        }
      }
    }
  }

  // Particle System
  function createHitSparks(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 80;
      defenseParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2,
        color: color,
        alpha: 1,
        life: 0.3 + Math.random() * 0.2
      });
    }
  }

  function createDeathParticles(x, y, color) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 110;
      defenseParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3.5,
        color: color,
        alpha: 1,
        life: 0.4 + Math.random() * 0.3
      });
    }
  }

  function updateDefenseParticles(dt) {
    for (let i = defenseParticles.length - 1; i >= 0; i--) {
      const p = defenseParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life * 2);
      if (p.life <= 0) {
        defenseParticles.splice(i, 1);
      }
    }
  }

  // Canvas Drawing & Art Rendering
  function renderDefenseCanvas() {
    if (!defenseCtx) return;
    const ctx = defenseCtx;
    const w = defenseCanvas.width;
    const h = defenseCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Lawn / Lab Tile Background
    drawDefenseBoard(ctx);

    // 2. Draw Protected Partner & Base Line on Left
    drawProtectedPartner(ctx);

    // 3. Draw Emergency Love Mowers
    drawLawnMowers(ctx);

    // 4. Draw Plants on Tiles
    drawPlants(ctx);

    // 5. Draw Placement Ghost if Hovering
    drawHoverGhost(ctx);

    // 6. Draw Projectiles
    drawProjectiles(ctx);

    // 7. Draw Enemies & Giant Walking Thesis Book
    drawEnemies(ctx);

    // 8. Draw Boss (Mr. Manuscript / Tugas Akhir)
    drawBoss(ctx);

    // 9. Draw Energy Drops
    drawEnergyDrops(ctx);

    // 10. Draw Particles
    drawParticles(ctx);
  }

  // Draw Checkered Board Grid
  function drawDefenseBoard(ctx) {
    const isRachel = defenseCommander === 'rachel';

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 850, 420);
    if (isRachel) {
      bgGrad.addColorStop(0, '#062015');
      bgGrad.addColorStop(1, '#0b1622');
    } else {
      bgGrad.addColorStop(0, '#081726');
      bgGrad.addColorStop(1, '#0e111a');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 850, 420);

    // Grid tiles (5 rows x 9 cols)
    for (let r = 0; r < DEFENSE_ROWS; r++) {
      for (let c = 0; c < DEFENSE_COLS; c++) {
        const x = DEFENSE_GRID_X + c * DEFENSE_CELL_W;
        const y = DEFENSE_GRID_Y + r * DEFENSE_CELL_H;
        const isEven = (r + c) % 2 === 0;

        if (isRachel) {
          ctx.fillStyle = isEven ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.06)';
        } else {
          ctx.fillStyle = isEven ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.06)';
        }
        ctx.fillRect(x, y, DEFENSE_CELL_W - 2, DEFENSE_CELL_H - 2);

        // Tile border outline
        ctx.strokeStyle = isRachel ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, DEFENSE_CELL_W - 2, DEFENSE_CELL_H - 2);
      }
    }

    // Lane division lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= DEFENSE_ROWS; r++) {
      const y = DEFENSE_GRID_Y + r * DEFENSE_CELL_H;
      ctx.beginPath();
      ctx.moveTo(DEFENSE_GRID_X, y);
      ctx.lineTo(DEFENSE_GRID_X + DEFENSE_COLS * DEFENSE_CELL_W, y);
      ctx.stroke();
    }
  }

  // Draw Protected Partner on Left (Elang or Rachel)
  function drawProtectedPartner(ctx) {
    const isRachel = defenseCommander === 'rachel';
    const partnerKey = isRachel ? 'protect-elang' : 'protect-rachel';
    const partnerName = isRachel ? 'Elang' : 'Rachel';
    const majorBadge = isRachel ? 'Teknik Fisika' : 'Biologi';

    // Goal protection baseline
    ctx.strokeStyle = isRachel ? 'rgba(6, 182, 212, 0.5)' : 'rgba(16, 185, 129, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(110, DEFENSE_GRID_Y);
    ctx.lineTo(110, DEFENSE_GRID_Y + DEFENSE_ROWS * DEFENSE_CELL_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Partner Podium & Character Avatar
    const centerX = 50;
    const centerY = DEFENSE_GRID_Y + (DEFENSE_ROWS * DEFENSE_CELL_H) / 2;

    // Glowing Love Aura Ring
    const auraPulse = Math.sin(defenseGameTime * 3) * 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 15, 38 + auraPulse, 0, Math.PI * 2);
    ctx.fillStyle = isRachel ? 'rgba(6, 182, 212, 0.15)' : 'rgba(16, 185, 129, 0.15)';
    ctx.fill();
    ctx.strokeStyle = isRachel ? 'rgba(6, 182, 212, 0.6)' : 'rgba(16, 185, 129, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Partner Face (Image with fallback)
    drawCharacterAvatar(ctx, centerX, centerY - 15, 60, partnerKey, isRachel ? '#06b6d4' : '#10b981', isRachel ? 'EL' : 'RC');

    // Partner Label & Hearts
    ctx.font = 'bold 10px Cinzel, serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(partnerName, centerX, centerY + 30);

    ctx.font = '8px sans-serif';
    ctx.fillStyle = isRachel ? '#38bdf8' : '#34d399';
    ctx.fillText(majorBadge, centerX, centerY + 42);

    // Love Shield Hearts
    let heartsStr = '';
    for (let h = 0; h < defenseHearts; h++) heartsStr += '❤️ ';
    ctx.font = '11px sans-serif';
    ctx.fillText(heartsStr.trim(), centerX, centerY + 58);
  }

  // Draw Emergency Love Mowers (Cinta Darurat)
  function drawLawnMowers(ctx) {
    for (let r = 0; r < DEFENSE_ROWS; r++) {
      if (defenseLawnMowers[r]) {
        const x = 86;
        const y = DEFENSE_GRID_Y + r * DEFENSE_CELL_H + DEFENSE_CELL_H / 2;

        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚀', x, y);

        ctx.font = '8px sans-serif';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('CINTA', x, y + 15);
      }
    }

    // Active rushing mowers
    activeMowerRunners.forEach(m => {
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚀💖', m.x, m.y);
    });
  }

  // Draw Plants on Board
  function drawPlants(ctx) {
    for (let r = 0; r < DEFENSE_ROWS; r++) {
      for (let c = 0; c < DEFENSE_COLS; c++) {
        const plant = defenseGrid[r][c];
        if (!plant) continue;

        const x = DEFENSE_GRID_X + c * DEFENSE_CELL_W + DEFENSE_CELL_W / 2;
        const y = DEFENSE_GRID_Y + r * DEFENSE_CELL_H + DEFENSE_CELL_H / 2;
        const sway = Math.sin((plant.animTimer || 0) * 3) * 2;

        ctx.save();
        ctx.translate(x, y + sway);

        // Crushed squish animation
        if (plant.crushed) {
          ctx.scale(1.4, 0.2);
        }

        // Draw Plant Icon
        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(plant.icon, 0, 0);

        // Wallnut / Barrier Damage Cracks
        if (plant.type === 'wall' && plant.hp < plant.maxHp * 0.5) {
          ctx.font = '16px sans-serif';
          ctx.fillText('🩹', 12, -12);
        }

        // Health bar if damaged
        if (plant.hp < plant.maxHp && !plant.crushed) {
          const hpPct = Math.max(0, plant.hp / plant.maxHp);
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(-20, 22, 40, 4);
          ctx.fillStyle = hpPct > 0.4 ? '#22c55e' : '#ef4444';
          ctx.fillRect(-20, 22, 40 * hpPct, 4);
        }

        ctx.restore();
      }
    }
  }

  // Draw Hover Ghost when planting
  function drawHoverGhost(ctx) {
    if (defenseState !== 'playing' || !defenseHoverCell) return;
    const { r, c } = defenseHoverCell;
    if (r < 0 || r >= DEFENSE_ROWS || c < 0 || c >= DEFENSE_COLS) return;

    const x = DEFENSE_GRID_X + c * DEFENSE_CELL_W;
    const y = DEFENSE_GRID_Y + r * DEFENSE_CELL_H;
    const currentPlant = defenseGrid[r][c];

    if (defenseShovelActive) {
      // Shovel highlight
      ctx.fillStyle = currentPlant ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(x, y, DEFENSE_CELL_W - 2, DEFENSE_CELL_H - 2);
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧹', x + DEFENSE_CELL_W / 2, y + DEFENSE_CELL_H / 2);
    } else if (defenseSelectedSeed !== null) {
      const plant = DEFENSE_PLANTS[defenseCommander][defenseSelectedSeed];
      const isValid = !currentPlant;

      ctx.fillStyle = isValid ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(x, y, DEFENSE_CELL_W - 2, DEFENSE_CELL_H - 2);

      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(plant.icon, x + DEFENSE_CELL_W / 2, y + DEFENSE_CELL_H / 2);
      ctx.restore();
    }
  }

  // Draw Projectiles
  function drawProjectiles(ctx) {
    defenseProjectiles.forEach(p => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.isSlow ? 6 : 5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();

      // Laser / Spore trail
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 14, p.y);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();
    });
  }

  // Draw Enemies & Giant Walking Thesis Book
  function drawEnemies(ctx) {
    defenseEnemies.forEach(e => {
      ctx.save();
      const bob = Math.sin(e.stepAnim || 0) * 3;

      if (e.isBook) {
        // ========================================================
        // BUKU BESAR BERJALAN (GIANT WALKING THESIS BOOK)
        // ========================================================
        ctx.translate(e.x, e.y + bob);

        // Walking Legs
        const legSwing = Math.sin(e.stepAnim * 2) * 8;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 4;
        // Left Leg
        ctx.beginPath();
        ctx.moveTo(-15, 24);
        ctx.lineTo(-15 + legSwing, 38);
        ctx.stroke();
        // Right Leg
        ctx.beginPath();
        ctx.moveTo(15, 24);
        ctx.lineTo(15 - legSwing, 38);
        ctx.stroke();

        // Sturdy Hardcover Book Body
        ctx.fillStyle = '#7f1d1d'; // Crimson/leather thesis binding
        ctx.beginPath();
        ctx.roundRect(-42, -32, 84, 60, 6);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b'; // Gold border
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Gold Ribbon Bookmark
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-4, 26, 8, 14);

        // Thesis Book Title & Details
        ctx.font = 'bold 8px Cinzel, serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('TUGAS AKHIR', 0, -18);

        ctx.font = 'bold 7px sans-serif';
        ctx.fillStyle = '#fff';
        const displayTitle = e.shortTitle.length > 20 ? e.shortTitle.substring(0, 18) + '...' : e.shortTitle;
        ctx.fillText(displayTitle, 0, -5);

        // Menacing glowing eyes
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-14, 10, 3, 0, Math.PI * 2);
        ctx.arc(14, 10, 3, 0, Math.PI * 2);
        ctx.fill();

        // Crush Warning Tag
        ctx.font = 'bold 7px sans-serif';
        ctx.fillStyle = '#fca5a5';
        ctx.fillText('⚠️ MERATAKAN ⚠️', 0, 20);

        // Health bar
        const hpPct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(-35, -38, 70, 5);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-35, -38, 70 * hpPct, 5);
      } else if (e.isLecturer) {
        // ========================================================
        // DOSEN ZOMBIE (Pak Suyanto, Bambang, Syamsul, Katherin, Ridho, etc.)
        // ========================================================
        ctx.translate(e.x, e.y + bob);

        // Chill blue aura if slowed
        if (e.slowTimer > 0) {
          ctx.beginPath();
          ctx.arc(0, 0, 26, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.fill();
        }

        // Draw Lecturer Face (Image with stylized fallback)
        drawCharacterAvatar(ctx, 0, -6, 42, e.id, e.color, e.initials);

        // Name badge
        ctx.font = 'bold 8px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(e.name, 0, 24);

        // Academic Rank / HP badge
        ctx.font = '7px sans-serif';
        ctx.fillStyle = e.color;
        ctx.fillText(e.badge, 0, 33);

        // Health bar
        const hpPct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(-20, -32, 40, 4);
        ctx.fillStyle = hpPct > 0.35 ? e.color : '#ef4444';
        ctx.fillRect(-20, -32, 40 * hpPct, 4);
      } else {
        // ========================================================
        // MATA KULIAH ZOMBIE (Fisika Bahan, Kuantum, Bio Mol, etc.)
        // ========================================================
        ctx.translate(e.x, e.y + bob);

        // Floating Course Scroll / Book
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.roundRect(-24, -20, 48, 40, 5);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(e.icon, 0, -4);

        ctx.font = 'bold 7px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(e.name.length > 14 ? e.name.substring(0, 12) + '..' : e.name, 0, 12);

        // Health bar
        const hpPct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(-18, -26, 36, 3.5);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-18, -26, 36 * hpPct, 3.5);
      }

      ctx.restore();
    });
  }

  // Draw Avatar Helper (Custom Image or Stylized Caricature)
  function drawCharacterAvatar(ctx, x, y, size, key, defaultColor, initials) {
    const cached = defenseImages[key];

    if (cached && cached.loaded && cached.img.naturalWidth > 0) {
      // Draw User's custom photo inside a circle clip!
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(cached.img, x - size / 2, y - size / 2, size, size);
      ctx.restore();

      // Border ring
      ctx.strokeStyle = defaultColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Fallback: High Quality Stylized Cartoon Caricature with Tie/Glasses & Initials
      ctx.save();
      // Face base circle
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = defaultColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Doctor / Academic Cap or Hair
      ctx.fillStyle = defaultColor;
      ctx.beginPath();
      ctx.moveTo(x - size / 2.5, y - size / 5);
      ctx.lineTo(x, y - size / 2.2);
      ctx.lineTo(x + size / 2.5, y - size / 5);
      ctx.lineTo(x, y - size / 8);
      ctx.closePath();
      ctx.fill();

      // Initials Text
      ctx.font = `bold ${Math.floor(size * 0.38)}px Cinzel, serif`;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials || 'DS', x, y + 4);

      // Glasses detail
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x - size / 3, y - 2, size / 3.5, size / 5);
      ctx.strokeRect(x + size / 16, y - 2, size / 3.5, size / 5);

      ctx.restore();
    }
  }

  // Draw Boss (Mr. Manuscript / Tugas Akhir - Dr. Zomboss style)
  function drawBoss(ctx) {
    const boss = defenseBoss;
    const x = boss.x;
    const y = boss.y + (boss.hoverOffsetY || 0);

    ctx.save();
    ctx.translate(x, y);

    // Hit Flash
    if (boss.hitFlash > 0) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating Manuscript Sheets around Boss
    for (let s = 0; s < 5; s++) {
      const angle = defenseGameTime * 2 + (s * Math.PI * 2) / 5;
      const sx = Math.cos(angle) * 48;
      const sy = Math.sin(angle) * 32;

      ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
      ctx.fillRect(sx - 6, sy - 8, 12, 16);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - 6, sy - 8, 12, 16);
    }

    // Dr. Zomboss Style Academic Entity Body
    ctx.fillStyle = '#1e1b4b'; // Deep scholarly robe
    ctx.beginPath();
    ctx.roundRect(-32, -38, 64, 76, 10);
    ctx.fill();
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Giant Quill Pen in Hand
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪶', 28, -15);

    // Scholarly Hat
    ctx.font = '28px sans-serif';
    ctx.fillText('🎓', 0, -32);

    // Glowing Eyes
    ctx.fillStyle = boss.vulnerableActive ? '#ef4444' : '#a855f7';
    ctx.beginPath();
    ctx.arc(-10, -8, 4, 0, Math.PI * 2);
    ctx.arc(10, -8, 4, 0, Math.PI * 2);
    ctx.fill();

    // Master Manuscript Seal on Chest
    ctx.font = 'bold 8px Cinzel, serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText('TUGAS AKHIR', 0, 14);
    ctx.font = '7px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Mr. Manuscript', 0, 24);

    // FORCEFIELD SPHERE WHEN INVULNERABLE
    if (boss.invulnerable) {
      const shieldPulse = Math.sin(defenseGameTime * 5) * 3;
      ctx.beginPath();
      ctx.arc(0, 0, 56 + shieldPulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 8px sans-serif';
      ctx.fillStyle = '#f3e8ff';
      ctx.fillText('🛡️ KEBAL (30s)', 0, 48);
    }

    ctx.restore();
  }

  // Draw Energy Drops (ATP or Photon)
  function drawEnergyDrops(ctx) {
    defenseEnergyDrops.forEach(drop => {
      const isAtp = drop.type === 'atp';
      const bounce = Math.sin(drop.animTimer * 4) * 3;

      ctx.save();
      ctx.translate(drop.x, drop.y + bounce);

      // Glowing aura
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fillStyle = isAtp ? 'rgba(34, 197, 94, 0.3)' : 'rgba(6, 182, 212, 0.3)';
      ctx.fill();

      // Energy Icon
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isAtp ? '🧬' : '⚡', 0, 0);

      // Floating label
      ctx.font = 'bold 8px sans-serif';
      ctx.fillStyle = isAtp ? '#4ade80' : '#38bdf8';
      ctx.fillText(`+${drop.value}`, 0, 16);

      ctx.restore();
    });
  }

  // Draw Particles
  function drawParticles(ctx) {
    defenseParticles.forEach(p => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.restore();
    });
  }

  // End Game (Victory or Defeat)
  function endDefenseGame(isWin) {
    defenseState = 'ended';
    if (defenseAnimFrameId) cancelAnimationFrame(defenseAnimFrameId);

    const elapsed = Math.floor((Date.now() - defenseStats.startTime) / 1000);

    if (isWin) {
      playDefenseSound('win');
      if (window.confetti) {
        window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }

      // Update records
      if (defenseCommander === 'rachel') {
        defenseRecords.rachelWins = (defenseRecords.rachelWins || 0) + 1;
        if (!defenseRecords.rachelBestTime || elapsed < defenseRecords.rachelBestTime) {
          defenseRecords.rachelBestTime = elapsed;
        }
      } else {
        defenseRecords.elangWins = (defenseRecords.elangWins || 0) + 1;
        if (!defenseRecords.elangBestTime || elapsed < defenseRecords.elangBestTime) {
          defenseRecords.elangBestTime = elapsed;
        }
      }
      saveDefenseRecords();
      updateDefenseHighScoresUI();

      if (defenseResultIcon) defenseResultIcon.textContent = '🎓💖';
      if (defenseResultTitle) defenseResultTitle.textContent = 'TUGAS AKHIR TERCAPAI! KELULUSAN CINTA!';
      if (defenseResultVerdict) {
        defenseResultVerdict.textContent = defenseCommander === 'rachel'
          ? 'Luar biasa! Rachel berhasil melindungi Elang dari gempuran dosen & Tugas Akhir Teknik Fisika! Cinta kalian tak tergoyahkan!'
          : 'Luar biasa! Elang berhasil melindungi Rachel dari gempuran dosen & Tugas Akhir Biologi! Cinta kalian tak tergoyahkan!';
      }
      if (defenseFinalOutcome) {
        defenseFinalOutcome.textContent = 'MENANG 🎉';
        defenseFinalOutcome.style.color = '#22c55e';
      }
    } else {
      playDefenseSound('lose');
      if (defenseResultIcon) defenseResultIcon.textContent = '💔🥀';
      if (defenseResultTitle) defenseResultTitle.textContent = 'PERTAHANAN CINTA TERBOBOL!';
      if (defenseResultVerdict) {
        defenseResultVerdict.textContent = 'Dosen & Tugas Akhir sempat menembus benteng... Tapi cinta sejati tak pernah menyerah! Mari kita coba lagi bersama!';
      }
      if (defenseFinalOutcome) {
        defenseFinalOutcome.textContent = 'KALAH 💔';
        defenseFinalOutcome.style.color = '#ef4444';
      }
    }

    if (defenseFinalKills) defenseFinalKills.textContent = defenseStats.kills;
    if (defenseFinalTime) defenseFinalTime.textContent = formatDefenseTime(elapsed);
    if (defenseFinalEnergy) defenseFinalEnergy.textContent = defenseStats.energyCollected;

    if (defenseResultModal) {
      defenseResultModal.style.display = 'flex';
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // Pointer & Touch Controls on Canvas
  let defenseCanvasRect = null;
  function updateDefenseCanvasRect() {
    if (defenseCanvas) defenseCanvasRect = defenseCanvas.getBoundingClientRect();
  }
  window.addEventListener('resize', updateDefenseCanvasRect);
  window.addEventListener('scroll', updateDefenseCanvasRect, { passive: true });

  function getDefenseCanvasPos(e) {
    if (!defenseCanvas) return { x: 0, y: 0 };
    const rect = defenseCanvas.getBoundingClientRect();
    const scaleX = defenseCanvas.width / rect.width;
    const scaleY = defenseCanvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  let lastDefenseTouchTime = 0;
  if (defenseCanvas) {
    defenseCanvas.addEventListener('mousemove', e => {
      if (defenseState !== 'playing') return;
      const pos = getDefenseCanvasPos(e);
      const c = Math.floor((pos.x - DEFENSE_GRID_X) / DEFENSE_CELL_W);
      const r = Math.floor((pos.y - DEFENSE_GRID_Y) / DEFENSE_CELL_H);
      if (r >= 0 && r < DEFENSE_ROWS && c >= 0 && c < DEFENSE_COLS) {
        defenseHoverCell = { r, c };
      } else {
        defenseHoverCell = null;
      }
    });

    defenseCanvas.addEventListener('mouseleave', () => {
      defenseHoverCell = null;
    });

    // Click / Tap Handler
    function handleDefenseCanvasClick(e) {
      if (defenseState !== 'playing') return;
      const pos = getDefenseCanvasPos(e);

      // 1. Check if clicking on an Energy Drop
      for (let i = defenseEnergyDrops.length - 1; i >= 0; i--) {
        const drop = defenseEnergyDrops[i];
        if (!drop.collected) {
          const dist = Math.hypot(pos.x - drop.x, pos.y - drop.y);
          if (dist < 32) {
            drop.collected = true;
            playDefenseSound('collect');
            return;
          }
        }
      }

      // 2. Check Grid Cell Interaction
      const c = Math.floor((pos.x - DEFENSE_GRID_X) / DEFENSE_CELL_W);
      const r = Math.floor((pos.y - DEFENSE_GRID_Y) / DEFENSE_CELL_H);

      if (r >= 0 && r < DEFENSE_ROWS && c >= 0 && c < DEFENSE_COLS) {
        if (defenseShovelActive) {
          // Remove plant
          if (defenseGrid[r][c]) {
            defenseGrid[r][c] = null;
            defenseShovelActive = false;
            if (defenseShovelBtn) defenseShovelBtn.classList.remove('active');
            playDefenseSound('plant');
            updateSeedBankState();
          }
        } else if (defenseSelectedSeed !== null) {
          // Plant unit
          const plantDef = DEFENSE_PLANTS[defenseCommander][defenseSelectedSeed];
          if (!defenseGrid[r][c] && defenseEnergy >= plantDef.cost && defenseSeedCooldowns[defenseSelectedSeed] <= 0) {
            defenseEnergy -= plantDef.cost;
            defenseSeedCooldowns[defenseSelectedSeed] = plantDef.cooldown;

            defenseGrid[r][c] = {
              id: plantDef.id,
              name: plantDef.name,
              unitName: plantDef.unitName,
              icon: plantDef.icon,
              type: plantDef.type,
              hp: plantDef.hp,
              maxHp: plantDef.hp,
              produceInterval: plantDef.produceInterval,
              shootInterval: plantDef.shootInterval,
              damage: plantDef.damage,
              bulletColor: plantDef.bulletColor,
              fuse: plantDef.fuse,
              animTimer: 0
            };

            playDefenseSound('plant');
            defenseSelectedSeed = null;
            updateSeedBankState();
          }
        }
      }
    }

    defenseCanvas.addEventListener('touchstart', e => {
      lastDefenseTouchTime = performance.now();
      handleDefenseCanvasClick(e);
    }, { passive: true });

    defenseCanvas.addEventListener('click', e => {
      if (performance.now() - lastDefenseTouchTime < 450) return; // Prevent double trigger on touch devices
      handleDefenseCanvasClick(e);
    });
  }

  // Responsive Canvas Resize Helper
  function resizeDefenseCanvas() {
    if (!defenseCanvas) return;
    updateDefenseCanvasRect();
    // Canvas dimensions are fixed to 850x420, CSS handles responsive aspect-ratio scaling
  }

  // Button Listeners
  if (defenseLandscapeBtn) {
    defenseLandscapeBtn.addEventListener('click', () => toggleGameLandscape('defense'));
  }

  if (defenseStartBtn) {
    defenseStartBtn.addEventListener('click', () => {
      requestGameLandscape('defense');
      startDefenseGame();
    });
  }

  if (defensePauseBtn) {
    defensePauseBtn.addEventListener('click', () => {
      if (defenseState === 'playing') {
        defenseState = 'paused';
        defensePauseBtn.innerHTML = '<i data-lucide="play"></i>';
      } else if (defenseState === 'paused') {
        defenseState = 'playing';
        defenseLastFrameTime = performance.now();
        defensePauseBtn.innerHTML = '<i data-lucide="pause"></i>';
        defenseAnimFrameId = requestAnimationFrame(defenseGameLoop);
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  if (defenseExitBtn) {
    defenseExitBtn.addEventListener('click', () => {
      exitGameLandscape();
      defenseState = 'lobby';
      if (defenseAnimFrameId) cancelAnimationFrame(defenseAnimFrameId);
      if (defenseGameScreen) defenseGameScreen.style.display = 'none';
      if (defenseSelectScreen) defenseSelectScreen.style.display = 'block';
      if (defenseResultModal) defenseResultModal.style.display = 'none';
      updateDefenseHighScoresUI();
    });
  }

  if (defenseRetryBtn) {
    defenseRetryBtn.addEventListener('click', () => {
      if (defenseResultModal) defenseResultModal.style.display = 'none';
      requestGameLandscape('defense');
      startDefenseGame();
    });
  }

  if (defenseBackToMenuBtn) {
    defenseBackToMenuBtn.addEventListener('click', () => {
      exitGameLandscape();
      defenseState = 'lobby';
      if (defenseGameScreen) defenseGameScreen.style.display = 'none';
      if (defenseSelectScreen) defenseSelectScreen.style.display = 'block';
      if (defenseResultModal) defenseResultModal.style.display = 'none';
      updateDefenseHighScoresUI();
    });
  }

  // Reset Love Defense Records (Testing & Shortcut)
  function resetDefenseScores() {
    defenseRecords = {
      rachelWins: 0,
      rachelBestTime: null,
      elangWins: 0,
      elangBestTime: null
    };
    try {
      localStorage.removeItem(DEFENSE_STORAGE_KEY);
    } catch (e) {
      console.warn('Could not reset defense records:', e);
    }
    updateDefenseHighScoresUI();
    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    playDefenseSound('plant');
  }

  // Expose globally for testing via browser console
  window.resetDefenseScores = window.resetDefenseRecords = resetDefenseScores;

  if (defenseSecretResetBtn) {
    defenseSecretResetBtn.addEventListener('click', resetDefenseScores);
  }

  // Secret shortcut: Press '0' anywhere when in Love Defense tab
  window.addEventListener('keydown', (e) => {
    if (e.key === '0' && document.activeElement && document.activeElement.tagName !== 'INPUT') {
      const isDefenseVisible = defenseWrapper && defenseWrapper.style.display !== 'none';
      if (isDefenseVisible) {
        resetDefenseScores();
      }
    }
  });

  // Initial render of Love Defense lobby records
  updateDefenseHighScoresUI();

  // ==================== 9. SECRET VAULT: WAX SEAL ENVELOPE ====================
  const waxSealTrigger = document.getElementById('wax-seal-trigger');
  const sealedEnvelope = document.getElementById('sealed-envelope');
  const openedLetter = document.getElementById('opened-letter');
  const closeLetterTopBtn = document.getElementById('close-letter-top-btn');
  const closeLetterBottomBtn = document.getElementById('close-letter-bottom-btn');

  function openLetter() {
    if (waxSealTrigger) waxSealTrigger.style.transform = 'scale(0.8)';

    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    setTimeout(() => {
      sealedEnvelope.style.display = 'none';
      openedLetter.style.display = 'block';
      if (window.lucide) window.lucide.createIcons();
      openedLetter.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  }

  function closeLetter() {
    openedLetter.style.display = 'none';
    sealedEnvelope.style.display = 'block';
    if (waxSealTrigger) waxSealTrigger.style.transform = 'scale(1)';
    sealedEnvelope.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (waxSealTrigger) {
    waxSealTrigger.addEventListener('click', openLetter);
  }

  if (closeLetterTopBtn) {
    closeLetterTopBtn.addEventListener('click', closeLetter);
  }

  if (closeLetterBottomBtn) {
    closeLetterBottomBtn.addEventListener('click', closeLetter);
  }

  // ==================== 10. AMBIENT BACKGROUND PARTICLES CANVAS ====================
  function initAmbientParticles() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(50, Math.floor(width / 25));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        color: Math.random() > 0.6 ? '#f5c518' : (Math.random() > 0.3 ? '#a855f7' : '#38bdf8'),
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }
});

// Global function for claiming vouchers
function claimVoucher(id, btnElement) {
  if (btnElement.classList.contains('claimed')) return;

  btnElement.classList.add('claimed');
  btnElement.innerHTML = '<span>TERKLAIM! ❤️ Elang Siap Menemani</span>';

  if (window.confetti) {
    window.confetti({
      particleCount: 90,
      spread: 60,
      origin: { y: 0.8 }
    });
  }
}
