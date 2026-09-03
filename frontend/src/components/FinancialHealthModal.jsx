import { X, ShieldCheck, CheckCircle2, Info } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';

export default function FinancialHealthModal({ isOpen, onClose, healthData }) {
  const { fmt } = usePreferences();
  if (!isOpen || !healthData) return null;

  const score = healthData.score || 0;
  const metrics = healthData.metrics || {};

  return (
    <div className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl animate-in relative"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-surface)] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold font-heading text-[var(--fg)]">Financial Health Score</h3>
            <p className="text-xs text-[var(--fg-muted)]">Transparent automated evaluation model</p>
          </div>
        </div>

        {/* Big Score Card */}
        <div className="p-4 rounded-xl mb-5 flex items-center justify-between border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div>
            <div className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Overall Rating</div>
            <div className="text-3xl font-extrabold font-heading text-emerald-500 mt-1">
              {score} <span className="text-base font-normal text-[var(--fg-muted)]">/ 100</span>
            </div>
            <div className="text-xs font-bold text-[var(--fg)] mt-0.5">{healthData.status}</div>
          </div>
          <div className="max-w-[200px] text-right text-xs text-[var(--fg-muted)] leading-relaxed">
            {healthData.summaryText}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
            Score Components Breakdown
          </div>

          <div className="flex flex-col gap-2 text-xs">
            {/* 1. Savings Rate */}
            <div className="p-3 rounded-xl border flex items-center justify-between" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div>
                <div className="font-semibold text-[var(--fg)]">Savings Rate ({metrics.savingsRate}%)</div>
                <div className="text-[11px] text-[var(--fg-muted)] mt-0.5">Benchmark target: 20%+ of monthly income</div>
              </div>
              <div className="font-bold text-emerald-500 font-mono-num">{metrics.savingsRateScore} / 30 pts</div>
            </div>

            {/* 2. Budget Adherence */}
            <div className="p-3 rounded-xl border flex items-center justify-between" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div>
                <div className="font-semibold text-[var(--fg)]">Budget Adherence</div>
                <div className="text-[11px] text-[var(--fg-muted)] mt-0.5">Staying within allocated category caps</div>
              </div>
              <div className="font-bold text-amber-500 font-mono-num">{metrics.budgetScore} / 25 pts</div>
            </div>

            {/* 3. Recurring Burden */}
            <div className="p-3 rounded-xl border flex items-center justify-between" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div>
                <div className="font-semibold text-[var(--fg)]">Recurring Commitment Ratio</div>
                <div className="text-[11px] text-[var(--fg-muted)] mt-0.5">Total monthly fixed subscriptions: {fmt(metrics.recurringMonthly)}</div>
              </div>
              <div className="font-bold text-sky-500 font-mono-num">{metrics.recurringScore} / 20 pts</div>
            </div>

            {/* 4. Goals Progress */}
            <div className="p-3 rounded-xl border flex items-center justify-between" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div>
                <div className="font-semibold text-[var(--fg)]">Savings Goals Trajectory</div>
                <div className="text-[11px] text-[var(--fg-muted)] mt-0.5">Milestone progress towards active goals</div>
              </div>
              <div className="font-bold text-purple-500 font-mono-num">{metrics.goalScore} / 25 pts</div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t flex items-center gap-2 text-[11px] text-[var(--fg-muted)]" style={{ borderColor: 'var(--border)' }}>
          <Info size={14} className="flex-shrink-0 text-[var(--accent)]" />
          <span>This score is an informational heuristic and does not constitute professional financial advice.</span>
        </div>
      </div>
    </div>
  );
}
