import { useState, useEffect } from 'react';
import { Plus, Trash2, Settings } from 'lucide-react';
import { API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

function DropdownManager() {
  const [options, setOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('pole_types');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    value: '',
    label: ''
  });

  const categories = [
    { value: 'pole_types', label: 'Tipos de Postes' },
    { value: 'conductor_types', label: 'Tipos de Condutores' },
    { value: 'conductor_insulation', label: 'Isolamento de Condutores' },
    { value: 'conductor_configuration', label: 'Configuração de Condutores' },
    { value: 'equipment_categories', label: 'Categorias de Equipamentos' }
  ];

  useEffect(() => {
    loadOptions();
  }, [selectedCategory]);

  const loadOptions = async () => {
    try {
      const response = await axios.get(`${API}/dropdown-options/${selectedCategory}`);
      setOptions(response.data);
    } catch (error) {
      toast.error('Erro ao carregar opções');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/dropdown-options`, {
        category: selectedCategory,
        value: formData.value,
        label: formData.label
      });
      toast.success('Opção adicionada com sucesso!');
      setShowForm(false);
      setFormData({ value: '', label: '' });
      loadOptions();
    } catch (error) {
      toast.error('Erro ao adicionar opção');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta opção?')) {
      try {
        await axios.delete(`${API}/dropdown-options/${id}`);
        toast.success('Opção excluída com sucesso!');
        loadOptions();
      } catch (error) {
        toast.error('Erro ao excluir opção');
      }
    }
  };

  const getCategoryLabel = (value) => {
    const category = categories.find(c => c.value === value);
    return category ? category.label : value;
  };

  return (
    <div className="fade-in" data-testid="dropdown-manager">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Settings className="text-purple-600" />
          Gerenciar Opções dos Formulários
        </h1>
        <p className="text-slate-600">Configure as opções disponíveis nas listas suspensas dos formulários</p>
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setShowForm(false);
              }}
              className="input-field max-w-md"
              data-testid="category-select"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
            data-testid="add-option-btn"
          >
            <Plus size={20} />
            Nova Opção
          </button>
        </div>

        {showForm && (
          <div className="border-t border-slate-200 pt-4 mt-4" data-testid="option-form">
            <h3 className="text-lg font-bold text-slate-800 mb-3">
              Adicionar Opção para {getCategoryLabel(selectedCategory)}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Valor (Código)</label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="input-field"
                  data-testid="option-value-input"
                  placeholder="Ex: Aco"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Label (Texto exibido)</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="input-field"
                  data-testid="option-label-input"
                  placeholder="Ex: Aço Galvanizado"
                  required
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className="btn-primary" data-testid="submit-option-btn">
                  Adicionar
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ value: '', label: '' });
                  }} 
                  className="btn-secondary"
                  data-testid="cancel-option-btn"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          Opções de {getCategoryLabel(selectedCategory)}
        </h3>
        <div className="table-container" data-testid="options-table">
          <table>
            <thead>
              <tr>
                <th>Valor</th>
                <th>Label</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {options.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-slate-500 py-8">
                    Nenhuma opção cadastrada. Clique em "Nova Opção" para adicionar.
                  </td>
                </tr>
              ) : (
                options.map((option) => (
                  <tr key={option.id} data-testid={`option-row-${option.id}`}>
                    <td className="font-medium">{option.value}</td>
                    <td>{option.label}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(option.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        data-testid={`delete-option-${option.id}`}
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DropdownManager;
