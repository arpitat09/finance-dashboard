import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Toast() {
  const { toasts } = useStore();
  const icons = { success: CheckCircle, error: AlertCircle, info: Info };
  
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      {toasts.map(t => {
        const Icon = icons[t.type] || Info;
        return (
          <div key={t.id} className="flex items-center gap-2 px-5 py-3 rounded-[10px] text-[13px] font-medium shadow-lg" style={{background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--fg)', borderLeft: `3px solid var(--${t.type === 'info' ? 'accent' : t.type})`, animation: 'toastIn 0.3s ease'}}>
            <Icon size={16} style={{flexShrink:0}} />
            {t.message}
          </div>
        );
      })}
    </div>
  );
}