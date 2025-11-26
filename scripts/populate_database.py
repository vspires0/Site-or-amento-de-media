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

# Dados dos Postes
postes_data = [
    {"type": "Duplo T", "height": 11, "capacity": 1000, "code": "DT-11-1000", "unit_price": 3200.00},
    {"type": "Duplo T", "height": 11, "capacity": 300, "code": "DT-11-300", "unit_price": 1700.00},
    {"type": "Duplo T", "height": 12, "capacity": 1000, "code": "DT-12-1000", "unit_price": 3800.00},
    {"type": "Duplo T", "height": 12, "capacity": 600, "code": "DT-12-600", "unit_price": 2700.00},
    {"type": "Duplo T", "height": 9, "capacity": 600, "code": "DT-09-600", "unit_price": 1800.00},
    {"type": "Duplo T", "height": 9, "capacity": 300, "code": "DT-09-300", "unit_price": 1300.00},
    {"type": "Concreto", "height": 11, "capacity": 600, "code": "CIRC-11-600", "unit_price": 3100.00},
    {"type": "Concreto", "height": 11, "capacity": 1000, "code": "CIRC-11-1000", "unit_price": 3200.00},
    {"type": "Concreto", "height": 11, "capacity": 300, "code": "CIRC-11-300", "unit_price": 1700.00},
    {"type": "Concreto", "height": 12, "capacity": 1000, "code": "CIRC-12-1000", "unit_price": 3800.00},
    {"type": "Concreto", "height": 12, "capacity": 600, "code": "CIRC-12-600", "unit_price": 2700.00},
    {"type": "Concreto", "height": 9, "capacity": 600, "code": "CIRC-09-600", "unit_price": 1800.00},
    {"type": "Concreto", "height": 9, "capacity": 300, "code": "CIRC-09-300", "unit_price": 1300.00},
]

# Estruturas Primárias
primary_structures_data = [
    {"code": "CE1", "description": "Estrutura Primária Compacta 1 Fase 15kV", "phases": 1, "voltage_class": "15kV", "network_type": "Compacta", "unit_price": 850.00},
    {"code": "CE2", "description": "Estrutura Primária Compacta 3 Fases 15kV", "phases": 3, "voltage_class": "15kV", "network_type": "Compacta", "unit_price": 1450.00},
    {"code": "CE3", "description": "Estrutura Primária Compacta com Neutro 15kV", "phases": 3, "voltage_class": "15kV", "network_type": "Compacta", "unit_price": 1650.00},
    {"code": "CRUZ-FIBRA-2.4M", "description": "Cruzeta Fibra Reta 90x90 2,4m Reforçada", "phases": 3, "voltage_class": "15kV", "network_type": "Convencional", "unit_price": 150.00},
]

# Estruturas Secundárias
secondary_structures_data = [
    {"code": "M1", "description": "Estrutura Secundária 2 Condutores", "conductor_count": 2, "network_type": "Convencional", "unit_price": 350.00},
    {"code": "M2", "description": "Estrutura Secundária 3 Condutores", "conductor_count": 3, "network_type": "Convencional", "unit_price": 420.00},
    {"code": "M3", "description": "Estrutura Secundária 4 Condutores Multiplexado", "conductor_count": 4, "network_type": "Multiplexado", "unit_price": 580.00},
]

# Condutores
conductors_data = [
    {"type": "Alumínio", "insulation": "XLPE", "section": "CAA 2 AWG", "code": "CAA-2AWG-XLPE", "configuration": "Simples", "unit_price": 8.50},
    {"type": "Alumínio", "insulation": "XLPE", "section": "CAA 1/0 AWG", "code": "CAA-1/0AWG-XLPE", "configuration": "Simples", "unit_price": 12.30},
    {"type": "Alumínio", "insulation": "XLPE", "section": "CAA 4/0 AWG", "code": "CAA-4/0AWG-XLPE", "configuration": "Simples", "unit_price": 18.90},
    {"type": "Cobre", "insulation": "XLPE", "section": "16 mm²", "code": "CU-16MM2-XLPE", "configuration": "Simples", "unit_price": 15.40},
    {"type": "Alumínio", "insulation": "XLPE", "section": "25 mm²", "code": "AL-25MM2-XLPE", "configuration": "Multiplexado", "unit_price": 10.80},
    {"type": "AAAC", "insulation": "PVC", "section": "35 mm²", "code": "AAAC-35MM2-PVC", "configuration": "Simples", "unit_price": 13.20},
]

