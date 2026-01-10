const state = {
  currentMood: null,
  verses: [],
  isSearching: false,
  currentAudio: null,
  playingVerseId: null,
  ayatsData: null
};

// ========================================
// ✨ NEW: EMOTION MAPPING SYSTEM
// ========================================
const emotionMap = {
  // HAPPY & JOY
  "happy": "happy",
  "joyful": "happy",
  "cheerful": "happy",
  "delighted": "happy",
  "pleased": "happy",
  "content": "happy",
  "satisfied": "happy",
  "glad": "happy",
  "ecstatic": "happy",
  "elated": "happy",
  "thrilled": "happy",
  "excited": "happy",
  "optimistic": "happy",
  "positive": "happy",
  "great": "happy",
  
  // SAD & SORROW
  "sad": "sad",
  "unhappy": "sad",
  "sorrowful": "sad",
  "miserable": "sad",
  "depressed": "sad",
  "down": "sad",
  "low": "sad",
  "blue": "sad",
  "gloomy": "sad",
  "melancholy": "sad",
  "heartbroken": "sad",
  "disappointed": "sad",
  "discouraged": "sad",
  "hopeless": "sad",
  "despairing": "sad",
  "grief": "sad",
  "grieving": "sad",
  "mourning": "sad",
  "lonely": "sad",
  "isolated": "sad",
  "empty": "sad",
  
  // ANXIOUS & WORRIED
  "anxious": "anxious",
  "worried": "anxious",
  "nervous": "anxious",
  "stressed": "anxious",
  "distressed": "anxious",
  "concerned": "anxious",
  "uneasy": "anxious",
  "restless": "anxious",
  "tense": "anxious",
  "fearful": "anxious",
  "scared": "anxious",
  "afraid": "anxious",
  "panicked": "anxious",
  "overwhelmed": "anxious",
  "troubled": "anxious",
  "uncertain": "anxious",
  "insecure": "anxious",
  
  // ANGRY & FRUSTRATED
  "angry": "angry",
  "mad": "angry",
  "furious": "angry",
  "frustrated": "angry",
  "annoyed": "angry",
  "irritated": "angry",
  "agitated": "angry",
  "upset": "angry",
  "enraged": "angry",
  "outraged": "angry",
  "resentful": "angry",
  "bitter": "angry",
  "hostile": "angry",
  "offended": "angry",
  
  // HOPE & OPTIMISM
  "hope": "hope",
  "hopeful": "hope",
  "optimistic": "hope",
  "encouraged": "hope",
  "inspired": "hope",
  "motivated": "hope",
  "determined": "hope",
  "ambitious": "hope",
  "aspiring": "hope",
  
  // PATIENCE
  "patience": "patience",
  "patient": "patience",
  "persevering": "patience",
  "enduring": "patience",
  "resilient": "patience",
  "persistent": "patience",
  "steadfast": "patience",
  "tolerant": "patience",
  
  // GRATITUDE & THANKFULNESS
  "gratitude": "gratitude",
  "grateful": "gratitude",
  "thankful": "gratitude",
  "appreciative": "gratitude",
  "fortunate": "gratitude",
  "lucky": "gratitude",
  
  // GUIDANCE & SEEKING
  "guidance": "guidance",
  "lost": "guidance",
  "confused": "guidance",
  "uncertain": "guidance",
  "searching": "guidance",
  "seeking": "guidance",
  "wondering": "guidance",
  "questioning": "guidance",
  "directionless": "guidance",
  "bewildered": "guidance",
  
  // TRUST & FAITH
  "trust": "trust",
  "trusting": "trust",
  "faithful": "trust",
  "believing": "trust",
  "confident": "trust",
  "secure": "trust",
  "reassured": "trust",
  "reliant": "trust",
  
  // PEACE & CALM
  "peace": "peace",
  "peaceful": "peace",
  "calm": "peace",
  "serene": "peace",
  "tranquil": "peace",
  "relaxed": "peace",
  "composed": "peace",
  "centered": "peace",
  "balanced": "peace",
  "harmonious": "peace",
  "still": "peace",
  "quiet": "peace",
  
  // GOOD & VIRTUE
  "good": "good",
  "virtuous": "good",
  "righteous": "good",
  "kind": "good",
  "compassionate": "good",
  "generous": "good",
  "charitable": "good",
  "helpful": "good",
  
  // BLESSED
  "blessed": "blessed",
  "favored": "blessed",
  "fortunate": "blessed"
};

