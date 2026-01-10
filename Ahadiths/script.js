// ========================================
// State Management
// ========================================
const state = {
    currentCollection: null,
    currentSection: null,
    collections: {},
    darkMode: false,
    bookmarks: [],
    viewMode: 'collections' // 'collections' or 'books'
};

const collectionAliases = {
    // Bukhari variations
    'bukhari': ['bukhari', 'sahih bukhari', 'sahihbukhari'],
    'sahihbukhari': ['bukhari', 'sahih bukhari', 'sahihbukhari'],
    
    // Muslim variations
    'muslim': ['muslim', 'sahih muslim', 'sahihmuslim'],
    'sahihmuslim': ['muslim', 'sahih muslim', 'sahihmuslim'],
    
    // Abu Dawud variations
    'abudawud': ['abudawud', 'abu dawud', 'abu-dawud', 'sunan abu dawud'],
    'abu-dawud': ['abudawud', 'abu dawud', 'abu-dawud', 'sunan abu dawud'],
    
    // Tirmidhi variations
    'tirmidhi': ['tirmidhi', 'al-tirmidhi', 'jami at-tirmidhi'],
    
    // Ibn Majah variations
    'ibnmajah': ['ibnmajah', 'ibn majah', 'ibn-majah', 'sunan ibn majah'],
    'ibn-majah': ['ibnmajah', 'ibn majah', 'ibn-majah', 'sunan ibn majah'],
    
    // Nasai variations
    'nasai': ['nasai', 'al-nasai', "nasa'i", 'sunan an-nasai'],
    
    // Malik variations
    'malik': ['malik', 'muwatta', 'muwatta malik'],
    
    // Ahmad variations
    'ahmad': ['ahmad', 'musnad ahmad', 'ibn hanbal']
};

