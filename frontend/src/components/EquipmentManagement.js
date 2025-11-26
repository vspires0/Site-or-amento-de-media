import { useState, useEffect } from 'react';
import { Plus, Trash2, Wrench, Edit } from 'lucide-react';
import { API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

function EquipmentManagement() {
  const [equipment, setEquipment] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [equipmentCategories, setEquipmentCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: 'Chave',
    type: '',
    code: '',
    description: '',
    unit_price: ''
  });

  useEffect(() => {
    loadEquipment();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API}/dropdown-options/equipment_categories`);
      setEquipmentCategories(response.data);
      if (response.data.length > 0 && !editingId) {
        setFormData(prev => ({ ...prev, category: response.data[0].value }));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipment`);
      setEquipment(response.data);
    } catch (error) {
      toast.error('Erro ao carregar equipamentos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        unit_price: parseFloat(formData.unit_price)
      };
      
      if (editingId) {
        await axios.put(`${API}/equipment/${editingId}`, data);
        toast.success('Equipamento atualizado com sucesso!');
      } else {
        await axios.post(`${API}/equipment`, data);
        toast.success('Equipamento cadastrado com sucesso!');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ category: 'Chave', type: '', code: '', description: '', unit_price: '' });
      loadEquipment();
    } catch (error) {
      toast.error(editingId ? 'Erro ao atualizar equipamento' : 'Erro ao cadastrar equipamento');
    }
  };

  const handleEdit = (equip) => {
    setFormData({
      category: equip.category,
      type: equip.type,
      code: equip.code,
      description: equip.description,
      unit_price: equip.unit_price.toString()
    });
    setEditingId(equip.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ category: 'Chave', type: '', code: '', description: '', unit_price: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este equipamento?')) {
      try {
        await axios.delete(`${API}/equipment/${id}`);
        toast.success('Equipamento excluído com sucesso!');
        loadEquipment();
      } catch (error) {
        toast.error('Erro ao excluir equipamento');
      }
    }
  };

  return (
    <div className="fade-in" data-testid="equipment-management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Wrench className="text-red-600" />
            Gerenciamento de Equipamentos
          </h1>
          <p className="text-slate-600">Cadastre chaves, transformadores, capacitores, religadores e reguladores</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
          data-testid="add-equipment-btn"
        >
          <Plus size={20} />
          Novo Equipamento
        </button>
      </div>

      {showForm && (
        <div className="card mb-6" data-testid="equipment-form">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            {editingId ? 'Editar Equipamento' : 'Cadastrar Novo Equipamento'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                data-testid="equipment-category-input"
                required
              >
                {equipmentCategories.map(cat => (
                  <option key={cat.id} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field"
                data-testid="equipment-type-input"
                placeholder="Ex: Faca, Tandem, ET1A, BCD"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Código</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-field"
                data-testid="equipment-code-input"
                placeholder="Ex: CH-FACA-15KV"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                data-testid="equipment-description-input"
                placeholder="Descrição detalhada do equipamento"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preço Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                className="input-field"
                data-testid="equipment-price-input"
                placeholder="Ex: 2500.00"
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary flex-1" data-testid="submit-equipment-btn">
                {editingId ? 'Atualizar' : 'Cadastrar'}
              </button>
              <button type="button" onClick={handleCancelEdit} className="btn-secondary" data-testid="cancel-equipment-btn">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container" data-testid="equipment-table">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Preço (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipment.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-slate-500 py-8">
                  Nenhum equipamento cadastrado. Clique em "Novo Equipamento" para começar.
                </td>
              </tr>
            ) : (
              equipment.map((item) => (
                <tr key={item.id} data-testid={`equipment-row-${item.id}`}>
                  <td className="font-medium">{item.code}</td>
                  <td>{item.category}</td>
                  <td>{item.type}</td>
                  <td>{item.description}</td>
                  <td>R$ {item.unit_price.toFixed(2)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        data-testid={`edit-equipment-${item.id}`}
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        data-testid={`delete-equipment-${item.id}`}
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EquipmentManagement;