function mapEmotion(userInput) {
  if (!userInput || typeof userInput !== 'string') {
    return null;
  }
  
  const normalized = userInput.toLowerCase().trim();
  
  if (emotionMap[normalized]) {
    return emotionMap[normalized];
  }
  
  for (const [key, value] of Object.entries(emotionMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  return null;
}

function getCoreEmotions() {
  return [...new Set(Object.values(emotionMap))];
}
// ========================================
// END OF NEW EMOTION MAPPING
// ========================================

// ===== DOM ELEMENTS =====
const elements = {
  searchBar: document.getElementById('search-bar'),
  searchBtn: document.getElementById('search-btn'),
  hero: document.getElementById('hero'),
  results: document.getElementById('results'),
  loading: document.getElementById('loading'),
  verseContainer: document.getElementById('verse-container'),
  emptyState: document.getElementById('empty-state'),
  resultsHeader: document.getElementById('results-header'),
  moodTitle: document.getElementById('mood-title'),
  verseCount: document.getElementById('verse-count'),
  backBtn: document.getElementById('back-btn'),
  moodPills: document.querySelectorAll('.mood-pill'),
  modal: document.getElementById('modal'),
  modalBody: document.getElementById('modal-body'),
  modalOverlay: document.getElementById('modal-overlay'),
  modalClose: document.getElementById('modal-close'),
  openBookmarks: document.getElementById('open-bookmarks'),
  closeBookmarks: document.getElementById('close-bookmarks'),
  bookmarksModal: document.getElementById('bookmarks-modal'),
  bookmarksList: document.getElementById('bookmarks-list')
};

// ===== MOOD PHRASES =====
const moodPhrases = [
  'How are you feeling?',
  'Happy',
  'Sad',
  'Hopeful',
  'Patient',
  'Grateful',
  'Seeking guidance',
  'Trusting',
  'Peaceful'
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingTimeout;

// ===== TYPING ANIMATION =====
function typeEffect() {
  const currentPhrase = moodPhrases[phraseIndex];
  
  if (!isDeleting) {
    elements.searchBar.placeholder = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
    
    if (charIndex === currentPhrase.length) {
      typingTimeout = setTimeout(() => {
        isDeleting = true;
        typeEffect();
      }, 2000);
      return;
    }
  } else {
    elements.searchBar.placeholder = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
    
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % moodPhrases.length;
    }
  }
  
  const typingSpeed = isDeleting ? 50 : 100;
  typingTimeout = setTimeout(typeEffect, typingSpeed);
}

// ===== BOOKMARK HELPERS =====
function getBookmarks() {
  return JSON.parse(localStorage.getItem('solaceBookmarks') || '[]');
}

function isBookmarked(verse) {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.verse === verse.verse && b.arabic === verse.arabic);
}

function toggleBookmark(verse, button) {
  let bookmarks = getBookmarks();
  const index = bookmarks.findIndex(b => b.verse === verse.verse && b.arabic === verse.arabic);
  
  if (index > -1) {
    bookmarks.splice(index, 1);
    button.classList.remove('active');
  } else {
    bookmarks.push(verse);
    button.classList.add('active');
  }
  
  localStorage.setItem('solaceBookmarks', JSON.stringify(bookmarks));
  updateBookmarkButtons(verse);
}

function updateBookmarkButtons(verse) {
  const isNowBookmarked = isBookmarked(verse);
  
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    const card = btn.closest('.verse-card, .modal-body');
    if (card) {
      const verseRef = card.querySelector('.verse-reference');
      if (verseRef && verseRef.textContent.includes(verse.verse)) {
        if (isNowBookmarked) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
        const svg = btn.querySelector('svg');
        if (svg) {
          svg.setAttribute('fill', isNowBookmarked ? 'currentColor' : 'none');
        }
      }
    }
  });
}

// ===== AUDIO HELPERS =====
function playAudio(verse, button, verseId) {
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio = null;
    
    const prevButton = document.querySelector(`.audio-btn[data-verse-id="${state.playingVerseId}"]`);
    if (prevButton) prevButton.classList.remove('playing');
  }
  
  if (state.playingVerseId === verseId) {
    state.playingVerseId = null;
    button.classList.remove('playing');
    return;
  }
  
  const audioUrl = getAudioUrl(verse);
  
  if (!audioUrl) {
    alert('Audio not available for this verse');
    return;
  }
  
  state.currentAudio = new Audio(audioUrl);
  state.playingVerseId = verseId;
  button.classList.add('playing');
  
  state.currentAudio.play().catch(err => {
    console.error('Audio playback failed:', err);
    button.classList.remove('playing');
    state.currentAudio = null;
    state.playingVerseId = null;
  });
  
  state.currentAudio.addEventListener('ended', () => {
    button.classList.remove('playing');
    state.currentAudio = null;
    state.playingVerseId = null;
  });
}

