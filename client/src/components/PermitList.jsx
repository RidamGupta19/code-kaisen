import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Clock, AlertTriangle, FileDown, Search, Filter, ShieldCheck, ShieldAlert, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

const PermitList = ({ isAdmin = false, departmentId = null }) => {
  const [permits, setPermits] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters State
  const [ward, setWard] = useState('');
  const [status, setStatus] = useState('');
  const [deptFilter, setDeptFilter] = useState(departmentId || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  const fetchDepartments = async () => {
    try {
      const res = await apiClient.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchPermits = async () => {
    setLoading(true);
    try {
      const params = {};
      if (ward) params.ward = ward;
      if (status) params.status = status;
      if (deptFilter) params.department = deptFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;

      const res = await apiClient.get('/permits', { params });
      if (res.data.success) {
        setPermits(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching permits:', err);
      toast.error('Failed to load permits log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchPermits();
  }, [ward, status, deptFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPermits();
  };

  const handleStatusUpdate = async (permitId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await apiClient.patch(`/permits/${permitId}/status`, {
        status: newStatus,
        remarks: `Permit request was ${newStatus.toLowerCase()} by Nodal Admin.`
      });
      if (res.data.success) {
        toast.success(`Permit successfully ${newStatus.toLowerCase()}.`);
        fetchPermits();
      }
    } catch (err) {
      toast.error(err.message || `Failed to update status to ${newStatus}.`);
    } finally {
      setActionLoading(false);
    }
  };

  const downloadCertificate = async (permitId, permitNumber) => {
    try {
      toast.info('Generating certificate PDF...');
      const res = await apiClient.get(`/permits/${permitId}/pdf`, {
        responseType: 'blob'
      });
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `permit_${permitNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Certificate downloaded successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download permit certificate.');
    }
  };

  const clearFilters = () => {
    setWard('');
    setStatus('');
    if (!departmentId) setDeptFilter('');
    setStartDate('');
    setEndDate('');
    setSearch('');
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters panel */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-850 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by road or segment name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 outline-none focus:border-gov-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Search
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-xl text-xs transition"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Ward Zone</label>
            <select
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-slate-300 outline-none focus:border-gov-500"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
            >
              <option value="">All Wards</option>
              <option value="Ward 12 (TT Nagar)">Ward 12 (TT Nagar)</option>
              <option value="Ward 45 (MP Nagar)">Ward 45 (MP Nagar)</option>
              <option value="Ward 52 (Habibganj)">Ward 52 (Habibganj)</option>
              <option value="Ward 80 (Kolar)">Ward 80 (Kolar)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Status</label>
            <select
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-slate-300 outline-none focus:border-gov-500"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Conflict">Conflict</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {!departmentId && (
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Utility Department</label>
              <select
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-slate-300 outline-none focus:border-gov-500"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Start Date</label>
            <input
              type="date"
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-slate-300 outline-none focus:border-gov-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">End Date</label>
            <input
              type="date"
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-slate-300 outline-none focus:border-gov-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Permits Log Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-850">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading permits log...</div>
        ) : permits.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No permit records match the filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 pl-2">Ref ID</th>
                  <th className="pb-3">Utility Dept</th>
                  <th className="pb-3">Road Segment</th>
                  <th className="pb-3">Ward</th>
                  <th className="pb-3">Excavation Dates</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {permits.map((permit) => {
                  let statusBadge = 'bg-slate-900 text-slate-400';
                  if (permit.status === 'Active') statusBadge = 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
                  if (permit.status === 'Conflict') statusBadge = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                  if (permit.status === 'Completed') statusBadge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                  if (permit.status === 'Approved') statusBadge = 'bg-gov-500/10 text-gov-400 border border-gov-500/20';
                  if (permit.status === 'Pending') statusBadge = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
                  if (permit.status === 'Rejected') statusBadge = 'bg-rose-500/10 text-rose-500/30 border border-rose-500/20';

                  return (
                    <tr key={permit._id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3.5 pl-2 font-mono text-slate-400">{permit.permitNumber || permit._id.substring(12)}</td>
                      <td className="py-3.5 font-semibold text-slate-300">{permit.department?.name || 'N/A'}</td>
                      <td className="py-3.5 font-semibold text-slate-200">{permit.roadName}</td>
                      <td className="py-3.5 text-slate-300">{permit.ward?.name || permit.ward || 'N/A'}</td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(permit.startDate).toLocaleDateString()} - {new Date(permit.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${statusBadge}`}>
                          {permit.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex justify-end gap-1.5">
                          {/* Nodal Approve/Reject actions */}
                          {isAdmin && permit.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(permit._id, 'Approved')}
                                disabled={actionLoading}
                                className="p-1 rounded-lg bg-emerald-950/20 hover:bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition"
                                title="Approve Request"
                              >
                                <ShieldCheck className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(permit._id, 'Rejected')}
                                disabled={actionLoading}
                                className="p-1 rounded-lg bg-rose-950/20 hover:bg-rose-950/50 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                                title="Reject Request"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {/* Download PDF button */}
                          {['Approved', 'Active', 'Completed'].includes(permit.status) && (
                            <button
                              onClick={() => downloadCertificate(permit._id, permit.permitNumber)}
                              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gov-400 hover:text-gov-300 transition"
                              title="Download PDF Certificate"
                            >
                              <FileDown className="h-4 w-4" />
                            </button>
                          )}

                          {/* Conflict manager navigation */}
                          {permit.status === 'Conflict' && (
                            <Link
                              to="/admin/conflicts"
                              className="p-1 rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 hover:text-red-300 transition"
                              title="Manage Conflicts"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermitList;
