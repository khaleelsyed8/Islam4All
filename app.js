// ========================================
// State Management
// ========================================
const state = {
  currentView: "surah",
  currentMode: "translate",
  currentLanguage: "en.ahmedraza",
  currentSurah: null,
  currentJuz: null,
  currentAyahs: [],
  currentAyahIndex: 0,
  darkMode: false,
  bookmarks: [],
  progress: {},
  isPlaying: false,
  viewtype: null,
};

// ========================================
// DOM Elements
// ========================================
const elements = {
  loader: document.getElementById("loader"),
  sidebar: document.getElementById("sidebar"),
  sidebarContent: document.getElementById("sidebarContent"),
  sidebarToggleBtn: document.getElementById("sidebarToggleBtn"),
  content: document.getElementById("content"),
  searchInput: document.getElementById("searchInput"),
  darkModeBtn: document.getElementById("darkModeBtn"),
  languageBtn: document.getElementById("languageBtn"),
  languageMenu: document.getElementById("languageMenu"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),
  floatingSearchBtn: document.getElementById("floatingSearchBtn"),
  tabBtns: document.querySelectorAll(".tab-btn"),
  modeBtns: document.querySelectorAll(".mode-btn"),

  // Bookmarks
  bookmarksBtn: document.getElementById("bookmarksBtn"),
  bookmarksModal: document.getElementById("bookmarksModal"),
  bookmarksContent: document.getElementById("bookmarksContent"),
  closeBookmarksBtn: document.getElementById("closeBookmarksBtn"),
  bookmarkBadge: document.getElementById("bookmarkBadge"),

  // Progress
  progressBtn: document.getElementById("progressBtn"),
  progressModal: document.getElementById("progressModal"),
  progressContent: document.getElementById("progressContent"),
  closeProgressBtn: document.getElementById("closeProgressBtn"),

  // Audio
  audioPlayer: document.getElementById("audioPlayer"),
  audioElement: document.getElementById("audioElement"),
  playPauseBtn: document.getElementById("playPauseBtn"),
  prevAyahBtn: document.getElementById("prevAyahBtn"),
  nextAyahBtn: document.getElementById("nextAyahBtn"),
  closeAudioBtn: document.getElementById("closeAudioBtn"),
  audioAyahInfo: document.getElementById("audioAyahInfo"),
  audioProgressBar: document.getElementById("audioProgressBar"),

  // Footer
  mainFooter: document.getElementById("mainFooter"),
  footerToggleBtn: document.getElementById("footerToggleBtn"),
  footerContent: document.getElementById("footerContent"),
  feelingsLink: document.getElementById("feelingsLink"),
  hadithLink: document.getElementById("hadithLink"),
};

// ========================================
// Language Configuration
// ========================================
const languages = {
  en: { name: "English", edition: "en.ahmedraza" },
  ur: { name: "Urdu", edition: "ur.ahmedali" },
  es: { name: "Spanish", edition: "es.asad" },
  fr: { name: "French", edition: "fr.hamidullah" },
};

// ========================================
// Storage Functions
// ========================================
const storage = {
  // Load bookmarks from localStorage
  loadBookmarks() {
    const saved = localStorage.getItem("quranBookmarks");
    state.bookmarks = saved ? JSON.parse(saved) : [];
    storage.updateBookmarkBadge();
  },

  // Save bookmarks to localStorage
  saveBookmarks() {
    localStorage.setItem("quranBookmarks", JSON.stringify(state.bookmarks));
    storage.updateBookmarkBadge();
  },

  // Add bookmark
  addBookmark(surah, ayah, text) {
    const bookmark = {
      id: `${surah}-${ayah}`,
      surah,
      ayah,
      text: text.substring(0, 100) + "...",
      timestamp: Date.now(),
    };

    // Check if already bookmarked
    const exists = state.bookmarks.find((b) => b.id === bookmark.id);
    if (!exists) {
      state.bookmarks.unshift(bookmark);
      storage.saveBookmarks();
      return true;
    }
    return false;
  },

  // Remove bookmark
  removeBookmark(id) {
    state.bookmarks = state.bookmarks.filter((b) => b.id !== id);
    storage.saveBookmarks();
  },

  // Check if ayah is bookmarked
  isBookmarked(surah, ayah) {
    return state.bookmarks.some((b) => b.id === `${surah}-${ayah}`);
  },

  // Update bookmark badge
  updateBookmarkBadge() {
    elements.bookmarkBadge.textContent = state.bookmarks.length;
    if (state.bookmarks.length === 0) {
      elements.bookmarkBadge.style.display = "none";
    } else {
      elements.bookmarkBadge.style.display = "block";
    }
  },

  // Load progress from localStorage
  loadProgress() {
    const saved = localStorage.getItem("quranProgress");
    state.progress = saved ? JSON.parse(saved) : {};
  },

  // Save progress to localStorage
  saveProgress() {
    localStorage.setItem("quranProgress", JSON.stringify(state.progress));
  },

  // Mark surah as read
  markSurahRead(surahNumber) {
    if (!state.progress[surahNumber]) {
      state.progress[surahNumber] = { completed: false, lastRead: Date.now() };
    }
    state.progress[surahNumber].completed = true;
    state.progress[surahNumber].lastRead = Date.now();
    storage.saveProgress();
  },

  // Toggle surah completion status
  toggleSurahCompletion(surahNumber) {
    if (!state.progress[surahNumber]) {
      state.progress[surahNumber] = { completed: true, lastRead: Date.now() };
    } else {
      state.progress[surahNumber].completed =
        !state.progress[surahNumber].completed;
      state.progress[surahNumber].lastRead = Date.now();
    }
    storage.saveProgress();
  },

  // Update last read
  updateLastRead(surahNumber) {
    if (!state.progress[surahNumber]) {
      state.progress[surahNumber] = { completed: false, lastRead: Date.now() };
    }
    state.progress[surahNumber].lastRead = Date.now();
    storage.saveProgress();
  },
};

