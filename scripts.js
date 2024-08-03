function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    sidebar.classList.toggle('active');
    body.classList.toggle('sidebar-open');
}
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const languageDropdown = document.getElementById('languageDropdown');
    const languageMenu = document.getElementById('languageMenu');
    const sidebarContent = document.getElementById('sidebar-content');
    const headerBtns = document.querySelectorAll('.header-btn');
    const searchInput = document.getElementById('searchInput');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mainBtns = document.querySelectorAll('.main-btn');
    const body = document.body;
    let currentSurahNumber = 1;
    let currentJuzNumber = 1;
    let currentView = 'surah';
    let currentMode = 'translate';
    let currentLanguage = 'en.ahmedraza';
    let availableLanguages = [];

    function openSidebar() {
        sidebar.classList.add('active');
        body.classList.add('sidebar-open');
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        body.classList.remove('sidebar-open');
    }

    hamburgerMenu.addEventListener('click', (event) => {
        event.stopPropagation();
        openSidebar();
    });

    document.addEventListener('click', (event) => {
        if (body.classList.contains('sidebar-open') && !sidebar.contains(event.target)) {
            closeSidebar();
        }
    });

    sidebar.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && body.classList.contains('sidebar-open')) {
            closeSidebar();
        }
    });

    function fetchLanguages() {
        fetch('https://api.alquran.cloud/v1/edition/language')
            .then(response => response.json())
            .then(data => {
                availableLanguages = data.data.filter(lang => ['en', 'ur', 'es', 'fr'].includes(lang));
                createLanguageMenu();
            });
    }

    function createLanguageMenu() {
        availableLanguages.forEach(lang => {
            const langItem = document.createElement('a');
            langItem.href = '#';
            langItem.textContent = getLanguageName(lang);
            langItem.onclick = (e) => {
                e.preventDefault();
                changeLanguage(lang);
            };
            languageMenu.appendChild(langItem);
        });
    }

    function getLanguageName(code) {
        const names = {
            en: 'English',
            es: 'Spanish',
            fr: 'French',
            ur: 'Urdu'
        };
        return names[code] || code.toUpperCase();
    }

    function changeLanguage(lang) {
        currentLanguage = getEditionCode(lang);
        if (currentView === 'surah') {
            loadSurah(currentSurahNumber);
        } else if (currentView === 'juz') {
            loadJuz(1);
        }
        languageDropdown.textContent = getLanguageName(lang).substring(0, 2);
        toggleLanguageMenu();
    }

    function getEditionCode(lang) {
        const editionCodes = {
            en: 'en.ahmedraza',
            ur: 'ur.ahmedali',
            es: 'es.asad',
            fr: 'fr.hamidullah'
        };
        return editionCodes[lang] || lang;
    }

    languageDropdown.onclick = toggleLanguageMenu;

    function toggleLanguageMenu() {
        languageMenu.classList.toggle('show');
    }

    window.onclick = function(event) {
        if (!event.target.matches('#languageDropdown')) {
            if (languageMenu.classList.contains('show')) {
                languageMenu.classList.remove('show');
            }
        }
    }
    if (!sidebarContent) {
        console.error('Could not find element with id "sidebar-content"');
        return;
    }

    if (!searchInput) {
        console.error('Could not find element with id "searchInput"');
        return;
    }

    function fetchSurahs() {
        fetch('https://api.alquran.cloud/v1/surah')
            .then(response => response.json())
            .then(data => {
                sidebarContent.innerHTML = '';
                data.data.forEach(surah => {
                    const surahElement = document.createElement('div');
                    surahElement.className = 'sidebar-item';
                    surahElement.textContent = `${surah.number}. ${surah.englishName}`;
                    surahElement.onclick = () => {
                        document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
                        surahElement.classList.add('active');
                        loadSurah(surah.number);
                    };
                    sidebarContent.appendChild(surahElement);
                });
                if (currentMode === 'translate') {
                    loadSurah(currentSurahNumber);
                } else if (currentMode === 'read') {
                    loadSurah(currentSurahNumber);
                }
            })
            .catch(error => console.error('Error fetching surahs:', error));
    }

    function fetchJuz() {
        sidebarContent.innerHTML = ''; // Clear existing sidebar content
    
        for (let i = 1; i <= 30; i++) {
            const juzElement = document.createElement('div');
            juzElement.className = 'sidebar-item';
            juzElement.textContent = `Juz ${i}`;
            juzElement.onclick = () => {
                document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
                juzElement.classList.add('active');
                loadJuz(i);
            };
            sidebarContent.appendChild(juzElement);
        }
    
        if (currentMode === 'translate') {
            loadJuz(currentJuzNumber);
        } else if (currentMode === 'read') {
            loadJuz(currentJuzNumber);
        }
    }
    function fetchAyah(ayahNumber) {
        if (ayahNumber < 1 || ayahNumber > 6236) {
            content.innerHTML = '<p>Please choose an ayah number between 1 and 6236.</p>';
            return;
        }
    
        const urlArabic = `https://api.alquran.cloud/v1/ayah/${ayahNumber}/ar.uthmani`;
        const urlTranslation = `https://api.alquran.cloud/v1/ayah/${ayahNumber}/${currentLanguage}`;
    
        Promise.all([
            fetch(urlArabic).then(response => response.json()),
            fetch(urlTranslation).then(response => response.json())
        ])
        .then(data => {
            const arabicData = data[0].data;
            const translationData = data[1].data;
            
            // Combine both data into one object
            const combinedData = {
                arabic: {
                    text: arabicData.text,
                    surah: arabicData.surah,
                    numberInSurah: arabicData.numberInSurah
                },
                translation: {
                    text: translationData.text,
                    surah: translationData.surah,
                    numberInSurah: translationData.numberInSurah
                }
            };
    
            displayAyah(combinedData);
        })
        .catch(error => {
            if (ayahNumber < 1 || ayahNumber > 6236) {
                content.innerHTML = '<p>Please choose an ayah number between 1 and 6236.</p>';
            } else {
                console.error('Error fetching ayah:', error);
                content.innerHTML = `<p>Error loading ayah. Please try again. Details: ${error.message}</p>`;
            }
        });
    }
    function displayAyah(data) {
        const arabicText = data.arabic.text;
        const translationText = data.translation.text;
    
        const html = `
            <h1>${data.translation.surah.englishName} (${data.translation.surah.name})</h1>
            <p><strong>Ayah ${data.translation.numberInSurah}</strong></p>
            <div class="arabic">
                <p>${arabicText}</p>
            </div>
            <div class="translation">
                <p>${translationText}</p>
            </div>
        `;
    
        content.innerHTML = html;
    }

    function loadSurah(surahNumber) {
        currentSurahNumber = surahNumber;
        const url = currentMode === 'translate'
            ? `https://api.alquran.cloud/v1/surah/${surahNumber}`
            : `https://api.alquran.cloud/v1/surah/${surahNumber}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (currentMode === 'translate') {
                    const arabicData = data.data;
                    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${currentLanguage}`)
                        .then(response => response.json())
                        .then(translationData => {
                            displaySurah(arabicData, translationData.data);
                        })
                        .catch(error => console.error('Error loading translation:', error));
                } else {
                    displaySurah(data.data);
                }
            })
            .catch(error => console.error('Error loading surah:', error));
    }

    function loadJuz(juzNumber) {
        currentJuzNumber = juzNumber;
        
        const arabicUrl = `https://api.alquran.cloud/v1/juz/${juzNumber}`;
        const translationUrl = `https://api.alquran.cloud/v1/juz/${juzNumber}/${currentLanguage}`;
        
        // Fetch the Arabic text
        fetch(arabicUrl)
            .then(response => response.json())
            .then(data => {
                if (currentMode === 'translate') {
                    // If translating, fetch the translation as well
                    fetch(translationUrl)
                        .then(response => response.json())
                        .then(translationData => {
                            const arabicAyahs = data.data.ayahs || [];
                            const translatedAyahs = translationData.data.ayahs || [];
                            displayJuz(arabicAyahs, translatedAyahs);
                        })
                        .catch(error => console.error('Error loading translation:', error));
                } else {
                    // Only need Arabic text
                    const arabicAyahs = data.data.ayahs || [];
                    displayJuz(arabicAyahs, []);
                }
            })
            .catch(error => console.error('Error loading juz:', error));
    }
    

    function displaySurah(arabicData, translationData = null) {
        if (!arabicData) return;

        let html = `<h1>${arabicData.name} (${arabicData.englishName})</h1>`;
        for (let i = 0; i < arabicData.ayahs.length; i++) {
            html += `
                <div class="arabic">
                    <p>${arabicData.ayahs[i].text}</p>
                </div>
                ${currentMode === 'translate' ? `
                    <div class="translation">
                        <p>${translationData.ayahs[i].text}</p>
                    </div>` : ''}
            `;
        }
        content.innerHTML = html;
    }

    function displayJuz(arabicAyahs, translationAyahs = []) {
        if (!arabicAyahs) return;

        let html = `<h1>Juz ${currentJuzNumber}</h1>`;
        for (let i = 0; i < arabicAyahs.length; i++) {
            html += `
                <div class="arabic">
                    <p>${arabicAyahs[i].text}</p>
                </div>
                ${currentMode === 'translate' ? `
                    <div class="translation">
                        <p>${translationAyahs[i] ? translationAyahs[i].text : ''}</p>
                    </div>` : ''}
            `;
        }
        content.innerHTML = html;
    }
    function handleSearchInput() {
        const query = searchInput.value.trim().toLowerCase();

        if (query === '') {
            // If the search input is empty, reload the current view (surah, juz, ayah)
            if (currentView === 'surah') {
                fetchSurahs();
            } else if (currentView === 'juz') {
                fetchJuz();
            } else if (currentView === 'ayah') {
                fetchAyahs();
            }
        } else if (!isNaN(query)) {
            // If the search query is a number, assume it's an Ayah number
            fetchAyah(query);
        } else {
            // If the search query is a text, search in Surahs
            fetch(`https://api.alquran.cloud/v1/surah`)
                .then(response => response.json())
                .then(data => {
                    const filteredSurahs = data.data.filter(surah => 
                        surah.englishName.toLowerCase().includes(query) || 
                        surah.englishNameTranslation.toLowerCase().includes(query)
                    );

                    sidebarContent.innerHTML = '';
                    filteredSurahs.forEach(surah => {
                        const surahElement = document.createElement('div');
                        surahElement.className = 'sidebar-item';
                        surahElement.textContent = `${surah.number}. ${surah.englishName}`;
                        surahElement.onclick = () => loadSurah(surah.number);
                        sidebarContent.appendChild(surahElement);
                    });
                })
                .catch(error => console.error('Error searching surahs:', error));
        }
    }

    headerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove 'active' class from all tabs
            headerBtns.forEach(button => button.classList.remove('active'));
            
            // Add 'active' class to the clicked tab
            e.target.classList.add('active');
            
            currentView = e.target.dataset.type;
            sidebarContent.innerHTML = '';
            
            if (currentView === 'surah') {
                fetchSurahs();
            } else if (currentView === 'juz') {
                fetchJuz();
            }
        });
    });

    mainBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.main-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentMode = e.target.dataset.type;
            if (currentView === 'surah') {
                loadSurah(currentSurahNumber);
            } else if (currentView === 'juz') {
                loadJuz(currentJuzNumber);
            }
        });
    });

    searchInput.addEventListener('input', handleSearchInput);

    fetchLanguages();
    fetchSurahs();
});
