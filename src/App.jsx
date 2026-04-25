import React, { useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, BarChart3, Users, Clock, Percent,
  Calendar, ChevronDown, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';
import { format, subDays, startOfWeek, startOfMonth, startOfYear, isAfter, isBefore, addDays } from 'date-fns';

/* ─── SERVICE CATALOG ─── */
const SERVICES = [
  { id: 'standard-clean', name: 'Standard Dryer Vent Cleaning', price: 139, cost: 25, hours: 1 },
  { id: 'deep-clean', name: 'Deep Clean (Heavy Buildup)', price: 219, cost: 35, hours: 1.5 },
  { id: 'roof-clean', name: 'Roof-Level Vent Cleaning', price: 249, cost: 40, hours: 2 },
  { id: 'inspection', name: 'Dryer Vent Inspection', price: 69, cost: 10, hours: 0.5 },
  { id: 'bird-guard', name: 'Bird Guard Installation', price: 125, cost: 45, hours: 0.75 },
  { id: 'vent-cap', name: 'Vent Cap Replacement', price: 135, cost: 35, hours: 0.75 },
  { id: 'reroute', name: 'Vent Line Reroute', price: 500, cost: 120, hours: 3 },
  { id: 'booster-fan', name: 'Booster Fan Installation', price: 350, cost: 150, hours: 2.5 },
  { id: 'lint-alarm', name: 'Lint Alert Alarm Install', price: 89, cost: 30, hours: 0.5 },
  { id: 'commercial', name: 'Commercial Vent Cleaning', price: 99, cost: 20, hours: 1 },
  { id: 'maintenance-plan', name: 'Annual Maintenance Plan', price: 149, cost: 25, hours: 1 },
  { id: 'emergency', name: 'Emergency Service Call', price: 199, cost: 30, hours: 1 },
];

const TECHS = [
  { id: 't1', name: 'Mike Johnson' },
  { id: 't2', name: 'Sarah Chen' },
  { id: 't3', name: 'James Wilson' },
  { id: 't4', name: 'Maria Garcia' },
];

/* ─── SEEDED RANDOM ─── */
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

/* ─── GENERATE DEMO JOBS ─── */
function generateDemoJobs() {
  const rand = seededRandom(42);
  const jobs = [];
  const today = new Date(2026, 3, 23); // April 23, 2026
  const weights = [0.22, 0.12, 0.08, 0.10, 0.06, 0.06, 0.03, 0.02, 0.05, 0.10, 0.08, 0.08];

  for (let i = 0; i < 38; i++) {
    const daysAgo = Math.floor(rand() * 90);
    const jobDate = subDays(today, daysAgo);

    // weighted service selection
    let r = rand();
    let cumulative = 0;
    let serviceIdx = 0;
    for (let j = 0; j < weights.length; j++) {
      cumulative += weights[j];
      if (r <= cumulative) { serviceIdx = j; break; }
    }
    const service = SERVICES[serviceIdx];
    const tech = TECHS[Math.floor(rand() * TECHS.length)];
    const laborCost = 35 * service.hours; // $35/hr labor rate
    const materialCost = service.cost;
    const totalCogs = laborCost + materialCost;

    // customer names
    const firstNames = ['Robert', 'Jennifer', 'Michael', 'Lisa', 'David', 'Amanda', 'Chris', 'Emily', 'Brian', 'Nicole', 'Kevin', 'Stephanie', 'Tom', 'Rachel', 'Andrew', 'Laura', 'Jason', 'Karen', 'Mark', 'Diana', 'Paul', 'Susan', 'Ryan', 'Angela', 'Steven', 'Melissa', 'Dan', 'Amy', 'Matt', 'Jessica', 'John', 'Ashley', 'Greg', 'Heather', 'Scott', 'Tina', 'Jeff', 'Donna'];
    const lastNames = ['Smith', 'Martinez', 'Thompson', 'Anderson', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'King', 'Wright', 'Hill', 'Green', 'Adams', 'Nelson', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker', 'Collins', 'Edwards', 'Stewart', 'Morris', 'Murphy', 'Rivera', 'Cook', 'Rogers', 'Morgan', 'Bell', 'Bailey', 'Cooper', 'Reed', 'Ward', 'Howard'];

    jobs.push({
      id: `JOB-${String(1000 + i).slice(1)}`,
      date: jobDate,
      customer: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      service: service,
      tech: tech,
      revenue: service.price,
      laborCost,
      materialCost,
      totalCogs,
      profit: service.price - totalCogs,
      margin: ((service.price - totalCogs) / service.price * 100),
      hours: service.hours,
    });
  }

  return jobs.sort((a, b) => b.date - a.date);
}

const ALL_JOBS = generateDemoJobs();

/* ─── DATE RANGE PRESETS ─── */
const today = new Date(2026, 3, 23);
const DATE_RANGES = [
  { label: 'This Week', from: startOfWeek(today, { weekStartsOn: 1 }) },
  { label: 'This Month', from: startOfMonth(today) },
  { label: 'Last Month', from: new Date(2026, 2, 1), to: new Date(2026, 2, 31) },
  { label: 'Last 90 Days', from: subDays(today, 90) },
  { label: 'YTD', from: startOfYear(today) },
];

/* ─── CURRENCY FORMAT ─── */
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtDec = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const pct = (n) => `${n.toFixed(1)}%`;

/* ─── KPI CARD ─── */
function KPICard({ icon: Icon, label, value, subtext, color = 'dojo' }) {
  const colorMap = {
    dojo: 'bg-dojo-50 text-dojo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
    cyan: 'bg-cyan-50 text-cyan-600',
  };
  return (
    <div className="card flex items-start gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${colorMap[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="mt-0.5 text-xs text-gray-400">{subtext}</p>}
      </div>
    </div>
  );
}

/* ─── SIMPLE BAR ─── */
function Bar({ value, max, color = 'bg-dojo-500', height = 'h-6' }) {
  const w = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className={`w-full rounded-full bg-gray-100 ${height} overflow-hidden`}>
      <div className={`${color} ${height} rounded-full transition-all duration-500`} style={{ width: `${w}%` }} />
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState(3); // Last 90 Days default

  const filteredJobs = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    return ALL_JOBS.filter((j) => {
      const after = isAfter(j.date, subDays(range.from, 1));
      const before = range.to ? isBefore(j.date, addDays(range.to, 1)) : isBefore(j.date, addDays(today, 1));
      return after && before;
    });
  }, [dateRange]);

  /* KPI calculations */
  const kpis = useMemo(() => {
    const totalRevenue = filteredJobs.reduce((s, j) => s + j.revenue, 0);
    const totalCogs = filteredJobs.reduce((s, j) => s + j.totalCogs, 0);
    const grossProfit = totalRevenue - totalCogs;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const avgJobProfit = filteredJobs.length > 0 ? grossProfit / filteredJobs.length : 0;
    const totalHours = filteredJobs.reduce((s, j) => s + j.hours, 0);
    const revenuePerHour = totalHours > 0 ? totalRevenue / totalHours : 0;
    return { totalRevenue, totalCogs, grossProfit, grossMargin, avgJobProfit, revenuePerHour, totalHours, jobCount: filteredJobs.length };
  }, [filteredJobs]);

  /* By-service aggregation */
  const byService = useMemo(() => {
    const map = {};
    filteredJobs.forEach((j) => {
      const key = j.service.id;
      if (!map[key]) map[key] = { service: j.service, jobs: 0, revenue: 0, cogs: 0, hours: 0 };
      map[key].jobs++;
      map[key].revenue += j.revenue;
      map[key].cogs += j.totalCogs;
      map[key].hours += j.hours;
    });
    return Object.values(map).sort((a, b) => (b.revenue - b.cogs) - (a.revenue - a.cogs));
  }, [filteredJobs]);

  /* By-tech aggregation */
  const byTech = useMemo(() => {
    const map = {};
    filteredJobs.forEach((j) => {
      const key = j.tech.id;
      if (!map[key]) map[key] = { tech: j.tech, jobs: 0, revenue: 0, hours: 0 };
      map[key].jobs++;
      map[key].revenue += j.revenue;
      map[key].hours += j.hours;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredJobs]);

  /* Monthly trends (last 6 months) */
  const trends = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(2026, 3 - i, 1);
      const monthEnd = new Date(2026, 4 - i, 0);
      const monthJobs = ALL_JOBS.filter((j) => j.date >= d && j.date <= monthEnd);
      const revenue = monthJobs.reduce((s, j) => s + j.revenue, 0);
      const cogs = monthJobs.reduce((s, j) => s + j.totalCogs, 0);
      months.push({
        label: format(d, 'MMM yyyy'),
        jobs: monthJobs.length,
        revenue,
        cogs,
        profit: revenue - cogs,
        margin: revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0,
      });
    }
    return months;
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'service', label: 'By Service' },
    { id: 'tech', label: 'By Technician' },
    { id: 'trends', label: 'Trends' },
  ];

  const maxRevenue = Math.max(...byService.map((s) => s.revenue), 1);
  const maxCost = Math.max(...byService.map((s) => s.cogs), 1);
  const barMax = Math.max(maxRevenue, maxCost);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── HEADER ─── */}
      <header className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                <span className="text-2xl">🥋</span> Job Costing & Reporting Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-300">The Dojo &mdash; Dryer Vent Services</p>
            </div>
            <span className="badge-blue text-xs self-start sm:self-center">Widget 5 of 7</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* ─── DATE RANGE FILTER ─── */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-500 mr-1">Period:</span>
          {DATE_RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setDateRange(i)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                dateRange === i
                  ? 'bg-dojo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* ─── KPI CARDS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard icon={DollarSign} label="Total Revenue" value={fmt(kpis.totalRevenue)} subtext={`${kpis.jobCount} jobs`} color="dojo" />
          <KPICard icon={BarChart3} label="Total COGS" value={fmt(kpis.totalCogs)} subtext="Labor + Materials" color="rose" />
          <KPICard icon={TrendingUp} label="Gross Profit" value={fmt(kpis.grossProfit)} subtext="Revenue - COGS" color="emerald" />
          <KPICard icon={Percent} label="Gross Margin" value={pct(kpis.grossMargin)} subtext="Profit / Revenue" color="amber" />
          <KPICard icon={DollarSign} label="Avg Job Profit" value={fmtDec(kpis.avgJobProfit)} subtext="Per completed job" color="violet" />
          <KPICard icon={Clock} label="Rev / Tech Hour" value={fmtDec(kpis.revenuePerHour)} subtext={`${kpis.totalHours.toFixed(1)} hrs total`} color="cyan" />
        </div>

        {/* ─── TAB NAV ─── */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === t.id
                    ? 'border-dojo-600 text-dojo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ─── TAB CONTENT ─── */}
        {activeTab === 'overview' && <OverviewTab jobs={filteredJobs} byService={byService} barMax={barMax} />}
        {activeTab === 'service' && <ServiceTab byService={byService} />}
        {activeTab === 'tech' && <TechTab byTech={byTech} />}
        {activeTab === 'trends' && <TrendsTab trends={trends} />}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-4">
        <p className="text-center text-xs text-gray-400">
          Job Costing & Reporting Dashboard &copy; {new Date().getFullYear()} The Dojo &mdash; Powered by GoHighLevel
        </p>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════ */
function OverviewTab({ jobs, byService, barMax }) {
  const top5 = byService.slice(0, 5);
  const recentJobs = jobs.slice(0, 10);
  const chartMax = Math.max(...top5.map((s) => s.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Revenue vs Cost chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Cost by Service</h3>
        <div className="space-y-4">
          {byService.map((s) => (
            <div key={s.service.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{s.service.name}</span>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="text-dojo-600 font-medium">{fmt(s.revenue)}</span>
                  <span className="text-rose-500 font-medium">{fmt(s.cogs)}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <div className="flex-1">
                  <Bar value={s.revenue} max={barMax} color="bg-dojo-500" height="h-4" />
                </div>
                <div className="flex-1">
                  <Bar value={s.cogs} max={barMax} color="bg-rose-400" height="h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="h-3 w-3 rounded bg-dojo-500" /> Revenue
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="h-3 w-3 rounded bg-rose-400" /> COGS
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Most Profitable */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Most Profitable Services</h3>
          <div className="space-y-3">
            {top5.map((s, i) => {
              const profit = s.revenue - s.cogs;
              const margin = s.revenue > 0 ? (profit / s.revenue) * 100 : 0;
              return (
                <div key={s.service.id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dojo-50 text-xs font-bold text-dojo-700">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.service.name}</p>
                    <p className="text-xs text-gray-400">{s.jobs} job{s.jobs !== 1 ? 's' : ''} &middot; {pct(margin)} margin</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{fmt(profit)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profit Margin by Service */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Margin by Service</h3>
          <div className="space-y-3">
            {byService.map((s) => {
              const margin = s.revenue > 0 ? ((s.revenue - s.cogs) / s.revenue) * 100 : 0;
              const barColor = margin >= 70 ? 'bg-emerald-500' : margin >= 50 ? 'bg-amber-400' : 'bg-rose-400';
              return (
                <div key={s.service.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium truncate max-w-[180px]">{s.service.name}</span>
                    <span className={`font-bold ${margin >= 70 ? 'text-emerald-600' : margin >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {pct(margin)}
                    </span>
                  </div>
                  <Bar value={margin} max={100} color={barColor} height="h-3" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Completed Jobs */}
      <div className="card overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Completed Jobs</h3>
        <div className="overflow-x-auto -mx-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tech</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">COGS</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentJobs.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-dojo-600 font-medium">{j.id}</td>
                  <td className="px-6 py-3 text-gray-600">{format(j.date, 'MMM d, yyyy')}</td>
                  <td className="px-6 py-3 text-gray-900 font-medium">{j.customer}</td>
                  <td className="px-6 py-3 text-gray-600 max-w-[180px] truncate">{j.service.name}</td>
                  <td className="px-6 py-3 text-gray-600">{j.tech.name}</td>
                  <td className="px-6 py-3 text-right font-medium text-gray-900">{fmt(j.revenue)}</td>
                  <td className="px-6 py-3 text-right text-rose-600">{fmt(j.totalCogs)}</td>
                  <td className="px-6 py-3 text-right font-bold text-emerald-600">{fmt(j.profit)}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`badge ${j.margin >= 70 ? 'badge-green' : j.margin >= 50 ? 'badge-yellow' : 'badge-red'}`}>
                      {pct(j.margin)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BY SERVICE TAB
   ═══════════════════════════════════════════ */
function ServiceTab({ byService }) {
  const totals = byService.reduce(
    (acc, s) => ({ jobs: acc.jobs + s.jobs, revenue: acc.revenue + s.revenue, cogs: acc.cogs + s.cogs }),
    { jobs: 0, revenue: 0, cogs: 0 }
  );

  return (
    <div className="card overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profitability by Service Type</h3>
      <div className="overflow-x-auto -mx-6">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Labor</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Materials</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total COGS</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Profit</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Margin %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {byService.map((s) => {
              const profit = s.revenue - s.cogs;
              const margin = s.revenue > 0 ? (profit / s.revenue) * 100 : 0;
              const laborTotal = 35 * s.hours;
              const materialsTotal = s.cogs - laborTotal;
              return (
                <tr key={s.service.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 text-gray-900 font-medium">{s.service.name}</td>
                  <td className="px-6 py-3 text-right text-gray-600">{s.jobs}</td>
                  <td className="px-6 py-3 text-right font-medium text-gray-900">{fmt(s.revenue)}</td>
                  <td className="px-6 py-3 text-right text-gray-500">{fmt(laborTotal)}</td>
                  <td className="px-6 py-3 text-right text-gray-500">{fmt(materialsTotal)}</td>
                  <td className="px-6 py-3 text-right text-rose-600">{fmt(s.cogs)}</td>
                  <td className="px-6 py-3 text-right font-bold text-emerald-600">{fmt(profit)}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`badge ${margin >= 70 ? 'badge-green' : margin >= 50 ? 'badge-yellow' : 'badge-red'}`}>
                      {pct(margin)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
              <td className="px-6 py-3 text-gray-900">Totals</td>
              <td className="px-6 py-3 text-right text-gray-900">{totals.jobs}</td>
              <td className="px-6 py-3 text-right text-gray-900">{fmt(totals.revenue)}</td>
              <td className="px-6 py-3 text-right text-gray-500">&mdash;</td>
              <td className="px-6 py-3 text-right text-gray-500">&mdash;</td>
              <td className="px-6 py-3 text-right text-rose-600">{fmt(totals.cogs)}</td>
              <td className="px-6 py-3 text-right text-emerald-600">{fmt(totals.revenue - totals.cogs)}</td>
              <td className="px-6 py-3 text-right">
                <span className="badge-green">{pct(totals.revenue > 0 ? ((totals.revenue - totals.cogs) / totals.revenue) * 100 : 0)}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BY TECHNICIAN TAB
   ═══════════════════════════════════════════ */
function TechTab({ byTech }) {
  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Technician</h3>
        <div className="overflow-x-auto -mx-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Technician</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue Generated</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hours Worked</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue / Hour</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Job Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {byTech.map((t) => {
                const revPerHour = t.hours > 0 ? t.revenue / t.hours : 0;
                const avgJobValue = t.jobs > 0 ? t.revenue / t.jobs : 0;
                return (
                  <tr key={t.tech.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dojo-100 text-dojo-700 font-bold text-xs">
                          {t.tech.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{t.tech.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600">{t.jobs}</td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">{fmt(t.revenue)}</td>
                    <td className="px-6 py-3 text-right text-gray-600">{t.hours.toFixed(1)}</td>
                    <td className="px-6 py-3 text-right font-medium text-dojo-600">{fmtDec(revPerHour)}</td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">{fmtDec(avgJobValue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tech Revenue Comparison Bars */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Comparison</h3>
        <div className="space-y-4">
          {byTech.map((t) => {
            const maxRev = Math.max(...byTech.map((x) => x.revenue), 1);
            return (
              <div key={t.tech.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{t.tech.name}</span>
                  <span className="font-bold text-dojo-600">{fmt(t.revenue)}</span>
                </div>
                <Bar value={t.revenue} max={maxRev} color="bg-dojo-500" height="h-5" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TRENDS TAB
   ═══════════════════════════════════════════ */
function TrendsTab({ trends }) {
  const maxRev = Math.max(...trends.map((m) => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Monthly Revenue Trend Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue & Profit Trend</h3>
        <div className="space-y-4">
          {trends.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 w-20">{m.label}</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-dojo-600 font-medium">{fmt(m.revenue)}</span>
                  <span className="text-emerald-600 font-medium">{fmt(m.profit)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Bar value={m.revenue} max={maxRev} color="bg-dojo-500" height="h-4" />
                <Bar value={m.profit} max={maxRev} color="bg-emerald-500" height="h-4" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="h-3 w-3 rounded bg-dojo-500" /> Revenue
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="h-3 w-3 rounded bg-emerald-500" /> Gross Profit
          </div>
        </div>
      </div>

      {/* Monthly Data Table */}
      <div className="card overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown (Last 6 Months)</h3>
        <div className="overflow-x-auto -mx-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">COGS</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Profit</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {trends.map((m, i) => {
                const prev = i > 0 ? trends[i - 1] : null;
                const revChange = prev && prev.revenue > 0 ? ((m.revenue - prev.revenue) / prev.revenue) * 100 : null;
                return (
                  <tr key={m.label} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{m.label}</td>
                    <td className="px-6 py-3 text-right text-gray-600">{m.jobs}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-medium text-gray-900">{fmt(m.revenue)}</span>
                        {revChange !== null && m.revenue > 0 && (
                          <span className={`text-xs flex items-center ${revChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {revChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(revChange).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right text-rose-600">{fmt(m.cogs)}</td>
                    <td className="px-6 py-3 text-right font-bold text-emerald-600">{fmt(m.profit)}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`badge ${m.margin >= 70 ? 'badge-green' : m.margin >= 50 ? 'badge-yellow' : 'badge-red'}`}>
                        {pct(m.margin)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                <td className="px-6 py-3 text-gray-900">Total</td>
                <td className="px-6 py-3 text-right text-gray-900">{trends.reduce((s, m) => s + m.jobs, 0)}</td>
                <td className="px-6 py-3 text-right text-gray-900">{fmt(trends.reduce((s, m) => s + m.revenue, 0))}</td>
                <td className="px-6 py-3 text-right text-rose-600">{fmt(trends.reduce((s, m) => s + m.cogs, 0))}</td>
                <td className="px-6 py-3 text-right text-emerald-600">{fmt(trends.reduce((s, m) => s + m.profit, 0))}</td>
                <td className="px-6 py-3 text-right">
                  {(() => {
                    const totalRev = trends.reduce((s, m) => s + m.revenue, 0);
                    const totalProfit = trends.reduce((s, m) => s + m.profit, 0);
                    const avgMargin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;
                    return <span className="badge-green">{pct(avgMargin)}</span>;
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