function normalizeCollectionName(input) {
    if (!input) return '';
    
    // Remove common prefixes and clean up
    return input.toLowerCase()
        .replace(/^(sahih|sunan|jami|musnad|muwatta)\s+/i, '')
        .replace(/['\s-]+/g, '') // Remove spaces, hyphens, apostrophes
        .trim();
}

// Helper function to find collection by flexible matching
function findCollection(userInput, collections) {
    if (!userInput || !collections) return null;
    
    const normalized = normalizeCollectionName(userInput);
    
    // Direct key match
    for (const [key, value] of Object.entries(collections)) {
        if (key.toLowerCase() === normalized) {
            return key;
        }
    }
    
    // Alias matching
    for (const [key, aliases] of Object.entries(collectionAliases)) {
        if (aliases.some(alias => normalizeCollectionName(alias) === normalized)) {
            // Find the actual collection key
            for (const [collectionKey, collectionValue] of Object.entries(collections)) {
                if (normalizeCollectionName(collectionKey) === key || 
                    normalizeCollectionName(collectionValue.name).includes(key)) {
                    return collectionKey;
                }
            }
        }
    }
    
    // Partial name matching
    for (const [key, value] of Object.entries(collections)) {
        if (normalizeCollectionName(key).includes(normalized) || 
            normalizeCollectionName(value.name).includes(normalized)) {
            return key;
        }
    }
    
    return null;
}

// ========================================
// DOM Elements
// ========================================
const elements = {
    loader: document.getElementById('loader'),
    sidebar: document.getElementById('sidebar'),
    sidebarContent: document.getElementById('sidebarContent'),
    subSidebar: document.getElementById('subSidebar'),
    subSidebarContent: document.getElementById('subSidebarContent'),
    sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
    content: document.getElementById('content'),
    searchInput: document.getElementById('searchInput'),
    darkModeBtn: document.getElementById('darkModeBtn'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    floatingSearchBtn: document.getElementById('floatingSearchBtn'),
    
    // Bookmarks
    bookmarksBtn: document.getElementById('bookmarksBtn'),
    bookmarksModal: document.getElementById('bookmarksModal'),
    bookmarksContent: document.getElementById('bookmarksContent'),
    closeBookmarksBtn: document.getElementById('closeBookmarksBtn'),
    bookmarkBadge: document.getElementById('bookmarkBadge'),
    
    // Footer
    mainFooter: document.getElementById('mainFooter'),
    footerToggleBtn: document.getElementById('footerToggleBtn'),
    quranLink: document.getElementById('quranLink'),
    feelingsLink: document.getElementById('feelingsLink')
};

// ========================================
// Storage Functions
// ========================================
const storage = {
    loadBookmarks() {
        const saved = localStorage.getItem('hadithBookmarks');
        state.bookmarks = saved ? JSON.parse(saved) : [];
        storage.updateBookmarkBadge();
    },

    saveBookmarks() {
        localStorage.setItem('hadithBookmarks', JSON.stringify(state.bookmarks));
        storage.updateBookmarkBadge();
    },

    addBookmark(collection, hadithNumber, text) {
        const bookmark = {
            id: `${collection}-${hadithNumber}`,
            collection,
            hadithNumber,
            text: text.substring(0, 100) + '...',
            timestamp: Date.now()
        };
        
        const exists = state.bookmarks.find(b => b.id === bookmark.id);
        if (!exists) {
            state.bookmarks.unshift(bookmark);
            storage.saveBookmarks();
            return true;
        }
        return false;
    },

    removeBookmark(id) {
        state.bookmarks = state.bookmarks.filter(b => b.id !== id);
        storage.saveBookmarks();
        
        // Update all bookmark buttons in the DOM
        ui.updateAllBookmarkButtons();
    },

    isBookmarked(collection, hadithNumber) {
        return state.bookmarks.some(b => b.id === `${collection}-${hadithNumber}`);
    },

    updateBookmarkBadge() {
        elements.bookmarkBadge.textContent = state.bookmarks.length;
        if (state.bookmarks.length === 0) {
            elements.bookmarkBadge.style.display = 'none';
        } else {
            elements.bookmarkBadge.style.display = 'block';
        }
    }
};

// ========================================
// Utility Functions
// ========================================
const utils = {
    hideLoader() {
        setTimeout(() => {
            elements.loader.classList.add('hidden');
        }, 800);
    },

    showError(message) {
        elements.content.innerHTML = `
            <div class="welcome-screen">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Oops!</h2>
                <p>${message}</p>
            </div>
        `;
    },

    showLoading() {
        elements.content.innerHTML = `
            <div class="welcome-screen">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading...</p>
            </div>
        `;
    },

    toggleDarkMode() {
        state.darkMode = !state.darkMode;
        document.body.classList.toggle('dark-mode');
        
        const icon = elements.darkModeBtn.querySelector('i');
        if (state.darkMode) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
        
        localStorage.setItem('darkMode', state.darkMode);
    },

    loadDarkModePreference() {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            state.darkMode = true;
            document.body.classList.add('dark-mode');
            const icon = elements.darkModeBtn.querySelector('i');
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
    },

    closeSidebar() {
        elements.sidebar.classList.remove('active');
        elements.subSidebar.classList.remove('active');
        elements.mobileMenuBtn.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    },

    toggleSidebar() {
        const wasCollapsed = elements.sidebar.classList.contains('collapsed');
        elements.sidebar.classList.toggle('collapsed');
        elements.sidebarToggleBtn.classList.toggle('collapsed');
        
        // Only hide sub-sidebar when collapsing the main sidebar
        if (!wasCollapsed) {
            elements.subSidebar.classList.add('hidden');
        }
    },

    toggleFooter() {
        elements.mainFooter.classList.toggle('collapsed');
    },

    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    isMobile() {
        return window.innerWidth <= 768;
    }
};

// ========================================
// API Functions
// ========================================
const api = {
    baseUrl: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1',

    async getCollections() {
        try {
            const response = await fetch(`${this.baseUrl}/editions.json`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching collections:', error);
            throw error;
        }
    },

    async getBooks(collectionName) {
        try {
            const response = await fetch(`${this.baseUrl}/editions/eng-${encodeURIComponent(collectionName)}.json`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching books:', error);
            throw error;
        }
    },

    async getHadiths(collectionName, sectionKey) {
        try {
            const response = await fetch(`${this.baseUrl}/editions/eng-${encodeURIComponent(collectionName)}/sections/${sectionKey}.json`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching hadiths:', error);
            throw error;
        }
    }
};

// ========================================
// UI Rendering Functions
// ========================================
const ui = {
    renderCollections(collections, filter = '') {
        const collectionArray = Object.entries(collections);
        const filteredCollections = filter 
            ? collectionArray.filter(([key, value]) => 
                value.name.toLowerCase().includes(filter.toLowerCase())
            )
            : collectionArray;

        elements.sidebarContent.innerHTML = filteredCollections.map(([key, value]) => `
            <div class="sidebar-item" data-collection="${key}">
                <span>${value.name}</span>
            </div>
        `).join('');

        document.querySelectorAll('.sidebar-item[data-collection]').forEach(item => {
            item.addEventListener('click', () => {
                const collection = item.dataset.collection;
                ui.setActiveItem(item, elements.sidebarContent);
                handlers.loadCollection(collection);
            });
        });
    },

    renderBooks(sections, collectionName) {
        if (!sections) {
            elements.sidebarContent.innerHTML = '<div class="sidebar-item">No books found</div>';
            return;
        }

        state.viewMode = 'books';
        const sectionArray = Object.entries(sections);
        
        // Create back button + books list
        const backButton = `
            <div class="sidebar-item back-to-collections" style="background: var(--bg-primary); color: var(--text-primary); font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">
                <i class="fas fa-arrow-left"></i>
                <span>Back to Collections</span>
            </div>
        `;
        
        const booksList = sectionArray.map(([key, name]) => `
            <div class="sidebar-item" data-section="${key}">
                <span>${name}</span>
            </div>
        `).join('');

        // On mobile, replace sidebar content. On desktop, use sub-sidebar
        if (utils.isMobile()) {
            elements.sidebarContent.innerHTML = backButton + booksList;
            
            // Add back button listener
            const backBtn = elements.sidebarContent.querySelector('.back-to-collections');
            backBtn.addEventListener('click', async () => {
                state.viewMode = 'collections';
                const collections = await api.getCollections();
                ui.renderCollections(collections);
            });
        } else {
            elements.subSidebarContent.innerHTML = booksList;
            elements.subSidebar.classList.remove('hidden');
        }

        // Add section click listeners
        const container = utils.isMobile() ? elements.sidebarContent : elements.subSidebarContent;
        container.querySelectorAll('.sidebar-item[data-section]').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                ui.setActiveItem(item, container);
                handlers.loadHadiths(state.currentCollection, section);
                
                // Auto-close on mobile
                if (utils.isMobile()) {
                    utils.closeSidebar();
                }
            });
        });
    },

    renderSingleHadith(hadith, collectionName, metadata = {}) {
        const isBookmarked = storage.isBookmarked(collectionName, hadith.hadithnumber);
        const grades = hadith.grades?.map(g => 
            `${g.name}: <span class="${g.grade.toLowerCase().includes('sahih') ? 'grade-sahih' : ''}">${g.grade}</span>`
        ).join(', ') || 'N/A';

        const html = `
            <div class="collection-title">
                <h1>${metadata.name || 'Hadith Result'}</h1>
                <p>Hadith ${hadith.hadithnumber}</p>
            </div>
            <div class="hadith-container">
                <div class="hadith-header">
                    <div class="hadith-number">Hadith ${hadith.hadithnumber}</div>
                    <div class="hadith-actions">
                        <button class="hadith-action-btn ${isBookmarked ? 'bookmarked' : ''}" 
                                data-collection="${collectionName}"
                                data-hadith="${hadith.hadithnumber}"
                                data-text="${utils.escapeHtml(hadith.text || '')}"
                                title="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
                <div class="hadith-text">${hadith.text || 'Not available'}</div>
                <div class="hadith-metadata">
                    <p><strong>Arabic Number:</strong> ${hadith.arabicnumber || 'N/A'}</p>
                    <p><strong>Reference:</strong> Book ${hadith.reference?.book || 'N/A'}, Hadith ${hadith.reference?.hadith || 'N/A'}</p>
                    <p><strong>Grades:</strong> ${grades}</p>
                </div>
            </div>
        `;

        elements.content.innerHTML = html;
        
        // Add event listener to bookmark button
        const bookmarkBtn = elements.content.querySelector('.hadith-action-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', function() {
                const collection = this.dataset.collection;
                const hadithNum = this.dataset.hadith;
                const text = this.dataset.text;
                handlers.toggleBookmark(collection, hadithNum, text, this);
            });
        }
    },

    renderHadiths(data) {
        if (!data || !data.hadiths || !Array.isArray(data.hadiths)) {
            elements.content.innerHTML = `
                <div class="welcome-screen">
                    <i class="fas fa-book"></i>
                    <h2>No Hadiths Found</h2>
                    <p>Please select another section</p>
                </div>
            `;
            return;
        }

        const collectionName = data.metadata?.name || 'Hadith Collection';
        const section = data.metadata?.section;
        const sectionName = section ? Object.values(section)[0] : 'Books';

        let html = `
            <div class="collection-title">
                <h1>${collectionName}</h1>
                <p>${sectionName} • ${data.hadiths.length} Hadiths</p>
            </div>
        `;

        data.hadiths.forEach(hadith => {
            const isBookmarked = storage.isBookmarked(state.currentCollection, hadith.hadithnumber);
            const grades = hadith.grades?.map(g => 
                `${g.name}: <span class="${g.grade.toLowerCase().includes('sahih') ? 'grade-sahih' : ''}">${g.grade}</span>`
            ).join(', ') || 'N/A';

            html += `
                <div class="hadith-container">
                    <div class="hadith-header">
                        <div class="hadith-number">Hadith ${hadith.hadithnumber}</div>
                        <div class="hadith-actions">
                            <button class="hadith-action-btn ${isBookmarked ? 'bookmarked' : ''}" 
                                    data-collection="${state.currentCollection}"
                                    data-hadith="${hadith.hadithnumber}"
                                    data-text="${utils.escapeHtml(hadith.text || '')}"
                                    title="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}">
                                <i class="fas fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                    <div class="hadith-text">${hadith.text || 'Not available'}</div>
                    <div class="hadith-metadata">
                        <p><strong>Arabic Number:</strong> ${hadith.arabicnumber || 'N/A'}</p>
                        <p><strong>Reference:</strong> Book ${hadith.reference?.book || 'N/A'}, Hadith ${hadith.reference?.hadith || 'N/A'}</p>
                        <p><strong>Grades:</strong> ${grades}</p>
                    </div>
                </div>
            `;
        });

        elements.content.innerHTML = html;
        
        // Add event listeners to all bookmark buttons
        elements.content.querySelectorAll('.hadith-action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const collection = this.dataset.collection;
                const hadithNum = this.dataset.hadith;
                const text = this.dataset.text;
                handlers.toggleBookmark(collection, hadithNum, text, this);
            });
        });
    },

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

        elements.bookmarksContent.innerHTML = state.bookmarks.map(bookmark => `
            <div class="bookmark-item">
                <div class="bookmark-item-header">
                    <span class="bookmark-ref">${bookmark.collection} - Hadith ${bookmark.hadithNumber}</span>
                    <button class="bookmark-remove" data-bookmark-id="${bookmark.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <p class="bookmark-text">${bookmark.text}</p>
            </div>
        `).join('');
        
        // Add event listeners to remove buttons
        elements.bookmarksContent.querySelectorAll('.bookmark-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                handlers.removeBookmark(this.dataset.bookmarkId);
            });
        });
    },

    updateAllBookmarkButtons() {
        // Update all bookmark buttons in the current view
        elements.content.querySelectorAll('.hadith-action-btn').forEach(btn => {
            const collection = btn.dataset.collection;
            const hadithNum = btn.dataset.hadith;
            const isBookmarked = storage.isBookmarked(collection, hadithNum);
            
            if (isBookmarked) {
                btn.classList.add('bookmarked');
            } else {
                btn.classList.remove('bookmarked');
            }
            
            btn.title = isBookmarked ? 'Remove bookmark' : 'Add bookmark';
        });
    },

    setActiveItem(item, container) {
        container.querySelectorAll('.sidebar-item').forEach(el => 
            el.classList.remove('active')
        );
        item.classList.add('active');
    }
};

