import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/api/client';
import { Timer } from '@/types';
import TimersList from '@/components/TimersList';

export default function Timers() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTimers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/timers');
      setTimers(res.data);
    } catch {
      setError('Failed to load timers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTimers(); }, [fetchTimers]);

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/timers/${id}`);
      setTimers(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('Failed to delete timer.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-semibold">{error}</p>
        <button onClick={fetchTimers} className="mt-3 text-sm text-indigo-600 font-medium hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Timers</h1>
          <p className="text-slate-500 text-sm mt-1">{timers.length} timer{timers.length !== 1 ? 's' : ''} total</p>
        </div>
      </header>

      {timers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">No timers yet. Create one to get started!</p>
        </div>
      ) : (
        <TimersList timers={timers} onDelete={handleDelete} />
      )}
    </div>
  );
}