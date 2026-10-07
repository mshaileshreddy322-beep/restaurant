import React from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardTab } from './components/tabs/DashboardTab';
import { DatasetTab } from './components/tabs/DatasetTab';
import { SatisfactionTab } from './components/tabs/SatisfactionTab';
import { HypothesisTab } from './components/tabs/HypothesisTab';
import { CustomerBehaviorTab } from './components/tabs/CustomerBehaviorTab';
import { MachineLearningTab } from './components/tabs/MachineLearningTab';
import { PredictionTab } from './components/tabs/PredictionTab';
import { VisualizationsTab } from './components/tabs/VisualizationsTab';
import { ConclusionTab } from './components/tabs/ConclusionTab';
import { AlertCircle, X, Loader2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, error, clearError, isLoading } = useData();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'dataset':
        return <DatasetTab />;
      case 'satisfaction':
        return <SatisfactionTab />;
      case 'hypothesis':
        return <HypothesisTab />;
      case 'customer':
        return <CustomerBehaviorTab />;
      case 'ml':
        return <MachineLearningTab />;
      case 'prediction':
        return <PredictionTab />;
      case 'visualizations':
        return <VisualizationsTab />;
      case 'conclusion':
        return <ConclusionTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
      {/* Global Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-3 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="p-1 hover:bg-rose-500/20 rounded transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Tab View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
            <span className="text-sm font-medium">Computing Real-Time Statistics &amp; Model...</span>
          </div>
        ) : (
          renderActiveTab()
        )}
      </main>
    </div>
  );
};

export function App() {
  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </DataProvider>
  );
}

export default App;
