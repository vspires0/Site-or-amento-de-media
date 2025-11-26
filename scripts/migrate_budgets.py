import asyncio
import sys
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment
ROOT_DIR = Path('/app/backend')
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def migrate_budgets():
    print("Migrando orçamentos antigos...")
    
    # Find all budgets without bdi_percentage
    budgets = await db.budgets.find({"bdi_percentage": {"$exists": False}}).to_list(1000)
    
    print(f"Encontrados {len(budgets)} orçamentos para migrar")
    
    for budget in budgets:
        # Add missing fields
        budget['bdi_percentage'] = 0.0
        budget['bdi_value'] = 0.0
        
        # Update the budget
        await db.budgets.replace_one({"id": budget['id']}, budget)
        print(f"  ✓ Migrado orçamento {budget['id']}")
    
    print("\n✅ Migração concluída!")
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_budgets())
