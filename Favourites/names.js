// ===== STATE =====
const state = {
  allNames: [],
  filteredNames: [],
  viewedNames: new Set(),
  currentMode: 'hero', // 'hero', 'shuffle', 'browse'
  currentName: null
};

// ===== DOM ELEMENTS =====
const elements = {
  hero: document.getElementById('hero'),
  searchBar: document.getElementById('search-bar'),
  shuffleBtn: document.getElementById('shuffle-btn'),
  browseBtn: document.getElementById('browse-btn'),
  shuffleResult: document.getElementById('shuffle-result'),
  shuffleCard: document.getElementById('shuffle-card'),
  backBtnShuffle: document.getElementById('back-btn-shuffle'),
  results: document.getElementById('results'),
  resultsHeader: document.getElementById('results-header'),
  backBtn: document.getElementById('back-btn'),
  modeTitle: document.getElementById('mode-title'),
  nameCount: document.getElementById('name-count'),
  loading: document.getElementById('loading'),
  namesContainer: document.getElementById('names-container'),
  emptyState: document.getElementById('empty-state'),
  modal: document.getElementById('modal'),
  modalBody: document.getElementById('modal-body'),
  modalOverlay: document.getElementById('modal-overlay'),
  modalClose: document.getElementById('modal-close'),
  progressIndicator: document.getElementById('progress-indicator'),
  progressText: document.getElementById('progress-text'),
  dailyNameBanner: document.getElementById('daily-name-banner'),
  dailyNameText: document.getElementById('daily-name-text')
};

// ===== LOAD DATA =====
async function loadNames() {
  try {
    const response = await fetch('names.json');
    const data = await response.json();
    state.allNames = data.names;
    state.filteredNames = [...state.allNames];
    
    // Load viewed names from localStorage
    const viewed = localStorage.getItem('solaceViewedNames');
    if (viewed) {
      state.viewedNames = new Set(JSON.parse(viewed));
    }
    
    updateProgress();
    initializeDailyName();
  } catch (error) {
    console.error('Error loading names:', error);
  }
}

// ===== DAILY NAME =====
function initializeDailyName() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('solaceDailyName');
  
  let dailyName;
  
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.date === today) {
      // Same day, use stored name
      dailyName = state.allNames.find(n => n.number === parsed.number);
    }
  }
  
  if (!dailyName) {
    // New day, generate new random name
    dailyName = state.allNames[Math.floor(Math.random() * state.allNames.length)];
    localStorage.setItem('solaceDailyName', JSON.stringify({
      date: today,
      number: dailyName.number
    }));
  }
  
  // Display daily name
  elements.dailyNameText.textContent = `${dailyName.transliteration} - ${dailyName.meaning}`;
  
  // Make banner clickable
  elements.dailyNameBanner.style.cursor = 'pointer';
  elements.dailyNameBanner.addEventListener('click', () => {
    showSingleName(dailyName);
  });
}

// ===== PROGRESS TRACKER =====
function updateProgress() {
  const viewed = state.viewedNames.size;
  const total = state.allNames.length;
  elements.progressText.textContent = `${viewed}/${total}`;
  
  // Add visual indicator
  const percentage = (viewed / total) * 100;
  elements.progressIndicator.style.setProperty('--progress', `${percentage}%`);
  
  // Save to localStorage
  localStorage.setItem('solaceViewedNames', JSON.stringify([...state.viewedNames]));
}

function markAsViewed(nameNumber) {
  state.viewedNames.add(nameNumber);
  updateProgress();
}

// ===== SHUFFLE =====
function shuffleName() {
  const randomName = state.allNames[Math.floor(Math.random() * state.allNames.length)];
  showSingleName(randomName);
}

function showSingleName(name) {
  state.currentMode = 'shuffle';
  state.currentName = name;
  markAsViewed(name.number);
  
  // Hide hero and browse
  elements.hero.classList.add('hidden');
  elements.results.classList.remove('active');
  
  // Show shuffle result with animation
  elements.shuffleResult.classList.add('active');
  
  // Create card with animation
  elements.shuffleCard.innerHTML = createShuffleCard(name);
  
  // Animate card entrance
  setTimeout(() => {
    elements.shuffleCard.querySelector('.name-card-large').classList.add('show');
  }, 100);
}

function createShuffleCard(name) {
  const cardHTML = `
    <div class="name-card-large">
      <div class="name-number">${name.number} / 99</div>
      <div class="name-arabic-large">${name.arabic}</div>
      <div class="name-transliteration-large">${name.transliteration}</div>
      <div class="name-meaning-large">${name.meaning}</div>
      <div class="name-description">${name.description}</div>
      <div class="name-benefit">
        <div class="benefit-icon">✨</div>
        <div>${name.benefit}</div>
      </div>
      <div class="card-actions">
        <button class="share-btn" data-name-number="${name.number}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          Share
        </button>
        <button class="shuffle-again-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Shuffle Again
        </button>
      </div>
    </div>
  `;
  
  // Set up event listeners after inserting HTML
  setTimeout(() => {
    const shareBtn = elements.shuffleCard.querySelector('.share-btn');
    const shuffleAgainBtn = elements.shuffleCard.querySelector('.shuffle-again-btn');
    
    if (shareBtn) {
      shareBtn.addEventListener('click', () => shareName(name.number));
    }
    if (shuffleAgainBtn) {
      shuffleAgainBtn.addEventListener('click', shuffleName);
    }
  }, 0);
  
  return cardHTML;
}

