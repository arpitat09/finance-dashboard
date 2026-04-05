import { LayoutDashboard, ArrowLeftRight, Lightbulb, Moon, Sun } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Sidebar({ isOpen, onClose }) {
  const { role, setRole, darkMode, toggleTheme } = useStore();

  const handleNav = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    onClose();
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} style={{zIndex: 39}} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="px-5 py-5 pb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0" style={{background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: '#0B0D13', fontFamily: "'Space Grotesk'"}}>F</div>
          <span className="font-semibold text-lg" style={{fontFamily: "'Space Grotesk'", color: 'var(--fg)'}}>FinVault</span>
        </div>
        
        <nav className="flex-1 px-3 flex flex-col gap-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'transactions', icon: ArrowLeftRight, label: 'Transactions' },
            { id: 'insights', icon: Lightbulb, label: 'Insights' },
          ].map(item => (
            <button key={item.id} onClick={() => handleNav(item.id)} className="nav-item">
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t flex flex-col gap-2.5" style={{borderColor: 'var(--border)'}}>
          <div className="flex rounded-lg p-[2px]" style={{background: 'var(--bg-tertiary)'}}>
            {['admin', 'viewer'].map(r => (
              <button key={r} onClick={() => setRole(r)} className="flex-1 py-[6px] rounded-md text-[11px] font-bold transition-all border-none cursor-pointer" style={role === r ? {background: 'var(--accent)', color: '#0B0D13', boxShadow: '0 1px 4px rgba(var(--accent-rgb), 0.3)'} : {background: 'transparent', color: 'var(--fg-muted)'}}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={toggleTheme} className="flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer text-xs font-medium transition-colors" style={{borderColor: 'var(--border)', background: 'transparent', color: 'var(--fg-muted)'}}>
            {darkMode ? <Moon size={14} /> : <Sun size={14} />}
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>
    </>
  );
}