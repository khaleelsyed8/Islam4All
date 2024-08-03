document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search-bar');
    const header = document.querySelector('header');
    const content = document.querySelector('.content');
    const ayahContainer = document.getElementById('ayah-container');
    const moods = ["Click me and type", "Happy", "Sad", "Good","Hope", "trust","Patience", "Gratitude","Guidance","Blessing","Unity","Reality","Divine","Angry"];
    let moodIndex = 0;
    let charIndex = 0;
    function type() {
        if (charIndex < moods[moodIndex].length) {
            searchBar.placeholder += moods[moodIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, 80); // Adjust typing speed here
        } else {
            setTimeout(erase, 500); // Adjust delay before erasing
        }
    }

    function erase() {
        if (charIndex > 0) {
            searchBar.placeholder = searchBar.placeholder.substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, 100); // Adjust erasing speed here
        } else {
            moodIndex = (moodIndex + 1) % moods.length;
            setTimeout(type, 500); // Adjust delay before typing new mood
        }
    }
    // Initial load animation
    setTimeout(() => {
        header.style.transform = 'translateY(0)';
    }, 500);

    // Listen for the Enter key press
    searchBar.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            const mood = searchBar.value.trim().toLowerCase();
            if (mood) {
                fetchAyahs(mood);
                header.classList.add('active');
                content.classList.add('active');
            }
        }
    });
    

    function fetchAyahs(mood) {
        // Fetch data from the local JSON file
        fetch('ayats.json')
            .then(response => response.json())
            .then(data => {
                ayahContainer.innerHTML = '';
                if (data[mood]) {
                    data[mood].forEach(ayah => {
                        const card = document.createElement('div');
                        card.className = 'card';
                        card.innerHTML = `
                            <div class="ayah-text">${ayah.arabic}</div>
                            <div class="ayah-translation">${ayah.translation}</div>
                            <div class="verse-number">Verse: ${ayah.verse}</div>
                        `;
                        card.addEventListener('click', () => toggleMaximize(card));
                        ayahContainer.appendChild(card);
                    });
                } else {
                    ayahContainer.innerHTML = '<p>No ayahs found for this mood.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                ayahContainer.innerHTML = '<p>Error fetching ayahs. Please try again later.</p>';
            });
    }

    function toggleMaximize(card) {
        const isMaximized = card.classList.contains('maximized');
        document.querySelectorAll('.card').forEach(c => c.classList.remove('maximized'));
        if (!isMaximized) {
            card.classList.add('maximized');
        }
    }
    type();
});