// ===== BROWSE ALL =====
function browseAll() {
  state.currentMode = 'browse';
  
  elements.hero.classList.add('compact');
  elements.shuffleResult.classList.remove('active');
  elements.results.classList.add('active');
  elements.loading.classList.add('active');
  elements.namesContainer.innerHTML = '';
  elements.emptyState.classList.remove('active');
  
  elements.modeTitle.textContent = 'All Names';
  elements.nameCount.textContent = '99 names';
  
  // Simulate loading
  setTimeout(() => {
    displayNames(state.filteredNames);
    elements.loading.classList.remove('active');
  }, 500);
}

function displayNames(names) {
  elements.namesContainer.innerHTML = '';
  
  if (names.length === 0) {
    elements.emptyState.classList.add('active');
    return;
  }
  
  names.forEach((name, index) => {
    const card = createNameCard(name, index);
    elements.namesContainer.appendChild(card);
  });
}

function createNameCard(name, index) {
  const card = document.createElement('div');
  card.className = 'verse-card name-card';
  card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.05}s backwards`;
  
  const isViewed = state.viewedNames.has(name.number);
  
  card.innerHTML = `
    <div class="name-card-header">
      <div class="name-number">${name.number}</div>
      ${isViewed ? '<div class="viewed-badge">✓</div>' : ''}
    </div>
    <div class="name-arabic">${name.arabic}</div>
    <div class="name-transliteration">${name.transliteration}</div>
    <div class="name-meaning">${name.meaning}</div>
  `;
  
  card.addEventListener('click', () => openModal(name));
  
  return card;
}

// ===== SEARCH =====
function searchNames(query) {
  if (!query.trim()) {
    state.filteredNames = [...state.allNames];
  } else {
    const lowerQuery = query.toLowerCase();
    state.filteredNames = state.allNames.filter(name => 
      name.transliteration.toLowerCase().includes(lowerQuery) ||
      name.meaning.toLowerCase().includes(lowerQuery) ||
      name.arabic.includes(query) ||
      name.description.toLowerCase().includes(lowerQuery)
    );
  }
  
  if (state.currentMode === 'browse') {
    displayNames(state.filteredNames);
    elements.nameCount.textContent = `${state.filteredNames.length} name${state.filteredNames.length !== 1 ? 's' : ''} found`;
  }
}

// ===== MODAL =====
function openModal(name) {
  markAsViewed(name.number);
  
  const isViewed = state.viewedNames.has(name.number);
  
  elements.modalBody.innerHTML = `
    <div class="modal-name-header">
      <div class="name-number">${name.number} / 99</div>
      ${isViewed ? '<div class="viewed-badge-large">✓ Explored</div>' : ''}
    </div>
    <div class="name-arabic-large">${name.arabic}</div>
    <div class="name-transliteration-large">${name.transliteration}</div>
    <div class="name-meaning-large">${name.meaning}</div>
    <div class="name-description">${name.description}</div>
    <div class="name-benefit">
      <div class="benefit-icon">✨</div>
      <div>${name.benefit}</div>
    </div>
    <div class="modal-actions">
      <button class="share-btn" data-name-number="${name.number}">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
        Share
      </button>
    </div>
  `;
  
  // Add event listener to share button
  setTimeout(() => {
    const shareBtn = elements.modalBody.querySelector('.share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => shareName(name.number));
    }
  }, 0);
  
  elements.modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  elements.modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== SHARE FUNCTION =====
function shareName(nameNumber) {
  const name = state.allNames.find(n => n.number === nameNumber);
  if (!name) return;
  
  const shareText = `${name.arabic}
${name.transliteration} - ${name.meaning}

${name.description}

✨ ${name.benefit}

#99NamesOfAllah #Solace`;
  
  // Try Web Share API first (mobile)
  if (navigator.share) {
    navigator.share({
      title: `${name.transliteration} - ${name.meaning}`,
      text: shareText
    }).catch(err => {
      console.log('Share cancelled');
    });
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      showToast('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      showToast('Failed to copy');
    });
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ===== NAVIGATION =====
function goBack() {
  if (state.currentMode === 'shuffle') {
    elements.shuffleResult.classList.remove('active');
    elements.hero.classList.remove('hidden');
    elements.hero.classList.remove('compact');
    state.currentMode = 'hero';
  } else if (state.currentMode === 'browse') {
    elements.hero.classList.remove('compact');
    elements.results.classList.remove('active');
    elements.searchBar.value = '';
    state.filteredNames = [...state.allNames];
    state.currentMode = 'hero';
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== EVENT LISTENERS =====
elements.shuffleBtn.addEventListener('click', shuffleName);
elements.browseBtn.addEventListener('click', browseAll);
elements.backBtn.addEventListener('click', goBack);
elements.backBtnShuffle.addEventListener('click', goBack);
elements.modalClose.addEventListener('click', closeModal);
elements.modalOverlay.addEventListener('click', closeModal);

elements.searchBar.addEventListener('input', (e) => {
  searchNames(e.target.value);
});

elements.searchBar.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && state.currentMode === 'hero') {
    browseAll();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (elements.modal.classList.contains('active')) {
      closeModal();
    }
  }
});

// Make progress indicator clickable to show stats
elements.progressIndicator.addEventListener('click', () => {
  const viewed = state.viewedNames.size;
  const remaining = state.allNames.length - viewed;
  const percentage = Math.round((viewed / state.allNames.length) * 100);
  
  showToast(`${viewed} explored • ${remaining} remaining • ${percentage}% complete`);
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  loadNames();
  console.log('🌟 99 Names of Allah - Loaded');
});