# Equipamentos
equipment_data = [
    {"category": "Chave", "type": "Fusível Polimérica", "code": "CH-FUS-15KV-100A", "description": "Chave Fusível Polimérica 15kV 100A 7,1kA", "unit_price": 297.01},
    {"category": "Chave", "type": "Faca", "code": "CH-FACA-15KV", "description": "Chave Faca 15kV", "unit_price": 800.00},
    {"category": "Religador", "type": "Automático Tipo 2", "code": "REL-AUTO-13.8KV", "description": "Religador Automático Tipo 2 - 13,8 kV", "unit_price": 86599.00},
    {"category": "Transformador", "type": "ET1A", "code": "TRANSF-3F-15KVA", "description": "Transformador Trifásico 15 kVA", "unit_price": 3500.00},
    {"category": "Transformador", "type": "ET2A", "code": "TRANSF-3F-30KVA", "description": "Transformador Trifásico 30 kVA", "unit_price": 4800.00},
    {"category": "Transformador", "type": "ET2A", "code": "TRANSF-3F-45KVA", "description": "Transformador Trifásico 45 kVA", "unit_price": 6200.00},
    {"category": "Transformador", "type": "ET3A", "code": "TRANSF-3F-75KVA", "description": "Transformador Trifásico 75 kVA", "unit_price": 8500.00},
    {"category": "Transformador", "type": "ET3A", "code": "TRANSF-3F-112.5KVA", "description": "Transformador Trifásico 112,5 kVA", "unit_price": 11800.00},
    {"category": "Transformador", "type": "ET4A", "code": "TRANSF-3F-150KVA", "description": "Transformador Trifásico 150 kVA", "unit_price": 14500.00},
    {"category": "Transformador", "type": "ET4A", "code": "TRANSF-3F-225KVA", "description": "Transformador Trifásico 225 kVA", "unit_price": 19800.00},
    {"category": "Transformador", "type": "ET4A", "code": "TRANSF-3F-300KVA", "description": "Transformador Trifásico 300 kVA", "unit_price": 24500.00},
    {"category": "Chave", "type": "Relé Fotoelétrico", "code": "RELE-FOTO", "description": "Relé Fotoelétrico", "unit_price": 18.42},
]

