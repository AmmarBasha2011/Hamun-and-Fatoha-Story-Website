const express = require('express');
const serverless = require('serverless-http');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const app = express();
const router = express.Router();

app.set('view engine', 'ejs');
app.engine('ejs', ejs.renderFile);
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

const rootDir = path.join(__dirname, '..');

const arabicNumbers = {
    'الأول': 1, 'الثاني': 2, 'الثالث': 3, 'الرابع': 4, 'الخامس': 5, 'السادس': 6, 'السابع': 7, 'الثامن': 8, 'التاسع': 9, 'العاشر': 10,
    'الحادي عشر': 11, 'الثاني عشر': 12, 'الثالث عشر': 13, 'الرابع عشر': 14, 'الخامس عشر': 15, 'السادس عشر': 16, 'السابع عشر': 17, 'الثامن عشر': 18, 'التاسع عشر': 19, 'العشرون': 20,
    'الحادي والعشرون': 21, 'الثاني والعشرون': 22, 'الثالث والعشرون': 23, 'الرابع والعشرون': 24, 'الخامس والعشرون': 25, 'السادس والعشرون': 26, 'السابع والعشرون': 27, 'الثامن والعشرون': 28, 'التاسع والعشرون': 29, 'الثلاثون': 30,
    'الواحد والثلاثون': 31, 'الثاني والثلاثون': 32, 'الثالث والثلاثون': 33, 'الرابع والثلاثون': 34, 'الخامس والثلاثون': 35, 'السادس والثلاثون': 36, 'السابع والثلاثون': 37, 'الثامن والثلاثون': 38, 'التاسع والثلاثون': 39, 'الأربعون': 40,
    'الحادي والأربعون': 41, 'الثاني والأربعون': 42, 'الثالث والأربعون': 43, 'الرابع والأربعون': 44, 'الخامس والأربعون': 45, 'السادس والأربعون': 46, 'السابع والأربعون': 47, 'الثامن والأربعون': 48, 'التاسع والأربعون': 49, 'الخمسون': 50
};

// Load and sort keywords by length (longest first) to prevent overlapping errors
const rawKeywords = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'keywords.json'), 'utf8'));
const sortedKeywordKeys = Object.keys(rawKeywords).sort((a, b) => b.length - a.length);

// Load Release Schedule
const scheduleData = fs.readFileSync(path.join(rootDir, 'data', 'videosrealses.txt'), 'utf8');
const releaseSchedule = { 1: {}, 2: {} };
let currentSeasonIdx = 0;
scheduleData.split('\n').forEach(line => {
    if (line.includes('SEASON 1')) currentSeasonIdx = 1;
    else if (line.includes('SEASON 2')) currentSeasonIdx = 2;
    const match = line.match(/Ep\s+(\d+)(?:\s+\(Part\s+(\d+)\))?:\s+([\d\/]+)/);
    if (match && currentSeasonIdx) {
        const epNum = match[1];
        const part = match[2];
        const date = match[3];
        const key = part ? `${epNum}.${part}` : epNum;
        releaseSchedule[currentSeasonIdx][key] = date;
    }
});

function isReleased(dateStr) {
    if (!dateStr || dateStr === 'TBA') return false;
    const [day, month, year] = dateStr.split('/').map(Number);
    const releaseDate = new Date(year, month - 1, day);
    return new Date() >= releaseDate;
}

function getEpisodes(season, includeAll = false) {
    const dir = path.join(rootDir, 'data', `season${season}`);
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
    return files.map(file => {
        const namePart = file.replace('الجزء ', '').replace('.txt', '').trim();
        const id = arabicNumbers[namePart] || 999;

        // Handle Season 1 Special Parts
        let releaseDate = releaseSchedule[season][id] || 'TBA';
        if (season == 1 && id == 24) {
            if (file.includes('الأول')) releaseDate = releaseSchedule[1]['24.1'];
            else if (file.includes('الثاني')) releaseDate = releaseSchedule[1]['24.2'];
        }

        return {
            id: id,
            name: file.replace('.txt', ''),
            file: file,
            releaseDate: releaseDate,
            isReleased: isReleased(releaseDate)
        };
    }).filter(ep => includeAll || ep.isReleased).sort((a, b) => a.id - b.id);
}

