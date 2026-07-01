import React, { useMemo } from 'react';
import { useHotelStore } from '../store';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { floors, guests, staff, money } = useHotelStore();

  const totalBeds = useMemo(() => {
    let count = 0;
    floors.forEach(f => {
      f.grid.forEach(row => {
        row.forEach(cell => {
          if (cell === 'bed') count++;
        });
      });
    });
    return count * 2; // Assuming 2 capacity per bed based on store logic
  }, [floors]);

  const occupancyRate = totalBeds > 0 ? (guests.length / totalBeds) * 100 : 0;

  const satisfiedGuests = guests.filter(g => !g.need || g.need === 'none').length;
  const satisfactionScore = guests.length > 0 ? (satisfiedGuests / guests.length) * 100 : 100;

  const workingStaff = staff.filter(s => s.currentTask && s.currentTask !== 'Idle').length;
  const efficiency = staff.length > 0 ? (workingStaff / staff.length) * 100 : 0;

  // Fake historical data for charts
  const revenueData = [
    { name: 'Mon', revenue: Math.max(1000, money * 0.8) },
    { name: 'Tue', revenue: Math.max(1200, money * 0.85) },
    { name: 'Wed', revenue: Math.max(1100, money * 0.9) },
    { name: 'Thu', revenue: Math.max(1400, money * 0.92) },
    { name: 'Fri', revenue: Math.max(1800, money * 0.95) },
    { name: 'Sat', revenue: Math.max(2000, money * 0.98) },
    { name: 'Sun', revenue: money },
  ];

  const occupancyData = [
    { name: '08:00', rate: Math.max(0, occupancyRate - 20) },
    { name: '10:00', rate: Math.max(0, occupancyRate - 10) },
    { name: '12:00', rate: Math.max(0, occupancyRate - 5) },
    { name: '14:00', rate: occupancyRate },
    { name: '16:00', rate: Math.min(100, occupancyRate + 5) },
    { name: '18:00', rate: Math.min(100, occupancyRate + 15) },
  ];

  const staffData = [
    { name: 'Working', value: workingStaff },
    { name: 'Idle', value: staff.length - workingStaff },
  ];
  const COLORS = ['#10b981', '#cbd5e1'];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Analytics Overview</h2>
          <p className="text-slate-500">Key performance indicators and hotel statistics.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500">Occupancy Rate</p>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{occupancyRate.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">{guests.length} / {totalBeds} capacity</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <DollarSign size={16} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">${money.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Current total balance</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500">Guest Satisfaction</p>
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <TrendingUp size={16} className="text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{satisfactionScore.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">Based on fulfilled needs</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500">Staff Efficiency</p>
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <Activity size={16} className="text-violet-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{efficiency.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">Active / Total employees</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Revenue Trend (Weekly)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`$${value.toFixed(0)}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Occupancy Today</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Occupancy']}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Staff Task Distribution</h3>
          <div className="flex items-center flex-col md:flex-row gap-8">
            <div className="h-48 w-48">
              {staff.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={staffData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {staffData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm italic">
                  No staff hired
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-slate-700 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Active Tasks
                  </span>
                  <span className="text-slate-900">{workingStaff}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${efficiency}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-slate-700 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-300"></span> Idle
                  </span>
                  <span className="text-slate-900">{staff.length - workingStaff}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-slate-300 h-2 rounded-full" style={{ width: `${staff.length > 0 ? ((staff.length - workingStaff) / staff.length) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
