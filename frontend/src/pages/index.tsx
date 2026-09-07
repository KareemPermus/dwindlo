import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/api/client';
import { Timer } from '@/types';
import Link from 'next/link';
import { FiClock, FiCheckCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import styles from '@/styles/home.module.css';

function pad(n: number) { return String(Math.max(0, Math.floor(n))).padStart(2, '0'); }

function timeLeft(timer: Timer) {
  if (!timer.end_time) return { d: 0, h: 0, m: 0, s: 0, total: 0 };
  const diff = Math.max(0, (new Date(timer.end_time).getTime() - Date.now()) / 1000);
  return { d: Math.floor(diff / 86400), h: Math.floor((diff % 86400) / 3600), m: Math.floor((diff % 3600) / 60), s: Math.floor(diff % 60), total: diff };
}

function CountdownDisplay({ timer }: { timer: Timer }) {
  const [t, setT] = useState(timeLeft(timer));
  useEffect(() => {
    const iv = setInterval(() => setT(timeLeft(timer)), 1000);
    return () => clearInterval(iv);
  }, [timer]);
  return (
    <div className={styles.heroDigits}>
      {[['d', 'DAYS'], ['h', 'HOURS'], ['m', 'MINUTES'], ['s', 'SECONDS']].map(([k, label]) => (
        <div key={k} className={styles.digitBox}>
          <div className={styles.digitValue}>{pad((t as any)[k])}</div>
          <div className={styles.digitLabel}>{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    apiClient.get('/api/timers').then(r => { setTimers(r.data); setError(''); }).catch(() => setError('Failed to load timers')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeTimers = timers.filter(t => t.status === 'active');
  const completedTimers = timers.filter(t => t.status === 'completed');
  const featured = activeTimers.length > 0 ? activeTimers.reduce((a, b) => {
    const aEnd = a.end_time ? new Date(a.end_time).getTime() : Infinity;
    const bEnd = b.end_time ? new Date(b.end_time).getTime() : Infinity;
    return aEnd < bEnd ? a : b;
  }) : null;

  const handleDelete = async (id: number) => {
    try { await apiClient.delete(`/api/timers/${id}`); load(); } catch { /* ignore */ }
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>You have {activeTimers.length} active countdown{activeTimers.length !== 1 ? 's' : ''} running.</p>
        </div>
        <Link href="/newtimer" className={styles.newBtn}><FiPlus size={16} /> New Countdown</Link>
      </header>

      {featured && (
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.heroLabel}>NEXT UP</p>
            <h2 className={styles.heroTitle}>{featured.title}</h2>
            <CountdownDisplay timer={featured} />
          </div>
        </section>
      )}

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}><FiClock size={14} /> Active timers</div>
          <p className={styles.statValue}>{activeTimers.length}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}><FiCheckCircle size={14} /> Completed</div>
          <p className={styles.statValue}>{completedTimers.length}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}><FiClock size={14} /> Total</div>
          <p className={styles.statValue}>{timers.length}</p>
        </div>
      </section>

      <section className={styles.listCard}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>Upcoming countdowns</h3>
          <Link href="/timers" className={styles.viewAll}>View all</Link>
        </div>
        {activeTimers.length === 0 && <p className={styles.empty}>No active timers. Create one!</p>}
        <ul className={styles.list}>
          {activeTimers.map(timer => {
            const t = timeLeft(timer);
            return (
              <li key={timer.id} className={styles.listItem}>
                <div className={styles.listItemLeft}>
                  <div className={styles.listIcon}><FiClock size={18} /></div>
                  <div>
                    <p className={styles.listItemTitle}>{timer.title}</p>
                    <p className={styles.listItemSub}>{timer.duration_seconds}s duration</p>
                  </div>
                </div>
                <div className={styles.listItemRight}>
                  <span className={styles.countdown}>{t.d > 0 ? `${t.d}d ` : ''}{pad(t.h)}h {pad(t.m)}m</span>
                  <button onClick={() => handleDelete(timer.id)} className={styles.deleteBtn}><FiTrash2 size={14} /></button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}