
import React from 'react';
import { Trash2, Info, ArrowRightLeft, Edit2 } from 'lucide-react';
import { BPRecord } from '../types';

interface BPTableProps {
  records: BPRecord[];
  onDelete: (id: string) => void;
  onEdit: (record: BPRecord) => void;
}

const BPTable: React.FC<BPTableProps> = ({ records, onDelete, onEdit }) => {
  const getStatus = (sys: number, dia: number) => {
    if (sys >= 180 || dia >= 120) return { label: '危机', color: 'bg-red-600 text-white' };
    if (sys >= 140 || dia >= 90) return { label: '高血压', color: 'bg-rose-100 text-rose-700 border-rose-200' };
    if (sys >= 120 || dia >= 80) return { label: '高值', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: '正常', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">日期与时间</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">部位</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">血压 (高/低)</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">心率</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">备注</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  尚无测量数据
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const status = getStatus(record.systolic, record.diastolic);
                return (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-700">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-tight font-medium">
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        record.arm === '左手' ? 'bg-indigo-50 text-indigo-600' : 
                        record.arm === '右手' ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <ArrowRightLeft className="w-3 h-3" />
                        {record.arm}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-800">{record.systolic}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-lg font-semibold text-slate-600">{record.diastolic}</span>
                        <span className="text-[10px] text-slate-400 ml-1 font-mono">mmHg</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        {record.heartRate} <span className="text-[10px] text-slate-400 font-normal font-mono">bpm</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500 line-clamp-1 max-w-[150px]" title={record.note}>
                        {record.note || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                      <button 
                        onClick={() => onEdit(record)}
                        className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(record.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BPTable;
