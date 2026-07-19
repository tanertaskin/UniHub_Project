from fastapi import FastAPI, Depends
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os

from backend.database import SessionLocal, Deadline

app = FastAPI(title="Unihub API")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- TÜRSTEHER (PYDANTIC MODELLE) ---

# Für Daten, die REIN kommen (POST)
class DeadlineCreate(BaseModel):
    title: str
    course: str
    source: str
    due: str
    is_urgent: bool

# NEU: Für Daten, die RAUS gehen (GET)
class DeadlineResponse(BaseModel):
    id: int
    title: str
    course: str
    source: str
    due: str
    is_urgent: bool

    class Config:
        from_attributes = True  # Das ist der magische Schalter! Er übersetzt Datenbank-Objekte in JSON.


# --- ROUTEN ---

@app.get("/", response_class=HTMLResponse)
async def read_root():
    html_file = os.path.join(FRONTEND_DIR, "index.html")
    with open(html_file, "r", encoding="utf-8") as f:
        return f.read()

# NEU: Wir sagen FastAPI, dass es die DeadlineResponse-Übersetzung nutzen soll
@app.get("/api/deadlines", response_model=list[DeadlineResponse])
async def get_deadlines(db: Session = Depends(get_db)):
    deadlines = db.query(Deadline).all()
    
    if not deadlines:
        demo1 = Deadline(title="Hausarbeit Makroökonomie", course="Makroökonomie", source="Moodle", due="Morgen, 23:59", is_urgent=True)
        demo2 = Deadline(title="Ethik Essay Entwurf", course="Wirtschaftsethik", source="Moodle", due="In 5 Tagen", is_urgent=False)
        db.add(demo1)
        db.add(demo2)
        db.commit()
        deadlines = db.query(Deadline).all()
        
    return deadlines

@app.post("/api/deadlines", response_model=DeadlineResponse)
async def create_deadline(deadline: DeadlineCreate, db: Session = Depends(get_db)):
    new_db_deadline = Deadline(
        title=deadline.title,
        course=deadline.course,
        source=deadline.source,
        due=deadline.due,
        is_urgent=deadline.is_urgent
    )
    db.add(new_db_deadline)
    db.commit()
    db.refresh(new_db_deadline)
    return new_db_deadline

@app.get("/api/schedule")
async def get_schedule():
    return [
        {"id": 1, "time": "10:00", "type": "lecture", "title": "Makroökonomie", "subtitle": "Raum B.412 • Prof. Schmidt"},
        {"id": 2, "time": "12:15", "type": "study", "title": "Lerngruppe", "subtitle": "Bibliothek • 3. Stock"},
        {"id": 3, "time": "14:00", "type": "work", "title": "Arbeitsschicht", "subtitle": "Café Neró"}
    ]


# NEU: Ein DELETE-Endpunkt, um Deadlines zu löschen
@app.delete("/api/deadlines/{deadline_id}")
async def delete_deadline(deadline_id: int, db: Session = Depends(get_db)):
    """
    Sucht die Deadline anhand ihrer ID und löscht sie aus der Datenbank.
    """
    # 1. Suche die Deadline in der Datenbank
    db_deadline = db.query(Deadline).filter(Deadline.id == deadline_id).first()
    
    # 2. Wenn sie existiert, lösche sie und speichere die Änderung
    if db_deadline:
        db.delete(db_deadline)
        db.commit()
        return {"message": "Deadline erfolgreich gelöscht"}
        
    return {"error": "Deadline nicht gefunden"}