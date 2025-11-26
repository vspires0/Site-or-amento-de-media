import { useState, useEffect } from 'react';
import { Plus, Trash2, Zap, Edit } from 'lucide-react';
import { API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

function ConductorsManagement() {
  const [conductors, setConductors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [conductorTypes, setConductorTypes] = useState([]);
  const [insulationTypes, setInsulationTypes] = useState([]);
  const [configurationTypes, setConfigurationTypes] = useState([]);
  const [formData, setFormData] = useState({
    type: 'Cobre',
    insulation: 'XLPE',
    section: '',
    code: '',
    configuration: 'Simples',
    unit_price: ''
  });

  useEffect(() => {
    loadConductors();
    loadDropdownOptions();
  }, []);

  const loadDropdownOptions = async () => {
    try {
      const [types, insulation, config] = await Promise.all([
        axios.get(`${API}/dropdown-options/conductor_types`),
        axios.get(`${API}/dropdown-options/conductor_insulation`),
        axios.get(`${API}/dropdown-options/conductor_configuration`)
      ]);
      setConductorTypes(types.data);
      setInsulationTypes(insulation.data);
      setConfigurationTypes(config.data);
      
      if (!editingId) {
        setFormData(prev => ({
          ...prev,
          type: types.data[0]?.value || 'Cobre',
          insulation: insulation.data[0]?.value || 'XLPE',
          configuration: config.data[0]?.value || 'Simples'
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    }
  };

  const loadConductors = async () => {
    try {
      const response = await axios.get(`${API}/conductors`);
      setConductors(response.data);
    } catch (error) {
      toast.error('Erro ao carregar condutores');
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
        await axios.put(`${API}/conductors/${editingId}`, data);
        toast.success('Condutor atualizado com sucesso!');
      } else {
        await axios.post(`${API}/conductors`, data);
        toast.success('Condutor cadastrado com sucesso!');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ type: 'Cobre', insulation: 'XLPE', section: '', code: '', configuration: 'Simples', unit_price: '' });
      loadConductors();
    } catch (error) {
      toast.error(editingId ? 'Erro ao atualizar condutor' : 'Erro ao cadastrar condutor');
    }
  };

  const handleEdit = (conductor) => {
    setFormData({
      type: conductor.type,
      insulation: conductor.insulation,
      section: conductor.section,
      code: conductor.code,
      configuration: conductor.configuration,
      unit_price: conductor.unit_price.toString()
    });
    setEditingId(conductor.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ type: 'Cobre', insulation: 'XLPE', section: '', code: '', configuration: 'Simples', unit_price: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este condutor?')) {
      try {
        await axios.delete(`${API}/conductors/${id}`);
        toast.success('Condutor excluído com sucesso!');
        loadConductors();
      } catch (error) {
        toast.error('Erro ao excluir condutor');
      }
    }
  };

  return (
    <div className="fade-in" data-testid="conductors-management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Zap className="text-yellow-600" />
            Gerenciamento de Condutores
          </h1>
          <p className="text-slate-600">Cadastre condutores de cobre, alumínio e AAAC com isolação XLPE ou PVC</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
          data-testid="add-conductor-btn"
        >
          <Plus size={20} />
          Novo Condutor
        </button>
      </div>

      {showForm && (
        <div className="card mb-6" data-testid="conductor-form">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            {editingId ? 'Editar Condutor' : 'Cadastrar Novo Condutor'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field"
                data-testid="conductor-type-input"
                required
              >
                {conductorTypes.map(type => (
                  <option key={type.id} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Isolamento</label>
              <select
                value={formData.insulation}
                onChange={(e) => setFormData({ ...formData, insulation: e.target.value })}
                className="input-field"
                data-testid="conductor-insulation-input"
                required
              >
                {insulationTypes.map(type => (
                  <option key={type.id} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Seção</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="input-field"
                data-testid="conductor-section-input"
                placeholder="Ex: 4 AWG, 25 mm²"
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
                data-testid="conductor-code-input"
                placeholder="Ex: CD-CU-4AWG-XLPE"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Configuração</label>
              <select
                value={formData.configuration}
                onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
                className="input-field"
                data-testid="conductor-configuration-input"
                required
              >
                {configurationTypes.map(type => (
                  <option key={type.id} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preço Unitário (R$/m)</label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                className="input-field"
                data-testid="conductor-price-input"
                placeholder="Ex: 12.50"
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary flex-1" data-testid="submit-conductor-btn">
                {editingId ? 'Atualizar' : 'Cadastrar'}
              </button>
              <button type="button" onClick={handleCancelEdit} className="btn-secondary" data-testid="cancel-conductor-btn">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container" data-testid="conductors-table">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Isolamento</th>
              <th>Seção</th>
              <th>Configuração</th>
              <th>Preço (R$/m)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {conductors.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-slate-500 py-8">
                  Nenhum condutor cadastrado. Clique em "Novo Condutor" para começar.
                </td>
              </tr>
            ) : (
              conductors.map((conductor) => (
                <tr key={conductor.id} data-testid={`conductor-row-${conductor.id}`}>
                  <td className="font-medium">{conductor.code}</td>
                  <td>{conductor.type}</td>
                  <td>{conductor.insulation}</td>
                  <td>{conductor.section}</td>
                  <td>{conductor.configuration}</td>
                  <td>R$ {conductor.unit_price.toFixed(2)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(conductor)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        data-testid={`edit-conductor-${conductor.id}`}
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(conductor.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        data-testid={`delete-conductor-${conductor.id}`}
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

export default ConductorsManagement;