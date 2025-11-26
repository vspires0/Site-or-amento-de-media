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

# Estruturas de Média Tensão (começam com C)
medium_voltage_structures = [
    {
        "code": "CE1-A",
        "description": "Estrutura CE1-A - Rede Compacta",
        "voltage_class": "13.8kV",
        "materials": [
            {"code": "PAR-FRANC-70-M16", "description": "Parafuso francês 70mm M16", "unit": "pç", "quantity": 1, "unit_price": 11.90},
            {"code": "BRACO-ANTIBAL", "description": "Braço antibalanço", "unit": "pç", "quantity": 1, "unit_price": 25.78},
            {"code": "BRACO-L-354", "description": "Braço suporte tipo L", "unit": "pç", "quantity": 1, "unit_price": 62.12},
            {"code": "PAR-FRANC-45-M16", "description": "Parafuso francês 45mm M16", "unit": "pç", "quantity": 1, "unit_price": 9.50},
            {"code": "ESTRIBO-SUP-L", "description": "Estribo suporte L", "unit": "pç", "quantity": 1, "unit_price": 11.14},
            {"code": "ESPAC-LOSANG", "description": "Espaçador losangular com garra", "unit": "pç", "quantity": 1, "unit_price": 27.95},
            {"code": "CINTA-190", "description": "Cinta circular 190mm", "unit": "pç", "quantity": 1, "unit_price": 7.50},
            {"code": "CINTA-200", "description": "Cinta circular 200mm", "unit": "pç", "quantity": 1, "unit_price": 7.80}
        ]
    },
    {
        "code": "CE1",
        "description": "Estrutura CE1 - Rede Compacta 1 Fase",
        "voltage_class": "13.8kV",
        "materials": [
            {"code": "PAR-CAB-M16-250", "description": "Parafuso cab. Quadrada m-16, 250mm", "unit": "pç", "quantity": 2, "unit_price": 20.16},
            {"code": "BRACO-L-354", "description": "Braço suporte tipo L", "unit": "pç", "quantity": 1, "unit_price": 62.12},
            {"code": "ARRUELA-QUAD", "description": "Arruela quadrada aço 38x3x ØF 18 mm", "unit": "pç", "quantity": 1, "unit_price": 40.50},
            {"code": "ESTRIBO-SUP-L", "description": "Estribo para suporte L", "unit": "pç", "quantity": 1, "unit_price": 11.14},
            {"code": "ESPAC-LOSANG", "description": "Espaçador losangular com garra", "unit": "pç", "quantity": 1, "unit_price": 27.95},
            {"code": "CINTA-190", "description": "Cinta circular 190mm", "unit": "pç", "quantity": 1, "unit_price": 7.50}
        ]
    },
    {
        "code": "CE2",
        "description": "Estrutura CE2 - Rede Compacta 3 Fases",
        "voltage_class": "13.8kV",
        "materials": [
            {"code": "ALCA-PREFORM", "description": "Alça pré-formada estai", "unit": "pç", "quantity": 2, "unit_price": 27.95},
            {"code": "ANEL-AMAR", "description": "Anel de amarração elastomérico para isolador", "unit": "pç", "quantity": 3, "unit_price": 15.41},
            {"code": "OLHAL-500", "description": "Olhal p/ parafuso 500daN", "unit": "pç", "quantity": 3, "unit_price": 9.65},
            {"code": "BRACO-C", "description": "Braço C", "unit": "pç", "quantity": 1, "unit_price": 158.72},
            {"code": "ISOL-PINO-POLIM", "description": "Isolador de pino polimérico rosca 25 mm", "unit": "pç", "quantity": 3, "unit_price": 32.30},
            {"code": "PINO-ISOL", "description": "Pino isolador reto curto aço", "unit": "pç", "quantity": 3, "unit_price": 38.55},
            {"code": "SAPAT-9.5", "description": "Sapatilha cabo 9,5 mm", "unit": "pç", "quantity": 1, "unit_price": 1.49},
            {"code": "CINTA-190", "description": "Cinta circular 190mm", "unit": "pç", "quantity": 2, "unit_price": 7.50},
            {"code": "PAR-FRANC-45", "description": "Parafuso francês 45mm M16", "unit": "pç", "quantity": 3, "unit_price": 9.50},
            {"code": "CINTA-200", "description": "Cinta circular 200mm", "unit": "pç", "quantity": 2, "unit_price": 7.80}
        ]
    },
    {
        "code": "CE2-TR",
        "description": "Estrutura CE2-TR - Rede Compacta com Transformador",
        "voltage_class": "13.8kV",
        "materials": [
            {"code": "ALCA-PREFORM", "description": "Alça pré-formada estai", "unit": "pç", "quantity": 1, "unit_price": 27.95},
            {"code": "ANEL-AMAR", "description": "Anel de amarração elastomérico", "unit": "pç", "quantity": 3, "unit_price": 15.41},
            {"code": "OLHAL-500", "description": "Olhal p/ parafuso 500daN", "unit": "pç", "quantity": 3, "unit_price": 9.65},
            {"code": "ISOL-SUSP-50KN", "description": "Isolador SUSP POLIMERICO 50KN 15kV", "unit": "pç", "quantity": 3, "unit_price": 32.30},
            {"code": "BRACO-C", "description": "Braço C", "unit": "pç", "quantity": 1, "unit_price": 158.72},
            {"code": "PINO-ISOL", "description": "Pino isolador reto curto aço", "unit": "pç", "quantity": 3, "unit_price": 38.55},
            {"code": "SAPAT-9.5", "description": "Sapatilha cabo 9,5 mm", "unit": "pç", "quantity": 1, "unit_price": 1.49},
            {"code": "PAR-FRANC-45", "description": "Parafuso francês 45mm M16", "unit": "pç", "quantity": 2, "unit_price": 9.50},
            {"code": "PAR-QUAD-150", "description": "Parafuso QUAD ACO CARB M16x150MM", "unit": "pç", "quantity": 2, "unit_price": 14.80},
            {"code": "MAO-FRANC-726", "description": "Mão-francesa plana aço carbono 726 mm", "unit": "pç", "quantity": 2, "unit_price": 85.30},
            {"code": "CRUZ-FIBRA", "description": "Cruzeta fibra reta 90x90 2,4m reforçada", "unit": "pç", "quantity": 1, "unit_price": 150.00},
            {"code": "CH-FUS-13.8", "description": "Chave fusível polimérica 13,8kV", "unit": "pç", "quantity": 3, "unit_price": 297.01},
            {"code": "SELA-CRUZ", "description": "Sela cruzeta 110x116mm", "unit": "pç", "quantity": 1, "unit_price": 12.40},
            {"code": "SUP-TRAFO", "description": "Suporte instalação trafo tipo cantoneira 255mm", "unit": "pç", "quantity": 2, "unit_price": 39.38},
            {"code": "PARA-RAIO", "description": "Para-Raio RD - 13,8kV", "unit": "pç", "quantity": 3, "unit_price": 7.74},
            {"code": "CINTA-190", "description": "Cinta circular 190mm", "unit": "pç", "quantity": 1, "unit_price": 7.50},
            {"code": "GRAM-ANCOR", "description": "Grampo de ancoragem cunha", "unit": "pç", "quantity": 3, "unit_price": 19.90},
            {"code": "CINTA-200", "description": "Cinta circular 200mm", "unit": "pç", "quantity": 2, "unit_price": 7.80},
            {"code": "CINTA-220", "description": "Cinta circular 220mm", "unit": "pç", "quantity": 2, "unit_price": 8.50},
            {"code": "CINTA-240", "description": "Cinta circular 240mm", "unit": "pç", "quantity": 1, "unit_price": 9.20}
        ]
    },
    {
        "code": "CE3",
        "description": "Estrutura CE3 - Rede Compacta com Ancoragem",
        "voltage_class": "13.8kV",
        "materials": [
            {"code": "ALCA-PREFORM", "description": "Alça pré-formada estai", "unit": "pç", "quantity": 1, "unit_price": 27.95},
            {"code": "SUP-AUX-BRACO", "description": "Suporte auxiliar para braço C 65x65x900 mm", "unit": "pç", "quantity": 1, "unit_price": 30.26},
            {"code": "GANCHO-OLHAL", "description": "Gancho olhal galvanizado 5.000 daN", "unit": "pç", "quantity": 3, "unit_price": 19.50},
            {"code": "GRAM-ANCOR", "description": "Grampo de ancoragem cunha", "unit": "pç", "quantity": 3, "unit_price": 19.90},
            {"code": "ISOL-ANCOR", "description": "Isolador de ancoragem tipo bastão polimérico", "unit": "pç", "quantity": 3, "unit_price": 39.38},
            {"code": "MANIL-SAPAT", "description": "Manilha sapatilha aço 5.000 daN", "unit": "pç", "quantity": 3, "unit_price": 5.72},
            {"code": "BRACO-C", "description": "Braço C", "unit": "pç", "quantity": 1, "unit_price": 158.72},
            {"code": "SAPAT-9.5", "description": "Sapatilha cabo 9,5 mm", "unit": "pç", "quantity": 1, "unit_price": 1.49},
            {"code": "OLHAL-5000", "description": "Olhal para parafuso 5.000 daN", "unit": "pç", "quantity": 2, "unit_price": 9.65},
            {"code": "CINTA-200", "description": "Cinta circular 200mm", "unit": "pç", "quantity": 3, "unit_price": 7.80},
            {"code": "CINTA-190", "description": "Cinta circular 190mm", "unit": "pç", "quantity": 1, "unit_price": 7.50}
        ]
    },
    {
        "code": "CE4",
        "description": "Estrutura CE4 - Rede Compacta Dupla Ancoragem",
        "voltage_class": "13.8kV",
        "materials": [
            {"code": "ALCA-PREFORM", "description": "Alça pré-formada estai", "unit": "pç", "quantity": 2, "unit_price": 27.95},
            {"code": "ANEL-AMAR", "description": "Anel de amarração elastomérico", "unit": "pç", "quantity": 2, "unit_price": 15.41},
            {"code": "OLHAL-500", "description": "Olhal p/ parafuso 500daN", "unit": "pç", "quantity": 3, "unit_price": 9.65},
            {"code": "BRACO-C", "description": "Braço C", "unit": "pç", "quantity": 1, "unit_price": 158.72},
            {"code": "ISOL-SUSP-50KN", "description": "Isolador SUSP POLIMERICO 50KN 15kV", "unit": "pç", "quantity": 3, "unit_price": 32.30},
            {"code": "PINO-ISOL-16", "description": "Pino isol aço 16,0mm 154x38x192mm", "unit": "pç", "quantity": 3, "unit_price": 38.55},
            {"code": "SAPAT-9.5", "description": "Sapatilha cabo 9,5 mm", "unit": "pç", "quantity": 2, "unit_price": 1.49},
            {"code": "ISOL-ANCOR", "description": "Isolador de ancoragem tipo bastão polimérico", "unit": "pç", "quantity": 6, "unit_price": 39.38},
            {"code": "GRAM-ANCOR", "description": "Grampo de ancoragem cunha", "unit": "pç", "quantity": 6, "unit_price": 19.90},
            {"code": "MANIL-SAPAT", "description": "Manilha sapatilha aço 5.000 daN", "unit": "pç", "quantity": 6, "unit_price": 5.72},
            {"code": "CINTA-200", "description": "Cinta circular 200mm", "unit": "pç", "quantity": 1, "unit_price": 7.80},
            {"code": "CINTA-190", "description": "Cinta circular 190mm", "unit": "pç", "quantity": 1, "unit_price": 7.50}
        ]
    },
    {
        "code": "CE3-TR",
        "description": "Estrutura CE3-TR - Rede Compacta com Transformador e Ancoragem",
        "voltage_class": "13.8kV",
        "materials": [
            {"code": "ALCA-PREFORM", "description": "Alça pré-formada estai", "unit": "pç", "quantity": 1, "unit_price": 27.95},
            {"code": "SUP-AUX-BRACO", "description": "Suporte auxiliar para braço C", "unit": "pç", "quantity": 1, "unit_price": 30.26},
            {"code": "OLHAL-500", "description": "Olhal p/ parafuso 500daN", "unit": "pç", "quantity": 4, "unit_price": 9.65},
            {"code": "GANCHO-OLHAL", "description": "Gancho olhal galvanizado 5.000 daN", "unit": "pç", "quantity": 3, "unit_price": 19.50},
            {"code": "BRACO-C", "description": "Braço C", "unit": "pç", "quantity": 1, "unit_price": 158.72},
            {"code": "ISOL-ANCOR", "description": "Isolador de ancoragem tipo bastão polimérico", "unit": "pç", "quantity": 3, "unit_price": 39.38},
            {"code": "MANIL-SAPAT", "description": "Manilha sapatilha aço 5.000 daN", "unit": "pç", "quantity": 3, "unit_price": 5.72},
            {"code": "SAPAT-9.5", "description": "Sapatilha cabo 9,5 mm", "unit": "pç", "quantity": 1, "unit_price": 1.49},
            {"code": "PAR-FRANC-45", "description": "Parafuso francês 45mm M16", "unit": "pç", "quantity": 5, "unit_price": 9.50},
            {"code": "PAR-QUAD-150", "description": "Parafuso QUAD ACO CARB M16x150MM", "unit": "pç", "quantity": 2, "unit_price": 14.80},
            {"code": "MAO-FRANC-726", "description": "Mão-francesa plana aço carbono 726 mm", "unit": "pç", "quantity": 2, "unit_price": 85.30},
            {"code": "CRUZ-FIBRA", "description": "Cruzeta fibra reta 90x90 2,4m", "unit": "pç", "quantity": 1, "unit_price": 150.00},
            {"code": "CH-FUS-13.8", "description": "Chave fusível polimérica 13,8kV", "unit": "pç", "quantity": 3, "unit_price": 297.01},
            {"code": "SELA-CRUZ", "description": "Sela cruzeta 110x116mm", "unit": "pç", "quantity": 1, "unit_price": 12.40},
            {"code": "SUP-TRAFO", "description": "Suporte instalação trafo tipo cantoneira 255mm", "unit": "pç", "quantity": 2, "unit_price": 39.38},
            {"code": "PARA-RAIO", "description": "Para-Raio RD - 13,8kV", "unit": "pç", "quantity": 3, "unit_price": 7.74},
            {"code": "CINTA-190", "description": "Cinta circular 190mm", "unit": "pç", "quantity": 1, "unit_price": 7.50},
            {"code": "GRAM-ANCOR", "description": "Grampo de ancoragem cunha", "unit": "pç", "quantity": 3, "unit_price": 19.90},
            {"code": "CINTA-200", "description": "Cinta circular 200mm", "unit": "pç", "quantity": 2, "unit_price": 7.80},
            {"code": "CINTA-220", "description": "Cinta circular 220mm", "unit": "pç", "quantity": 2, "unit_price": 8.50},
            {"code": "CINTA-240", "description": "Cinta circular 240mm", "unit": "pç", "quantity": 1, "unit_price": 9.20}
        ]
    }
]

# Estruturas de Baixa Tensão (outras)
low_voltage_structures = [
    {
        "code": "S1L / STBI",
        "description": "Estrutura S1L / STBI - Baixa Tensão",
        "voltage_class": "220V/380V",
        "materials": [
            {"code": "ARM-SECUND", "description": "Armação secundária para roldana", "unit": "pç", "quantity": 1, "unit_price": 15.41},
            {"code": "ISOL-ROLD", "description": "Isolador Roldana 750v", "unit": "pç", "quantity": 1, "unit_price": 12.83},
            {"code": "CINTA-240", "description": "Cinta circular 240mm", "unit": "pç", "quantity": 1, "unit_price": 9.20},
            {"code": "LACO-PREFORM", "description": "Laço preformado roldana", "unit": "pç", "quantity": 1, "unit_price": 18.50}
        ]
    },
    {
        "code": "S3L / FLBIT",
        "description": "Estrutura S3L / FLBIT - Baixa Tensão",
        "voltage_class": "220V/380V",
        "materials": [
            {"code": "ARM-SECUND", "description": "Armação secundária para roldana", "unit": "pç", "quantity": 1, "unit_price": 15.41},
            {"code": "ISOL-ROLD", "description": "Isolador Roldana 750v", "unit": "pç", "quantity": 1, "unit_price": 12.83},
            {"code": "CINTA-240", "description": "Cinta circular 240mm", "unit": "pç", "quantity": 1, "unit_price": 9.20},
            {"code": "LACO-PREFORM", "description": "Laço preformado roldana", "unit": "pç", "quantity": 1, "unit_price": 18.50},
            {"code": "ALCA-PREFORM", "description": "Alça pré-formada estai", "unit": "pç", "quantity": 1, "unit_price": 27.95}
        ]
    },
    {
        "code": "S4L - FLABIT / FLABIDT",
        "description": "Estrutura S4L - FLABIT / FLABIDT - Baixa Tensão",
        "voltage_class": "220V/380V",
        "materials": [
            {"code": "ARM-SECUND", "description": "Armação secundária para roldana", "unit": "pç", "quantity": 2, "unit_price": 15.41},
            {"code": "ISOL-ROLD", "description": "Isolador Roldana 750v", "unit": "pç", "quantity": 2, "unit_price": 12.83},
            {"code": "CINTA-240", "description": "Cinta circular 240mm", "unit": "pç", "quantity": 2, "unit_price": 9.20},
            {"code": "ALCA-PREFORM", "description": "Alça pré-formada estai", "unit": "pç", "quantity": 2, "unit_price": 27.95}
        ]
    },
    {
        "code": "S1I-S3I-OP - SDBIT",
        "description": "Estrutura S1I-S3I-OP - SDBIT - Baixa Tensão",
        "voltage_class": "220V/380V",
        "materials": [
            {"code": "ABRAC-PLAST", "description": "Abraçadeira Plástica", "unit": "pç", "quantity": 3, "unit_price": 2.50},
            {"code": "ALCA-PREFORM", "description": "Alça pré-formada estai", "unit": "pç", "quantity": 1, "unit_price": 27.95},
            {"code": "ARM-SECUND-1", "description": "Armação secundária 1 estribo", "unit": "pç", "quantity": 2, "unit_price": 15.41},
            {"code": "CONECT-PERFUR", "description": "Conector tipo perfurante", "unit": "pç", "quantity": 4, "unit_price": 1.14},
            {"code": "ISOL-ROLD", "description": "Isolador Roldana 750v", "unit": "pç", "quantity": 2, "unit_price": 12.83},
            {"code": "CINTA-240", "description": "Cinta circular 240mm", "unit": "pç", "quantity": 3, "unit_price": 9.20}
        ]
    }
]

