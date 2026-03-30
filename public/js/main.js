document.addEventListener('DOMContentLoaded', () => {
    // Progress Tracking
    const STORAGE_KEY = 'reading_progress_v1';
    
    function getProgress() {
        const progress = localStorage.getItem(STORAGE_KEY);
        return progress ? JSON.parse(progress) : {};
    }

    function saveProgress(seasonId, episodeId) {
        const progress = getProgress();
        if (!progress[seasonId]) progress[seasonId] = [];
        if (!progress[seasonId].includes(episodeId)) {
            progress[seasonId].push(episodeId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        }
    }

    // Mark current episode as read
    const reader = document.querySelector('.reader');
    if (reader) {
        const seasonId = reader.dataset.seasonId;
        const episodeId = reader.dataset.episodeId;
        saveProgress(seasonId, episodeId);
    }

    // Highlight completed episodes in the list
    const episodeItems = document.querySelectorAll('.episode-item');
    if (episodeItems.length > 0) {
        const progress = getProgress();
        const seasonId = document.querySelector('.episode-list').dataset.seasonId;
        
        if (progress[seasonId]) {
            episodeItems.forEach(item => {
                if (progress[seasonId].includes(item.dataset.episodeId)) {
                    item.classList.add('completed');
                }
            });
        }
    }

    // Scroll Animations for Key Plot Points
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reader-content p, .season-card, .episode-item').forEach(el => {
        observer.observe(el);
    });
});
