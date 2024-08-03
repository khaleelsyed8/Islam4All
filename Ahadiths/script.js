document.addEventListener('DOMContentLoaded', function () {
    const collectionsList = document.getElementById('books-list');
    const chaptersList = document.getElementById('chapters-list');
    const hadithsList = document.getElementById('hadiths-list');
    const subSidebar = document.getElementById('sub-sidebar');
    const loadingIndicator = document.createElement('div');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const darkModeSwitch = document.getElementById('dark-mode-switch');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.innerText = 'Loading...';
    document.body.appendChild(loadingIndicator);

    fetchCollections();
    hamburgerMenu.addEventListener('click', function () {
        sidebar.classList.toggle('active');
        subSidebar.classList.remove('active');
    });
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    darkModeSwitch.addEventListener('click', () => {
        // Toggle dark mode
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });


    async function fetchCollections() {
        const collectionsApiUrl = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json';
        try {
            showLoadingIndicator();
            const response = await fetch(collectionsApiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (!data || typeof data !== 'object') {
                throw new Error('Invalid collections data');
            }

            collectionsList.innerHTML = '';
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const collection = data[key];
                    const li = document.createElement('li');
                    li.textContent = collection.name;
                    li.dataset.name = key;
                    li.addEventListener('click', debounce(function () {
                        const collectionName = this.dataset.name;
                        console.log('Collection clicked:', collectionName);
                        fetchBooks(collectionName);
                    }, 300));
                    collectionsList.appendChild(li);
                }
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        } finally {
            hideLoadingIndicator();
        }
    }

    async function fetchBooks(collectionName) {
        const booksApiUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${encodeURIComponent(collectionName)}.json`;
        console.log('Fetching books for collection:', collectionName);

        try {
            showLoadingIndicator();
            const response = await fetch(booksApiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            chaptersList.innerHTML = '';
            subSidebar.classList.remove('hidden');
            subSidebar.classList.add('active');

            if (!data || !data.metadata || !data.metadata.sections) {
                chaptersList.innerHTML = '<li>No books found</li>';
                return;
            }

            const sections = data.metadata.sections;
            for (const key in sections) {
                if (sections.hasOwnProperty(key)) {
                    const sectionName = sections[key];
                    const li = document.createElement('li');
                    li.textContent = sectionName;
                    li.dataset.section = key;
                    li.addEventListener('click', debounce(function () {
                        const sectionKey = this.dataset.section;
                        console.log('Section clicked:', sectionKey);
                        fetchHadiths(collectionName, sectionKey);
                    }, 300));
                    chaptersList.appendChild(li);
                }
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            hideLoadingIndicator();
        }
    }

    async function fetchHadiths(collectionName, sectionKey) {
        const hadithsApiUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${encodeURIComponent(collectionName)}/sections/${sectionKey}.json`;
        console.log('Fetching hadiths for collection:', collectionName, 'section:', sectionKey);

        try {
            showLoadingIndicator();
            const response = await fetch(hadithsApiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            hadithsList.innerHTML = '';

            if (!data || !data.hadiths || !Array.isArray(data.hadiths)) {
                hadithsList.innerHTML = '<p>No hadiths found</p>';
                return;
            }

            data.hadiths.forEach(hadith => {
                const hadithDiv = document.createElement('div');
                hadithDiv.classList.add('hadith');
                hadithDiv.innerHTML = `
                    <div class="hadiths">
                        <p>${hadith.text || 'Not available'}</p>
                        <p><strong>Hadith Number:</strong> ${hadith.hadithnumber}</p>
                        <p><strong>Arabic Number:</strong> ${hadith.arabicnumber}</p>
                        <p><strong>Reference:</strong> Book ${hadith.reference.book}, Hadith ${hadith.reference.hadith}</p>
                        <p><strong>Grades:</strong> ${hadith.grades.map(grade => `${grade.name}: ${grade.grade}`).join(', ')}</p>
                    </div>
                `;
                hadithsList.appendChild(hadithDiv);
            });
        } catch (error) {
            console.error('Error fetching hadiths:', error);
            hadithsList.innerHTML = '<p>Error loading hadiths. Please try again.</p>';
        } finally {
            hideLoadingIndicator();
        }
    }

    function showLoadingIndicator() {
        loadingIndicator.style.display = 'block';
    }

    function hideLoadingIndicator() {
        loadingIndicator.style.display = 'none';
    }

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
});


