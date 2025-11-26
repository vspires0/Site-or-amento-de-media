from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

# Pole Models
class PoleCreate(BaseModel):
    type: str  # Concreto, Fibra, Duplo T, Especial
    height: float  # metros
    capacity: int  # daN
    code: str
    unit_price: float

class Pole(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    height: float
    capacity: int
    code: str
    unit_price: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Primary Structure Models
class PrimaryStructureCreate(BaseModel):
    code: str  # CE1, CE2, CE3
    description: str
    phases: int  # 1 or 3
    voltage_class: str  # 15kV, 36.2kV
    network_type: str  # Compacta, Convencional
    unit_price: float

class PrimaryStructure(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    description: str
    phases: int
    voltage_class: str
    network_type: str
    unit_price: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Secondary Structure Models
class SecondaryStructureCreate(BaseModel):
    code: str  # M1, M2, M3
    description: str
    conductor_count: int
    network_type: str  # Convencional, Multiplexado
    unit_price: float

class SecondaryStructure(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    description: str
    conductor_count: int
    network_type: str
    unit_price: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Conductor Models
class ConductorCreate(BaseModel):
    type: str  # Cobre, Alumínio, AAAC
    insulation: str  # XLPE, PVC
    section: str  # AWG, mm²
    code: str
    configuration: str  # Multiplexado, Duplexado, Simples
    unit_price: float  # por metro

class Conductor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    insulation: str
    section: str
    code: str
    configuration: str
    unit_price: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Equipment Models
class EquipmentCreate(BaseModel):
    category: str  # Chave, Transformador, Capacitor, Religador, Regulador
    type: str  # Faca, Tandem, Fusível, ET1A, etc.
    code: str
    description: str
    unit_price: float

class Equipment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    type: str
    code: str
    description: str
    unit_price: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Hardware Models
class HardwareCreate(BaseModel):
    category: str  # Braçadeira, Para-raios, Isolador
    description: str
    code: str
    unit_price: float

class Hardware(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    description: str
    code: str
    unit_price: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Budget Models
class BudgetItem(BaseModel):
    item_id: str
    item_type: str  # pole, primary_structure, secondary_structure, conductor, equipment, hardware
    code: str
    description: str
    quantity: float
    unit_price: float
    total_price: float

class BudgetCreate(BaseModel):
    project_name: str
    client_name: str
    items: List[BudgetItem]
    labor_cost: float = 0.0
    additional_services: float = 0.0
    notes: Optional[str] = None

class Budget(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_name: str
    client_name: str
    items: List[BudgetItem]
    labor_cost: float
    additional_services: float
    subtotal: float
    total: float
    notes: Optional[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Sistema de Orçamentação - Estruturas de Média Tensão"}

# Pole Routes
@api_router.post("/poles", response_model=Pole)
async def create_pole(pole: PoleCreate):
    pole_obj = Pole(**pole.model_dump())
    doc = pole_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.poles.insert_one(doc)
    return pole_obj

@api_router.get("/poles", response_model=List[Pole])
async def get_poles():
    poles = await db.poles.find({}, {"_id": 0}).to_list(1000)
    for pole in poles:
        if isinstance(pole['created_at'], str):
            pole['created_at'] = datetime.fromisoformat(pole['created_at'])
    return poles

@api_router.delete("/poles/{pole_id}")
async def delete_pole(pole_id: str):
    result = await db.poles.delete_one({"id": pole_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Poste não encontrado")
    return {"message": "Poste deletado com sucesso"}

# Primary Structure Routes
@api_router.post("/primary-structures", response_model=PrimaryStructure)
async def create_primary_structure(structure: PrimaryStructureCreate):
    structure_obj = PrimaryStructure(**structure.model_dump())
    doc = structure_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.primary_structures.insert_one(doc)
    return structure_obj

@api_router.get("/primary-structures", response_model=List[PrimaryStructure])
async def get_primary_structures():
    structures = await db.primary_structures.find({}, {"_id": 0}).to_list(1000)
    for structure in structures:
        if isinstance(structure['created_at'], str):
            structure['created_at'] = datetime.fromisoformat(structure['created_at'])
    return structures

@api_router.delete("/primary-structures/{structure_id}")
async def delete_primary_structure(structure_id: str):
    result = await db.primary_structures.delete_one({"id": structure_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Estrutura não encontrada")
    return {"message": "Estrutura deletada com sucesso"}

# Secondary Structure Routes
@api_router.post("/secondary-structures", response_model=SecondaryStructure)
async def create_secondary_structure(structure: SecondaryStructureCreate):
    structure_obj = SecondaryStructure(**structure.model_dump())
    doc = structure_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.secondary_structures.insert_one(doc)
    return structure_obj

@api_router.get("/secondary-structures", response_model=List[SecondaryStructure])
async def get_secondary_structures():
    structures = await db.secondary_structures.find({}, {"_id": 0}).to_list(1000)
    for structure in structures:
        if isinstance(structure['created_at'], str):
            structure['created_at'] = datetime.fromisoformat(structure['created_at'])
    return structures

@api_router.delete("/secondary-structures/{structure_id}")
async def delete_secondary_structure(structure_id: str):
    result = await db.secondary_structures.delete_one({"id": structure_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Estrutura não encontrada")
    return {"message": "Estrutura deletada com sucesso"}

# Conductor Routes
@api_router.post("/conductors", response_model=Conductor)
async def create_conductor(conductor: ConductorCreate):
    conductor_obj = Conductor(**conductor.model_dump())
    doc = conductor_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.conductors.insert_one(doc)
    return conductor_obj

@api_router.get("/conductors", response_model=List[Conductor])
async def get_conductors():
    conductors = await db.conductors.find({}, {"_id": 0}).to_list(1000)
    for conductor in conductors:
        if isinstance(conductor['created_at'], str):
            conductor['created_at'] = datetime.fromisoformat(conductor['created_at'])
    return conductors

@api_router.delete("/conductors/{conductor_id}")
async def delete_conductor(conductor_id: str):
    result = await db.conductors.delete_one({"id": conductor_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Condutor não encontrado")
    return {"message": "Condutor deletado com sucesso"}

# Equipment Routes
@api_router.post("/equipment", response_model=Equipment)
async def create_equipment(equipment: EquipmentCreate):
    equipment_obj = Equipment(**equipment.model_dump())
    doc = equipment_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.equipment.insert_one(doc)
    return equipment_obj

@api_router.get("/equipment", response_model=List[Equipment])
async def get_equipment():
    equipment_list = await db.equipment.find({}, {"_id": 0}).to_list(1000)
    for equipment in equipment_list:
        if isinstance(equipment['created_at'], str):
            equipment['created_at'] = datetime.fromisoformat(equipment['created_at'])
    return equipment_list

@api_router.delete("/equipment/{equipment_id}")
async def delete_equipment(equipment_id: str):
    result = await db.equipment.delete_one({"id": equipment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    return {"message": "Equipamento deletado com sucesso"}

# Hardware Routes
@api_router.post("/hardware", response_model=Hardware)
async def create_hardware(hardware: HardwareCreate):
    hardware_obj = Hardware(**hardware.model_dump())
    doc = hardware_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.hardware.insert_one(doc)
    return hardware_obj

@api_router.get("/hardware", response_model=List[Hardware])
async def get_hardware():
    hardware_list = await db.hardware.find({}, {"_id": 0}).to_list(1000)
    for hardware in hardware_list:
        if isinstance(hardware['created_at'], str):
            hardware['created_at'] = datetime.fromisoformat(hardware['created_at'])
    return hardware_list

@api_router.delete("/hardware/{hardware_id}")
async def delete_hardware(hardware_id: str):
    result = await db.hardware.delete_one({"id": hardware_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ferragem não encontrada")
    return {"message": "Ferragem deletada com sucesso"}

# Budget Routes
@api_router.post("/budgets", response_model=Budget)
async def create_budget(budget: BudgetCreate):
    # Calculate subtotal from items
    subtotal = sum(item.total_price for item in budget.items)
    total = subtotal + budget.labor_cost + budget.additional_services
    
    budget_obj = Budget(
        **budget.model_dump(),
        subtotal=subtotal,
        total=total
    )
    doc = budget_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.budgets.insert_one(doc)
    return budget_obj

@api_router.get("/budgets", response_model=List[Budget])
async def get_budgets():
    budgets = await db.budgets.find({}, {"_id": 0}).to_list(1000)
    for budget in budgets:
        if isinstance(budget['created_at'], str):
            budget['created_at'] = datetime.fromisoformat(budget['created_at'])
    return budgets

@api_router.get("/budgets/{budget_id}", response_model=Budget)
async def get_budget(budget_id: str):
    budget = await db.budgets.find_one({"id": budget_id}, {"_id": 0})
    if not budget:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    if isinstance(budget['created_at'], str):
        budget['created_at'] = datetime.fromisoformat(budget['created_at'])
    return budget

@api_router.delete("/budgets/{budget_id}")
async def delete_budget(budget_id: str):
    result = await db.budgets.delete_one({"id": budget_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    return {"message": "Orçamento deletado com sucesso"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()