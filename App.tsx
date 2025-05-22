
import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import ThemeToggleButton from './components/ThemeToggleButton';
import CpuSchedulingSimulator from './components/cpu/CpuSchedulingSimulator';
import MemoryManagementSimulator from './components/memory/MemoryManagementSimulator';
import DiskSchedulingSimulator from './components/disk/DiskSchedulingSimulator';
import DeadlockSimulator from './components/deadlock/DeadlockSimulator';

type SimulatorType = 'cpu' | 'memory' | 'disk' | 'deadlock';

interface NavItemProps {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
  >
    <i className={`fas ${icon} mr-2 w-5 text-center`}></i>
    {label}
  </button>
);

const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const [activeSimulator, setActiveSimulator] = useState<SimulatorType>('cpu');

  const renderActiveSimulator = () => {
    switch (activeSimulator) {
      case 'cpu':
        return <CpuSchedulingSimulator />;
      case 'memory':
        return <MemoryManagementSimulator />;
      case 'disk':
        return <DiskSchedulingSimulator />;
      case 'deadlock':
        return <DeadlockSimulator />;
      default:
        return <CpuSchedulingSimulator />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
              <i className="fas fa-cogs mr-2 sm:mr-3"></i> OS Concepts Simulator Suite
            </h1>
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
          </div>
          <nav className="flex space-x-1 sm:space-x-2 pb-2 overflow-x-auto">
            <NavItem label="CPU Scheduling" icon="fa-microchip" isActive={activeSimulator === 'cpu'} onClick={() => setActiveSimulator('cpu')} />
            <NavItem label="Memory Mgmt" icon="fa-memory" isActive={activeSimulator === 'memory'} onClick={() => setActiveSimulator('memory')} />
            <NavItem label="Disk Scheduling" icon="fa-hdd" isActive={activeSimulator === 'disk'} onClick={() => setActiveSimulator('disk')} />
            <NavItem label="Deadlock" icon="fa-lock" isActive={activeSimulator === 'deadlock'} onClick={() => setActiveSimulator('deadlock')} />
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 max-w-full">
        {renderActiveSimulator()}
      </main>
      
      <footer className="text-center py-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
        OS Concepts Simulator Suite &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
