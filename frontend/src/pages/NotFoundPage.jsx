import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeft, Smartphone } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 font-sans">
      <div className="text-center">
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 mb-4">
          404
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">
          The page you're looking for doesn't exist in the ReTrac system, or you may not have permission to access it.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <HomeIcon className="w-4 h-4" /> Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center gap-2 transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