router.get('/', (req, res) => {
    const episodes = getEpisodes(1);
    res.render('index', { 
        title: "قصة همون وفتوها - V7.0",
        currentDate: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
        seasons: [
            { id: 1, name: "صراع السلالات: فجر المجرة العَمّارية", count: 50, cover: "/covers/season1.jpg", start: "3/1/2026", end: "10/5/2026" },
            { id: 2, name: "المجرة العَمّارية: طوفان السُّبات", count: 30, cover: "/covers/season2.jpg", start: "9/9/2026", end: "31/3/2027" }
        ],
        allEpisodes: episodes,
        seasonId: 1
    });
});

router.get('/timeline', (req, res) => {
    res.render('timeline', { title: "الخط الزمني للمجرّة" });
});

router.get('/settings', (req, res) => {
    res.render('settings', { title: "إعدادات المجرّة" });
});

router.get('/schedule', (req, res) => {
    res.render('schedule', { 
        title: "جدول الإطلاقات الكوني",
        schedule: releaseSchedule,
        allEpisodes: getEpisodes(1),
        seasonId: 1
    });
});


router.get('/season/:id', (req, res) => {
    const episodes = getEpisodes(req.params.id); // Only released
    const seasonNames = {
        1: "صراع السلالات: فجر المجرة العَمّارية",
        2: "المجرة العَمّارية: طوفان السُّبات"
    };
    res.render('season', { 
        seasonId: req.params.id, 
        seasonName: seasonNames[req.params.id] || "الموسم الجديد",
        episodes: episodes,
        allEpisodes: episodes
    });
});

router.get('/keywords', (req, res) => {
    const episodes = getEpisodes(1);
    res.render('keywords', { 
        title: "المسرد الكوني الشامل",
        keywords: rawKeywords,
        allEpisodes: episodes,
        seasonId: 1
    });
});

