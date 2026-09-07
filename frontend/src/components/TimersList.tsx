import { useEffect, useState } from 'react';
import { Timer } from '@/types';
import { FiClock, FiTrash2 } from 'react-icons/fi';

function useCountdown(timer: Timer) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const calc = () => {
      if (timer.status === 'completed') { setRemaining('Done'); return; }
      if (!timer.end_time) {
        const h = Math.floor(timer.duration_seconds / 3600);
        const m = Math.floor((timer.duration_seconds % 3600) / 60);
        const s = timer.duration_seconds % 60;
        setRemaining(`${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`);
        return;
      }
      const diff = Math.max(0, Math.floor((new Date(timer.end_time).getTime() - Date.now()) / 1000));
      if (diff <= 0) { setRemaining('Done'); return; }
      const d = Math.floor(diff / 86400);
      const h = Math.floor((diff % 86400) / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setRemaining(d > 0 ? `${d}d ${String(h).padStart(2,'0')}h` : `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`);
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [timer]);

  return remaining;
}

const colors = [
  { bg: 'bg-rose-100', text: 'text-rose-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
  { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
];

function TimerRow({ timer, index, onDelete }: { timer: Timer; index: number; onDelete: (id: number) => void }) {
  const remaining = useCountdown(timer);
  const c = colors[index % colors.length];

  return (
    <li className="flex items-center justify-between px-6 py-4 group">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
          <FiClock className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-slate-800">{timer.title}</p>
          <p className="text-xs text-slate-400">{timer.status}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-semibold text-slate-700 tabular-nums tracking-tight">{remaining}</span>
        <button
          onClick={() => onDelete(timer.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
          aria-label={`Delete ${timer.title}`}
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
}

export default function TimersList({ timers, onDelete }: { timers: Timer[]; onDelete: (id: number) => void }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">All Timers</h3>
      </div>
      <ul className="divide-y divide-slate-100">
        {timers.map((t, i) => (
          <TimerRow key={t.id} timer={t} index={i} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  );
}