# Ferragens e Acessórios
hardware_data = [
    {"category": "Parafuso", "description": "Parafuso Quadrada M-16 200mm", "code": "PAR-QUAD-M16-200", "unit_price": 16.11},
    {"category": "Braçadeira", "description": "Braço Rede Prot Antibal 205mm", "code": "BRACO-ANTIBAL-205", "unit_price": 25.78},
    {"category": "Braçadeira", "description": "Braço Rede Prot Tipo L 354mm", "code": "BRACO-L-354", "unit_price": 62.12},
    {"category": "Parafuso", "description": "Parafuso Abau Aço Carb M16x45mm", "code": "PAR-ABAU-M16-45", "unit_price": 2.29},
    {"category": "Acessório", "description": "Estribo Bralco L", "code": "ESTRIBO-BRALCO-L", "unit_price": 11.14},
    {"category": "Acessório", "description": "Espaçador Losangular RD Prot 15kV", "code": "ESPAC-LOSANG-15KV", "unit_price": 27.95},
    {"category": "Acessório", "description": "Alça Pré-Formada Estai", "code": "ALCA-PREFORM-ESTAI", "unit_price": 27.95},
    {"category": "Acessório", "description": "Anel de Amarração Elastomérico para Isolador", "code": "ANEL-AMAR-ELAST", "unit_price": 15.41},
    {"category": "Acessório", "description": "Olhal p/Parafuso 500daN", "code": "OLHAL-500DAN", "unit_price": 9.65},
    {"category": "Isolador", "description": "Isolador Susp Polimérico 50kN 15kV", "code": "ISOL-SUSP-50KN-15KV", "unit_price": 32.30},
    {"category": "Isolador", "description": "Pino Isol Aço 16,0mm 154x38x192mm", "code": "PINO-ISOL-16MM", "unit_price": 38.55},
    {"category": "Acessório", "description": "Sapatilha Cabo 9,5mm", "code": "SAPAT-CABO-9.5MM", "unit_price": 1.49},
    {"category": "Para-raios", "description": "Para-Raio RD - 13,8kV", "code": "PARA-RAIO-13.8KV", "unit_price": 7.74},
    {"category": "Acessório", "description": "Mão Francesa 700mm", "code": "MAO-FRANCESA-700", "unit_price": 174.51},
    {"category": "Acessório", "description": "Suporte Auxiliar para Braço C 65x65x900mm", "code": "SUP-AUX-BRACO-900", "unit_price": 30.26},
    {"category": "Acessório", "description": "Gancho Olhal Galvanizado 5.000 daN", "code": "GANCHO-OLHAL-5000", "unit_price": 19.50},
    {"category": "Acessório", "description": "Grampo de Ancoragem Cunha 15kV", "code": "GRAM-ANCOR-15KV", "unit_price": 19.90},
    {"category": "Acessório", "description": "Manilha Sapatilha Aço 5.000 daN", "code": "MANIL-SAPAT-5000", "unit_price": 5.72},
    {"category": "Acessório", "description": "Armação Secundária", "code": "ARM-SECUND", "unit_price": 15.41},
    {"category": "Isolador", "description": "Isolador Roldana Porcelana 750V", "code": "ISOL-ROLD-750V", "unit_price": 12.83},
    {"category": "Braçadeira", "description": "Braço C 580x440x365x76mm", "code": "BRACO-C-580", "unit_price": 38.90},
    {"category": "Braçadeira", "description": "Braço C", "code": "BRACO-C", "unit_price": 158.72},
    {"category": "Acessório", "description": "Conector Tipo Perfurante", "code": "CONECT-PERFUR", "unit_price": 1.14},
    {"category": "Acessório", "description": "Suporte Instalação Trafo Tipo Cantoneira 255mm", "code": "SUP-TRAFO-255", "unit_price": 39.38},
    {"category": "Isolador", "description": "Isolador de Ancoragem Tipo Bastão Polimérico 15kV", "code": "ISOL-ANCOR-BAST-15KV", "unit_price": 39.38},
    {"category": "Para-raios", "description": "Haste Terra Cobre 16x2.400mm", "code": "HASTE-TERRA-CU-16", "unit_price": 89.19},
    {"category": "Acessório", "description": "Conector Cunha Ater CB Haste Cu 6 a 16mm²", "code": "CONECT-CUNHA-HASTE", "unit_price": 28.40},
    {"category": "Acessório", "description": "Parafuso Cab. Quadrada M-16 250mm", "code": "PAR-CAB-M16-250", "unit_price": 20.16},
    {"category": "Parafuso", "description": "Parafuso Olhal Galv. M-16 200mm", "code": "PAR-OLHAL-M16-200", "unit_price": 16.90},
    {"category": "Parafuso", "description": "Parafuso Gab. Quadrada M-16 300mm", "code": "PAR-GAB-M16-300", "unit_price": 25.66},
    {"category": "Isolador", "description": "Pino Gabonizado 294 x M 25mm Isolador", "code": "PINO-GABON-294", "unit_price": 30.54},
    {"category": "Braçadeira", "description": "Cinta Circular 220mm", "code": "CINTA-CIRC-220", "unit_price": 8.50},
    {"category": "Braçadeira", "description": "Cinta Circular 200mm", "code": "CINTA-CIRC-200", "unit_price": 7.80},
    {"category": "Braçadeira", "description": "Cinta Circular 190mm", "code": "CINTA-CIRC-190", "unit_price": 7.50},
    {"category": "Braçadeira", "description": "Cinta Circular 240mm", "code": "CINTA-CIRC-240", "unit_price": 9.20},
    {"category": "Acessório", "description": "Sela Cruzeta 110x116mm", "code": "SELA-CRUZ-110", "unit_price": 12.40},
    {"category": "Acessório", "description": "Mão-Francesa Plana Aço Carbono 726mm", "code": "MAO-FRANC-PLANA-726", "unit_price": 85.30},
    {"category": "Parafuso", "description": "Parafuso Quad Aço Carb M16x150mm", "code": "PAR-QUAD-M16-150", "unit_price": 14.80},
    {"category": "Acessório", "description": "Laço Preformado Roldana 25mm²", "code": "LACO-PREFORM-25", "unit_price": 18.50},
    {"category": "Parafuso", "description": "Parafuso Francês 70mm M16", "code": "PAR-FRANC-70-M16", "unit_price": 11.90},
]

