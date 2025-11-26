import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FileText, Database, Calculator, Package, Zap, Wrench, Menu, X } from "lucide-react";
import Dashboard from "./components/Dashboard";
import PolesManagement from "./components/PolesManagement";
import MediumVoltageStructures from "./components/MediumVoltageStructures";
import LowVoltageStructures from "./components/LowVoltageStructures";
import ConductorsManagement from "./components/ConductorsManagement";
import EquipmentManagement from "./components/EquipmentManagement";
import HardwareManagement from "./components/HardwareManagement";
import BudgetCreation from "./components/BudgetCreation";
import BudgetList from "./components/BudgetList";
import DropdownManager from "./components/DropdownManager";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  
  const menuItems = [
    { path: "/", icon: FileText, label: "Dashboard" },
    { path: "/poles", icon: Database, label: "Postes" },
    { path: "/medium-voltage", icon: Package, label: "Média Tensão" },
    { path: "/low-voltage", icon: Package, label: "Baixa Tensão" },
    { path: "/conductors", icon: Zap, label: "Condutores" },
    { path: "/equipment", icon: Wrench, label: "Equipamentos" },
    { path: "/budget/create", icon: Calculator, label: "Criar Orçamento" },
    { path: "/budgets", icon: FileText, label: "Orçamentos" },
    { path: "/dropdown-manager", icon: Wrench, label: "Opções dos Formulários" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white w-64 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static`}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Sistema de Orçamentação</h1>
            <button onClick={toggleSidebar} className="lg:hidden" data-testid="close-sidebar-btn">
              <X size={24} />
            </button>
          </div>
          <p className="text-sm text-slate-400 mt-1">Média Tensão</p>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="lg:hidden text-slate-700"
            data-testid="open-sidebar-btn"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-slate-800">Sistema de Orçamentação para Estruturas de Média Tensão</h2>
        </header>
        
        <main className="flex-1 overflow-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/poles" element={<PolesManagement />} />
            <Route path="/medium-voltage" element={<MediumVoltageStructures />} />
            <Route path="/low-voltage" element={<LowVoltageStructures />} />
            <Route path="/conductors" element={<ConductorsManagement />} />
            <Route path="/equipment" element={<EquipmentManagement />} />
            <Route path="/budget/create" element={<BudgetCreation />} />
            <Route path="/budgets" element={<BudgetList />} />
            <Route path="/dropdown-manager" element={<DropdownManager />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
export { API };