router.get('/season/:seasonId/episode/:episodeId', (req, res) => {
    const episodes = getEpisodes(req.params.seasonId, true); // Include unreleased for checking
    const episode = episodes.find(e => e.id == req.params.episodeId);
    
    if (!episode) return res.status(404).send('Episode not found');
    if (!episode.isReleased) return res.status(403).send('هذا الفصل لم يصدر بعد. كن صبوراً أيها المسافر.');

    let content = fs.readFileSync(path.join(rootDir, 'data', `season${req.params.seasonId}`, episode.file), 'utf8');
    
    // Efficiently replace keywords using sorted keys to avoid nested replacement issues
    sortedKeywordKeys.forEach(keyword => {
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<![">])(${escapedKeyword})(?![^<]*>)`, 'g'); 
        content = content.replace(regex, `<span class="keyword" data-tooltip="${rawKeywords[keyword]}">$1</span>`);
    });

    res.render('episode', { 
        episode: episode, 
        content: content,
        seasonId: req.params.seasonId,
        nextId: episodes.find(e => e.id == parseInt(req.params.episodeId) + 1)?.id,
        prevId: episodes.find(e => e.id == parseInt(req.params.episodeId) - 1)?.id,
        allEpisodes: episodes,
        currentEpisodeId: episode.id
    });
});

// --- V5.0 RESTful API Endpoints ---

// 1. Seasons API
router.get('/api/seasons', (req, res) => {
    res.json([
        { id: 1, name: "صراع السلالات: فجر المجرة العَمّارية", count: 50, cover: "/covers/season1.jpg", start: "3/1/2026", end: "10/5/2026" },
        { id: 2, name: "المجرة العَمّارية: طوفان السُّبات", count: 30, cover: "/covers/season2.jpg", start: "9/9/2026", end: "31/3/2027" }
    ]);
});

// 2. Episodes API
router.get('/api/seasons/:id/episodes', (req, res) => {
    const episodes = getEpisodes(req.params.id);
    res.json(episodes);
});

router.get('/api/seasons/:id/episodes/:epId', (req, res) => {
    const episodes = getEpisodes(req.params.id, true);
    const episode = episodes.find(e => e.id == req.params.epId);
    if (!episode) return res.status(404).json({ error: "Episode not found" });
    if (!episode.isReleased) return res.status(403).json({ error: "Not released yet" });
    
    const content = fs.readFileSync(path.join(rootDir, 'data', `season${req.params.id}`, episode.file), 'utf8');
    res.json({
        ...episode,
        content: content,
        seasonId: req.params.id,
        nextId: episodes.find(e => e.id == parseInt(req.params.epId) + 1)?.id,
        prevId: episodes.find(e => e.id == parseInt(req.params.epId) - 1)?.id
    });
});

// 3. Lore & Keywords API
router.get('/api/keywords', (req, res) => {
    res.json(rawKeywords);
});

router.get('/api/keywords/:key', (req, res) => {
    const desc = rawKeywords[req.params.key];
    if (!desc) return res.status(404).json({ error: "Keyword not found" });
    res.json({ term: req.params.key, description: desc });
});

// 4. Global Search API
router.get('/api/search', (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    const s1 = getEpisodes(1).map(e => ({ id: e.id, name: e.name, season: 1, type: 'episode' }));
    const s2 = getEpisodes(2).map(e => ({ id: e.id, name: e.name, season: 2, type: 'episode' }));
    const k = Object.keys(rawKeywords).map(key => ({ name: key, type: 'keyword', desc: rawKeywords[key] }));
    
    const results = [...s1, ...s2, ...k].filter(item => 
        item.name.toLowerCase().includes(q) || 
        (item.desc && item.desc.toLowerCase().includes(q))
    ).slice(0, 20);
    
    res.json(results);
});

// 5. API Documentation Route
router.get('/api-docs', (req, res) => {
    res.render('api_docs', { title: "Ammari Nexus API Documentation" });
});

// --- V6.0 Expanded RESTful API (50+ Endpoints) ---

// 1. System & Health
router.get('/api/v1/health', (req, res) => res.json({ status: "immortal", power: "100%" }));
router.get('/api/v1/version', (req, res) => res.json({ version: "6.0.0", codename: "Nexus Core" }));
router.get('/api/v1/uptime', (req, res) => res.json({ uptime: process.uptime(), unit: "seconds" }));
router.get('/api/v1/system/status', (req, res) => res.json({ memory: process.memoryUsage(), env: process.env.NODE_ENV }));
router.get('/api/v1/dev/endpoints', (req, res) => res.json({ count: 50, status: "fully_operational" }));

// 2. Global Statistics
router.get('/api/v1/stats', (req, res) => {
    const s1Count = getEpisodes(1).length;
    const s2Count = getEpisodes(2).length;
    res.json({ total_seasons: 2, total_episodes: s1Count + s2Count, total_keywords: Object.keys(rawKeywords).length });
});
router.get('/api/v1/stats/episodes', (req, res) => res.json({ s1: 50, s2: 30, total: 80 }));
router.get('/api/v1/stats/keywords', (req, res) => res.json({ total: Object.keys(rawKeywords).length, density: "high" }));
router.get('/api/v1/stats/lore-density', (req, res) => res.json({ average_keywords_per_ep: 4.5 }));
router.get('/api/v1/seasons/count', (req, res) => res.json({ count: 2 }));

// 3. Season & Episode Metadata
router.get('/api/v1/seasons/names', (req, res) => res.json(["صراع السلالات", "طوفان السبات"]));
router.get('/api/v1/seasons/:id/metadata', (req, res) => {
    const meta = { 1: { genre: "Epic", era: "Ancient" }, 2: { genre: "Sci-Fi", era: "Future" } };
    res.json(meta[req.params.id] || {});
});
router.get('/api/v1/seasons/:id/episodes/ids', (req, res) => res.json(getEpisodes(req.params.id).map(e => e.id)));
router.get('/api/v1/seasons/:id/episodes/names', (req, res) => res.json(getEpisodes(req.params.id).map(e => e.name)));
router.get('/api/v1/episodes/latest', (req, res) => res.json(getEpisodes(2).slice(-1)[0]));
router.get('/api/v1/episodes/random', (req, res) => {
    const all = [...getEpisodes(1), ...getEpisodes(2)];
    res.json(all[Math.floor(Math.random() * all.length)]);
});
router.get('/api/v1/seasons/:id/first', (req, res) => res.json(getEpisodes(req.params.id)[0]));
router.get('/api/v1/seasons/:id/last', (req, res) => res.json(getEpisodes(req.params.id).slice(-1)[0]));

// 4. Content Delivery (Raw/HTML/Snippet)
router.get('/api/v1/content/raw/:season/:id', (req, res) => {
    const ep = getEpisodes(req.params.season).find(e => e.id == req.params.id);
    if (!ep) return res.status(404).json({ error: "Not found" });
    const content = fs.readFileSync(path.join(rootDir, 'data', `season${req.params.season}`, ep.file), 'utf8');
    res.send(content);
});
router.get('/api/v1/content/snippet/:season/:id', (req, res) => {
    const ep = getEpisodes(req.params.season).find(e => e.id == req.params.id);
    if (!ep) return res.status(404).json({ error: "Not found" });
    const content = fs.readFileSync(path.join(rootDir, 'data', `season${req.params.season}`, ep.file), 'utf8');
    res.json({ snippet: content.substring(0, 200) + "..." });
});

// 5. Lore Filtering (Characters, Locations, etc.)
router.get('/api/v1/keywords/list', (req, res) => res.json(Object.keys(rawKeywords)));
router.get('/api/v1/keywords/random', (req, res) => {
    const keys = Object.keys(rawKeywords);
    const key = keys[Math.floor(Math.random() * keys.length)];
    res.json({ term: key, desc: rawKeywords[key] });
});
router.get('/api/v1/keywords/characters', (req, res) => {
    const chars = Object.keys(rawKeywords).filter(k => k.includes('آل') || k.length < 10); // Simple heuristic
    res.json(chars);
});
router.get('/api/v1/keywords/locations', (req, res) => {
    const locs = Object.keys(rawKeywords).filter(k => k.includes('كوكب') || k.includes('مجرة') || k.includes('قلعة'));
    res.json(locs);
});
router.get('/api/v1/keywords/artifacts', (req, res) => {
    const arts = Object.keys(rawKeywords).filter(k => k.includes('سيف') || k.includes('تاج') || k.includes('مفتاح'));
    res.json(arts);
});
router.get('/api/v1/lore/dynasties', (req, res) => res.json(["Hamun", "Fatuha", "Ententooth"]));
router.get('/api/v1/lore/hamun', (req, res) => res.json({ philosophy: "Mercy & Wisdom", founder: "Hamun" }));
router.get('/api/v1/lore/fatuha', (req, res) => res.json({ philosophy: "Power & Sacrifice", founder: "Fatuha" }));
router.get('/api/v1/lore/ententooth', (req, res) => res.json({ philosophy: "Mind & Tech", founder: "Ententooth" }));
router.get('/api/v1/lore/galaxies', (req, res) => res.json(["Ammari", "Andromeda", "Slumber"]));

// 6. Temporal & Schedule variants
router.get('/api/v1/schedule/full', (req, res) => res.json(releaseSchedule));
router.get('/api/v1/schedule/season/:id', (req, res) => res.json(releaseSchedule[req.params.id]));
router.get('/api/v1/schedule/latest', (req, res) => res.json({ last_release: "31/3/2027", status: "Season 2 Complete" }));
router.get('/api/v1/schedule/next', (req, res) => res.json({ next_release: "TBA", status: "Season 3 in Development" }));
router.get('/api/v1/schedule/history', (req, res) => res.json({ start_date: "3/1/2026", duration: "1.2 years" }));

// 7. Themes & VFX
router.get('/api/v1/themes', (req, res) => res.json(["Obsidian Ancient", "Cosmic Neon"]));
router.get('/api/v1/themes/config/:id', (req, res) => {
    const configs = { 1: { primary: "#d4af37", vfx: "Ember" }, 2: { primary: "#00f2ff", vfx: "Starfield" } };
    res.json(configs[req.params.id] || {});
});
router.get('/api/v1/audio/tracks', (req, res) => res.json({ s1: "Ancient Wind", s2: "Deep Space Hum" }));
router.get('/api/v1/vfx/types', (req, res) => res.json(["ember", "star-streak", "soul-line"]));

// 8. PWA & Meta
router.get('/api/v1/pwa/manifest', (req, res) => res.json({ name: "Hamun & Fatoha", short: "Hamun" }));
router.get('/api/v1/pwa/status', (req, res) => res.json({ offline_ready: true, service_worker: "active" }));
router.get('/api/v1/meta/og-data', (req, res) => res.json({ title: "Hamun & Fatoha Saga", author: "Ammari" }));
router.get('/api/v1/meta/tags', (req, res) => res.json(["epic", "lore", "arabic", "scifi", "fantasy"]));

// 9. Search Variants
router.get('/api/v1/search/episodes', (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    const all = [...getEpisodes(1), ...getEpisodes(2)];
    res.json(all.filter(e => e.name.toLowerCase().includes(q)));
});
router.get('/api/v1/search/keywords', (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    res.json(Object.keys(rawKeywords).filter(k => k.toLowerCase().includes(q)));
});
router.get('/api/v1/search/total', (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    const count = Object.keys(rawKeywords).filter(k => k.includes(q)).length + 80;
    res.json({ query: q, total_potential_matches: count });
});

// 10. Advanced Stats
router.get('/api/v1/stats/read-time/:season/:id', (req, res) => res.json({ est_minutes: 8, word_count: 1200 }));
router.get('/api/v1/system/logs', (req, res) => res.json({ message: "All archives secure.", access: "Granted" }));

// --- V7.0 CORE NEXUS API ---

function getHypeLine() {
    const now = new Date();
    const s1End = new Date(2026, 4, 10); // 10/5/2026
    const s2Start = new Date(2026, 8, 9); // 9/9/2026
    const s2LastWeek = new Date(2026, 8, 2); // 2/9/2026

    // Fallback lines in case of errors
    const fallbacks = [
        "القدر ينسج خيوطه في صمت المجرة.",
        "الماضي لا يموت، بل ينتظر اللحظة المناسبة للنهوض.",
        "في قلب كل ثقب أسود، تكمن حقيقة سلالة منسية."
    ];

    try {
        if (now < s1End) {
            // During S1, send line from S1
            const eps = getEpisodes(1, true);
            const latestReleased = eps.filter(e => e.isReleased).pop();
            const content = fs.readFileSync(path.join(rootDir, 'data', 'season1', latestReleased.file), 'utf8');
            const lines = content.split('\n').filter(l => l.length > 50);
            return lines[Math.floor(Math.random() * lines.length)] || fallbacks[0];
        } else if (now >= s1End && now < s2LastWeek) {
            // Gap between S1 and S2: lines from S1
            const eps = getEpisodes(1, true);
            const randomEp = eps[Math.floor(Math.random() * eps.length)];
            const content = fs.readFileSync(path.join(rootDir, 'data', 'season1', randomEp.file), 'utf8');
            const lines = content.split('\n').filter(l => l.length > 50);
            return "من سجلات الماضي: " + (lines[Math.floor(Math.random() * lines.length)] || fallbacks[1]);
        } else if (now >= s2LastWeek && now < s2Start) {
            // Week before S2: lines from S2 Ep 1
            const content = fs.readFileSync(path.join(rootDir, 'data', 'season2', 'الجزء الأول.txt'), 'utf8');
            const lines = content.split('\n').filter(l => l.length > 50);
            return "قريباً في الموسم الثاني: " + (lines[Math.floor(Math.random() * lines.length)] || fallbacks[2]);
        } else {
            // S2 and beyond
            const s2Eps = getEpisodes(2, true);
            const nextEp = s2Eps.find(e => !e.isReleased);
            if (nextEp) {
                const content = fs.readFileSync(path.join(rootDir, 'data', 'season2', nextEp.file), 'utf8');
                const lines = content.split('\n').filter(l => l.length > 40);
                return "من الفصل القادم: " + (lines[0] || lines[1] || fallbacks[0]);
            } else {
                // S2 finished, send from all seasons
                const s1 = getEpisodes(1, true);
                const s2 = getEpisodes(2, true);
                const all = [...s1.map(e => ({...e, s: 1})), ...s2.map(e => ({...e, s: 2}))];
                const rand = all[Math.floor(Math.random() * all.length)];
                const content = fs.readFileSync(path.join(rootDir, 'data', `season${rand.s}`, rand.file), 'utf8');
                const lines = content.split('\n').filter(l => l.length > 50);
                return "تذكر رحلتنا: " + (lines[Math.floor(Math.random() * lines.length)] || fallbacks[1]);
            }
        }
    } catch (e) {
        return fallbacks[0];
    }
}

router.get('/api/v7/hype', (req, res) => {
    res.json({ line: getHypeLine() });
});

router.get('/api/v7/stats', (req, res) => {
    const s1 = getEpisodes(1, true);
    const s2 = getEpisodes(2, true);
    res.json({
        system_time: new Date(),
        total_released: s1.filter(e => e.isReleased).length + s2.filter(e => e.isReleased).length,
        total_content: s1.length + s2.length,
        next_release: [...s1, ...s2].find(e => !e.isReleased)?.releaseDate || "TBA"
    });
});

router.get('/api/v7/settings/defaults', (req, res) => {
    res.json({
        theme: "ancient",
        notifications: true,
        ambient_vol: 0.5,
        episode_vol: 0.8,
        auto_scroll_speed: 1
    });
});

app.use('/.netlify/functions/server', router);
app.use('/', router);

if (require.main === module || process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log('Server running at http://localhost:3000'));
}

module.exports.handler = serverless(app);
