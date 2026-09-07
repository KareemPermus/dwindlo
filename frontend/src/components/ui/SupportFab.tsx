import React from 'react';
import { FiHelpCircle } from 'react-icons/fi';

export default function SupportFab() {
  return (
    <button
      className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 z-50"
      title="Help"
    >
      <FiHelpCircle className="w-5 h-5" />
    </button>
  );
}