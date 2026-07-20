// --- KONSTANTEN & SETUP ---
const BASE_API_URL = '/api'; // Da Frontend und Backend auf dem gleichen Server laufen

// WICHTIG FÜR DARK MODE: Wir prüfen direkt beim Laden, ob Dark Mode aktiv sein soll
// Bevor wir irgendwas zeichnen!
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// --- INITIALISIERUNG BEIM LADEN DER SEITE ---
document.addEventListener('DOMContentLoaded', () => {
    fetchDeadlines();
    fetchSchedule();
    setupModals();
    setupDarkModeToggle(); // NEU: Den Dark Mode Schalter initialisieren
    
    // Lucide Icons initialisieren
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});


// --- DATEN-FUNKTIONEN (FETCHING) ---

async function fetchDeadlines() {
    // ... (Diese Funktion bleibt unverändert, sie funktioniert ja super!) ...
    const container = document.getElementById('deadline-container');
    container.innerHTML = '<p class="text-sm text-gray-500">Lade Deadlines...</p>';

    try {
        const response = await fetch(`${BASE_API_URL}/deadlines`);
        const deadlines = await response.json();
        renderDeadlines(deadlines);
    } catch (error) {
        console.error('Fehler beim Laden der Deadlines:', error);
        container.innerHTML = '<p class="text-sm text-red-500 p-4 border border-red-100 rounded-lg bg-red-50">Fehler beim Laden der Deadlines. Ist das Backend aktiv?</p>';
    }
}

async function fetchSchedule() {
    // ... (Auch diese Funktion bleibt unverändert) ...
    try {
        const response = await fetch(`${BASE_API_URL}/schedule`);
        const schedule = await response.json();
        //renderSchedule(schedule); // Wir haben noch keinen Schedule Renderer, ist aber OK
    } catch (error) {
        console.error('Fehler beim Laden des Stundenplans:', error);
    }
}


// --- DOM MANIPULATION (RENDERING) ---

