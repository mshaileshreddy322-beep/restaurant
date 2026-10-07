import React from 'react';
import {
  LayoutDashboard,
  Table,
  Smile,
  FlaskConical,
  Users,
  Brain,
  Sparkles,
  BarChart3,
  FileCheck2,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { TabType } from '../types';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  isPrimary?: boolean;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, records } = useData();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'dataset',
      label: 'Dataset',
      icon: <Table className="w-4 h-4" />,
      badge: records.length > 0 ? `${records.length}` : undefined,
    },
    {
      id: 'satisfaction',
      label: 'Satisfaction Analysis',
      icon: <Smile className="w-4 h-4" />,
    },
    {
      id: 'hypothesis',
      label: 'Hypothesis Testing',
      icon: <FlaskConical className="w-4 h-4" />,
      badge: 'Core Stat',
      isPrimary: true,
    },
    {
      id: 'customer',
      label: 'Customer Analysis',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'ml',
      label: 'Machine Learning',
      icon: <Brain className="w-4 h-4" />,
      badge: 'RF',
    },
    {
      id: 'prediction',
      label: 'Prediction',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'visualizations',
      label: 'Visualizations',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'conclusion',
      label: 'Final Conclusion',
      icon: <FileCheck2 className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900/70 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-4 flex-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Navigation Modules
        </div>

        <nav className="space-y-1 mt-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={
                      isActive
                        ? 'text-indigo-400'
                        : item.isPrimary
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      item.isPrimary
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* College Project Info Banner */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Project Specification
        </div>
        <div className="text-slate-400 text-[11px] space-y-1">
          <p>
            <span className="text-slate-300">Hypothesis:</span> One-Sample t-Test
          </p>
          <p>
            <span className="text-slate-300">Benchmark:</span> μ₀ = 3.5
          </p>
          <p>
            <span className="text-slate-300">Significance:</span> α = 0.05
          </p>
          <p>
            <span className="text-slate-300">ML Model:</span> Random Forest
          </p>
        </div>
      </div>
    </aside>
  );
};
