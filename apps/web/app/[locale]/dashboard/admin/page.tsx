import Link from "next/link";
import { Users, Settings, Database, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">System Administration</h1>
        <p className="text-slate-500">Manage users, system settings, and database.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-800">User Management</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">Manage parent, child, and specialist accounts.</p>
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-900">1,204 Total Users</span>
            <button className="text-blue-600 hover:underline font-medium">Manage</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
              <Database size={20} />
            </div>
            <h3 className="font-bold text-slate-800">System Status</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">Database health and API status.</p>
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            All Systems Operational
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
              <AlertCircle size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Audit Logs</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">View security events and system access logs.</p>
          <button className="text-blue-600 hover:underline font-medium text-sm">View Logs</button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-bold text-yellow-800 text-sm">Maintenance Scheduled</h4>
          <p className="text-yellow-700 text-sm mt-1">System maintenance is scheduled for Sunday, Dec 28th at 02:00 UTC. Expect 15 mins downtime.</p>
        </div>
      </div>
    </div>
  );
}