function getAudioUrl(verse) {
  if (verse.audioNumber) {
    return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${verse.audioNumber}.mp3`;
  }
  
  const [surah, ayah] = verse.verse.split(':').map(Number);
  const ayahNumber = calculateAyahNumber(surah, ayah);
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`;
}

function calculateAyahNumber(surah, ayah) {
  const surahVerses = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
    123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
    34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
    54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
    60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
    14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
    28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
    29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
    15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
    11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
    5, 4, 5, 6
  ];
  
  let totalAyahs = 0;
  for (let i = 1; i < surah; i++) {
    totalAyahs += surahVerses[i - 1];
  }
  
  return totalAyahs + ayah;
}

// ========================================
// ✨ UPDATED: SEARCH FUNCTIONALITY
// ========================================
async function searchMood(mood) {
  if (!mood || state.isSearching) return;
  
  state.isSearching = true;
  
  // Map user input to core emotion
  const mappedEmotion = mapEmotion(mood);
  
  if (!mappedEmotion) {
    showEmotionNotFoundError(mood);
    state.isSearching = false;
    return;
  }
  
  state.currentMood = mappedEmotion;
  
  elements.hero.classList.add('compact');
  elements.results.classList.add('active');
  elements.loading.classList.add('active');
  elements.verseContainer.innerHTML = '';
  elements.emptyState.classList.remove('active');
  
  elements.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  try {
    const response = await fetch('ayats.json');
    const data = await response.json();
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const verses = data[state.currentMood] || [];
    state.verses = verses;
    
    displayResults(verses, mood, mappedEmotion);
  } catch (error) {
    console.error('Error fetching verses:', error);
    showError();
  } finally {
    state.isSearching = false;
    elements.loading.classList.remove('active');
  }
}

// ========================================
// ✨ UPDATED: DISPLAY RESULTS
// ========================================
function displayResults(verses, userMood, mappedEmotion) {
  const displayMood = userMood.charAt(0).toUpperCase() + userMood.slice(1);
  
  elements.moodTitle.textContent = `${displayMood} Verses`;
  
  if (userMood.toLowerCase() !== mappedEmotion) {
    elements.verseCount.textContent = `${verses.length} verse${verses.length !== 1 ? 's' : ''} found (showing ${mappedEmotion} verses)`;
  } else {
    elements.verseCount.textContent = `${verses.length} verse${verses.length !== 1 ? 's' : ''} found`;
  }
  
  elements.verseContainer.innerHTML = '';
  
  if (verses.length === 0) {
    elements.emptyState.classList.add('active');
    return;
  }
  
  verses.forEach((verse, index) => {
    const card = createVerseCard(verse, index);
    elements.verseContainer.appendChild(card);
  });
}

// ========================================
// ✨ NEW: ERROR HANDLING FOR UNKNOWN EMOTIONS
// ========================================
function showEmotionNotFoundError(mood) {
  elements.hero.classList.add('compact');
  elements.results.classList.add('active');
  elements.verseContainer.innerHTML = '';
  elements.emptyState.classList.remove('active');
  
  const coreEmotions = getCoreEmotions();
  const suggestions = coreEmotions.slice(0, 8).map(emotion => 
    `<button class="suggestion-pill" onclick="searchMood('${emotion}')">${emotion}</button>`
  ).join('');
  
  elements.verseContainer.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
      <svg style="width: 64px; height: 64px; color: var(--text-tertiary); margin: 0 auto 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary);">
        Hmm, I don't recognize "${mood}"
      </h3>
      <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
        Try searching for one of these emotions:
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; max-width: 600px; margin: 0 auto;">
        ${suggestions}
      </div>
    </div>
  `;
  
  elements.moodTitle.textContent = 'Emotion Not Found';
  elements.verseCount.textContent = '';
}

// ===== CREATE VERSE CARD =====
function createVerseCard(verse, index) {
  const card = document.createElement('div');
  card.className = 'verse-card';
  card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`;
  const verseId = `verse-${verse.verse.replace(':', '-')}`;

  card.innerHTML = `
    <div class="verse-card-header">
      <div class="verse-actions">
        <button class="bookmark-btn ${isBookmarked(verse) ? 'active' : ''}" title="Bookmark">
          <svg viewBox="0 0 24 24" fill="${isBookmarked(verse) ? 'currentColor' : 'none'}" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
        </button>
        <button class="audio-btn" data-verse-id="${verseId}" title="Play Audio">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="verse-arabic">${verse.arabic}</div>
    <div class="verse-translation">${verse.translation}</div>
    <div class="verse-reference">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
      ${verse.verse}
    </div>
  `;

  const bookmarkBtn = card.querySelector('.bookmark-btn');
  const audioBtn = card.querySelector('.audio-btn');
  
  bookmarkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBookmark(verse, bookmarkBtn);
    const svg = bookmarkBtn.querySelector('svg');
    svg.setAttribute('fill', bookmarkBtn.classList.contains('active') ? 'currentColor' : 'none');
  });
  
  audioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playAudio(verse, audioBtn, verseId);
  });

  card.addEventListener('click', () => openModal(verse));

  return card;
}