# Postes
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

async def populate_database():
    print("Iniciando população do banco de dados com estruturas...")
    
    # Clear existing data
    print("Limpando dados existentes...")
    await db.medium_voltage_structures.delete_many({})
    await db.low_voltage_structures.delete_many({})
    await db.poles.delete_many({})
    
    # Insert Medium Voltage Structures
    print(f"\nInserindo {len(medium_voltage_structures)} estruturas de média tensão...")
    for structure in medium_voltage_structures:
        # Calculate total price
        total_price = sum(mat['quantity'] * mat['unit_price'] for mat in structure['materials'])
        
        structure_doc = {
            **structure,
            "id": str(uuid.uuid4()),
            "total_price": total_price,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.medium_voltage_structures.insert_one(structure_doc)
        print(f"  ✓ {structure['code']} - R$ {total_price:.2f}")
    
    # Insert Low Voltage Structures
    print(f"\nInserindo {len(low_voltage_structures)} estruturas de baixa tensão...")
    for structure in low_voltage_structures:
        # Calculate total price
        total_price = sum(mat['quantity'] * mat['unit_price'] for mat in structure['materials'])
        
        structure_doc = {
            **structure,
            "id": str(uuid.uuid4()),
            "total_price": total_price,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.low_voltage_structures.insert_one(structure_doc)
        print(f"  ✓ {structure['code']} - R$ {total_price:.2f}")
    
    # Insert Postes
    print(f"\nInserindo {len(postes_data)} postes...")
    for pole in postes_data:
        pole_doc = {
            **pole,
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.poles.insert_one(pole_doc)
    
    print("\n" + "="*60)
    print("✅ Banco de dados populado com sucesso!")
    print("="*60)
    print(f"\n📊 Resumo:")
    print(f"  • Estruturas de Média Tensão: {len(medium_voltage_structures)}")
    print(f"  • Estruturas de Baixa Tensão: {len(low_voltage_structures)}")
    print(f"  • Postes: {len(postes_data)}")
    print(f"\n  TOTAL: {len(medium_voltage_structures) + len(low_voltage_structures) + len(postes_data)} itens")
    print("="*60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(populate_database())
