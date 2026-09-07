import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Timer } from '@/types';
import { FiClock, FiCheckCircle, FiPlus, FiZap } from 'react-icons/fi';
import styles from '@/components/HomePage.module.css';

function pad(n: number) { return String(Math.max(0, n)).padStart(2, '0'); }

function useCountdown(endTime: string | null | undefined) {
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0, total: 0 });
  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000));
      setRemaining({
        d: Math.floor(diff / 86400),
        h: Math.floor((diff % 86400) / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
        total: diff,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return remaining;
}

function HeroCountdown({ timer }: { timer: Timer }) {
  const r = useCountdown(timer.end_time);
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <p className={styles.heroLabel}>NEXT UP</p>
        <h2 className={styles.heroTitle}>{timer.title}</h2>
        <div className={styles.countdownGrid}>
          {[['d', 'DAYS'], ['h', 'HOURS'], ['m', 'MINUTES'], ['s', 'SECONDS']].map(([k, label]) => (
            <div key={k} className={styles.countdownCell}>
              <div className={styles.countdownNum}>{pad((r as any)[k])}</div>
              <div className={styles.countdownLabel}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/api/timers').then(r => setTimers(r.data)).catch(() => setError('Failed to load timers')).finally(() => setLoading(false));
  }, []);

  const active = timers.filter(t => t.status === 'active' || t.status === 'running');
  const completed = timers.filter(t => t.status === 'completed' || t.status === 'done');
  const featured = active.length > 0 ? active.reduce((a, b) => {
    const aEnd = a.end_time ? new Date(a.end_time).getTime() : Infinity;
    const bEnd = b.end_time ? new Date(b.end_time).getTime() : Infinity;
    return aEnd < bEnd ? a : b;
  }) : null;

  if (loading) return <div className={styles.center}>Loading...</div>;
  if (error) return <div className={styles.center}>{error}</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Overview</h1>
          <p className={styles.subtitle}>You have {active.length} active countdown{active.length !== 1 ? 's' : ''} running.</p>
        </div>
        <Link href="/newtimer" className={styles.ctaBtn}><FiPlus size={16} /> New Countdown</Link>
      </header>

      {featured && <HeroCountdown timer={featured} />}

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}><FiClock size={16} /> Active timers</div>
          <p className={styles.statValue}>{active.length}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}><FiCheckCircle size={16} /> Completed</div>
          <p className={styles.statValue}>{completed.length}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}><FiZap size={16} /> Total</div>
          <p className={styles.statValue}>{timers.length}</p>
        </div>
      </section>

      <section className={styles.listCard}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>Upcoming countdowns</h3>
          <Link href="/timers" className={styles.viewAll}>View all</Link>
        </div>
        {active.length === 0 && <p className={styles.empty}>No active countdowns yet.</p>}
        <ul className={styles.list}>
          {active.map(t => (
            <TimerRow key={t.id} timer={t} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function TimerRow({ timer }: { timer: Timer }) {
  const r = useCountdown(timer.end_time);
  const colors = ['rose', 'amber', 'emerald', 'indigo', 'violet'];
  const color = colors[timer.id % colors.length];
  return (
    <li className={styles.row}>
      <div className={styles.rowLeft}>
        <div className={`${styles.rowIcon} ${styles['icon_' + color]}`}><FiClock size={20} /></div>
        <div>
          <p className={styles.rowName}>{timer.title}</p>
          <p className={styles.rowSub}>{timer.duration_seconds}s total</p>
        </div>
      </div>
      <span className={styles.rowTime}>{r.total > 0 ? `${r.d}d ${pad(r.h)}h ${pad(r.m)}m` : 'Done'}</span>
    </li>
  );
}