// ========================================
// Utility Functions
// ========================================
const utils = {
  // Hide loader after page load
  hideLoader() {
    setTimeout(() => {
      elements.loader.classList.add("hidden");
    }, 800);
  },

  // Show error message
  showError(message) {
    elements.content.innerHTML = `
            <div class="welcome-screen">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Oops!</h2>
                <p>${message}</p>
            </div>
        `;
  },

  // Show loading state
  showLoading() {
    elements.content.innerHTML = `
            <div class="welcome-screen">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading...</p>
            </div>
        `;
  },

  // Toggle dark mode
  toggleDarkMode() {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle("dark-mode");

    const icon = elements.darkModeBtn.querySelector("i");
    if (state.darkMode) {
      icon.classList.remove("far");
      icon.classList.add("fas");
    } else {
      icon.classList.remove("fas");
      icon.classList.add("far");
    }

    localStorage.setItem("darkMode", state.darkMode);
  },

  // Load dark mode preference
  loadDarkModePreference() {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      state.darkMode = true;
      document.body.classList.add("dark-mode");
      const icon = elements.darkModeBtn.querySelector("i");
      icon.classList.remove("far");
      icon.classList.add("fas");
    }
  },

  // Close sidebar on mobile
  closeSidebar() {
    elements.sidebar.classList.remove("active");
    elements.mobileMenuBtn.classList.remove("active");
    document.body.classList.remove("sidebar-open");
  },

  // Toggle sidebar (desktop)
  toggleSidebar() {
    elements.sidebar.classList.toggle("collapsed");
    elements.sidebarToggleBtn.classList.toggle("collapsed");
  },

  // Toggle footer
  toggleFooter() {
    elements.mainFooter.classList.toggle("collapsed");
  },
};

