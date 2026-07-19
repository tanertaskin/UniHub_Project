// Diese Funktion wird ausgeführt, sobald die Seite geladen ist
document.addEventListener('DOMContentLoaded', () => {
    fetchDeadlines();
    fetchSchedule(); // NEU: Wir rufen jetzt auch den Tagesplan ab!
});

// --- API AUFRUFE ---

async function fetchDeadlines() {
    try {
        const response = await fetch('/api/deadlines');
        const deadlines = await response.json();
        renderDeadlines(deadlines);
    } catch (error) {
        console.error("Fehler beim Abrufen der Deadlines:", error);
    }
}

async function fetchSchedule() {
    try {
        const response = await fetch('/api/schedule');
        const schedule = await response.json();
        renderSchedule(schedule);
    } catch (error) {
        console.error("Fehler beim Abrufen des Tagesplans:", error);
    }
}

function renderDeadlines(deadlines) {
    const container = document.getElementById('deadline-container');
    container.innerHTML = ''; 

    deadlines.forEach(deadline => {
        const isUrgent = deadline.is_urgent;
        const cardClass = isUrgent ? "border-orange-200 bg-orange-50/50 hover:bg-orange-50" : "border-gray-100 hover:bg-gray-50";
        const timeColor = isUrgent ? "text-orange-700" : "text-gray-600";
        const badgeClass = isUrgent ? "bg-orange-200 text-orange-800" : "bg-gray-200 text-gray-600";

        // NEU: Wir haben die Klasse "group" hinzugefügt und rechts den Button eingebaut
        const html = `
            <div class="border ${cardClass} rounded-xl p-4 flex justify-between items-center transition-colors group">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-medium text-gray-900 text-sm">${deadline.title}</h4>
                        <span class="${badgeClass} text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">${deadline.source}</span>
                    </div>
                    <p class="text-xs text-gray-500">${deadline.course}</p>
                </div>
                <div class="text-right flex items-center gap-3">
                    <p class="text-sm font-semibold ${timeColor}">${deadline.due}</p>
                    
                    <!-- Der Mülleimer-Button: Standardmäßig unsichtbar, wird beim Drüberfahren sichtbar -->
                    <button onclick="deleteDeadline(${deadline.id})" class="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });

    // Wichtig: Neue Icons zeichnen lassen!
    lucide.createIcons();
}

function renderSchedule(scheduleItems) {
    const container = document.getElementById('schedule-container');
    container.innerHTML = ''; 

    scheduleItems.forEach(item => {
        // Wir bestimmen Icon und Farbe basierend auf dem Termin-Typ
        let iconName = 'calendar';
        let colorClass = 'bg-gray-50 text-gray-600';
        
        if (item.type === 'lecture') {
            iconName = 'book-open';
            colorClass = 'bg-blue-50 text-blue-600';
        } else if (item.type === 'study') {
            iconName = 'users';
            colorClass = 'bg-purple-50 text-purple-600';
        } else if (item.type === 'work') {
            iconName = 'coffee';
            colorClass = 'bg-amber-50 text-amber-600';
        }

        const html = `
            <div class="flex items-start gap-4">
                <div class="text-sm text-gray-500 w-12 pt-1 font-medium">${item.time}</div>
                <div class="w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0">
                    <i data-lucide="${iconName}" class="w-5 h-5"></i>
                </div>
                <div>
                    <h4 class="font-medium text-gray-900">${item.title}</h4>
                    <p class="text-sm text-gray-500">${item.subtitle}</p>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });

    // GANZ WICHTIG: Da wir gerade neue HTML-Elemente mit Icons generiert haben,
    // müssen wir das Icon-Skript bitten, diese neuen Icons auch zu zeichnen!
    lucide.createIcons();
}

// --- MODAL & FORMULAR LOGIK ---

const newBtn = document.getElementById('new-btn');
const modal = document.getElementById('deadline-modal');
const closeBtn = document.getElementById('close-modal-btn');
const form = document.getElementById('new-deadline-form');

// Fenster öffnen
newBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    lucide.createIcons(); // Icons im Modal neu laden
});

// Fenster schließen
closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Formular abschicken (Die Fernbedienung drückt den Knopf)
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Verhindert, dass die Seite neu lädt

    // 1. Daten aus den Eingabefeldern sammeln
    const newDeadline = {
        title: document.getElementById('input-title').value,
        course: document.getElementById('input-course').value,
        source: document.getElementById('input-source').value,
        due: document.getElementById('input-due').value,
        is_urgent: document.getElementById('input-urgent').checked
    };

    try {
        // 2. Das Paket an unseren Python-Empfänger (API) schicken
        const response = await fetch('/api/deadlines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newDeadline)
        });

        if (response.ok) {
            // 3. Wenn es geklappt hat: Fenster zu, Formular leeren, Deadlines neu laden!
            modal.classList.add('hidden');
            form.reset();
            fetchDeadlines(); // Holt die frische Liste aus der Datenbank
        } else {
            console.error("Fehler vom Server");
        }
    } catch (error) {
        console.error("Fehler beim Senden:", error);
    }
});


// --- LÖSCHEN LOGIK ---

async function deleteDeadline(id) {
    // 1. Kleine Sicherheitsabfrage, damit man nicht aus Versehen löscht
    if (!confirm("Möchtest du diese Deadline wirklich löschen?")) {
        return; 
    }

    try {
        // 2. Den DELETE-Befehl an unser Python-Backend schicken
        const response = await fetch(`/api/deadlines/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // 3. Wenn es geklappt hat, laden wir die Liste einfach neu!
            console.log("Deadline gelöscht!");
            fetchDeadlines(); 
        } else {
            console.error("Fehler beim Löschen auf dem Server.");
        }
    } catch (error) {
        console.error("Netzwerkfehler:", error);
    }
}