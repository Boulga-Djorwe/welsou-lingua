// ===============================================
// INTERACTIVE TRANSLATION APP - Advanced Features
// ===============================================

// DOM Elements
const sourceLangSelect = document.getElementById('sourceLang');
const targetLangSelect = document.getElementById('targetLang');
const sourceTextArea = document.getElementById('sourceText');
const targetTextArea = document.getElementById('targetText');
const translateBtn = document.getElementById('translateBtn');
const swapBtn = document.getElementById('swapBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const pasteBtn = document.getElementById('pasteBtn');
const voiceBtn = document.getElementById('voiceBtn');
const voiceTargetBtn = document.getElementById('voiceTargetBtn');
const shareBtn = document.getElementById('shareBtn');
const charCount = document.getElementById('charCount');
const statusMessage = document.getElementById('statusMessage');
const langDetected = document.getElementById('langDetected');
const historyBtn = document.getElementById('historyBtn');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const shareModal = document.getElementById('shareModal');
const closeShareModal = document.getElementById('closeShareModal');
const translationInfo = document.getElementById('translationInfo');
const logoText = document.getElementById('logoText');

// Stats
const totalTranslationsEl = document.getElementById('totalTranslations');
const totalCharactersEl = document.getElementById('totalCharacters');
const languagesUsedEl = document.getElementById('languagesUsed');

// App State
let languages = [];

function getBrowserUserId() {
    const userKey = 'welsou_user_id';
    let id = localStorage.getItem(userKey);
    if (!id) {
        id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(userKey, id);
    }
    return id;
}

const currentUserId = getBrowserUserId();
const historyStorageKey = `translationHistory:${currentUserId}`;
const statsStorageKey = `translationStats:${currentUserId}`;

let translationHistory = JSON.parse(sessionStorage.getItem(historyStorageKey)) || [];
let stats = JSON.parse(localStorage.getItem(statsStorageKey)) || {
    total: 0,
    characters: 0,
    languagesSet: new Set()
};
let lastTranslation = null;
let lastDetectedSourceLang = null;
const API_BASE_URL = '';

// ===============================================
// PARTICLES ANIMATION
// ===============================================
const canvas = document.getElementById('particlesCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const particles = [];
for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animateParticles);
}

animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ===============================================
// LANGUAGE LOADING
// ===============================================
async function loadLanguages() {
    try {
        const response = await fetch(`${API_BASE_URL}/languages`);
        if (!response.ok) {
            throw new Error(`Erreur API langues (${response.status})`);
        }
        languages = await response.json();
        populateLanguageSelects();
        updateStats();
    } catch (error) {
        console.error('Erreur chargement langues:', error);
        showStatus('Erreur lors du chargement des langues', 'error');
    }
}

const languageFlags = {
    'en': '', 'fr': '', 'es': '', 'de': '', 'it': '',
    'pt': '', 'ru': '', 'ja': '', 'zh': '', 'ar': '',
    'hi': '', 'ko': '', 'nl': '', 'pl': '', 'tr': '',
    'vi': '', 'th': '', 'sv': '', 'da': '', 'no': '',
    'fi': '', 'cs': '', 'el': '', 'he': '', 'id': '',
    'af': '', 'bg': '', 'bn': '', 'ca': '', 'cy': '',
    'et': '', 'fa': '', 'gu': '', 'hu': '', 'hy': '',
    'ka': '', 'kn': '', 'lv': '', 'lt': '', 'mk': '',
    'ml': '', 'mr': '', 'ne': '', 'pa': '', 'ro': '',
    'sk': '', 'sl': '', 'so': '', 'sq': '', 'ta': '',
    'te': '', 'uk': '', 'ur': '', 'zh-Hans': '', 'zh-Hant': ''
};

function populateLanguageSelects() {
    const sourceOptions = '<option value="auto">Détection Automatique</option>' + 
        languages.map(lang => {
            const flag = languageFlags[lang.code] || '';
            return `<option value="${lang.code}">${flag} ${lang.name}</option>`;
        }).join('');
    
    sourceLangSelect.innerHTML = sourceOptions;
    
    const targetOptions = languages.map(lang => {
        const flag = languageFlags[lang.code] || '';
        const selected = lang.code === 'en' ? 'selected' : '';
        return `<option value="${lang.code}" ${selected}>${flag} ${lang.name}</option>`;
    }).join('');
    
    targetLangSelect.innerHTML = targetOptions;
}

