document.addEventListener('DOMContentLoaded', () => {
    const ambientAudio = document.getElementById('v7-audio-ambient');
    const episodeAudio = document.getElementById('v7-audio-episode');

    // Initialize Audio Settings
    const settings = {
        ambientVol: localStorage.getItem('v7_ambient_vol') || 0.3,
        episodeVol: localStorage.getItem('v7_episode_vol') || 0.6,
        isMuted: localStorage.getItem('v7_muted') === 'true'
    };

    ambientAudio.volume = settings.ambientVol;
    episodeAudio.volume = settings.episodeVol;

    // Ambient Tracks Mapping
    const ambientTracks = {
        1: 'https://www.soundjay.com/nature/wind-01.mp3', // Season 1: Ancient Wind
        2: 'https://www.soundjay.com/free-music/deep-space-01.mp3' // Season 2: Cosmic Hum
    };

    // Auto-play ambient on user interaction
    const startAudio = () => {
        const seasonId = window.location.pathname.includes('/season/2') ? 2 : 1;
        if (ambientAudio.src !== ambientTracks[seasonId]) {
            ambientAudio.src = ambientTracks[seasonId];
        }
        if (!settings.isMuted) {
            ambientAudio.play().catch(e => console.log("Auto-play blocked"));
        }
        document.removeEventListener('click', startAudio);
    };
    document.addEventListener('click', startAudio);

    // Crossfade Logic (Basic)
    window.v7SetVolume = (type, val) => {
        if (type === 'ambient') {
            ambientAudio.volume = val;
            localStorage.setItem('v7_ambient_vol', val);
        } else if (type === 'episode') {
            episodeAudio.volume = val;
            localStorage.setItem('v7_episode_vol', val);
        }
    };

    // V7 Notification Registration & Daily Hype
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('SW Registered');

            // Check for daily hype notification
            const lastHype = localStorage.getItem('v7_last_hype');
            const today = new Date().toDateString();

            if (lastHype !== today && localStorage.getItem('v7_notifications') !== 'false') {
                fetch('/api/v7/hype')
                    .then(r => r.json())
                    .then(data => {
                        if (Notification.permission === 'granted') {
                            reg.showNotification('خاطرة اليوم من المجرّة', {
                                body: data.line,
                                icon: '/covers/season1.jpg'
                            });
                            localStorage.setItem('v7_last_hype', today);
                        }
                    });
            }
        });
    }

    window.requestV7Notifications = () => {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                localStorage.setItem('v7_notifications', 'true');
                alert('تم تفعيل التنبيهات الكونية!');
            }
        });
    };

    // Feature 3: Auto-Scroll Logic
    let autoScrollInterval = null;
    window.v7ToggleAutoScroll = (speed) => {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
            return;
        }
        autoScrollInterval = setInterval(() => {
            window.scrollBy(0, speed);
        }, 50);
    };

    // Feature 4: Double-Tap Lore Search
    document.addEventListener('dblclick', (e) => {
        const selection = window.getSelection().toString().trim();
        if (selection.length > 2) {
            fetch(`/api/keywords/${selection}`)
                .then(r => r.json())
                .then(data => {
                    if (data.description) {
                        alert(`${selection}: ${data.description}`);
                    }
                });
        }
    });

    // Feature 8: Dynamic Story Backgrounds
    const applyDynamicBackground = () => {
        const episodeId = parseInt(window.location.pathname.split('/').pop());
        if (!isNaN(episodeId)) {
            if (episodeId % 5 === 0) document.body.style.setProperty('--accent-gold-glow', 'rgba(255,0,0,0.2)');
            if (episodeId % 7 === 0) document.body.style.setProperty('--accent-gold-glow', 'rgba(0,255,0,0.2)');
        }
    };
    applyDynamicBackground();

    // Feature 9: Story Bookmarking
    window.v7AddBookmark = () => {
        const title = document.title;
        const url = window.location.pathname;
        let bookmarks = JSON.parse(localStorage.getItem('v7_bookmarks') || '[]');
        if (!bookmarks.find(b => b.url === url)) {
            bookmarks.push({ title, url, date: new Date().toLocaleDateString() });
            localStorage.setItem('v7_bookmarks', JSON.stringify(bookmarks));
            alert('تمت إضافة الإشارة المرجعية!');
        }
    };

    // Apply Focus Mode from storage
    if (localStorage.getItem('v7_focus_mode') === 'true') {
        document.body.classList.add('v7-focus-mode');
    }
});