async def populate_database():
    print("Iniciando população do banco de dados...")
    
    # Clear existing data
    print("Limpando dados existentes...")
    await db.poles.delete_many({})
    await db.primary_structures.delete_many({})
    await db.secondary_structures.delete_many({})
    await db.conductors.delete_many({})
    await db.equipment.delete_many({})
    await db.hardware.delete_many({})
    
    # Insert Postes
    print(f"Inserindo {len(postes_data)} postes...")
    for pole in postes_data:
        pole_doc = {
            **pole,
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.poles.insert_one(pole_doc)
    
    # Insert Primary Structures
    print(f"Inserindo {len(primary_structures_data)} estruturas primárias...")
    for structure in primary_structures_data:
        structure_doc = {
            **structure,
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.primary_structures.insert_one(structure_doc)
    
    # Insert Secondary Structures
    print(f"Inserindo {len(secondary_structures_data)} estruturas secundárias...")
    for structure in secondary_structures_data:
        structure_doc = {
            **structure,
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.secondary_structures.insert_one(structure_doc)
    
    # Insert Conductors
    print(f"Inserindo {len(conductors_data)} condutores...")
    for conductor in conductors_data:
        conductor_doc = {
            **conductor,
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.conductors.insert_one(conductor_doc)
    
    # Insert Equipment
    print(f"Inserindo {len(equipment_data)} equipamentos...")
    for equipment in equipment_data:
        equipment_doc = {
            **equipment,
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.equipment.insert_one(equipment_doc)
    
    # Insert Hardware
    print(f"Inserindo {len(hardware_data)} ferragens...")
    for hardware in hardware_data:
        hardware_doc = {
            **hardware,
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.hardware.insert_one(hardware_doc)
    
    print("\n✅ Banco de dados populado com sucesso!")
    print(f"Total de itens inseridos:")
    print(f"  - Postes: {len(postes_data)}")
    print(f"  - Estruturas Primárias: {len(primary_structures_data)}")
    print(f"  - Estruturas Secundárias: {len(secondary_structures_data)}")
    print(f"  - Condutores: {len(conductors_data)}")
    print(f"  - Equipamentos: {len(equipment_data)}")
    print(f"  - Ferragens: {len(hardware_data)}")
    print(f"\nTOTAL: {len(postes_data) + len(primary_structures_data) + len(secondary_structures_data) + len(conductors_data) + len(equipment_data) + len(hardware_data)} itens")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(populate_database())
