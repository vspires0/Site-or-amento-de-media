import { useState, useEffect } from 'react';
import { Plus, Trash2, Wrench } from 'lucide-react';
import { API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

function HardwareManagement() {
  const [hardware, setHardware] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Braçadeira',
    description: '',
    code: '',
    unit_price: ''
  });

  useEffect(() => {
    loadHardware();
  }, []);

  const loadHardware = async () => {
    try {
      const response = await axios.get(`${API}/hardware`);
      setHardware(response.data);
    } catch (error) {
      toast.error('Erro ao carregar ferragens');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/hardware`, {
        ...formData,
        unit_price: parseFloat(formData.unit_price)
      });
      toast.success('Ferragem cadastrada com sucesso!');
      setShowForm(false);
      setFormData({ category: 'Braçadeira', description: '', code: '', unit_price: '' });
      loadHardware();
    } catch (error) {
      toast.error('Erro ao cadastrar ferragem');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta ferragem?')) {
      try {
        await axios.delete(`${API}/hardware/${id}`);
        toast.success('Ferragem excluída com sucesso!');
        loadHardware();
      } catch (error) {
        toast.error('Erro ao excluir ferragem');
      }
    }
  };

  return (
    <div className="fade-in" data-testid="hardware-management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Wrench className="text-indigo-600" />
            Gerenciamento de Ferragens
          </h1>
          <p className="text-slate-600">Cadastre braçadeiras, para-raios, isoladores e acessórios</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
          data-testid="add-hardware-btn"
        >
          <Plus size={20} />
          Nova Ferragem
        </button>
      </div>

      {showForm && (
        <div className="card mb-6" data-testid="hardware-form">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Cadastrar Nova Ferragem</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                data-testid="hardware-category-input"
                required
              >
                <option value="Braçadeira">Braçadeira</option>
                <option value="Para-raios">Para-raios</option>
                <option value="Isolador">Isolador</option>
                <option value="Acessório">Acessório</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Código</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-field"
                data-testid="hardware-code-input"
                placeholder="Ex: BR-50MM"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                data-testid="hardware-description-input"
                placeholder="Descrição detalhada da ferragem"
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
                data-testid="hardware-price-input"
                placeholder="Ex: 45.00"
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary flex-1" data-testid="submit-hardware-btn">Cadastrar</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" data-testid="cancel-hardware-btn">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container" data-testid="hardware-table">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Preço (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {hardware.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-slate-500 py-8">
                  Nenhuma ferragem cadastrada. Clique em "Nova Ferragem" para começar.
                </td>
              </tr>
            ) : (
              hardware.map((item) => (
                <tr key={item.id} data-testid={`hardware-row-${item.id}`}>
                  <td className="font-medium">{item.code}</td>
                  <td>{item.category}</td>
                  <td>{item.description}</td>
                  <td>R$ {item.unit_price.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      data-testid={`delete-hardware-${item.id}`}
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

export default HardwareManagement;