export default function SpecialistDashboard() {
  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Patient Queue</h1>
        <p className="text-slate-500">You have 3 new assessments to review today.</p>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Active Patients</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">24</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Pending Reviews</h3>
          <p className="text-3xl font-bold text-amber-500 mt-2">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Hours Logged</h3>
          <p className="text-3xl font-bold text-blue-500 mt-2">12.5</p>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">Recent Activity</h2>
          <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="px-6 py-3 font-medium">Child Name</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">L</div>
                  <span className="font-medium text-slate-900">Leo Johnson</span>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-600">Video Assessment (Eye Contact)</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Needs Review
                </span>
              </td>
              <td className="px-6 py-4 text-slate-500 text-sm">Today, 10:23 AM</td>
              <td className="px-6 py-4">
                <button className="text-blue-600 font-medium text-sm hover:underline">Review Now</button>
              </td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs">S</div>
                  <span className="font-medium text-slate-900">Sarah Miller</span>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-600">Game Session (Memory Match)</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
              <td className="px-6 py-4 text-slate-500 text-sm">Yesterday, 4:15 PM</td>
              <td className="px-6 py-4">
                <button className="text-slate-400 font-medium text-sm hover:text-slate-600">View Report</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
