import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiClock, FiHome, FiPlusCircle, FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { label: 'Overview', href: '/', icon: FiHome },
  { label: 'My Timers', href: '/timers', icon: FiClock },
  { label: 'New Countdown', href: '/newtimer', icon: FiPlusCircle },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen flex bg-slate-50 text-slate-800 overflow-hidden">
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 h-screen w-60 flex flex-col bg-white border-r border-slate-200 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <FiClock className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Dwindlo</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {navItems.map((item) => {
            const active = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                onClick={() => setOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
              U
            </div>
            <div className="text-sm">
              <p className="font-semibold leading-tight">User</p>
              <p className="text-slate-400 text-xs">Free plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden h-14 flex items-center px-4 bg-white border-b border-slate-200">
          <button onClick={() => setOpen(true)} className="p-1">
            <FiMenu className="w-6 h-6" />
          </button>
          <span className="ml-3 font-bold">Dwindlo</span>
        </div>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}