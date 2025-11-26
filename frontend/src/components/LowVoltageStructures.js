import { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { API } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

function LowVoltageStructures() {
  const [structures, setStructures] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    try {
      const response = await axios.get(`${API}/low-voltage-structures`);
      setStructures(response.data);
    } catch (error) {
      toast.error('Erro ao carregar estruturas');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="fade-in" data-testid="low-voltage-structures">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Package className="text-green-600" />
          Estruturas de Baixa Tensão
        </h1>
        <p className="text-slate-600">Estruturas para redes de distribuição de baixa tensão (220V/380V)</p>
      </div>

      <div className="space-y-4">
        {structures.length === 0 ? (
          <div className="card text-center py-12 text-slate-500">
            <p>Nenhuma estrutura cadastrada.</p>
          </div>
        ) : (
          structures.map((structure) => (
            <div
              key={structure.id}
              className="card hover:shadow-xl transition-shadow"
              data-testid={`structure-${structure.code}`}
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(structure.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-lg">
                      {structure.code}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{structure.description}</h3>
                      <p className="text-sm text-slate-600">
                        Classe: {structure.voltage_class} | {structure.materials.length} materiais
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Preço Total</p>
                    <p className="text-2xl font-bold text-green-600">R$ {structure.total_price.toFixed(2)}</p>
                  </div>
                  <button className="text-slate-600 hover:text-slate-800" data-testid={`expand-${structure.code}`}>
                    {expandedId === structure.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </button>
                </div>
              </div>

              {expandedId === structure.id && (
                <div className="mt-6 pt-6 border-t border-slate-200" data-testid={`materials-${structure.code}`}>
                  <h4 className="text-lg font-bold text-slate-800 mb-4">Lista de Materiais</h4>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Descrição</th>
                          <th>Unidade</th>
                          <th>Quantidade</th>
                          <th>Preço Unit.</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {structure.materials.map((material, index) => (
                          <tr key={index}>
                            <td className="font-medium">{material.code}</td>
                            <td>{material.description}</td>
                            <td>{material.unit}</td>
                            <td>{material.quantity}</td>
                            <td>R$ {material.unit_price.toFixed(2)}</td>
                            <td className="font-semibold">R$ {(material.quantity * material.unit_price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan="5" className="text-right">Total da Estrutura:</td>
                          <td className="text-green-600 text-lg">R$ {structure.total_price.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LowVoltageStructures;