// ========================================
// Event Handlers
// ========================================
const handlers = {
    async loadCollection(collectionName) {
        state.currentCollection = collectionName;

        try {
            const data = await api.getBooks(collectionName);
            
            if (data && data.metadata && data.metadata.sections) {
                ui.renderBooks(data.metadata.sections, collectionName);
                
                // Show instruction to select a book
                elements.content.innerHTML = `
                    <div class="welcome-screen">
                        <i class="fas fa-book-open"></i>
                        <h2>${data.metadata.name || 'Collection Loaded'}</h2>
                        <p>Please select a book from the ${utils.isMobile() ? 'menu' : 'sidebar'} to view hadiths</p>
                    </div>
                `;
                
                // On desktop, collapse main sidebar to show sub-sidebar better
                if (!utils.isMobile()) {
                    elements.sidebar.classList.add('collapsed');
                    elements.sidebarToggleBtn.classList.add('collapsed');
                }
            } else {
                utils.showError('No books found in this collection');
            }
        } catch (error) {
            utils.showError('Failed to load collection. Please try again.');
        }
    },

    async loadHadiths(collectionName, sectionKey) {
        state.currentSection = sectionKey;
        utils.showLoading();

        try {
            const data = await api.getHadiths(collectionName, sectionKey);
            ui.renderHadiths(data);
        } catch (error) {
            utils.showError('Failed to load hadiths. Please try again.');
        }
    },

    async handleSearch(query) {
    const trimmedQuery = query.trim();

    // Empty search - show all collections
    if (!trimmedQuery) {
        const collections = await api.getCollections();
        ui.renderCollections(collections);
        state.viewMode = 'collections';
        elements.subSidebar.classList.add('hidden');
        return;
    }

    // ===== PATTERN 1: "collection number" or "collection:number" =====
    // Matches: "bukhari 123", "bukhari:123", "bukhari2342", "abu dawud 456"
    const hadithSearchPattern = /^(.+?)[\s:]*(\d+)$/i;
    const match = trimmedQuery.match(hadithSearchPattern);

    if (match) {
        const collectionInput = match[1].trim();
        const hadithNumber = match[2];
        
        const collections = await api.getCollections();
        const foundCollection = findCollection(collectionInput, collections);

        if (foundCollection) {
            await handlers.searchSpecificHadith(foundCollection, hadithNumber);
            return;
        } else {
            utils.showError(`Collection "${collectionInput}" not found. Available collections: Bukhari, Muslim, AbuDawud, Tirmidhi, IbnMajah, Nasai, Malik, Ahmad`);
            return;
        }
    }

    // ===== PATTERN 2: Just a number (search in current collection) =====
    if (/^\d+$/.test(trimmedQuery)) {
        if (state.currentCollection) {
            await handlers.searchSpecificHadith(state.currentCollection, trimmedQuery);
            return;
        } else {
            utils.showError('Please specify a collection. Example: "Bukhari 123" or select a collection first.');
            return;
        }
    }

    // ===== PATTERN 3: Collection name only - Load that collection =====
    const collections = await api.getCollections();
    const foundCollection = findCollection(trimmedQuery, collections);

    if (foundCollection) {
        // Load the collection's books
        await handlers.loadCollection(foundCollection);
        
        // Highlight it in sidebar
        const collectionItem = elements.sidebarContent.querySelector(`[data-collection="${foundCollection}"]`);
        if (collectionItem) {
            ui.setActiveItem(collectionItem, elements.sidebarContent);
        }
        return;
    }

    // ===== PATTERN 4: Regular text search in collection names =====
    ui.renderCollections(collections, trimmedQuery);
    state.viewMode = 'collections';
    elements.subSidebar.classList.add('hidden');
},


    async searchSpecificHadith(collectionName, hadithNumber) {
    utils.showLoading();
    
    try {
        // Load the collection metadata
        const data = await api.getBooks(collectionName);
        
        if (!data || !data.metadata || !data.metadata.sections) {
            utils.showError('Could not load collection data');
            return;
        }

        // Show progress to user
        const totalSections = Object.keys(data.metadata.sections).length;
        let searchedSections = 0;
        
        // Update loading message with progress
        elements.content.innerHTML = `
            <div class="welcome-screen">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Searching for Hadith ${hadithNumber} in ${data.metadata.name}...</p>
                <p style="font-size: 14px; color: var(--text-tertiary); margin-top: 8px;">
                    Searched <span id="search-progress">0</span>/${totalSections} sections
                </p>
            </div>
        `;

        let foundHadith = null;
        let foundSection = null;

        // Search through sections with progress updates
        for (const [sectionKey, sectionName] of Object.entries(data.metadata.sections)) {
            try {
                const hadithData = await api.getHadiths(collectionName, sectionKey);
                
                searchedSections++;
                const progressEl = document.getElementById('search-progress');
                if (progressEl) progressEl.textContent = searchedSections;
                
                if (hadithData && hadithData.hadiths) {
                    // Try multiple matching strategies
                    const hadith = hadithData.hadiths.find(h => 
                        // Exact hadith number match
                        h.hadithnumber === hadithNumber || 
                        h.hadithnumber === parseInt(hadithNumber) ||
                        // Arabic number match
                        h.arabicnumber === hadithNumber ||
                        h.arabicnumber === parseInt(hadithNumber) ||
                        // Reference book hadith number
                        (h.reference && (
                            h.reference.hadith === hadithNumber ||
                            h.reference.hadith === parseInt(hadithNumber)
                        ))
                    );
                    
                    if (hadith) {
                        foundHadith = hadith;
                        foundSection = { 
                            key: sectionKey, 
                            name: sectionName, 
                            data: hadithData 
                        };
                        break; // Found it! Stop searching
                    }
                }
            } catch (error) {
                // Section fetch failed, continue to next
                console.warn(`Failed to fetch section ${sectionKey}:`, error);
                continue;
            }
        }

        if (foundHadith && foundSection) {
            // Success! Display the hadith
            state.currentCollection = collectionName;
            state.currentSection = foundSection.key;
            
            // Update sidebar to show the collection and its books
            ui.renderBooks(data.metadata.sections, collectionName);
            
            // Highlight the book in sub-sidebar
            const container = utils.isMobile() ? elements.sidebarContent : elements.subSidebarContent;
            const bookItem = container.querySelector(`[data-section="${foundSection.key}"]`);
            if (bookItem) {
                ui.setActiveItem(bookItem, container);
            }
            
            // Render the found hadith
            ui.renderSingleHadith(foundHadith, collectionName, foundSection.data.metadata);
            
            // Show success message briefly
            showSearchSuccess(collectionName, hadithNumber, foundSection.name);
            
        } else {
            // Not found
            utils.showError(`
                <div style="max-width: 500px; margin: 0 auto;">
                    <h3>Hadith ${hadithNumber} not found in ${data.metadata.name}</h3>
                    <p style="margin: 16px 0;">This could mean:</p>
                    <ul style="text-align: left; display: inline-block;">
                        <li>The hadith number doesn't exist in this collection</li>
                        <li>Different editions use different numbering</li>
                        <li>Try browsing the collection manually</li>
                    </ul>
                    <p style="margin-top: 16px;">
                        <button 
                            class="mode-btn active" 
                            onclick="handlers.loadCollection('${collectionName}')"
                            style="margin-top: 16px;">
                            Browse ${data.metadata.name}
                        </button>
                    </p>
                </div>
            `);
        }
    } catch (error) {
        console.error('Error searching hadith:', error);
        utils.showError('Error searching for hadith. Please try again or browse manually.');
    }
},


    toggleBookmark(collection, hadithNumber, text, buttonElement) {
        const id = `${collection}-${hadithNumber}`;
        
        if (storage.isBookmarked(collection, hadithNumber)) {
            storage.removeBookmark(id);
            buttonElement.classList.remove('bookmarked');
        } else {
            storage.addBookmark(collection, hadithNumber, text);
            buttonElement.classList.add('bookmarked');
        }
    },

    removeBookmark(id) {
        storage.removeBookmark(id);
        ui.renderBookmarks();
        // The bookmark buttons are updated via storage.removeBookmark() -> ui.updateAllBookmarkButtons()
    }
};

function showSearchSuccess(collectionName, hadithNumber, bookName) {
    // Create temporary success banner
    const banner = document.createElement('div');
    banner.className = 'search-success-banner';
    banner.innerHTML = `
        <i class="fas fa-check-circle"></i>
        Found Hadith ${hadithNumber} in ${bookName}
    `;
    banner.style.cssText = `
        position: fixed;
        top: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--success);
        color: white;
        padding: 12px 24px;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 200;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        animation: slideDown 0.3s ease-out;
    `;
    
    document.body.appendChild(banner);
    
    // Remove after 3 seconds
    setTimeout(() => {
        banner.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => banner.remove(), 300);
    }, 3000);
}

// ========================================
// Event Listeners
// ========================================
function initEventListeners() {
    // Dark mode
    elements.darkModeBtn.addEventListener('click', utils.toggleDarkMode);

    // Bookmarks
    elements.bookmarksBtn.addEventListener('click', () => {
        ui.renderBookmarks();
        elements.bookmarksModal.classList.add('show');
    });

    elements.closeBookmarksBtn.addEventListener('click', () => {
        elements.bookmarksModal.classList.remove('show');
    });

    elements.bookmarksModal.addEventListener('click', (e) => {
        if (e.target === elements.bookmarksModal) {
            elements.bookmarksModal.classList.remove('show');
        }
    });

    // Sidebar toggle
    elements.sidebarToggleBtn.addEventListener('click', utils.toggleSidebar);

    // Footer toggle
    if (elements.footerToggleBtn) {
        elements.footerToggleBtn.addEventListener('click', utils.toggleFooter);
    }

    // Mobile menu
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.sidebar.classList.toggle('active');
        elements.mobileMenuBtn.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    });

    // Floating search
    if (elements.floatingSearchBtn) {
        elements.floatingSearchBtn.addEventListener('click', () => {
            elements.sidebar.classList.add('active');
            elements.mobileMenuBtn.classList.add('active');
            document.body.classList.add('sidebar-open');
            setTimeout(() => {
                elements.searchInput.focus();
            }, 300);
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (utils.isMobile() && 
            (elements.sidebar.classList.contains('active') || elements.subSidebar.classList.contains('active')) &&
            !elements.sidebar.contains(e.target) && 
            !elements.subSidebar.contains(e.target) &&
            !elements.mobileMenuBtn.contains(e.target) &&
            (!elements.floatingSearchBtn || !elements.floatingSearchBtn.contains(e.target))) {
            utils.closeSidebar();
        }
    });

    // Search
    elements.searchInput.addEventListener('input', utils.debounce((e) => {
        handlers.handleSearch(e.target.value);
    }, 300));

    // Footer links
    if (elements.feelingsLink) {
        elements.feelingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '../Favourites/';
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.sidebar.classList.contains('active') || elements.subSidebar.classList.contains('active')) {
                utils.closeSidebar();
            }
            if (elements.bookmarksModal.classList.contains('show')) {
                elements.bookmarksModal.classList.remove('show');
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        // If switching from mobile to desktop or vice versa, refresh the sidebar view
        const wasMobile = state.viewMode === 'books' && elements.sidebarContent.querySelector('.back-to-collections');
        const isMobileNow = utils.isMobile();
        
        if (wasMobile !== isMobileNow && state.viewMode === 'books' && state.currentCollection) {
            // Reload books view with current collection
            handlers.loadCollection(state.currentCollection);
        }
    });
}

// ========================================
// Initialization
// ========================================
async function init() {
    try {
        // Load preferences
        utils.loadDarkModePreference();
        storage.loadBookmarks();

        // Initialize event listeners
        initEventListeners();

        // Load collections
        const collections = await api.getCollections();
        state.collections = collections;
        ui.renderCollections(collections);

        // Hide loader
        utils.hideLoader();
    } catch (error) {
        console.error('Initialization error:', error);
        utils.showError('Failed to initialize app. Please refresh the page.');
        utils.hideLoader();
    }
}

// Start the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}