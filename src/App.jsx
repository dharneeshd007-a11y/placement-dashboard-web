import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Users, UserCheck, Percent, IndianRupee } from 'lucide-react';
import placementData from './data.json';
import './index.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const PIE_COLORS = ['#10b981', '#ef4444'];

function App() {
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterCompany, setFilterCompany] = useState('All');
  const [filterSkill, setFilterSkill] = useState('All');
  const [filterYear, setFilterYear] = useState('All');

  // Extract unique filter options
  const branches = ['All', ...new Set(placementData.map(d => d.Branch).filter(Boolean))];
  const companies = ['All', ...new Set(placementData.map(d => d.Company).filter(c => c && c !== 'N/A'))];
  const skills = ['All', ...new Set(placementData.map(d => d.Skill).filter(Boolean))];
  const years = ['All', ...new Set(placementData.map(d => d.Year).filter(Boolean))];

  // Apply filters
  const filteredData = useMemo(() => {
    return placementData.filter(d => {
      return (filterBranch === 'All' || d.Branch === filterBranch) &&
             (filterCompany === 'All' || d.Company === filterCompany) &&
             (filterSkill === 'All' || d.Skill === filterSkill) &&
             (filterYear === 'All' || d.Year === filterYear);
    });
  }, [filterBranch, filterCompany, filterSkill, filterYear]);

  // Calculate KPIs
  const totalStudents = filteredData.length;
  const placedStudentsData = filteredData.filter(d => d.Placement_Status === 'Placed');
  const totalPlaced = placedStudentsData.length;
  const placementRate = totalStudents > 0 ? ((totalPlaced / totalStudents) * 100).toFixed(1) : 0;
  
  const totalPackage = placedStudentsData.reduce((sum, d) => sum + (Number(d.Package_LPA) || 0), 0);
  const avgPackage = totalPlaced > 0 ? (totalPackage / totalPlaced).toFixed(2) : 0;

  // Chart Data: Branch-wise Placement
  const branchPlacementData = useMemo(() => {
    const branchCounts = {};
    filteredData.forEach(d => {
      if (!d.Branch) return;
      if (!branchCounts[d.Branch]) {
        branchCounts[d.Branch] = { name: d.Branch, Placed: 0, Unplaced: 0 };
      }
      if (d.Placement_Status === 'Placed') {
        branchCounts[d.Branch].Placed += 1;
      } else {
        branchCounts[d.Branch].Unplaced += 1;
      }
    });
    return Object.values(branchCounts);
  }, [filteredData]);

  // Chart Data: Average Package by Branch
  const avgPackageByBranchData = useMemo(() => {
    const branchSums = {};
    placedStudentsData.forEach(d => {
      if (!d.Branch) return;
      if (!branchSums[d.Branch]) {
        branchSums[d.Branch] = { name: d.Branch, total: 0, count: 0 };
      }
      branchSums[d.Branch].total += Number(d.Package_LPA) || 0;
      branchSums[d.Branch].count += 1;
    });
    return Object.values(branchSums).map(b => ({
      name: b.name,
      'Average Package (LPA)': Number((b.total / b.count).toFixed(2))
    }));
  }, [placedStudentsData]);

  // Chart Data: Company-wise Placement
  const companyPlacementData = useMemo(() => {
    const companyCounts = {};
    placedStudentsData.forEach(d => {
      if (!d.Company || d.Company === 'N/A') return;
      companyCounts[d.Company] = (companyCounts[d.Company] || 0) + 1;
    });
    return Object.entries(companyCounts)
      .map(([name, count]) => ({ name, Placed: count }))
      .sort((a, b) => b.Placed - a.Placed)
      .slice(0, 10); // Top 10
  }, [placedStudentsData]);

  // Chart Data: Skill-wise Placement (Bar Chart as requested)
  const skillPlacementData = useMemo(() => {
    const skillCounts = {};
    placedStudentsData.forEach(d => {
      if (!d.Skill) return;
      skillCounts[d.Skill] = (skillCounts[d.Skill] || 0) + 1;
    });
    return Object.entries(skillCounts)
      .map(([name, count]) => ({ name, Placed: count }))
      .sort((a, b) => b.Placed - a.Placed);
  }, [placedStudentsData]);

  // Chart Data: Placement Status (Donut)
  const placementStatusData = [
    { name: 'Placed', value: totalPlaced },
    { name: 'Not Placed', value: totalStudents - totalPlaced }
  ];

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>Placement Analytics Dashboard</h1>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="filter-group">
            <label>Branch</label>
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Company</label>
            <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Skill</label>
            <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
              {skills.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Year</label>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </aside>

        <main className="dashboard-body">
          <div className="kpi-container">
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                <Users size={24} />
              </div>
              <div className="kpi-info">
                <p className="kpi-value">{totalStudents}</p>
                <p className="kpi-label">Total Students</p>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                <UserCheck size={24} />
              </div>
              <div className="kpi-info">
                <p className="kpi-value">{totalPlaced}</p>
                <p className="kpi-label">Total Placed</p>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                <Percent size={24} />
              </div>
              <div className="kpi-info">
                <p className="kpi-value">{placementRate}%</p>
                <p className="kpi-label">Placement Rate</p>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
                <IndianRupee size={24} />
              </div>
              <div className="kpi-info">
                <p className="kpi-value">{avgPackage}</p>
                <p className="kpi-label">Average Package (LPA)</p>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Branch-wise Placement</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchPlacementData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="Placed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Unplaced" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3>Average Package by Branch</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={avgPackageByBranchData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="Average Package (LPA)" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {avgPackageByBranchData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3>Company-wise Placement</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companyPlacementData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="Placed" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3>Skill-wise Placement</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillPlacementData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="Placed" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3>Placement Status</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={placementStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {placementStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