// ===== MODAL FUNCTIONS =====
function openModal(verse) {
  const verseId = `modal-verse-${verse.verse.replace(':', '-')}`;
  
  elements.modalBody.innerHTML = `
    <div class="verse-actions">
      <button class="bookmark-btn ${isBookmarked(verse) ? 'active' : ''}" title="Bookmark">
        <svg viewBox="0 0 24 24" fill="${isBookmarked(verse) ? 'currentColor' : 'none'}" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
        </svg>
      </button>
      <button class="audio-btn" data-verse-id="${verseId}" title="Play Audio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
        </svg>
      </button>
    </div>
    <div class="verse-arabic">${verse.arabic}</div>
    <div class="verse-translation">${verse.translation}</div>
    <div class="verse-reference">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
      Surah ${verse.verse}
    </div>
  `;
  
  const bookmarkBtn = elements.modalBody.querySelector('.bookmark-btn');
  const audioBtn = elements.modalBody.querySelector('.audio-btn');
  
  bookmarkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBookmark(verse, bookmarkBtn);
    const svg = bookmarkBtn.querySelector('svg');
    svg.setAttribute('fill', bookmarkBtn.classList.contains('active') ? 'currentColor' : 'none');
  });
  
  audioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playAudio(verse, audioBtn, verseId);
  });
  
  elements.modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  elements.modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== BOOKMARKS =====
function renderBookmarks() {
  const bookmarks = getBookmarks();
  elements.bookmarksList.innerHTML = '';

  if (bookmarks.length === 0) {
    elements.bookmarksList.innerHTML = `
      <p style="color:var(--text-secondary); text-align:center; padding:2rem;">
        No bookmarks yet. Tap the bookmark icon on any verse to save it here.
      </p>
    `;
    return;
  }

  bookmarks.forEach(verse => {
    const item = document.createElement('div');
    item.className = 'bookmark-item';

    item.innerHTML = `
      <div class="arabic">${verse.arabic}</div>
      <div class="ref">Surah ${verse.verse}</div>
    `;

    item.addEventListener('click', () => {
      closeBookmarks();
      openModal(verse);
    });

    elements.bookmarksList.appendChild(item);
  });
}

function closeBookmarks() {
  elements.bookmarksModal.classList.remove('active');
}

// ===== BACK BUTTON =====
function goBack() {
  elements.hero.classList.remove('compact');
  elements.results.classList.remove('active');
  elements.searchBar.value = '';
  state.currentMood = null;
  
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio = null;
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== ERROR HANDLING =====
function showError() {
  elements.verseContainer.innerHTML = `
    <div style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
      <svg style="width: 64px; height: 64px; color: var(--text-tertiary); margin: 0 auto 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Something went wrong</h3>
      <p style="color: var(--text-secondary);">Please try again later</p>
    </div>
  `;
}

// ===== EVENT LISTENERS =====
elements.searchBar.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const mood = elements.searchBar.value.trim();
    if (mood) searchMood(mood);
  }
});

elements.searchBtn.addEventListener('click', () => {
  const mood = elements.searchBar.value.trim();
  if (mood) searchMood(mood);
});

elements.moodPills.forEach(pill => {
  pill.addEventListener('click', () => {
    const mood = pill.getAttribute('data-mood');
    elements.searchBar.value = mood;
    searchMood(mood);
  });
});

elements.backBtn.addEventListener('click', goBack);
elements.modalClose.addEventListener('click', closeModal);
elements.modalOverlay.addEventListener('click', closeModal);

elements.openBookmarks.addEventListener('click', () => {
  renderBookmarks();
  elements.bookmarksModal.classList.add('active');
});

elements.closeBookmarks.addEventListener('click', closeBookmarks);
elements.bookmarksModal.querySelector('.bookmarks-overlay').addEventListener('click', closeBookmarks);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (elements.modal.classList.contains('active')) {
      closeModal();
    } else if (elements.bookmarksModal.classList.contains('active')) {
      closeBookmarks();
    }
  }
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  typeEffect();
  
  elements.searchBar.addEventListener('focus', () => {
    clearTimeout(typingTimeout);
  });
  
  elements.searchBar.addEventListener('blur', () => {
    if (!elements.searchBar.value) {
      setTimeout(() => {
        charIndex = 0;
        isDeleting = false;
        typeEffect();
      }, 1000);
    }
  });
  
  console.log('🌟 Solace - Enhanced Version Loaded');
  console.log(`📊 Emotion Mapping Active: ${Object.keys(emotionMap).length} emotions → ${getCoreEmotions().length} categories`);
});