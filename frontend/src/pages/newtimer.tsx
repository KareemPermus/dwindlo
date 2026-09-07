import { useState } from 'react';
import { useRouter } from 'next/router';
import apiClient from '@/api/client';
import styles from '@/components/NewTimerPage.module.css';

export default function NewTimer() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const duration_seconds = hours * 3600 + minutes * 60 + seconds;
    if (!title.trim()) { setError('Title is required'); return; }
    if (duration_seconds <= 0) { setError('Duration must be greater than 0'); return; }
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/api/timers', { title: title.trim(), duration_seconds });
      router.push('/timers');
    } catch {
      setError('Failed to create timer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>New Countdown</h1>
        <p className={styles.subtitle}>Set up a new countdown timer</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.card}>
        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>Timer Name</label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. Product Launch"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <label className={styles.label}>Duration</label>
        <div className={styles.durationRow}>
          <div className={styles.durationField}>
            <input type="number" min={0} max={999} value={hours} onChange={e => setHours(+e.target.value)} className={styles.input} />
            <span className={styles.durationLabel}>Hours</span>
          </div>
          <div className={styles.durationField}>
            <input type="number" min={0} max={59} value={minutes} onChange={e => setMinutes(+e.target.value)} className={styles.input} />
            <span className={styles.durationLabel}>Minutes</span>
          </div>
          <div className={styles.durationField}>
            <input type="number" min={0} max={59} value={seconds} onChange={e => setSeconds(+e.target.value)} className={styles.input} />
            <span className={styles.durationLabel}>Seconds</span>
          </div>
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Creating…' : 'Create Countdown'}
        </button>
      </form>
    </div>
  );
}