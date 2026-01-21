
import React, { useState, useEffect } from 'react';
import { Plus, Table, BarChart3, Activity, Download, BrainCircuit, Wand2 } from 'lucide-react';
import { BPRecord, AIReport } from './types';
import BPForm from './components/BPForm';
import BPChart from './components/BPChart';
import BPTable from './components/BPTable';
import AIInsights from './components/AIInsights';
import BulkImport from './components/BulkImport';

const App: React.FC = () => {
  const [records, setRecords] = useState<BPRecord[]>([]);
  const [reports, setReports] = useState<AIReport[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'stats'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BPRecord | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  useEffect(() => {
    const savedRecords = localStorage.getItem('bp_records');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
    const savedReports = localStorage.getItem('bp_ai_reports');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bp_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('bp_ai_reports', JSON.stringify(reports));
  }, [reports]);

  const saveRecord = (record: BPRecord) => {
    setRecords(prev => {
      const exists = prev.some(r => r.id === record.id);
      let next;
      if (exists) {
        next = prev.map(r => r.id === record.id ? record : r);
      } else {
        next = [record, ...prev];
      }
      return next.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleEditRequest = (record: BPRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const addBulkRecords = (newRecords: BPRecord[]) => {
    setRecords(prev => [...newRecords, ...prev].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
    setIsBulkImportOpen(false);
  };

  const deleteRecord = (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const saveAIReport = (report: AIReport) => {
    setReports(prev => [report, ...prev]);
  };

  const deleteAIReport = (id: string) => {
    if (window.confirm('确定要删除这条报告吗？')) {
      setReports(prev => prev.filter(r => r.id !== id));
    }
  };

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = ['日期时间', '部位', '收缩压(mmHg)', '舒张压(mmHg)', '心率(bpm)', '备注'];
    const csvContent = [
      headers.join(','),
      ...records.map(r => [
        new Date(r.timestamp).toLocaleString(),
        r.arm,
        r.systolic,
        r.diastolic,
        r.heartRate,
        `"${r.note.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `血压记录_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <nav className="fixed bottom-0 left-0 w-full md:top-0 md:w-64 md:h-full bg-white border-t md:border-t-0 md:border-r border-slate-200 z-50 flex md:flex-col items-center md:items-stretch">
        <div className="hidden md:flex items-center gap-2 p-6 mb-4">
          <div className="bg-red-500 p-2 rounded-xl shadow-lg shadow-red-100">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
            血压助手
          </h1>
        </div>

        <div className="flex flex-1 justify-around md:flex-col md:px-4 md:gap-2 py-3 md:py-0">
          <NavItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<BarChart3 className="w-5 h-5" />} 
            label="看板" 
          />
          <NavItem 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<Table className="w-5 h-5" />} 
            label="明细" 
          />
          <NavItem 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')} 
            icon={<BrainCircuit className="w-5 h-5" />} 
            label="AI报告" 
          />
        </div>

        <div className="hidden md:block p-4 mt-auto space-y-2">
          <button 
            onClick={() => setIsBulkImportOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors font-medium text-sm"
          >
            <Wand2 className="w-4 h-4" />
            AI 批量导入
          </button>
          <button 
            onClick={exportCSV}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            导出 CSV
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'dashboard' ? '健康数据概览' : 
               activeTab === 'history' ? '测量历史' : 'AI 健康洞察'}
            </h2>
            <p className="text-slate-500 text-sm">
              {records.length > 0 ? `共计 ${records.length} 条测量记录` : '尚未添加记录'}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsBulkImportOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2.5 rounded-full transition-all"
            >
              <Wand2 className="w-4 h-4" />
              <span className="font-semibold text-sm">AI 导入</span>
            </button>
            <button 
              onClick={() => { setEditingRecord(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">手动记</span>
            </button>
          </div>
        </header>

        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  label="最近收缩压" 
                  value={records[0]?.systolic ?? '--'} 
                  unit="mmHg" 
                  color="text-red-500"
                  subtitle={records[0]?.arm ? `(${records[0].arm})` : ''}
                />
                <StatCard 
                  label="最近舒张压" 
                  value={records[0]?.diastolic ?? '--'} 
                  unit="mmHg" 
                  color="text-blue-500"
                />
                <StatCard 
                  label="最近心率" 
                  value={records[0]?.heartRate ?? '--'} 
                  unit="bpm" 
                  color="text-emerald-500"
                />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-700 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  血压动态趋势
                </h3>
                <BPChart records={records} />
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <BPTable records={records} onDelete={deleteRecord} onEdit={handleEditRequest} />
          )}

          {activeTab === 'stats' && (
            <AIInsights 
              records={records} 
              onSaveReport={saveAIReport} 
              savedReports={reports}
              onDeleteReport={deleteAIReport}
            />
          )}
        </div>
      </main>

      {isFormOpen && (
        <BPForm 
          initialData={editingRecord}
          onSubmit={saveRecord} 
          onClose={() => { setIsFormOpen(false); setEditingRecord(null); }} 
        />
      )}

      {isBulkImportOpen && (
        <BulkImport 
          onImport={addBulkRecords}
          onClose={() => setIsBulkImportOpen(false)}
        />
      )}
    </div>
  );
};

const NavItem: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
}> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all ${
      active 
      ? 'text-blue-600 bg-blue-50 md:bg-blue-50 font-bold' 
      : 'text-slate-500 hover:text-slate-800 md:hover:bg-slate-50 font-medium'
    }`}
  >
    {icon}
    <span className="text-[10px] md:text-sm">{label}</span>
  </button>
);

const StatCard: React.FC<{ 
  label: string; 
  value: number | string; 
  unit: string; 
  color: string;
  subtitle?: string;
}> = ({ label, value, unit, color, subtitle }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center md:items-start relative overflow-hidden group">
    <div className={`absolute top-0 left-0 w-1 h-full bg-current ${color} opacity-20`} />
    <span className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1">
      {label} <span className="text-[10px] text-slate-300 font-normal">{subtitle}</span>
    </span>
    <div className="flex items-baseline gap-1">
      <span className={`text-3xl font-bold font-mono tracking-tight ${color}`}>{value}</span>
      <span className="text-slate-400 text-xs font-normal font-sans">{unit}</span>
    </div>
  </div>
);

export default App;
