import { useState, useEffect } from 'react';
import { FileText, Eye, Trash2, Download } from 'lucide-react';
import { API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

function BudgetList() {
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const response = await axios.get(`${API}/budgets`);
      setBudgets(response.data);
    } catch (error) {
      toast.error('Erro ao carregar orçamentos');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este orçamento?')) {
      try {
        await axios.delete(`${API}/budgets/${id}`);
        toast.success('Orçamento excluído com sucesso!');
        loadBudgets();
      } catch (error) {
        toast.error('Erro ao excluir orçamento');
      }
    }
  };

  const viewDetails = async (id) => {
    try {
      const response = await axios.get(`${API}/budgets/${id}`);
      setSelectedBudget(response.data);
      setShowDetails(true);
    } catch (error) {
      toast.error('Erro ao carregar detalhes do orçamento');
    }
  };

  const exportToPDF = async (budget) => {
    try {
      toast.info('Gerando PDF...');
      
      const response = await axios.get(`${API}/budgets/${budget.id}/export-pdf`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orcamento_${budget.project_name.replace(/\s+/g, '_')}_${budget.id.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fade-in" data-testid="budget-list">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <FileText className="text-teal-600" />
          Orçamentos
        </h1>
        <p className="text-slate-600">Visualize e gerencie orçamentos criados</p>
      </div>

      <div className="table-container" data-testid="budgets-table">
        <table>
          <thead>
            <tr>
              <th>Projeto</th>
              <th>Cliente</th>
              <th>Total (R$)</th>
              <th>Itens</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {budgets.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-slate-500 py-8">
                  Nenhum orçamento cadastrado. Crie seu primeiro orçamento em "Criar Orçamento".
                </td>
              </tr>
            ) : (
              budgets.map((budget) => (
                <tr key={budget.id} data-testid={`budget-row-${budget.id}`}>
                  <td className="font-medium">{budget.project_name}</td>
                  <td>{budget.client_name}</td>
                  <td className="font-semibold text-blue-600">R$ {budget.total.toFixed(2)}</td>
                  <td>{budget.items.length}</td>
                  <td className="text-sm text-slate-600">{formatDate(budget.created_at)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewDetails(budget.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        data-testid={`view-budget-${budget.id}`}
                        title="Visualizar detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => exportToPDF(budget)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        data-testid={`export-budget-${budget.id}`}
                        title="Exportar PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        data-testid={`delete-budget-${budget.id}`}
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

      {/* Details Modal */}
      {showDetails && selectedBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="budget-details-modal">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedBudget.project_name}</h3>
                  <p className="text-slate-600">Cliente: {selectedBudget.client_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => exportToPDF(selectedBudget)}
                    className="btn-primary flex items-center gap-2"
                    data-testid="export-pdf-modal-btn"
                  >
                    <Download size={18} />
                    Exportar PDF
                  </button>
                  <button onClick={() => setShowDetails(false)} className="text-slate-600 hover:text-slate-800">
                    <FileText size={24} className="rotate-45" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="mb-6">
                <h4 className="text-lg font-bold text-slate-800 mb-3">Lista de Materiais</h4>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Descrição</th>
                        <th>Tipo</th>
                        <th>Qtd</th>
                        <th>Preço Unit.</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBudget.items.map((item, index) => (
                        <tr key={index}>
                          <td className="font-medium">{item.code}</td>
                          <td>{item.description}</td>
                          <td className="text-sm text-slate-600">{item.item_type}</td>
                          <td>{item.quantity}</td>
                          <td>R$ {item.unit_price.toFixed(2)}</td>
                          <td className="font-semibold">R$ {item.total_price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card bg-slate-50">
                  <h4 className="text-lg font-bold text-slate-800 mb-3">Resumo Financeiro</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Subtotal (Materiais):</span>
                      <span className="font-semibold">R$ {selectedBudget.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Mão de Obra:</span>
                      <span className="font-semibold">R$ {selectedBudget.labor_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Serviços Adicionais:</span>
                      <span className="font-semibold">R$ {selectedBudget.additional_services.toFixed(2)}</span>
                    </div>
                    {selectedBudget.bdi_percentage > 0 && (
                      <div className="flex justify-between text-slate-700 border-t border-slate-200 pt-2">
                        <span>BDI ({selectedBudget.bdi_percentage.toFixed(2)}%):</span>
                        <span className="font-semibold">R$ {selectedBudget.bdi_value.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-slate-300 pt-2 flex justify-between text-lg">
                      <span className="font-bold text-slate-900">Total:</span>
                      <span className="font-bold text-blue-600">R$ {selectedBudget.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="card bg-blue-50">
                  <h4 className="text-lg font-bold text-slate-800 mb-3">Informações Adicionais</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-semibold text-slate-700">Data de Criação:</span>
                      <p className="text-slate-800">{formatDate(selectedBudget.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-700">Total de Itens:</span>
                      <p className="text-slate-800">{selectedBudget.items.length}</p>
                    </div>
                    {selectedBudget.notes && (
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Observações:</span>
                        <p className="text-slate-800">{selectedBudget.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetList;