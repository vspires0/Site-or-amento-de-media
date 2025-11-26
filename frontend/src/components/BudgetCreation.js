import { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Save, Search } from 'lucide-react';
import { API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

function BudgetCreation() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [additionalServices, setAdditionalServices] = useState('');
  const [bdiPercentage, setBdiPercentage] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  
  const [availableItems, setAvailableItems] = useState({
    poles: [],
    medium_voltage_structures: [],
    low_voltage_structures: [],
    conductors: [],
    equipment: []
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState('poles');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAvailableItems();
  }, []);

  const loadAvailableItems = async () => {
    try {
      const [poles, mediumVoltage, lowVoltage, conductors, equipment] = await Promise.all([
        axios.get(`${API}/poles`),
        axios.get(`${API}/medium-voltage-structures`),
        axios.get(`${API}/low-voltage-structures`),
        axios.get(`${API}/conductors`),
        axios.get(`${API}/equipment`)
      ]);
      
      setAvailableItems({
        poles: poles.data,
        medium_voltage_structures: mediumVoltage.data,
        low_voltage_structures: lowVoltage.data,
        conductors: conductors.data,
        equipment: equipment.data
      });
    } catch (error) {
      toast.error('Erro ao carregar itens disponíveis');
      console.error('Erro:', error);
    }
  };

  const addItem = (item, type) => {
    const existingItem = items.find(i => i.item_id === item.id);
    if (existingItem) {
      toast.error('Este item já foi adicionado ao orçamento');
      return;
    }

    // Para estruturas, usar total_price, para outros usar unit_price
    const price = item.total_price || item.unit_price;
    
    const newItem = {
      item_id: item.id,
      item_type: type,
      code: item.code,
      description: item.description || `${item.type || ''} ${item.height || ''} ${item.capacity || ''}`,
      quantity: 1,
      unit_price: price,
      total_price: price
    };
    
    setItems([...items, newItem]);
    setShowAddModal(false);
    setSearchTerm('');
    toast.success('Item adicionado ao orçamento');
  };

  const updateQuantity = (index, quantity) => {
    const newItems = [...items];
    newItems[index].quantity = parseFloat(quantity) || 0;
    newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    toast.success('Item removido');
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const labor = parseFloat(laborCost) || 0;
    const services = parseFloat(additionalServices) || 0;
    const subtotalWithServices = subtotal + labor + services;
    const bdi = parseFloat(bdiPercentage) || 0;
    const bdiValue = subtotalWithServices * (bdi / 100);
    const total = subtotalWithServices + bdiValue;
    return { subtotal, labor, services, bdi, bdiValue, subtotalWithServices, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Adicione pelo menos um item ao orçamento');
      return;
    }

    try {
      await axios.post(`${API}/budgets`, {
        project_name: projectName,
        client_name: clientName,
        items: items,
        labor_cost: parseFloat(laborCost) || 0,
        additional_services: parseFloat(additionalServices) || 0,
        bdi_percentage: parseFloat(bdiPercentage) || 0,
        notes: notes || null
      });
      
      toast.success('Orçamento criado com sucesso!');
      navigate('/budgets');
    } catch (error) {
      toast.error('Erro ao criar orçamento');
    }
  };

  const totals = calculateTotal();
  
  const getFilteredItems = () => {
    const items = availableItems[selectedType] || [];
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="fade-in" data-testid="budget-creation">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Calculator className="text-blue-600" />
          Criar Orçamento
        </h1>
        <p className="text-slate-600">Crie orçamentos detalhados para projetos de média tensão</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Informações do Projeto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Projeto</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="input-field"
                data-testid="project-name-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="input-field"
                data-testid="client-name-input"
                required
              />
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800">Itens do Orçamento</h3>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
              data-testid="add-item-btn"
            >
              <Plus size={20} />
              Adicionar Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>Nenhum item adicionado. Clique em "Adicionar Item" para começar.</p>
            </div>
          ) : (
            <div className="table-container" data-testid="budget-items-table">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Preço Unit.</th>
                    <th>Total</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} data-testid={`budget-item-row-${index}`}>
                      <td className="font-medium">{item.code}</td>
                      <td>{item.description}</td>
                      <td className="text-sm text-slate-600">{item.item_type}</td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(index, e.target.value)}
                          className="input-field w-24"
                          data-testid={`quantity-input-${index}`}
                        />
                      </td>
                      <td>R$ {item.unit_price.toFixed(2)}</td>
                      <td className="font-semibold">R$ {item.total_price.toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                          data-testid={`remove-item-${index}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Custos Adicionais</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mão de Obra (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                  className="input-field"
                  data-testid="labor-cost-input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Serviços Adicionais (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={additionalServices}
                  onChange={(e) => setAdditionalServices(e.target.value)}
                  className="input-field"
                  data-testid="services-cost-input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">BDI - Benefícios e Despesas Indiretas (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={bdiPercentage}
                  onChange={(e) => setBdiPercentage(e.target.value)}
                  className="input-field"
                  data-testid="bdi-input"
                  placeholder="Ex: 25.00"
                />
                <p className="text-xs text-slate-500 mt-1">Percentual aplicado sobre o subtotal com serviços</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  data-testid="notes-input"
                  rows="3"
                  placeholder="Observações adicionais sobre o orçamento"
                />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-slate-50">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Resumo do Orçamento</h3>
            <div className="space-y-3" data-testid="budget-summary">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal (Materiais):</span>
                <span className="font-semibold">R$ {totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Mão de Obra:</span>
                <span className="font-semibold">R$ {totals.labor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Serviços Adicionais:</span>
                <span className="font-semibold">R$ {totals.services.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-sm pt-2 border-t border-slate-200">
                <span>Subtotal com Serviços:</span>
                <span className="font-semibold">R$ {totals.subtotalWithServices.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>BDI ({totals.bdi.toFixed(2)}%):</span>
                <span className="font-semibold">R$ {totals.bdiValue.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-slate-300 pt-3 flex justify-between text-slate-900 text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-blue-600">R$ {totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/budgets')}
            className="btn-secondary"
            data-testid="cancel-budget-btn"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            data-testid="save-budget-btn"
          >
            <Save size={20} />
            Salvar Orçamento
          </button>
        </div>
      </form>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="add-item-modal">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-slate-800">Adicionar Item ao Orçamento</h3>
                <button onClick={() => { setShowAddModal(false); setSearchTerm(''); }} className="text-slate-600 hover:text-slate-800">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              
              <div className="flex gap-2 mb-4">
                <select
                  value={selectedType}
                  onChange={(e) => { setSelectedType(e.target.value); setSearchTerm(''); }}
                  className="input-field flex-1"
                  data-testid="item-type-select"
                >
                  <option value="poles">Postes</option>
                  <option value="medium_voltage_structures">Estruturas Média Tensão</option>
                  <option value="low_voltage_structures">Estruturas Baixa Tensão</option>
                  <option value="conductors">Condutores</option>
                  <option value="equipment">Equipamentos</option>
                </select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por código ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                    data-testid="search-item-input"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getFilteredItems().map((item) => (
                  <div
                    key={item.id}
                    className="card hover:shadow-lg cursor-pointer transition-all"
                    onClick={() => addItem(item, selectedType)}
                    data-testid={`selectable-item-${item.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{item.code}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {item.description || `${item.type || ''} ${item.height || ''}m ${item.capacity || ''}daN`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">R$ {(item.total_price || item.unit_price).toFixed(2)}</p>
                        <p className="text-xs text-slate-500">
                          {selectedType === 'conductors' ? 'por metro' : 
                           selectedType === 'medium_voltage_structures' || selectedType === 'low_voltage_structures' ? 'estrutura completa' : 
                           'unitário'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {getFilteredItems().length === 0 && (
                  <div className="col-span-2 text-center py-12 text-slate-500">
                    <p>Nenhum item encontrado. Cadastre itens antes de criar orçamentos.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetCreation;