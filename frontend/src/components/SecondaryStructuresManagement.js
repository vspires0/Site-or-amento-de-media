import { useState, useEffect } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

function SecondaryStructuresManagement() {
  const [structures, setStructures] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    conductor_count: '',
    network_type: 'Convencional',
    unit_price: ''
  });

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    try {
      const response = await axios.get(`${API}/secondary-structures`);
      setStructures(response.data);
    } catch (error) {
      toast.error('Erro ao carregar estruturas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/secondary-structures`, {
        ...formData,
        conductor_count: parseInt(formData.conductor_count),
        unit_price: parseFloat(formData.unit_price)
      });
      toast.success('Estrutura cadastrada com sucesso!');
      setShowForm(false);
      setFormData({ code: '', description: '', conductor_count: '', network_type: 'Convencional', unit_price: '' });
      loadStructures();
    } catch (error) {
      toast.error('Erro ao cadastrar estrutura');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta estrutura?')) {
      try {
        await axios.delete(`${API}/secondary-structures/${id}`);
        toast.success('Estrutura excluída com sucesso!');
        loadStructures();
      } catch (error) {
        toast.error('Erro ao excluir estrutura');
      }
    }
  };

  return (
    <div className="fade-in" data-testid="secondary-structures-management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Package className="text-purple-600" />
            Estruturas Secundárias
          </h1>
          <p className="text-slate-600">Gerencie estruturas secundárias (M1, M2, M3) - Convencionais e Multiplexadas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
          data-testid="add-secondary-structure-btn"
        >
          <Plus size={20} />
          Nova Estrutura
        </button>
      </div>

      {showForm && (
        <div className="card mb-6" data-testid="secondary-structure-form">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Cadastrar Nova Estrutura Secundária</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Código</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-field"
                data-testid="secondary-structure-code-input"
                placeholder="Ex: M1, M2, M3"
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
                data-testid="secondary-structure-description-input"
                placeholder="Ex: Estrutura secundária com 4 condutores"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Número de Condutores</label>
              <input
                type="number"
                value={formData.conductor_count}
                onChange={(e) => setFormData({ ...formData, conductor_count: e.target.value })}
                className="input-field"
                data-testid="secondary-structure-conductors-input"
                placeholder="Ex: 4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Rede</label>
              <select
                value={formData.network_type}
                onChange={(e) => setFormData({ ...formData, network_type: e.target.value })}
                className="input-field"
                data-testid="secondary-structure-network-input"
                required
              >
                <option value="Convencional">Convencional</option>
                <option value="Multiplexado">Multiplexado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preço Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                className="input-field"
                data-testid="secondary-structure-price-input"
                placeholder="Ex: 680.00"
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary flex-1" data-testid="submit-secondary-structure-btn">Cadastrar</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" data-testid="cancel-secondary-structure-btn">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container" data-testid="secondary-structures-table">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Nº Condutores</th>
              <th>Tipo de Rede</th>
              <th>Preço (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {structures.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-slate-500 py-8">
                  Nenhuma estrutura cadastrada. Clique em "Nova Estrutura" para começar.
                </td>
              </tr>
            ) : (
              structures.map((structure) => (
                <tr key={structure.id} data-testid={`secondary-structure-row-${structure.id}`}>
                  <td className="font-medium">{structure.code}</td>
                  <td>{structure.description}</td>
                  <td>{structure.conductor_count}</td>
                  <td>{structure.network_type}</td>
                  <td>R$ {structure.unit_price.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(structure.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      data-testid={`delete-secondary-structure-${structure.id}`}
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
  );
}

export default SecondaryStructuresManagement;