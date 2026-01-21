
import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, AlertTriangle, CheckCircle2, Loader2, Save, History, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { BPRecord, AIReport } from '../types';
import { GoogleGenAI } from "@google/genai";

interface AIInsightsProps {
  records: BPRecord[];
  onSaveReport: (report: AIReport) => void;
  savedReports: AIReport[];
  onDeleteReport: (id: string) => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ records, onSaveReport, savedReports, onDeleteReport }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const analyzeData = async () => {
    if (records.length === 0) return;
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `作为一名专业的家庭医生助理，请分析以下血压测量记录并给出详细建议：
      ${JSON.stringify(records.slice(0, 15))}
      
      请重点分析：
      1. 总体数值表现（正常、偏高、波动情况）。
      2. 左右手差异分析：如果记录中包含左右手对比，请指出差异是否在正常范围。
      3. 活动关联：根据备注分析血压的变化。
      4. 针对性建议：针对当前的数值趋势，在作息、情绪管理和用药记录方面给出回复。
      
      请使用亲切、专业的语气，Markdown 格式，中文回复。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsight(response.text || '分析失败，请稍后再试。');
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setInsight('抱歉，目前无法连接到 AI 服务。');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!insight) return;
    const report: AIReport = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      content: insight,
      recordCount: records.length
    };
    onSaveReport(report);
    setInsight(null);
    alert('报告已保存至历史记录');
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 w-12 h-12 text-white/10" />
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">智能健康助手</h3>
            <p className="text-indigo-100 text-sm opacity-90">AI 深度分析您的血压趋势与左右手差异</p>
          </div>
        </div>
        
        <button 
          onClick={analyzeData}
          disabled={loading || records.length === 0}
          className="w-full md:w-auto bg-white text-indigo-600 hover:bg-indigo-50 px-10 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {loading ? 'AI 正在分析...' : '一键生成深度分析报告'}
        </button>
      </div>

      {insight && (
        <div className="bg-white rounded-[2rem] p-8 border border-indigo-100 shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" /> 最新分析结果
            </h4>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors"
            >
              <Save className="w-4 h-4" /> 保存至历史
            </button>
          </div>
          <div className="prose prose-indigo max-w-none text-slate-700 leading-relaxed border-t pt-6">
            {insight.split('\n').map((line, i) => (
              <p key={i} className={line.startsWith('#') ? 'text-xl font-bold text-slate-900 mt-6' : 'my-2'}>
                {line.replace(/^#+ /, '')}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold px-2">
          <History className="w-5 h-5" /> 历史分析报告
        </div>
        
        {savedReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400">
            暂无保存的报告
          </div>
        ) : (
          <div className="space-y-3">
            {savedReports.map(report => (
              <div key={report.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">
                        分析报告 - {new Date(report.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        基于 {report.recordCount} 条历史数据 · {new Date(report.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteReport(report.id); }}
                      className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedReportId === report.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                  </div>
                </div>
                {expandedReportId === report.id && (
                  <div className="p-6 bg-slate-50 border-t border-slate-100 prose prose-sm max-w-none text-slate-600">
                    {report.content.split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('#') ? 'font-bold text-slate-800 mt-4 first:mt-0' : 'my-1'}>
                        {line.replace(/^#+ /, '')}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
