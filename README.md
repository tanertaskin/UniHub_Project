# 🎓 Unihub - Student OS

Ein leichtgewichtiges, modernes Full-Stack-Dashboard für Studierende zur Organisation von Deadlines, Vorlesungen und Notizen. 

## 🚀 Features

* **Personalisiertes Dashboard:** Eine saubere, zentrierte Übersicht für den Uni-Alltag.
* **Deadline Radar (CRUD):** 
  * Deadlines werden dynamisch aus einer Datenbank geladen.
  * Neue Deadlines können über ein Pop-up-Modal direkt im Frontend angelegt werden.
  * Erledigte Deadlines lassen sich über einen Button unwiderruflich löschen.
* **Dynamischer Tagesplan:** Visuelle Unterscheidung zwischen Vorlesungen, Lernzeiten und Arbeitsschichten.
* **Responsive Design:** Optimiert für breite Monitore durch eine zentrierte Max-Width-Architektur.

## 🛠️ Tech Stack

**Backend (Der Motor)**
* [Python 3](https://www.python.org/)
* [FastAPI](https://fastapi.tiangolo.com/) - Für die API-Routen und Server-Logik
* [SQLAlchemy](https://www.sqlalchemy.org/) & SQLite - Als leichtgewichtige, dateibasierte Datenbank
* [Pydantic](https://docs.pydantic.dev/) - Für die Datenvalidierung (Ein- und Ausgang)

**Frontend (Die Benutzeroberfläche)**
* HTML5 & Vanilla JavaScript
* [Tailwind CSS](https://tailwindcss.com/) (via CDN) - Für das moderne Styling
* [Lucide Icons](https://lucide.dev/) - Für die Icon-Bibliothek

## 📂 Projektstruktur

```text
unihub/
├── backend/
│   ├── main.py         # Die Haupt-API und Server-Logik
│   └── database.py     # SQLite-Konfiguration und Tabellen-Baupläne
├── frontend/
│   ├── index.html      # Das Haupt-Dashboard
│   └── js/
│       └── app.js      # Die Frontend-Logik (API-Aufrufe, DOM-Manipulation)
├── unihub.db           # Die generierte SQLite-Datenbank
└── README.md           # Diese Datei