function renderDeadlines(deadlines) {
    const container = document.getElementById('deadline-container');
    container.innerHTML = ''; 

    // Wenn keine Deadlines da sind
    if (!deadlines || deadlines.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 px-4 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <i data-lucide="sparkles" class="w-8 h-8 text-blue-400 mx-auto mb-3"></i>
                <p class="text-sm font-medium text-gray-700 dark:text-white">Alles erledigt!</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Keine anstehenden Deadlines auf dem Radar.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    deadlines.forEach(deadline => {
        // ... (WICHTIG: Die renderDeadlines Funktion muss auch dark: Klassen kennen!) ...
        const isUrgent = deadline.is_urgent;
        
        // Farben für Hell und Dunkel anpassen
        const cardClass = isUrgent ? "border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20" : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900";
        const titleColor = "text-gray-900 dark:text-white";
        const courseColor = "text-gray-500 dark:text-gray-400";
        const timeColor = isUrgent ? "text-orange-700 dark:text-orange-400" : "text-gray-600 dark:text-gray-300";
        const badgeClass = isUrgent ? "bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-300" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400";

        const html = `
            <div class="border ${cardClass} rounded-xl p-4 flex justify-between items-center transition-colors group">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-medium ${titleColor} text-sm">${deadline.title}</h4>
                        <span class="${badgeClass} text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">${deadline.source}</span>
                    </div>
                    <p class="text-xs ${courseColor}">${deadline.course}</p>
                </div>
                <div class="text-right flex items-center gap-3">
                    <p class="text-sm font-semibold ${timeColor}">${deadline.due}</p>
                    
                    <button onclick="deleteDeadline(${deadline.id})" class="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}


// --- MODAL LOGIK SETUP (EINSTELLUNGEN & NEUE DEADLINE) ---

function setupModals() {
    // Diese Funktion fasst die Logik für alle Pop-ups zusammen

    // 1. Neue Deadline Modal
    const newBtn = document.getElementById('new-btn');
    const deadlineModal = document.getElementById('deadline-modal');
    const closeDeadlineBtn = document.getElementById('close-modal-btn');
    const deadlineForm = document.getElementById('new-deadline-form');

    if (newBtn && deadlineModal && closeDeadlineBtn && deadlineForm) {
        newBtn.addEventListener('click', () => {
            deadlineModal.classList.remove('hidden');
            lucide.createIcons(); 
        });

        const closeDeadlineModal = () => {
            deadlineModal.classList.add('hidden');
            deadlineForm.reset();
        };

        closeDeadlineBtn.addEventListener('click', closeDeadlineModal);
        
        // Klick außerhalb schließt das Modal
        deadlineModal.addEventListener('click', (e) => {
            if (e.target === deadlineModal) closeDeadlineModal();
        });

        // Deadline speichern (POST)
        deadlineForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newDeadline = {
                title: document.getElementById('input-title').value,
                course: document.getElementById('input-course').value,
                source: document.getElementById('input-source').value,
                due: document.getElementById('input-due').value,
                is_urgent: document.getElementById('input-urgent').checked
            };

            try {
                const response = await fetch(`${BASE_API_URL}/deadlines`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newDeadline)
                });
                if (response.ok) {
                    closeDeadlineModal();
                    fetchDeadlines(); 
                }
            } catch (error) {
                console.error("Fehler beim Senden:", error);
            }
        });
    }

    // 2. Einstellungen Modal
    const profileBtn = document.getElementById('profile-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // WICHTIG: Die IDs müssen jetzt perfekt stimmen!
    if (profileBtn && settingsModal && closeSettingsBtn && saveSettingsBtn) {
        
        const openSettings = () => {
            settingsModal.classList.remove('hidden');
            lucide.createIcons(); 
        };

        const closeSettings = () => {
            settingsModal.classList.add('hidden');
        };

        profileBtn.addEventListener('click', openSettings);
        closeSettingsBtn.addEventListener('click', closeSettings);
        saveSettingsBtn.addEventListener('click', closeSettings);
        
        // Klick außerhalb schließt das Modal
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) closeSettings();
        });
    }
}


// --- CRUD FUNKTIONEN (DELETE) ---

async function deleteDeadline(id) {
    if (!confirm("Möchtest du diese Deadline wirklich löschen?")) return; 

    try {
        const response = await fetch(`${BASE_API_URL}/deadlines/${id}`, { method: 'DELETE' });
        if (response.ok) fetchDeadlines(); 
    } catch (error) {
        console.error("Netzwerkfehler:", error);
    }
}


// --- NEU: SETUP DARK MODE TOGGLE (EINSTELLUNGEN) ---

function setupDarkModeToggle() {
    const toggleContainer = document.getElementById('dark-mode-toggle-container');
    const toggleSwitch = document.getElementById('dark-mode-switch');
    
    // Prüfen, ob die Elemente im HTML existieren
    if (!toggleContainer || !toggleSwitch) return;

    // 1. Visuellen Zustand des Schalters setzen
    const isDarkMode = document.documentElement.classList.contains('dark');
    updateDarkModeToggleUI(isDarkMode);

    // 2. Klick-Event Handler
    toggleContainer.addEventListener('click', () => {
        // Aktuellen Zustand umkehren
        const goingDark = !document.documentElement.classList.contains('dark');
        
        if (goingDark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark'; // Einstellung speichern
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light'; // Einstellung speichern
        }
        
        // Visuellen Zustand des Schalters aktualisieren
        updateDarkModeToggleUI(goingDark);
    });
}

// Hilfsfunktion zum visuellen Bewegen des Schalters
function updateDarkModeToggleUI(isDark) {
    const toggleContainer = document.getElementById('dark-mode-toggle-container');
    const toggleSwitch = document.getElementById('dark-mode-switch');
    
    if (isDark) {
        // Schalter nach rechts bewegen (an)
        toggleContainer.classList.remove('bg-gray-200', 'dark:bg-gray-700');
        toggleContainer.classList.add('bg-blue-600');
        toggleSwitch.classList.remove('left-1');
        toggleSwitch.classList.add('right-1');
    } else {
        // Schalter nach links bewegen (aus)
        toggleContainer.classList.remove('bg-blue-600');
        toggleContainer.classList.add('bg-gray-200', 'dark:bg-gray-700');
        toggleSwitch.classList.remove('right-1');
        toggleSwitch.classList.add('left-1');
    }
}