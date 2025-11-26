from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
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
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

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

# Dropdown Options Models
class DropdownOption(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str  # pole_types, conductor_types, equipment_categories, etc
    value: str
    label: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DropdownOptionCreate(BaseModel):
    category: str
    value: str
    label: str

# Material dentro de uma estrutura
class StructureMaterial(BaseModel):
    code: str
    description: str
    unit: str  # pç, Und, m
    quantity: float
    unit_price: float

# Estrutura de Média Tensão
class MediumVoltageStructureCreate(BaseModel):
    code: str  # CE1, CE1-A, CE2, CE2-TR, CE3, CE3-TR, CE4
    description: str
    voltage_class: str  # 15kV, 13.8kV
    materials: List[StructureMaterial]

class MediumVoltageStructure(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    description: str
    voltage_class: str
    materials: List[StructureMaterial]
    total_price: float  # Calculado automaticamente
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Estrutura de Baixa Tensão
class LowVoltageStructureCreate(BaseModel):
    code: str  # S1L, S3L, S4L, etc
    description: str
    voltage_class: str  # 220V, 380V, etc
    materials: List[StructureMaterial]

class LowVoltageStructure(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    description: str
    voltage_class: str
    materials: List[StructureMaterial]
    total_price: float  # Calculado automaticamente
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

# Budget Models
class BudgetItem(BaseModel):
    item_id: str
    item_type: str  # pole, medium_voltage_structure, low_voltage_structure, conductor, equipment
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
    bdi_percentage: float = 0.0
    notes: Optional[str] = None

class Budget(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_name: str
    client_name: str
    items: List[BudgetItem]
    labor_cost: float
    additional_services: float
    bdi_percentage: float
    bdi_value: float
    subtotal: float
    total: float
    notes: Optional[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Sistema de Orçamentação - Estruturas de Média Tensão"}

# Dropdown Options Routes
@api_router.get("/dropdown-options/{category}", response_model=List[DropdownOption])
async def get_dropdown_options(category: str):
    options = await db.dropdown_options.find({"category": category}, {"_id": 0}).to_list(1000)
    for option in options:
        if isinstance(option['created_at'], str):
            option['created_at'] = datetime.fromisoformat(option['created_at'])
    return options

@api_router.post("/dropdown-options", response_model=DropdownOption)
async def create_dropdown_option(option: DropdownOptionCreate):
    option_obj = DropdownOption(**option.model_dump())
    doc = option_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.dropdown_options.insert_one(doc)
    return option_obj

@api_router.delete("/dropdown-options/{option_id}")
async def delete_dropdown_option(option_id: str):
    result = await db.dropdown_options.delete_one({"id": option_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Opção não encontrada")
    return {"message": "Opção deletada com sucesso"}

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

@api_router.put("/poles/{pole_id}", response_model=Pole)
async def update_pole(pole_id: str, pole: PoleCreate):
    pole_obj = Pole(**pole.model_dump(), id=pole_id)
    doc = pole_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    result = await db.poles.replace_one({"id": pole_id}, doc)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Poste não encontrado")
    return pole_obj

@api_router.delete("/poles/{pole_id}")
async def delete_pole(pole_id: str):
    result = await db.poles.delete_one({"id": pole_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Poste não encontrado")
    return {"message": "Poste deletado com sucesso"}

# Medium Voltage Structure Routes
@api_router.post("/medium-voltage-structures", response_model=MediumVoltageStructure)
async def create_medium_voltage_structure(structure: MediumVoltageStructureCreate):
    # Calculate total price
    total_price = sum(mat.quantity * mat.unit_price for mat in structure.materials)
    
    structure_obj = MediumVoltageStructure(**structure.model_dump(), total_price=total_price)
    doc = structure_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.medium_voltage_structures.insert_one(doc)
    return structure_obj

@api_router.get("/medium-voltage-structures", response_model=List[MediumVoltageStructure])
async def get_medium_voltage_structures():
    structures = await db.medium_voltage_structures.find({}, {"_id": 0}).to_list(1000)
    for structure in structures:
        if isinstance(structure['created_at'], str):
            structure['created_at'] = datetime.fromisoformat(structure['created_at'])
    return structures

@api_router.get("/medium-voltage-structures/{structure_id}", response_model=MediumVoltageStructure)
async def get_medium_voltage_structure(structure_id: str):
    structure = await db.medium_voltage_structures.find_one({"id": structure_id}, {"_id": 0})
    if not structure:
        raise HTTPException(status_code=404, detail="Estrutura não encontrada")
    if isinstance(structure['created_at'], str):
        structure['created_at'] = datetime.fromisoformat(structure['created_at'])
    return structure

@api_router.put("/medium-voltage-structures/{structure_id}", response_model=MediumVoltageStructure)
async def update_medium_voltage_structure(structure_id: str, structure: MediumVoltageStructureCreate):
    # Calculate total price
    total_price = sum(mat.quantity * mat.unit_price for mat in structure.materials)
    
    structure_obj = MediumVoltageStructure(**structure.model_dump(), id=structure_id, total_price=total_price)
    doc = structure_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    result = await db.medium_voltage_structures.replace_one({"id": structure_id}, doc)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Estrutura não encontrada")
    return structure_obj

@api_router.delete("/medium-voltage-structures/{structure_id}")
async def delete_medium_voltage_structure(structure_id: str):
    result = await db.medium_voltage_structures.delete_one({"id": structure_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Estrutura não encontrada")
    return {"message": "Estrutura deletada com sucesso"}

# Low Voltage Structure Routes
@api_router.post("/low-voltage-structures", response_model=LowVoltageStructure)
async def create_low_voltage_structure(structure: LowVoltageStructureCreate):
    # Calculate total price
    total_price = sum(mat.quantity * mat.unit_price for mat in structure.materials)
    
    structure_obj = LowVoltageStructure(**structure.model_dump(), total_price=total_price)
    doc = structure_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.low_voltage_structures.insert_one(doc)
    return structure_obj

@api_router.get("/low-voltage-structures", response_model=List[LowVoltageStructure])
async def get_low_voltage_structures():
    structures = await db.low_voltage_structures.find({}, {"_id": 0}).to_list(1000)
    for structure in structures:
        if isinstance(structure['created_at'], str):
            structure['created_at'] = datetime.fromisoformat(structure['created_at'])
    return structures

@api_router.get("/low-voltage-structures/{structure_id}", response_model=LowVoltageStructure)
async def get_low_voltage_structure(structure_id: str):
    structure = await db.low_voltage_structures.find_one({"id": structure_id}, {"_id": 0})
    if not structure:
        raise HTTPException(status_code=404, detail="Estrutura não encontrada")
    if isinstance(structure['created_at'], str):
        structure['created_at'] = datetime.fromisoformat(structure['created_at'])
    return structure

@api_router.put("/low-voltage-structures/{structure_id}", response_model=LowVoltageStructure)
async def update_low_voltage_structure(structure_id: str, structure: LowVoltageStructureCreate):
    # Calculate total price
    total_price = sum(mat.quantity * mat.unit_price for mat in structure.materials)
    
    structure_obj = LowVoltageStructure(**structure.model_dump(), id=structure_id, total_price=total_price)
    doc = structure_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    result = await db.low_voltage_structures.replace_one({"id": structure_id}, doc)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Estrutura não encontrada")
    return structure_obj

@api_router.delete("/low-voltage-structures/{structure_id}")
async def delete_low_voltage_structure(structure_id: str):
    result = await db.low_voltage_structures.delete_one({"id": structure_id})
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

@api_router.put("/conductors/{conductor_id}", response_model=Conductor)
async def update_conductor(conductor_id: str, conductor: ConductorCreate):
    conductor_obj = Conductor(**conductor.model_dump(), id=conductor_id)
    doc = conductor_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    result = await db.conductors.replace_one({"id": conductor_id}, doc)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Condutor não encontrado")
    return conductor_obj

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

@api_router.put("/equipment/{equipment_id}", response_model=Equipment)
async def update_equipment(equipment_id: str, equipment: EquipmentCreate):
    equipment_obj = Equipment(**equipment.model_dump(), id=equipment_id)
    doc = equipment_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    result = await db.equipment.replace_one({"id": equipment_id}, doc)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    return equipment_obj

@api_router.delete("/equipment/{equipment_id}")
async def delete_equipment(equipment_id: str):
    result = await db.equipment.delete_one({"id": equipment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    return {"message": "Equipamento deletado com sucesso"}

# Budget Routes
@api_router.post("/budgets", response_model=Budget)
async def create_budget(budget: BudgetCreate):
    # Calculate subtotal from items
    subtotal = sum(item.total_price for item in budget.items)
    subtotal_with_services = subtotal + budget.labor_cost + budget.additional_services
    
    # Calculate BDI
    bdi_value = subtotal_with_services * (budget.bdi_percentage / 100)
    total = subtotal_with_services + bdi_value
    
    budget_obj = Budget(
        **budget.model_dump(),
        subtotal=subtotal,
        bdi_value=bdi_value,
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

@api_router.get("/budgets/{budget_id}/export-pdf")
async def export_budget_pdf(budget_id: str):
    budget = await db.budgets.find_one({"id": budget_id}, {"_id": 0})
    if not budget:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
    
    # Create PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1e3a8a'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    normal_style = styles['Normal']
    
    # Title
    elements.append(Paragraph("ORÇAMENTO", title_style))
    elements.append(Paragraph(f"Sistema de Orçamentação - Estruturas de Média Tensão", normal_style))
    elements.append(Spacer(1, 0.5*cm))
    
    # Project Info
    elements.append(Paragraph("INFORMAÇÕES DO PROJETO", heading_style))
    
    info_data = [
        ['Projeto:', budget['project_name']],
        ['Cliente:', budget['client_name']],
        ['Data:', datetime.fromisoformat(budget['created_at']).strftime('%d/%m/%Y %H:%M')],
        ['Orçamento Nº:', budget_id[:8].upper()]
    ]
    
    info_table = Table(info_data, colWidths=[4*cm, 13*cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    
    elements.append(info_table)
    elements.append(Spacer(1, 0.8*cm))
    
    # Items Table
    elements.append(Paragraph("LISTA DE MATERIAIS E SERVIÇOS", heading_style))
    
    items_data = [['Item', 'Código', 'Descrição', 'Qtd', 'Preço Unit.', 'Total']]
    
    for idx, item in enumerate(budget['items'], 1):
        items_data.append([
            str(idx),
            item['code'],
            item['description'][:40] + '...' if len(item['description']) > 40 else item['description'],
            str(item['quantity']),
            f"R$ {item['unit_price']:.2f}",
            f"R$ {item['total_price']:.2f}"
        ])
    
    items_table = Table(items_data, colWidths=[1*cm, 2.5*cm, 7*cm, 1.5*cm, 2.5*cm, 2.5*cm])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (2, 1), (2, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    
    elements.append(items_table)
    elements.append(Spacer(1, 0.5*cm))
    
    # Summary Table
    elements.append(Paragraph("RESUMO FINANCEIRO", heading_style))
    
    summary_data = [
        ['Subtotal (Materiais):', f"R$ {budget['subtotal']:.2f}"],
        ['Mão de Obra:', f"R$ {budget['labor_cost']:.2f}"],
        ['Serviços Adicionais:', f"R$ {budget['additional_services']:.2f}"],
    ]
    
    subtotal_with_services = budget['subtotal'] + budget['labor_cost'] + budget['additional_services']
    summary_data.append(['Subtotal com Serviços:', f"R$ {subtotal_with_services:.2f}"])
    
    if budget.get('bdi_percentage', 0) > 0:
        summary_data.append([f"BDI ({budget['bdi_percentage']:.2f}%):", f"R$ {budget['bdi_value']:.2f}"])
    
    summary_data.append(['', ''])  # Empty row
    summary_data.append(['TOTAL:', f"R$ {budget['total']:.2f}"])
    
    summary_table = Table(summary_data, colWidths=[13*cm, 4*cm])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (0, -2), 'Helvetica'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -2), 10),
        ('FONTSIZE', (0, -1), (-1, -1), 12),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#2563eb')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LINEABOVE', (0, -1), (-1, -1), 2, colors.HexColor('#2563eb')),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#eff6ff'))
    ]))
    
    elements.append(summary_table)
    elements.append(Spacer(1, 0.5*cm))
    
    # Notes
    if budget.get('notes'):
        elements.append(Paragraph("OBSERVAÇÕES", heading_style))
        elements.append(Paragraph(budget['notes'], normal_style))
        elements.append(Spacer(1, 0.5*cm))
    
    # Footer
    elements.append(Spacer(1, 1*cm))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER
    )
    elements.append(Paragraph("Documento gerado automaticamente pelo Sistema de Orçamentação", footer_style))
    elements.append(Paragraph(f"Data de geração: {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')}", footer_style))
    
    # Build PDF
    doc.build(elements)
    
    # Get PDF from buffer
    buffer.seek(0)
    
    # Return as streaming response
    filename = f"orcamento_{budget['project_name'].replace(' ', '_')}_{budget_id[:8]}.pdf"
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

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