// ===============================================
// TRANSLATION FUNCTION
// ===============================================
async function translate() {
    const text = sourceTextArea.value.trim();
    const sourceLang = sourceLangSelect.value;
    const targetLang = targetLangSelect.value;
    
    if (!text) {
        showStatus('Veuillez entrer du texte à traduire', 'error');
        return;
    }
    
    if (sourceLang === targetLang && sourceLang !== 'auto') {
        showStatus('Langues source et cible identiques', 'error');
        return;
    }
    
    translateBtn.classList.add('loading');
    targetTextArea.value = '';
    hideStatus();
    
    const startTime = Date.now();
    
    try {
        const payload = {
            q: text,
            source: sourceLang === 'auto' ? 'auto' : sourceLang,
            target: targetLang,
            format: 'text'
        };

        const response = await fetch(`${API_BASE_URL}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok && data.translatedText) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            await animateText(targetTextArea, data.translatedText);
            showStatus('Traduction réussie', 'success');
            
            // Update stats
            updateStatsAfterTranslation(text, sourceLang, targetLang);
            
            // Add to history
            addToHistory(text, data.translatedText, sourceLang, targetLang);
            
            // Show translation info
            showTranslationInfo(text.length, duration);
            
            // Detect language if auto
            if (sourceLang === 'auto') {
                const detectedLang = data.detectedLanguage?.language || data.sourceLang || targetLang;
                lastDetectedSourceLang = detectedLang;
                showDetectedLanguage(detectedLang);
            }
            
            lastTranslation = data.translatedText;
            
            setTimeout(() => hideStatus(), 3000);
        } else {
            throw new Error(data.error || data.message || 'Erreur de traduction');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showStatus('❌ ' + error.message, 'error');
    } finally {
        translateBtn.classList.remove('loading');
    }
}

// ===============================================
// AUTO-TRANSLATE FEATURE - Traduction instantanée à la saisie
// ===============================================
let autoTranslateTimeout = null;

sourceTextArea.addEventListener('input', () => {
    updateCharCount();
    
    // Traduction automatique avec délai de 800ms
    if (sourceTextArea.value.trim()) {
        clearTimeout(autoTranslateTimeout);
        autoTranslateTimeout = setTimeout(translate, 800);
    }
});

// ===============================================
// TEXT ANIMATION
// ===============================================
async function animateText(element, text) {
    return new Promise(resolve => {
        let index = 0;
        element.value = '';
        
        const interval = setInterval(() => {
            if (index < text.length) {
                element.value += text[index];
                index++;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, 8);
    });
}

// ===============================================
// SWAP LANGUAGES
// ===============================================
function swapLanguages() {
    const sourceLang = sourceLangSelect.value;
    const targetLang = targetLangSelect.value;
    const sourceText = sourceTextArea.value;
    const targetText = targetTextArea.value;

    // If source is auto, use the detected language as new target.
    if (sourceLang === 'auto') {
        if (!lastDetectedSourceLang) {
            showStatus('Faites une traduction pour detecter la langue avant inversion', 'error');
            setTimeout(hideStatus, 2000);
            return;
        }
        sourceLangSelect.value = targetLang;
        targetLangSelect.value = lastDetectedSourceLang;

        // Fallback if detected language is unavailable in target list.
        if (targetLangSelect.value !== lastDetectedSourceLang) {
            const fallbackTarget = Array.from(targetLangSelect.options)
                .find(option => option.value !== targetLang)?.value || 'en';
            targetLangSelect.value = fallbackTarget;
        }
    } else {
        sourceLangSelect.value = targetLang;
        targetLangSelect.value = sourceLang;
    }

    sourceTextArea.value = targetText;
    targetTextArea.value = sourceText;
    updateCharCount();

    // Animate swap
    swapBtn.style.transform = 'rotate(180deg) scale(1.2)';
    setTimeout(() => {
        swapBtn.style.transform = '';
    }, 400);
}

// ===============================================
// COPY TO CLIPBOARD
// ===============================================
async function copyTranslation() {
    const text = targetTextArea.value;
    
    if (!text) {
        showStatus('Aucun texte à copier', 'error');
        setTimeout(hideStatus, 2000);
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        copyBtn.style.transform = 'scale(0.9) rotate(360deg)';
        setTimeout(() => {
            copyBtn.style.transform = '';
        }, 300);
        showStatus('Texte copié', 'success');
        setTimeout(hideStatus, 2000);
    } catch (error) {
        showStatus('Erreur de copie', 'error');
    }
}

// ===============================================
// PASTE FROM CLIPBOARD
// ===============================================
async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        sourceTextArea.value = text;
        updateCharCount();
        showStatus('Texte collé', 'success');
        setTimeout(hideStatus, 2000);
    } catch (error) {
        showStatus('Erreur de collage', 'error');
    }
}

// ===============================================
// TEXT-TO-SPEECH
// ===============================================
function speakText(text, lang) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'auto' ? 'fr-FR' : lang + '-' + lang.toUpperCase();
        window.speechSynthesis.speak(utterance);
    } else {
        showStatus('Synthèse vocale non supportée', 'error');
    }
}

voiceBtn.addEventListener('click', () => {
    if (sourceTextArea.value.trim()) {
        speakText(sourceTextArea.value, sourceLangSelect.value);
    }
});

voiceTargetBtn.addEventListener('click', () => {
    if (targetTextArea.value.trim()) {
        speakText(targetTextArea.value, targetLangSelect.value);
    }
});

// ===============================================
// SHARE FUNCTIONALITY
// ===============================================
shareBtn.addEventListener('click', () => {
    if (!targetTextArea.value) {
        showStatus('Aucune traduction à partager', 'error');
        setTimeout(hideStatus, 2000);
        return;
    }
    shareModal.classList.add('show');
});

closeShareModal.addEventListener('click', () => {
    shareModal.classList.remove('show');
});

shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) {
        shareModal.classList.remove('show');
    }
});

document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.share;
        const text = `${sourceTextArea.value}\n\n→ ${targetTextArea.value}`;
        
        switch (type) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'email':
                window.location.href = `mailto:?subject=Traduction&body=${encodeURIComponent(text)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(window.location.href);
                showStatus('Lien copié', 'success');
                setTimeout(hideStatus, 2000);
                break;
        }
        shareModal.classList.remove('show');
    });
});

