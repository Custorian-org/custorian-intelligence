'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const COLORS = {
  accent: '#a78bfa', accent2: '#7c3aed', shield: '#10b981',
  warn: '#f59e0b', danger: '#ef4444', blue: '#3b82f6', pink: '#ec4899',
  text: '#f4f4f5',
};

const CAT_COLORS: Record<string, string> = {
  grooming: COLORS.danger, bullying: COLORS.warn, self_harm: COLORS.pink,
  selfHarm: COLORS.pink, violence: '#f97316', content_wellness: COLORS.accent,
  contentWellness: COLORS.accent,
};

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-6">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">{label}</div>
      <div className="text-3xl font-extrabold tracking-tight" style={{ color: color || COLORS.text }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [scans, setScans] = useState<any[]>([]);
  const [photodna, setPhotodna] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  if (authLoading || !user) return (
    <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
      <div className="text-[#a78bfa] text-xs tracking-[.3em] uppercase animate-pulse">Authenticating...</div>
    </div>
  );

  useEffect(() => {
    async function load() {
      const [s, p, ss, iv] = await Promise.all([
        supabase.from('scan_events').select('*').order('created_at', { ascending: false }).limit(1000),
        supabase.from('photodna_scans').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('app_sessions').select('*').order('created_at', { ascending: false }).limit(1000),
        supabase.from('interventions').select('*').order('created_at', { ascending: false }).limit(500),
      ]);
      setScans(s.data || []); setPhotodna(p.data || []);
      setSessions(ss.data || []); setInterventions(iv.data || []);
      setLoading(false);
    }
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, []);

  const alerts = scans.filter(s => s.confidence >= 0.5);
  const pdnaMatches = photodna.filter(p => p.is_match).length;

  // Category pie
  const catCounts = scans.reduce((a: any, s: any) => { a[s.category] = (a[s.category] || 0) + 1; return a; }, {});
  const pieData = Object.entries(catCounts).map(([name, value]) => ({ name, value: value as number }));

  // Daily trend
  const daily = scans.reduce((a: any, s: any) => { const d = s.created_at?.split('T')[0]; a[d] = (a[d] || 0) + 1; return a; }, {});
  const trend = Object.entries(daily).sort(([a], [b]) => a.localeCompare(b)).slice(-30).map(([d, c]) => ({ date: d.slice(5), count: c as number }));

  // Language bars
  const langs = scans.reduce((a: any, s: any) => { a[s.language || '?'] = (a[s.language || '?'] || 0) + 1; return a; }, {});
  const langData = Object.entries(langs).map(([lang, count]) => ({ lang, count: count as number }));

  // Severity
  const sevCounts = scans.reduce((a: any, s: any) => { a[s.severity] = (a[s.severity] || 0) + 1; return a; }, {});

  const avgPdna = photodna.length > 0 ? Math.round(photodna.reduce((s: number, p: any) => s + (p.response_time_ms || 0), 0) / photodna.length) : 0;

  const ttipStyle = { background: '#111118', border: '1px solid #1e1e2a', borderRadius: 8, color: '#f4f4f5', fontSize: 12 };

  if (loading) return (
    <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
      <div className="text-[#a78bfa] text-xs tracking-[.3em] uppercase animate-pulse">Loading Custorian Intelligence...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08080c] text-[#f4f4f5]">
      <div className="h-0.5 bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#10b981]" />

      <header className="px-8 py-5 flex items-center justify-between border-b border-[#1e1e2a]">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Custorian<span className="text-[#a78bfa]">.</span> Intelligence</h1>
          <p className="text-[10px] text-gray-500 mt-0.5 tracking-wide">Detection Analytics — Anonymised Telemetry</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" /><span className="text-[10px] text-gray-500">Live</span></div>
          <span className="text-[10px] text-gray-600">{user.email}</span>
          <a href="https://custorian.org" target="_blank" className="text-[10px] text-[#a78bfa] hover:underline">custorian.org</a>
          <button onClick={signOut} className="text-[10px] text-gray-500 hover:text-white transition-colors">Sign out</button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Stat label="Scans" value={scans.length} />
          <Stat label="Alerts" value={alerts.length} color={COLORS.warn} />
          <Stat label="Sessions" value={sessions.length} color={COLORS.blue} />
          <Stat label="PhotoDNA" value={photodna.length} color={COLORS.accent} />
          <Stat label="CSAM Matches" value={pdnaMatches} color={pdnaMatches > 0 ? COLORS.danger : COLORS.shield} />
          <Stat label="Interventions" value={interventions.length} color={COLORS.pink} />
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-5">
            <h2 className="text-xs font-semibold text-gray-500 mb-4">Detection Trend (30d)</h2>
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip contentStyle={ttipStyle} />
                  <Line type="monotone" dataKey="count" stroke={COLORS.accent} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-56 flex items-center justify-center text-gray-600 text-xs">No data yet</div>}
          </div>

          <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-5">
            <h2 className="text-xs font-semibold text-gray-500 mb-4">By Category</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {pieData.map((e, i) => <Cell key={i} fill={CAT_COLORS[e.name] || COLORS.accent} />)}
                  </Pie>
                  <Tooltip contentStyle={ttipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-56 flex items-center justify-center text-gray-600 text-xs">No data yet</div>}
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-5">
            <h2 className="text-xs font-semibold text-gray-500 mb-4">By Language</h2>
            {langData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={langData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
                  <XAxis dataKey="lang" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip contentStyle={ttipStyle} />
                  <Bar dataKey="count" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-44 flex items-center justify-center text-gray-600 text-xs">No data</div>}
          </div>

          <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-5">
            <h2 className="text-xs font-semibold text-gray-500 mb-4">Severity</h2>
            <div className="space-y-3 mt-4">
              {['critical', 'high', 'medium', 'low'].map(sev => {
                const c = sevCounts[sev] || 0;
                const pct = scans.length > 0 ? (c / scans.length * 100) : 0;
                const col = sev === 'critical' ? COLORS.danger : sev === 'high' ? '#f97316' : sev === 'medium' ? COLORS.warn : COLORS.shield;
                return (
                  <div key={sev}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500 uppercase tracking-wider">{sev}</span>
                      <span className="text-gray-600">{c} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 bg-[#1e1e2a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: col }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-5">
            <h2 className="text-xs font-semibold text-gray-500 mb-4">PhotoDNA</h2>
            <div className="space-y-4 mt-4">
              {[
                ['Scans', photodna.length, COLORS.text],
                ['CSAM Matches', pdnaMatches, pdnaMatches > 0 ? COLORS.danger : COLORS.shield],
                ['Avg Response', `${avgPdna}ms`, COLORS.text],
              ].map(([l, v, c]) => (
                <div key={l as string} className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500">{l as string}</span>
                  <span className="text-sm font-bold" style={{ color: c as string }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent table */}
        <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-5">
          <h2 className="text-xs font-semibold text-gray-500 mb-4">Recent Detections</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead><tr className="text-gray-600 uppercase tracking-wider border-b border-[#1e1e2a]">
                {['Time', 'Category', 'Severity', 'Confidence', 'Language', 'Source', 'Platform'].map(h => <th key={h} className="text-left py-2 px-2">{h}</th>)}
              </tr></thead>
              <tbody>
                {scans.slice(0, 15).map((s: any) => (
                  <tr key={s.id} className="border-b border-[#1e1e2a]/30 hover:bg-[#1e1e2a]/20">
                    <td className="py-2 px-2 text-gray-500">{new Date(s.created_at).toLocaleString()}</td>
                    <td className="py-2 px-2"><span className="px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ backgroundColor: (CAT_COLORS[s.category] || COLORS.accent) + '20', color: CAT_COLORS[s.category] || COLORS.accent }}>{s.category}</span></td>
                    <td className="py-2 px-2 text-gray-400">{s.severity}</td>
                    <td className="py-2 px-2 text-gray-400">{(s.confidence * 100).toFixed(0)}%</td>
                    <td className="py-2 px-2 text-gray-500">{s.language}</td>
                    <td className="py-2 px-2 text-gray-500">{s.source}</td>
                    <td className="py-2 px-2 text-gray-500">{s.platform}</td>
                  </tr>
                ))}
                {scans.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-600 text-xs">No detections yet. Data appears as the app generates events.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-600 py-6">
          Custorian Intelligence — Anonymous detection analytics. No child data. No message content. No identifiers.<br />custorian.org | CC BY-SA 4.0
        </div>
      </main>
    </div>
  );
}
