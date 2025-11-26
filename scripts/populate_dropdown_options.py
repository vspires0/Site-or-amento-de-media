import asyncio
import sys
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone
import uuid

# Load environment
ROOT_DIR = Path('/app/backend')
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Opções padrão para os dropdowns
dropdown_options = [
    # Tipos de Postes
    {"category": "pole_types", "value": "Concreto", "label": "Concreto"},
    {"category": "pole_types", "value": "Fibra", "label": "Fibra"},
    {"category": "pole_types", "value": "Duplo T", "label": "Duplo T"},
    {"category": "pole_types", "value": "Especial", "label": "Especial"},
    
    # Tipos de Condutores
    {"category": "conductor_types", "value": "Cobre", "label": "Cobre (Cu)"},
    {"category": "conductor_types", "value": "Alumínio", "label": "Alumínio (Al)"},
    {"category": "conductor_types", "value": "AAAC", "label": "AAAC"},
    
    # Isolamento de Condutores
    {"category": "conductor_insulation", "value": "XLPE", "label": "XLPE"},
    {"category": "conductor_insulation", "value": "PVC", "label": "PVC"},
    
    # Configuração de Condutores
    {"category": "conductor_configuration", "value": "Simples", "label": "Simples"},
    {"category": "conductor_configuration", "value": "Multiplexado", "label": "Multiplexado"},
    {"category": "conductor_configuration", "value": "Duplexado", "label": "Duplexado"},
    
    # Categorias de Equipamentos
    {"category": "equipment_categories", "value": "Chave", "label": "Chave"},
    {"category": "equipment_categories", "value": "Transformador", "label": "Transformador"},
    {"category": "equipment_categories", "value": "Capacitor", "label": "Capacitor"},
    {"category": "equipment_categories", "value": "Religador", "label": "Religador"},
    {"category": "equipment_categories", "value": "Regulador", "label": "Regulador de Tensão"},
]

async def populate_dropdown_options():
    print("Iniciando população de opções dos dropdowns...")
    
    # Clear existing data
    print("Limpando dados existentes...")
    await db.dropdown_options.delete_many({})
    
    # Insert dropdown options
    print(f"\nInserindo {len(dropdown_options)} opções...")
    for option in dropdown_options:
        option_doc = {
            **option,
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.dropdown_options.insert_one(option_doc)
        print(f"  ✓ {option['category']}: {option['label']}")
    
    print("\n" + "="*60)
    print("✅ Opções dos dropdowns populadas com sucesso!")
    print("="*60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(populate_dropdown_options())
