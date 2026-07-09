import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import PermitList from '../components/PermitList';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle2, Clock, AlertTriangle, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPermits = async () => {
    try {
      const res = await axios.get(`/api/permits?department=${user?.department?._id}`);
      if (res.data.success) {
        setPermits(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching department permits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.department?._id) {
      fetchPermits();
    }
  }, [user]);

  const activePermits = permits.filter(p => p.status === 'Active').length;
  const pendingPermits = permits.filter(p => p.status === 'Pending').length;
  const conflictPermits = permits.filter(p => p.status === 'Conflict').length;
  const completedPermits = permits.filter(p => p.status === 'Completed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Utility Control Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">Manage excavations, track coordination workflows, and download approved permits</p>
        </div>
        
        <Link
          to="/permits/create"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gov-600 hover:bg-gov-500 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-gov-950/20"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Request Dig Permit
        </Link>
      </div>

      {/* Stats block */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Active Excavations"
          value={activePermits}
          icon={Clock}
          description="In progress on-site"
          loading={loading}
        />
        <StatCard
          title="Pending Approval"
          value={pendingPermits}
          icon={FileText}
          description="Awaiting nodal review"
          loading={loading}
        />
        <StatCard
          title="Conflict Warnings"
          value={conflictPermits}
          icon={AlertTriangle}
          description="Clashes with other utilities"
          trend={conflictPermits > 0 ? 'Urgent' : ''}
          trendType="down"
          loading={loading}
        />
        <StatCard
          title="Completed Restorations"
          value={completedPermits}
          icon={CheckCircle2}
          description="Re-metalled and closed"
          loading={loading}
        />
      </div>

      {/* Permits Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-850 space-y-4">
        <h3 className="font-bold text-sm text-slate-200 border-b border-slate-850 pb-3 flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-gov-400" />
          Department Permits Log
        </h3>
        <PermitList isAdmin={false} departmentId={user?.department?._id} />
      </div>
    </div>
  );
};

export default DepartmentDashboard;
