import { useState, useEffect } from 'react';
import { Plus, Trash2, Database, Edit } from 'lucide-react';
import { API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

function PolesManagement() {
  const [poles, setPoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [poleTypes, setPoleTypes] = useState([]);
  const [formData, setFormData] = useState({
    type: 'Concreto',
    height: '',
    capacity: '',
    code: '',
    unit_price: ''
  });

  useEffect(() => {
    loadPoles();
    loadPoleTypes();
  }, []);

  const loadPoleTypes = async () => {
    try {
      const response = await axios.get(`${API}/dropdown-options/pole_types`);
      setPoleTypes(response.data);
      if (response.data.length > 0 && !editingId) {
        setFormData(prev => ({ ...prev, type: response.data[0].value }));
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de postes:', error);
    }
  };

  const loadPoles = async () => {
    try {
      const response = await axios.get(`${API}/poles`);
      setPoles(response.data);
    } catch (error) {
      toast.error('Erro ao carregar postes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        height: parseFloat(formData.height),
        capacity: parseInt(formData.capacity),
        unit_price: parseFloat(formData.unit_price)
      };
      
      if (editingId) {
        await axios.put(`${API}/poles/${editingId}`, data);
        toast.success('Poste atualizado com sucesso!');
      } else {
        await axios.post(`${API}/poles`, data);
        toast.success('Poste cadastrado com sucesso!');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ type: 'Concreto', height: '', capacity: '', code: '', unit_price: '' });
      loadPoles();
    } catch (error) {
      toast.error(editingId ? 'Erro ao atualizar poste' : 'Erro ao cadastrar poste');
    }
  };

  const handleEdit = (pole) => {
    setFormData({
      type: pole.type,
      height: pole.height.toString(),
      capacity: pole.capacity.toString(),
      code: pole.code,
      unit_price: pole.unit_price.toString()
    });
    setEditingId(pole.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ type: 'Concreto', height: '', capacity: '', code: '', unit_price: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este poste?')) {
      try {
        await axios.delete(`${API}/poles/${id}`);
        toast.success('Poste excluído com sucesso!');
        loadPoles();
      } catch (error) {
        toast.error('Erro ao excluir poste');
      }
    }
  };

  return (
    <div className="fade-in" data-testid="poles-management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Database className="text-blue-600" />
            Gerenciamento de Postes
          </h1>
          <p className="text-slate-600">Cadastre e gerencie postes de concreto, fibra e duplo T</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
          data-testid="add-pole-btn"
        >
          <Plus size={20} />
          Novo Poste
        </button>
      </div>

      {showForm && (
        <div className="card mb-6" data-testid="pole-form">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            {editingId ? 'Editar Poste' : 'Cadastrar Novo Poste'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field"
                data-testid="pole-type-input"
                required
              >
                {poleTypes.map(type => (
                  <option key={type.id} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Código</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-field"
                data-testid="pole-code-input"
                placeholder="Ex: PC-10-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Altura (m)</label>
              <input
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="input-field"
                data-testid="pole-height-input"
                placeholder="Ex: 10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Capacidade (daN)</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="input-field"
                data-testid="pole-capacity-input"
                placeholder="Ex: 500"
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
                data-testid="pole-price-input"
                placeholder="Ex: 850.00"
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary flex-1" data-testid="submit-pole-btn">
                {editingId ? 'Atualizar' : 'Cadastrar'}
              </button>
              <button type="button" onClick={handleCancelEdit} className="btn-secondary" data-testid="cancel-pole-btn">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container" data-testid="poles-table">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Altura (m)</th>
              <th>Capacidade (daN)</th>
              <th>Preço (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {poles.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-slate-500 py-8">
                  Nenhum poste cadastrado. Clique em "Novo Poste" para começar.
                </td>
              </tr>
            ) : (
              poles.map((pole) => (
                <tr key={pole.id} data-testid={`pole-row-${pole.id}`}>
                  <td className="font-medium">{pole.code}</td>
                  <td>{pole.type}</td>
                  <td>{pole.height}</td>
                  <td>{pole.capacity}</td>
                  <td>R$ {pole.unit_price.toFixed(2)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(pole)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        data-testid={`edit-pole-${pole.id}`}
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(pole.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        data-testid={`delete-pole-${pole.id}`}
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

export default PolesManagement;