// ========================================
// API Functions
// ========================================
const api = {
  baseUrl: "https://api.alquran.cloud/v1",

  // Fetch all surahs
  async getSurahs() {
    try {
      const response = await fetch(`${this.baseUrl}/surah`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching surahs:", error);
      throw error;
    }
  },

  // Fetch specific surah
  async getSurah(number, edition = "ar.alafasy") {
    try {
      const response = await fetch(
        `${this.baseUrl}/surah/${number}/${edition}`,
      );
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching surah:", error);
      throw error;
    }
  },

  // Fetch juz
  async getJuz(number, edition = "ar.alafasy") {
    try {
      const response = await fetch(`${this.baseUrl}/juz/${number}/${edition}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching juz:", error);
      throw error;
    }
  },

  // Fetch specific ayah
  async getAyah(number, edition = "ar.alafasy") {
    try {
      const response = await fetch(`${this.baseUrl}/ayah/${number}/${edition}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching ayah:", error);
      throw error;
    }
  },
};

// ========================================
// Audio Functions
// ========================================
const audio = {
  // Play ayah
  async playAyah(ayahData) {
    try {
      // Get the ayah number from the data structure
      // The API returns ayah.number which is the absolute ayah number (1-6236)
      const ayahNumber = ayahData.number || ayahData.numberInSurah;
      const surahNumber = ayahData.surah?.number || state.currentSurah;
      const ayahInSurah = ayahData.numberInSurah;

      if (!ayahNumber) {
        console.error("Ayah number not found", ayahData);
        return;
      }

      // Use the CDN endpoint with the absolute ayah number
      const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`;

      console.log("Playing audio:", audioUrl); // Debug log

      elements.audioElement.src = audioUrl;
      elements.audioPlayer.classList.add("active");
      elements.audioAyahInfo.textContent = `Playing: Surah ${surahNumber}, Ayah ${ayahInSurah}`;

      await elements.audioElement.play();
      state.isPlaying = true;
      audio.updatePlayButton();

      // Update UI to show which ayah is playing
      document.querySelectorAll(".ayah-action-btn.playing").forEach((btn) => {
        btn.classList.remove("playing");
      });
      const playBtn = document.querySelector(
        `[data-ayah-index="${state.currentAyahIndex}"]`,
      );
      if (playBtn) playBtn.classList.add("playing");
    } catch (error) {
      console.error("Error playing audio:", error);
      elements.audioAyahInfo.textContent = "Error loading audio";
    }
  },

  // Toggle play/pause
  togglePlayPause() {
    if (state.isPlaying) {
      elements.audioElement.pause();
      state.isPlaying = false;
    } else {
      elements.audioElement.play();
      state.isPlaying = true;
    }
    audio.updatePlayButton();
  },

  // Update play button icon
  updatePlayButton() {
    const icon = elements.playPauseBtn.querySelector("i");
    if (state.isPlaying) {
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
    } else {
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    }
  },

  // Play previous ayah
  playPrevious() {
    if (state.currentAyahIndex > 0) {
      state.currentAyahIndex--;
      const ayahData = state.currentAyahs[state.currentAyahIndex];
      audio.playAyah(ayahData);
    }
  },

  // Play next ayah
  playNext() {
    if (state.currentAyahIndex < state.currentAyahs.length - 1) {
      state.currentAyahIndex++;
      const ayahData = state.currentAyahs[state.currentAyahIndex];
      audio.playAyah(ayahData);
    } else {
      // Reached the end
      audio.closePlayer();
    }
  },

  // Close audio player
  closePlayer() {
    elements.audioElement.pause();
    elements.audioElement.src = "";
    elements.audioPlayer.classList.remove("active");
    state.isPlaying = false;
    document.querySelectorAll(".ayah-action-btn.playing").forEach((btn) => {
      btn.classList.remove("playing");
    });
  },
};

// ========================================
// UI Rendering Functions
// ========================================
const ui = {
  // Render surah list in sidebar
  renderSurahList(surahs, filter = "") {
    const filteredSurahs = filter
      ? surahs.filter(
          (surah) =>
            surah.englishName.toLowerCase().includes(filter.toLowerCase()) ||
            surah.englishNameTranslation
              .toLowerCase()
              .includes(filter.toLowerCase()) ||
            surah.number.toString().includes(filter),
        )
      : surahs;

    elements.sidebarContent.innerHTML = filteredSurahs
      .map((surah) => {
        const hasProgress = state.progress[surah.number];
        const isCompleted = hasProgress?.completed;

        return `
                <div class="sidebar-item" data-surah="${surah.number}">
                    <span>${surah.number}. ${surah.englishName}</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${isCompleted ? '<div class="progress-indicator"></div>' : ""}
                        <span style="font-size: 12px; color: var(--text-tertiary);">${surah.numberOfAyahs}</span>
                    </div>
                </div>
            `;
      })
      .join("");

    // Add click listeners
    document.querySelectorAll(".sidebar-item").forEach((item) => {
      item.addEventListener("click", () => {
        const surahNumber = parseInt(item.dataset.surah);
        this.setActiveItem(item);
        handlers.loadSurah(surahNumber);

        // Auto-close sidebar after selection on all devices
        if (window.innerWidth <= 768) {
          utils.closeSidebar();
        } else {
          utils.toggleSidebar();
        }
      });
    });
  },

  // Render juz list in sidebar
  renderJuzList(filter = "") {
    const juzNumbers = Array.from({ length: 30 }, (_, i) => i + 1);
    const filteredJuz = filter
      ? juzNumbers.filter((num) => num.toString().includes(filter))
      : juzNumbers;

    elements.sidebarContent.innerHTML = filteredJuz
      .map(
        (num) => `
            <div class="sidebar-item" data-juz="${num}">
                <span>Juz ${num}</span>
            </div>
        `,
      )
      .join("");

    document.querySelectorAll(".sidebar-item").forEach((item) => {
      item.addEventListener("click", () => {
        const juzNumber = parseInt(item.dataset.juz);
        this.setActiveItem(item);
        handlers.loadJuz(juzNumber);

        // Auto-close sidebar after selection on all devices
        if (window.innerWidth <= 768) {
          utils.closeSidebar();
        } else {
          utils.toggleSidebar();
        }
      });
    });
  },

  // Set active sidebar item
  setActiveItem(item) {
    document
      .querySelectorAll(".sidebar-item")
      .forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
  },

  // Render surah content
  renderSurah(arabicData, translationData = null) {
    const wrapper = document.querySelector(".content-wrapper");
    if (wrapper) wrapper.scrollTo({ top: 0, behavior: "smooth" });

    state.currentAyahs = arabicData.ayahs;
    const isCompleted = state.progress[arabicData.number]?.completed;

    // Header remains the same
    let html = `
        <div class="content-title">
            <h1>${arabicData.englishName} - <span class="arabic-text">${arabicData.name}</span></h1>
            <p>${arabicData.englishNameTranslation} • ${arabicData.numberOfAyahs} Ayahs • ${arabicData.revelationType}</p>
            <button class="mode-btn ${isCompleted ? "active" : ""}" onclick="handlers.toggleSurahComplete()">
                <i class="fas ${isCompleted ? "fa-check-circle" : "fa-circle"}"></i>
                <span>${isCompleted ? "Completed" : "Mark as Complete"}</span>
            </button>
        </div>
    `;

    if (arabicData.number !== 1 && arabicData.number !== 9) {
      html += `<div class="bismillah-text-header">بِسْمِ ٱللَّهِ ٱلرَّهْمَٰنِ ٱلرَّحِيمِ</div>`;
    }

    // --- NOTEBOOK MODE CHECK ---
    if (state.currentMode === "read") {
      // Start one single container for all verses
      html += `
            <div class="mushaf-help-banner">
                <i class="fas fa-info-circle"></i>
                <span><strong>Mushaf Mode:</strong> Click any verse to play audio. Hover to see verse references.</span>
            </div>
        `;
        html += `<div class="mushaf-container">`;

      arabicData.ayahs.forEach((ayah, index) => {
        let displayText = ayah.text;
        if (index === 0 && arabicData.number !== 1 && arabicData.number !== 9) {
          displayText = displayText.split(" ").slice(4).join(" ");
        }
        const arabicNumber = ayah.numberInSurah.toLocaleString("ar-EG");

        // Just the text and the circle, flowing naturally
        html += `
                <span class="mushaf-text" onclick="handlers.playAyahAudio(${index})">
                    ${displayText}
                    <span class="ayah-symbol"><span class="ayah-number-inner">${arabicNumber}</span></span>
                </span>
            `;
      });

      html += `</div>`; // Close the one big container
    } else {
      // --- DEFAULT TRANSLATION MODE (Individual Cards) ---
      arabicData.ayahs.forEach((ayah, index) => {
        const translationAyah = translationData?.ayahs[index];
        const isBookmarked = storage.isBookmarked(
          arabicData.number,
          ayah.numberInSurah,
        );
        let displayText = ayah.text;
        if (index === 0 && arabicData.number !== 1 && arabicData.number !== 9) {
          displayText = displayText.split(" ").slice(4).join(" ");
        }
        const arabicNumber = ayah.numberInSurah.toLocaleString("ar-EG");

        html += `
                <div class="ayah-container">
                    <div class="ayah-header">
                        <div class="ayah-number">${arabicData.number}:${ayah.numberInSurah}</div>
                        <div class="ayah-actions">
                            <button class="ayah-action-btn ${isBookmarked ? "bookmarked" : ""}" onclick="handlers.toggleBookmark(${arabicData.number}, ${ayah.numberInSurah}, '${ayah.text.replace(/'/g, "\\'")}', this)">
                                <i class="fas fa-bookmark"></i>
                            </button>
                            <button class="ayah-action-btn" onclick="handlers.playAyahAudio(${index})">
                                <i class="fas fa-play"></i>
                            </button>
                        </div>
                    </div>
                    <div class="arabic-text">
                        ${displayText}
                        <span class="ayah-symbol"><span class="ayah-number-inner">${arabicNumber}</span></span>
                    </div>
                    ${translationAyah ? `<div class="translation-text">${translationAyah.text}</div>` : ""}
                </div>
            `;
      });
    }

    elements.content.innerHTML = html;
    storage.updateLastRead(arabicData.number);
  },

  // Render juz content
  renderJuz(arabicAyahs, translationAyahs = []) {
    const wrapper = document.querySelector('.content-wrapper');
    if (wrapper) wrapper.scrollTo({ top: 0, behavior: 'smooth' });

    state.currentAyahs = arabicAyahs;
    
    let html = `
        <div class="content-title">
            <h1>Juz ${state.currentJuz}</h1>
            <p>${arabicAyahs.length} Ayahs</p>
        </div>
    `;

    if (state.currentMode === 'read') {
        // Help Banner for new users
        html += `
            <div class="mushaf-help-banner">
                <i class="fas fa-info-circle"></i>
                <span><strong>Mushaf Mode:</strong> Click any verse to play audio. Hover to see verse references.</span>
            </div>
        `;
        html += `<div class="mushaf-container">`;
        arabicAyahs.forEach((ayah, index) => {
            let displayText = ayah.text;
            if (ayah.numberInSurah === 1 && ayah.surah.number !== 1 && ayah.surah.number !== 9) {
                displayText = displayText.split(' ').slice(4).join(' ');
            }
            const arabicNumber = ayah.numberInSurah.toLocaleString('ar-EG');

            html += `
                <span class="mushaf-text" 
                      onclick="handlers.playAyahAudio(${index})"
                      <span class="mushaf-text" onclick="handlers.playAyahAudio(${index})" title="Play Ayah ${ayah.surah.number}:${ayah.numberInSurah}">
                    ${displayText}
                    <span class="ayah-symbol"><span class="ayah-number-inner">${arabicNumber}</span></span>
                </span>
            `;
        });
        html += `</div>`;
    } else {

    arabicAyahs.forEach((ayah, index) => {
      const translationAyah = translationAyahs[index];
      const isBookmarked = storage.isBookmarked(
        ayah.surah.number,
        ayah.numberInSurah,
      );

      let displayText = ayah.text;
      // Slicing logic for the first ayah of any surah in the Juz (except 1 and 9)
      if (
        ayah.numberInSurah === 1 &&
        ayah.surah.number !== 1 &&
        ayah.surah.number !== 9
      ) {
        displayText = displayText.split(" ").slice(4).join(" ");
      }

      const arabicNumber = ayah.numberInSurah.toLocaleString("ar-EG");

      html += `
            <div class="ayah-container">
                <div class="ayah-header">
                    <div class="ayah-number">${ayah.surah.number}:${ayah.numberInSurah}</div>
                    <div class="ayah-actions">
                        <button class="ayah-action-btn ${isBookmarked ? "bookmarked" : ""}" 
                                onclick="handlers.toggleBookmark(${ayah.surah.number}, ${ayah.numberInSurah}, '${ayah.text.replace(/'/g, "\\'")}', this)">
                            <i class="fas fa-bookmark"></i>
                        </button>
                        <button class="ayah-action-btn" onclick="handlers.playAyahAudio(${index})">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="arabic-row" style="direction: rtl;">
                    <div class="arabic-text">
                        ${displayText}
                        <span class="ayah-symbol">
                            <span class="ayah-number-inner">${arabicNumber}</span>
                        </span>
                    </div>
                </div>
                ${
                  state.currentMode === "translate" && translationAyah
                    ? `
                    <div class="translation-text">${translationAyah.text}</div>
                `
                    : ""
                }
            </div>
        `;
    });
}
    elements.content.innerHTML = html;
  },

  // Render single ayah
  renderAyah(arabicData, translationData = null) {
    state.currentAyahs = [arabicData];
    const isBookmarked = storage.isBookmarked(
      arabicData.surah.number,
      arabicData.numberInSurah,
    );

    const html = `
            <div class="content-title">
                <h1>${arabicData.surah.englishName} - ${arabicData.surah.name}</h1>
                <p>Ayah ${arabicData.surah.number}:${arabicData.numberInSurah}</p>
            </div>
            <div class="ayah-container">
                <div class="ayah-header">
                    <div class="ayah-number">${arabicData.surah.number}:${arabicData.numberInSurah}</div>
                    <div class="ayah-actions">
                        <button class="ayah-action-btn ${isBookmarked ? "bookmarked" : ""}" 
                                onclick="handlers.toggleBookmark(${arabicData.surah.number}, ${arabicData.numberInSurah}, '${arabicData.text.replace(/'/g, "\\'")}', this)"
                                title="${isBookmarked ? "Remove bookmark" : "Add bookmark"}">
                            <i class="fas fa-bookmark"></i>
                        </button>
                        <button class="ayah-action-btn" 
                                data-ayah-index="0"
                                onclick="handlers.playAyahAudio(0)"
                                title="Play audio">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="arabic-text">${arabicData.text}</div>
                ${
                  translationData
                    ? `
                    <div class="translation-text">${translationData.text}</div>
                `
                    : ""
                }
            </div>
        `;

    elements.content.innerHTML = html;
  },

  // Render bookmarks modal
  renderBookmarks() {
    if (state.bookmarks.length === 0) {
      elements.bookmarksContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark"></i>
                    <p>No bookmarks yet</p>
                </div>
            `;
      return;
    }

    elements.bookmarksContent.innerHTML = state.bookmarks
      .map(
        (bookmark) => `
            <div class="bookmark-item" onclick="handlers.goToBookmark(${bookmark.surah}, ${bookmark.ayah})">
                <div class="bookmark-item-header">
                    <span class="bookmark-ref">Surah ${bookmark.surah}:${bookmark.ayah}</span>
                    <button class="bookmark-remove" onclick="event.stopPropagation(); handlers.removeBookmark('${bookmark.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <p class="bookmark-text">${bookmark.text}</p>
            </div>
        `,
      )
      .join("");
  },

  // Render progress modal
  async renderProgress() {
    const surahs = await api.getSurahs();
    const totalSurahs = surahs.length;
    const completedSurahs = Object.values(state.progress).filter(
      (p) => p.completed,
    ).length;
    const percentage = Math.round((completedSurahs / totalSurahs) * 100);

    let html = `
            <div class="progress-stats">
                <div class="stat-card">
                    <div class="stat-value">${completedSurahs}</div>
                    <div class="stat-label">Completed Surahs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${percentage}%</div>
                    <div class="stat-label">Overall Progress</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${totalSurahs - completedSurahs}</div>
                    <div class="stat-label">Remaining</div>
                </div>
            </div>
            <h3 style="margin-bottom: 16px; color: var(--text-primary);">Recent Reads</h3>
        `;

    // Get recently read surahs
    const recentReads = Object.entries(state.progress)
      .sort((a, b) => b[1].lastRead - a[1].lastRead)
      .slice(0, 10);

    if (recentReads.length > 0) {
      recentReads.forEach(([surahNum, data]) => {
        const surah = surahs.find((s) => s.number === parseInt(surahNum));
        if (surah) {
          const progress = data.completed ? 100 : 50;
          html += `
                        <div class="progress-list-item">
                            <span class="progress-name">${surah.englishName}</span>
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" style="width: ${progress}%"></div>
                            </div>
                            <span class="progress-percent">${progress}%</span>
                        </div>
                    `;
        }
      });
    } else {
      html += `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <p>Start reading to track your progress</p>
                </div>
            `;
    }

    elements.progressContent.innerHTML = html;
  },
};

const tourSteps = [
    {
        target: '.sidebar',
        title: 'Browse Surahs & Juz',
        message: 'Select any Surah or Juz from this sidebar to begin reading.',
        position: 'right'
    },
    {
        target: '.mode-toggle',
        title: 'Switch Reading Modes',
        message: 'Toggle between Translation (verse-by-verse cards) and Arabic (flowing notebook style).',
        position: 'bottom'
    },
    {
        target: '.content-wrapper',
        title: 'Interactive Reading',
        message: 'In Arabic mode, click any verse to hear the beautiful recitation!',
        position: 'top'
    },
    {
        target: '.header-actions',
        title: 'Track Your Progress',
        message: 'Use bookmarks and progress tracking to continue where you left off.',
        position: 'bottom'
    }
];

let currentTourStep = 0;
let tourOverlay = null;
let tourPopover = null;

// Enhanced Tour Functions
const tour = {
    start() {
        currentTourStep = 0;
        this.createOverlay();
        this.showStep(0);
    },

    createOverlay() {
        // Create dark overlay
        tourOverlay = document.createElement('div');
        tourOverlay.className = 'tour-overlay';
        document.body.appendChild(tourOverlay);

        // Create popover
        tourPopover = document.createElement('div');
        tourPopover.className = 'tour-popover';
        document.body.appendChild(tourPopover);
    },

    showStep(stepIndex) {
        if (stepIndex >= tourSteps.length) {
            this.end();
            return;
        }

        const step = tourSteps[stepIndex];
        const target = document.querySelector(step.target);

        if (!target) {
            console.warn(`Tour target not found: ${step.target}`);
            this.next();
            return;
        }

        // Remove previous highlights
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });

        // Highlight current target
        target.classList.add('tour-highlight');

        // Position and show popover
        this.positionPopover(target, step);

        // Update popover content
        tourPopover.innerHTML = `
            <div class="tour-step-indicator">Step ${stepIndex + 1} of ${tourSteps.length}</div>
            <h3 class="tour-title">${step.title}</h3>
            <p class="tour-message">${step.message}</p>
            <div class="tour-actions">
                ${stepIndex > 0 ? '<button class="tour-btn tour-btn-secondary" onclick="tour.previous()">Previous</button>' : ''}
                <button class="tour-btn tour-btn-primary" onclick="tour.next()">
                    ${stepIndex === tourSteps.length - 1 ? 'Finish' : 'Next'}
                </button>
                <button class="tour-btn tour-btn-text" onclick="tour.end()">Skip Tour</button>
            </div>
        `;
    },

    positionPopover(target, step) {
        const rect = target.getBoundingClientRect();
        const popoverRect = tourPopover.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (viewportWidth < 768) {
        tourPopover.style.top = 'auto'; // Reset top
        tourPopover.style.bottom = '20px'; // Pin to bottom
        tourPopover.style.left = '50%';
        tourPopover.style.transform = 'translateX(-50%) scale(1)';
        tourPopover.style.opacity = '1';
        return; // Stop here for mobile
    }
        
        let top, left;

        // Calculate position based on step.position
        switch (step.position) {
            case 'right':
                top = rect.top + (rect.height / 2) - (popoverRect.height / 2);
                left = rect.right + 20;
                
                // Mobile adjustment: move below if not enough space
                if (viewportWidth < 768) {
                    top = rect.bottom + 20;
                    left = Math.max(20, (viewportWidth - 320) / 2);
                } else if (left + 320 > viewportWidth) {
                    left = rect.left - 320 - 20; // Position left instead
                }
                break;

            case 'bottom':
                top = rect.bottom + 20;
                left = rect.left + (rect.width / 2) - 160;
                
                // Keep within viewport
                if (left < 20) left = 20;
                if (left + 320 > viewportWidth) left = viewportWidth - 340;
                break;

            case 'top':
                top = rect.top - popoverRect.height - 20;
                left = rect.left + (rect.width / 2) - 160;
                
                if (left < 20) left = 20;
                if (left + 320 > viewportWidth) left = viewportWidth - 340;
                
                // If top goes off screen, show below instead
                if (top < 20) {
                    top = rect.bottom + 20;
                }
                break;

            default:
                top = rect.bottom + 20;
                left = rect.left;
        }

        // Final bounds checking
        top = Math.max(20, Math.min(top, viewportHeight - popoverRect.height - 20));
        left = Math.max(20, Math.min(left, viewportWidth - 340));

        tourPopover.style.top = top + 'px';
        tourPopover.style.left = left + 'px';
        tourPopover.style.opacity = '1';
        tourPopover.style.transform = 'scale(1)';
    },

    next() {
        currentTourStep++;
        this.showStep(currentTourStep);
    },

    previous() {
        if (currentTourStep > 0) {
            currentTourStep--;
            this.showStep(currentTourStep);
        }
    },

    end() {
        // Remove highlights
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });

        // Remove overlay and popover with animation
        if (tourOverlay) {
            tourOverlay.style.opacity = '0';
            setTimeout(() => tourOverlay.remove(), 300);
        }
        if (tourPopover) {
            tourPopover.style.opacity = '0';
            tourPopover.style.transform = 'scale(0.9)';
            setTimeout(() => tourPopover.remove(), 300);
        }

        // Mark tour as completed
        localStorage.setItem('tourCompleted', 'true');
    }
};

