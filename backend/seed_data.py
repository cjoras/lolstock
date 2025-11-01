from sqlalchemy.orm import Session
from database import engine
from models import User, Player

print("🌱 Seeder testdata...")

with Session(engine) as session:
    # Legg inn testbruker
    user = User(name="Testbruker")
    player = Player(summoner_name="Faker", current_rank="Challenger", stock_price=500.0)

    session.add_all([user, player])
    session.commit()

print("✅ Testdata lagt inn.")