// ===============================================
// HISTORY MANAGEMENT
// ===============================================
function addToHistory(source, target, sourceLang, targetLang) {
    const entry = {
        id: Date.now(),
        source,
        target,
        sourceLang,
        targetLang,
        timestamp: new Date().toISOString()
    };
    
    translationHistory.unshift(entry);
    translationHistory = translationHistory.slice(0, 50); // Keep last 50
    sessionStorage.setItem(historyStorageKey, JSON.stringify(translationHistory));
    renderHistory();
}

function renderHistory() {
    if (translationHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">Aucune traduction dans l\'historique</p>';
        return;
    }
    
    historyList.innerHTML = translationHistory.map(entry => {
        const sourceFlag = languageFlags[entry.sourceLang] || '';
        const targetFlag = languageFlags[entry.targetLang] || '';
        const date = new Date(entry.timestamp).toLocaleDateString('fr-FR');
        
        return `
            <div class="history-item" data-id="${entry.id}">
                <div class="history-item-lang">${sourceFlag} ${entry.sourceLang} → ${targetFlag} ${entry.targetLang} • ${date}</div>
                <div class="history-item-text">${entry.source.substring(0, 100)}${entry.source.length > 100 ? '...' : ''}</div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            const entry = translationHistory.find(e => e.id === id);
            if (entry) {
                sourceTextArea.value = entry.source;
                targetTextArea.value = entry.target;
                sourceLangSelect.value = entry.sourceLang;
                targetLangSelect.value = entry.targetLang;
                updateCharCount();
                historyPanel.classList.remove('show');
            }
        });
    });
}

historyBtn.addEventListener('click', () => {
    historyPanel.classList.toggle('show');
    if (historyPanel.classList.contains('show')) {
        renderHistory();
    }
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Effacer tout l\'historique ?')) {
        translationHistory = [];
        sessionStorage.removeItem(historyStorageKey);
        renderHistory();
        showStatus('Historique effacé', 'success');
        setTimeout(hideStatus, 2000);
    }
});

// ===============================================
// STATS MANAGEMENT
// ===============================================
function updateStatsAfterTranslation(text, sourceLang, targetLang) {
    stats.total++;
    stats.characters += text.length;
    if (!stats.languagesSet) stats.languagesSet = new Set();
    stats.languagesSet.add(sourceLang);
    stats.languagesSet.add(targetLang);
    
    localStorage.setItem(statsStorageKey, JSON.stringify({
        total: stats.total,
        characters: stats.characters,
        languagesSet: Array.from(stats.languagesSet)
    }));
    
    updateStats();
}

function updateStats() {
    if (stats.languagesSet && stats.languagesSet.constructor === Array) {
        stats.languagesSet = new Set(stats.languagesSet);
    } else if (!stats.languagesSet) {
        stats.languagesSet = new Set();
    }
    
    animateCounter(totalTranslationsEl, stats.total);
    animateCounter(totalCharactersEl, stats.characters);
    animateCounter(languagesUsedEl, stats.languagesSet.size);
}

function animateCounter(element, target) {
    const current = parseInt(element.textContent) || 0;
    const increment = Math.ceil((target - current) / 20);
    
    if (current < target) {
        element.textContent = current + increment;
        setTimeout(() => animateCounter(element, target), 30);
    } else {
        element.textContent = target;
    }
}

// ===============================================
// UTILITY FUNCTIONS
// ===============================================
function clearText() {
    sourceTextArea.value = '';
    targetTextArea.value = '';
    updateCharCount();
    hideStatus();
    translationInfo.classList.remove('show');
}

function updateCharCount() {
    const count = sourceTextArea.value.length;
    const max = 5000;
    charCount.textContent = `${count} / ${max} caractères`;
    charCount.style.color = count > max ? 'var(--secondary)' : 'var(--text-light)';
}

function showStatus(message, type) {
    const statusText = statusMessage.querySelector('.status-text') || statusMessage;
    statusText.textContent = message;
    statusMessage.className = `status-message ${type} show`;
}

function hideStatus() {
    statusMessage.className = 'status-message';
}

function showDetectedLanguage(lang) {
    const langName = languages.find(l => l.code === lang)?.name || lang;
    langDetected.textContent = `✓ Langue détectée: ${langName}`;
    langDetected.classList.add('show');
}

function showTranslationInfo(chars, duration) {
    translationInfo.innerHTML = `
        <strong>Statistiques:</strong> 
        ${chars} caractères traduits en ${duration}ms 
        (≈${Math.round(chars / (duration / 1000))} car/sec)
    `;
    translationInfo.classList.add('show');
}

// ===============================================
// LOGO INTERACTION
// ===============================================
let logoClickCount = 0;
logoText.addEventListener('click', () => {
    logoClickCount++;
    if (logoClickCount >= 5) {
        logoText.style.background = 'linear-gradient(135deg, #f59e0b, #ec4899, #6366f1)';
        logoText.style.backgroundClip = 'text';
        logoText.style.webkitBackgroundClip = 'text';
        logoClickCount = 0;
        setTimeout(() => {
            logoText.style.background = 'linear-gradient(135deg, #fff, #f0f0f0)';
            logoText.style.backgroundClip = 'text';
            logoText.style.webkitBackgroundClip = 'text';
        }, 2000);
    }
});

// ===============================================
// KEYBOARD SHORTCUTS
// ===============================================
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'Enter') {
            e.preventDefault();
            translate();
        } else if (e.key === 'k') {
            e.preventDefault();
            clearText();
        }
    }
});

// ===============================================
// EVENT LISTENERS
// ===============================================
translateBtn.addEventListener('click', translate);
swapBtn.addEventListener('click', swapLanguages);
copyBtn.addEventListener('click', copyTranslation);
clearBtn.addEventListener('click', clearText);
pasteBtn.addEventListener('click', pasteText);

// ===============================================
// INITIALIZATION
// ===============================================
loadLanguages();
renderHistory();

console.log('Welsou Lingua - Version Interactive chargee');
console.log('Raccourcis: Ctrl+Enter (traduire), Ctrl+K (effacer)');
