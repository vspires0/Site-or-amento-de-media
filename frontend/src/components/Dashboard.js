import { useState, useEffect } from 'react';
import { Package, Zap, Wrench, FileText, TrendingUp, Database } from 'lucide-react';
import { API } from '../App';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    poles: 0,
    primaryStructures: 0,
    secondaryStructures: 0,
    conductors: 0,
    equipment: 0,
    hardware: 0,
    budgets: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [poles, mediumVoltage, lowVoltage, conductors, equipment, budgets] = await Promise.all([
        axios.get(`${API}/poles`),
        axios.get(`${API}/medium-voltage-structures`),
        axios.get(`${API}/low-voltage-structures`),
        axios.get(`${API}/conductors`),
        axios.get(`${API}/equipment`),
        axios.get(`${API}/budgets`)
      ]);

      setStats({
        poles: poles.data.length,
        primaryStructures: mediumVoltage.data.length,
        secondaryStructures: lowVoltage.data.length,
        conductors: conductors.data.length,
        equipment: equipment.data.length,
        hardware: 0,
        budgets: budgets.data.length
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const cards = [
    { title: 'Postes', value: stats.poles, icon: Database, color: 'bg-blue-500' },
    { title: 'Estruturas Média Tensão', value: stats.primaryStructures, icon: Package, color: 'bg-blue-500' },
    { title: 'Estruturas Baixa Tensão', value: stats.secondaryStructures, icon: Package, color: 'bg-green-500' },
    { title: 'Condutores', value: stats.conductors, icon: Zap, color: 'bg-yellow-500' },
    { title: 'Equipamentos', value: stats.equipment, icon: Wrench, color: 'bg-red-500' },
    { title: 'Orçamentos', value: stats.budgets, icon: FileText, color: 'bg-teal-500' }
  ];

  return (
    <div className="fade-in" data-testid="dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">Sistema de Orçamentação para Estruturas de Média Tensão - Rede Compacta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card hover:shadow-xl transition-shadow" data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-800">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={24} />
            Sobre o Sistema
          </h3>
          <div className="space-y-3 text-slate-700">
            <p className="text-sm leading-relaxed">
              Sistema desenvolvido para otimizar o processo de orçamentação de estruturas de média tensão,
              garantindo conformidade com as normas técnicas DISNOR da Neoenergia Brasil.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Principais Funcionalidades:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Cadastro completo de componentes (postes, estruturas, condutores)</li>
                <li>Gestão de equipamentos e ferragens</li>
                <li>Criação automatizada de orçamentos</li>
                <li>Geração de relatórios detalhados</li>
                <li>Conformidade com DISNOR-012, 013, 014, 068</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="text-green-600" size={24} />
            Normas Técnicas
          </h3>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-900 mb-1">DISNOR-012</h4>
              <p className="text-sm text-blue-800">Critérios para projetos de redes aéreas</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-900 mb-1">DISNOR-013</h4>
              <p className="text-sm text-green-800">Projeto de rede compacta</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-semibold text-purple-900 mb-1">DISNOR-014</h4>
              <p className="text-sm text-purple-800">Projeto para áreas multiplexadas</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border-l-4 border-orange-500">
              <h4 className="font-semibold text-orange-900 mb-1">DISNOR-068</h4>
              <p className="text-sm text-orange-800">Construção por terceiros</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;