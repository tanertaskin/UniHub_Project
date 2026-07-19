import subprocess
import sys

def install_packages():
    print("⏳ Starte die Installation aller Pakete aus der requirements.txt...")
    try:
        # Führt den pip-Befehl direkt aus dem Skript heraus aus
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Alle Pakete erfolgreich installiert!")
    except subprocess.CalledProcessError:
        print("❌ Fehler bei der Installation. Ist deine virtuelle Umgebung aktiv?")

if __name__ == "__main__":
    install_packages()