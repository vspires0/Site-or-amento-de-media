import { useState, useEffect } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

function PrimaryStructuresManagement() {
  const [structures, setStructures] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    phases: '3',
    voltage_class: '15kV',
    network_type: 'Compacta',
    unit_price: ''
  });

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    try {
      const response = await axios.get(`${API}/primary-structures`);
      setStructures(response.data);
    } catch (error) {
      toast.error('Erro ao carregar estruturas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/primary-structures`, {
        ...formData,
        phases: parseInt(formData.phases),
        unit_price: parseFloat(formData.unit_price)
      });
      toast.success('Estrutura cadastrada com sucesso!');
      setShowForm(false);
      setFormData({ code: '', description: '', phases: '3', voltage_class: '15kV', network_type: 'Compacta', unit_price: '' });
      loadStructures();
    } catch (error) {
      toast.error('Erro ao cadastrar estrutura');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta estrutura?')) {
      try {
        await axios.delete(`${API}/primary-structures/${id}`);
        toast.success('Estrutura excluída com sucesso!');
        loadStructures();
      } catch (error) {
        toast.error('Erro ao excluir estrutura');
      }
    }
  };

  return (
    <div className="fade-in" data-testid="primary-structures-management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Package className="text-green-600" />
            Estruturas Primárias
          </h1>
          <p className="text-slate-600">Gerencie estruturas primárias para redes compactas (CE1, CE2, CE3)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
          data-testid="add-primary-structure-btn"
        >
          <Plus size={20} />
          Nova Estrutura
        </button>
      </div>

      {showForm && (
        <div className="card mb-6" data-testid="primary-structure-form">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Cadastrar Nova Estrutura Primária</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Código</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-field"
                data-testid="primary-structure-code-input"
                placeholder="Ex: CE1, CE2, CE3"
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
                data-testid="primary-structure-description-input"
                placeholder="Ex: Estrutura compacta 3 fases"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Número de Fases</label>
              <select
                value={formData.phases}
                onChange={(e) => setFormData({ ...formData, phases: e.target.value })}
                className="input-field"
                data-testid="primary-structure-phases-input"
                required
              >
                <option value="1">1 Fase</option>
                <option value="3">3 Fases</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Classe de Tensão</label>
              <select
                value={formData.voltage_class}
                onChange={(e) => setFormData({ ...formData, voltage_class: e.target.value })}
                className="input-field"
                data-testid="primary-structure-voltage-input"
                required
              >
                <option value="15kV">15 kV</option>
                <option value="36.2kV">36.2 kV</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Rede</label>
              <select
                value={formData.network_type}
                onChange={(e) => setFormData({ ...formData, network_type: e.target.value })}
                className="input-field"
                data-testid="primary-structure-network-input"
                required
              >
                <option value="Compacta">Compacta</option>
                <option value="Convencional">Convencional</option>
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
                data-testid="primary-structure-price-input"
                placeholder="Ex: 1250.00"
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary flex-1" data-testid="submit-primary-structure-btn">Cadastrar</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" data-testid="cancel-primary-structure-btn">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container" data-testid="primary-structures-table">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Fases</th>
              <th>Tensão</th>
              <th>Tipo de Rede</th>
              <th>Preço (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {structures.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-slate-500 py-8">
                  Nenhuma estrutura cadastrada. Clique em "Nova Estrutura" para começar.
                </td>
              </tr>
            ) : (
              structures.map((structure) => (
                <tr key={structure.id} data-testid={`primary-structure-row-${structure.id}`}>
                  <td className="font-medium">{structure.code}</td>
                  <td>{structure.description}</td>
                  <td>{structure.phases}</td>
                  <td>{structure.voltage_class}</td>
                  <td>{structure.network_type}</td>
                  <td>R$ {structure.unit_price.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(structure.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      data-testid={`delete-primary-structure-${structure.id}`}
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

export default PrimaryStructuresManagement;