// ========================================
// Event Handlers
// ========================================
const handlers = {

// Guided Tour

startTour() {
    
    tour.start();
},
// Load and display surah
  async loadSurah(surahNumber) {
    state.currentSurah = surahNumber;
    state.currentJuz = null; // Clear juz
    state.viewType = 'surah'; // Set view type
    utils.showLoading();

    try {
        const arabicData = await api.getSurah(surahNumber, "ar.alafasy");

        if (state.currentMode === "translate") {
            const translationData = await api.getSurah(
                surahNumber,
                state.currentLanguage,
            );
            ui.renderSurah(arabicData, translationData);
        } else {
            ui.renderSurah(arabicData);
        }
    } catch (error) {
        utils.showError("Failed to load surah. Please try again.");
    }
},

  // Load and display juz
  async loadJuz(juzNumber) {
    state.currentJuz = juzNumber;
    state.currentSurah = null; // Clear surah
    state.viewType = 'juz'; // Set view type
    utils.showLoading();

    try {
        const arabicData = await api.getJuz(juzNumber, "ar.alafasy");

        if (state.currentMode === "translate") {
            const translationData = await api.getJuz(
                juzNumber,
                state.currentLanguage,
            );
            ui.renderJuz(arabicData.ayahs, translationData.ayahs);
        } else {
            ui.renderJuz(arabicData.ayahs);
        }
    } catch (error) {
        utils.showError("Failed to load juz. Please try again.");
    }
},

  // Load and display single ayah
  async loadAyah(ayahNumber) {
    utils.showLoading();

    if (ayahNumber < 1 || ayahNumber > 6236) {
      utils.showError("Please enter an ayah number between 1 and 6236.");
      return;
    }

    try {
      const arabicData = await api.getAyah(ayahNumber, "ar.alafasy");
      const translationData = await api.getAyah(
        ayahNumber,
        state.currentLanguage,
      );
      ui.renderAyah(arabicData, translationData);
    } catch (error) {
      utils.showError("Failed to load ayah. Please try again.");
    }
  },

  // Handle search input
  async handleSearch(query) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      if (state.currentView === "surah") {
        const surahs = await api.getSurahs();
        ui.renderSurahList(surahs);
      } else if (state.currentView === "juz") {
        ui.renderJuzList();
      }
      return;
    }

    if (!isNaN(trimmedQuery)) {
      const ayahNumber = parseInt(trimmedQuery);
      await this.loadAyah(ayahNumber);
      return;
    }

    if (state.currentView === "surah") {
      const surahs = await api.getSurahs();
      ui.renderSurahList(surahs, trimmedQuery);
    } else if (state.currentView === "juz") {
      ui.renderJuzList(trimmedQuery);
    }
  },

  // Switch between surah/juz view
  async switchView(view) {
    state.currentView = view;

    if (view === "surah") {
      const surahs = await api.getSurahs();
      ui.renderSurahList(surahs);
    } else if (view === "juz") {
      ui.renderJuzList();
    }
  },

  // Switch between translate/read mode
  async switchMode(mode) {
    state.currentMode = mode;

    // Use viewType to determine what to reload
    if (state.viewType === 'surah' && state.currentSurah) {
        await this.loadSurah(state.currentSurah);
    } else if (state.viewType === 'juz' && state.currentJuz) {
        await this.loadJuz(state.currentJuz);
    }
},

  // Change language
  async changeLanguage(langCode) {
    state.currentLanguage = languages[langCode].edition;
    elements.languageMenu.classList.remove("show");

    if (state.currentMode === "translate") {
      if (state.currentSurah) {
        await this.loadSurah(state.currentSurah);
      } else if (state.currentJuz) {
        await this.loadJuz(state.currentJuz);
      }
    }
  },

  // Toggle bookmark
  toggleBookmark(surah, ayah, text, buttonElement) {
    const id = `${surah}-${ayah}`;

    if (storage.isBookmarked(surah, ayah)) {
      storage.removeBookmark(id);
      buttonElement.classList.remove("bookmarked");
    } else {
      storage.addBookmark(surah, ayah, text);
      buttonElement.classList.add("bookmarked");
    }
  },

  // Remove bookmark
  removeBookmark(id) {
    storage.removeBookmark(id);
    ui.renderBookmarks();
  },

  // Go to bookmarked ayah
  async goToBookmark(surah, ayah) {
    elements.bookmarksModal.classList.remove("show");
    await this.loadSurah(surah);

    // Scroll to ayah after a short delay
    setTimeout(() => {
      const ayahElement = document.querySelector(
        `[onclick*="${surah}, ${ayah}"]`,
      );
      if (ayahElement) {
        ayahElement.closest(".ayah-container").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 500);
  },

  // Play ayah audio
  playAyahAudio(index) {
    state.currentAyahIndex = index;
    const ayahData = state.currentAyahs[index];

    if (!ayahData) {
      console.error("Ayah not found at index:", index);
      return;
    }

    audio.playAyah(ayahData);
  },

  // Mark surah as complete
  toggleSurahComplete() {
    if (state.currentSurah) {
      storage.toggleSurahCompletion(state.currentSurah);

      // Reload current surah to update button
      handlers.loadSurah(state.currentSurah);

      // Refresh sidebar to show/hide completion indicator
      if (state.currentView === "surah") {
        api.getSurahs().then((surahs) => ui.renderSurahList(surahs));
      }
    }
  },
};

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
  // Dark mode toggle
  elements.darkModeBtn.addEventListener("click", utils.toggleDarkMode);

  // Language menu toggle
  elements.languageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    elements.languageMenu.classList.toggle("show");
  });

  // Language selection
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", () => {
      const lang = item.dataset.lang;
      handlers.changeLanguage(lang);
    });
  });

  // Close language menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !elements.languageMenu.contains(e.target) &&
      !elements.languageBtn.contains(e.target)
    ) {
      elements.languageMenu.classList.remove("show");
    }
  });

  // Bookmarks button
  elements.bookmarksBtn.addEventListener("click", () => {
    ui.renderBookmarks();
    elements.bookmarksModal.classList.add("show");
  });

  elements.closeBookmarksBtn.addEventListener("click", () => {
    elements.bookmarksModal.classList.remove("show");
  });

  // Progress button
  elements.progressBtn.addEventListener("click", () => {
    ui.renderProgress();
    elements.progressModal.classList.add("show");
  });

  elements.closeProgressBtn.addEventListener("click", () => {
    elements.progressModal.classList.remove("show");
  });

  // Close modals when clicking outside
  [elements.bookmarksModal, elements.progressModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    });
  });

  // Audio player controls
  elements.playPauseBtn.addEventListener("click", audio.togglePlayPause);
  elements.prevAyahBtn.addEventListener("click", audio.playPrevious);
  elements.nextAyahBtn.addEventListener("click", audio.playNext);
  elements.closeAudioBtn.addEventListener("click", audio.closePlayer);

  // Audio element events
  elements.audioElement.addEventListener("ended", audio.playNext);
  elements.audioElement.addEventListener("timeupdate", () => {
    const progress =
      (elements.audioElement.currentTime / elements.audioElement.duration) *
      100;
    elements.audioProgressBar.style.width = `${progress}%`;
  });

  elements.audioElement.addEventListener("play", () => {
    state.isPlaying = true;
    audio.updatePlayButton();
  });

  elements.audioElement.addEventListener("pause", () => {
    state.isPlaying = false;
    audio.updatePlayButton();
  });

  // Sidebar toggle (desktop)
  elements.sidebarToggleBtn.addEventListener("click", utils.toggleSidebar);

  // Footer toggle
  elements.footerToggleBtn.addEventListener("click", utils.toggleFooter);

  // Mobile menu toggle
  elements.mobileMenuBtn.addEventListener("click", () => {
    elements.sidebar.classList.toggle("active");
    elements.mobileMenuBtn.classList.toggle("active");
    document.body.classList.toggle("sidebar-open");
  });

  // Floating search button (opens sidebar on mobile)
  elements.floatingSearchBtn.addEventListener("click", () => {
    elements.sidebar.classList.add("active");
    elements.mobileMenuBtn.classList.add("active");
    document.body.classList.add("sidebar-open");
    // Focus on search input after opening
    setTimeout(() => {
      elements.searchInput.focus();
    }, 300);
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 768 &&
      elements.sidebar.classList.contains("active") &&
      !elements.sidebar.contains(e.target) &&
      !elements.mobileMenuBtn.contains(e.target) &&
      !elements.floatingSearchBtn.contains(e.target)
    ) {
      utils.closeSidebar();
    }
  });

  // Tab buttons (Surah/Juz)
  elements.tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      elements.tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      handlers.switchView(btn.dataset.view);
    });
  });

  // Mode buttons (Translate/Read)
  elements.modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      elements.modeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      handlers.switchMode(btn.dataset.mode);
    });
  });

  // Search input
  let searchTimeout;
  elements.searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      handlers.handleSearch(e.target.value);
    }, 300);
  });

  // Footer links (temporary - update with your actual pages)
  elements.feelingsLink.href = "/Favourites/index.html";

  elements.hadithLink.href = "/Ahadiths/index.html";

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (elements.sidebar.classList.contains("active")) {
        utils.closeSidebar();
      }
      if (elements.bookmarksModal.classList.contains("show")) {
        elements.bookmarksModal.classList.remove("show");
      }
      if (elements.progressModal.classList.contains("show")) {
        elements.progressModal.classList.remove("show");
      }
    }

    // Space to play/pause audio
    if (
      e.code === "Space" &&
      elements.audioPlayer.classList.contains("active")
    ) {
      e.preventDefault();
      audio.togglePlayPause();
    }
  });
}

// ========================================
// Initialization
// ========================================
async function init() {
    try {
        utils.loadDarkModePreference();
        storage.loadBookmarks();
        storage.loadProgress();

        initEventListeners();

        const surahs = await api.getSurahs();
        ui.renderSurahList(surahs);

        await handlers.loadSurah(1);

        const firstItem = document.querySelector('.sidebar-item[data-surah="1"]');
        if (firstItem) {
            firstItem.classList.add("active");
        }

        utils.hideLoader();

        // Auto-start tour for first-time visitors
        const tourCompleted = localStorage.getItem('tourCompleted');
        if (!tourCompleted) {
            setTimeout(() => {
                tour.start();
            }, 1000); // Start tour 1 second after page load
        }
    } catch (error) {
        console.error("Initialization error:", error);
        utils.showError("Failed to initialize app. Please refresh the page.");
        utils.hideLoader();
    }
}

// Start the app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}