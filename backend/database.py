from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Wo die Datenbank liegt (wird automatisch als Datei erstellt)
SQLALCHEMY_DATABASE_URL = "sqlite:///./unihub.db"

# 2. Der Motor, der die Verbindung herstellt
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False} # Wichtig für SQLite in FastAPI
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 3. Unser Bauplan (Tabelle) für eine Deadline
class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    course = Column(String)
    source = Column(String)
    due = Column(String)
    is_urgent = Column(Boolean, default=False)

# 4. Erstellt die Tabellen in der Datenbank-Datei
Base.metadata.create_all(bind=engine)