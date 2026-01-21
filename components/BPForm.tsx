
import React, { useState, useEffect } from 'react';
import { X, Clock, Heart, ArrowRightLeft } from 'lucide-react';
import { BPRecord, ArmType } from '../types';

interface BPFormProps {
  initialData?: BPRecord | null;
  onSubmit: (record: BPRecord) => void;
  onClose: () => void;
}

const BPForm: React.FC<BPFormProps> = ({ initialData, onSubmit, onClose }) => {
  const [timestamp, setTimestamp] = useState('');
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [heartRate, setHeartRate] = useState('75');
  const [arm, setArm] = useState<ArmType>('左手');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      const date = new Date(initialData.timestamp);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setTimestamp(localDate);
      setSystolic(initialData.systolic.toString());
      setDiastolic(initialData.diastolic.toString());
      setHeartRate(initialData.heartRate.toString());
      setArm(initialData.arm);
      setNote(initialData.note);
    } else {
      const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setTimestamp(localDate);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: BPRecord = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      timestamp: new Date(timestamp).toISOString(),
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      heartRate: parseInt(heartRate),
      arm,
      note
    };
    onSubmit(record);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <h3 className="text-xl font-bold text-slate-800">{initialData ? '修改记录' : '手动记录'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" /> 测量时间
              </label>
              <input 
                type="datetime-local" 
                required
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-500" /> 测量手臂
              </label>
              <div className="flex gap-2">
                {(['左手', '右手', '未指定'] as ArmType[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setArm(option)}
                    className={`flex-1 py-2 rounded-xl border-2 transition-all font-medium text-sm ${
                      arm === option 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' 
                        : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">收缩压 (高压)</label>
              <div className="relative">
                <input 
                  type="number" 
                  required
                  min="40" max="300"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none transition-all pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">SYS</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">舒张压 (低压)</label>
              <div className="relative">
                <input 
                  type="number" 
                  required
                  min="40" max="250"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">DIA</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" /> 心率
            </label>
            <div className="relative">
              <input 
                type="number" 
                required
                min="30" max="250"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">bpm</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">备注</label>
            <textarea 
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加测量环境、身体感受等..."
              className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              {initialData ? '保存修改' : '保存记录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BPForm;
