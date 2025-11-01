from database import Base, engine
from models import *

print("🛠️ Starter database-initiering...")

try:
    Base.metadata.create_all(bind=engine)
    print("✅ Ferdig! Tabeller opprettet.")
except Exception as e:
    print("❌ Feil under oppretting:", e)
