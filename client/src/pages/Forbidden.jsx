import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-panel max-w-md p-8 rounded-3xl border border-slate-800 flex flex-col items-center gap-4 shadow-xl">
        <ShieldAlert className="h-16 w-16 text-rose-500" />
        <h1 className="text-3xl font-extrabold text-white tracking-tight">403 Forbidden</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Access Denied. You do not have permissions to view this resource. Your role credentials do not authorize access to this portal dashboard.
        </p>
        <Link
          to="/"
          className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-gov-600 hover:bg-gov-500 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-gov-950/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Safety
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
