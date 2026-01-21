
import React, { useState } from 'react';
import { X, Wand2, Loader2, CheckCircle, AlertCircle, Sparkles, Heart } from 'lucide-react';
import { BPRecord, ArmType } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface BulkImportProps {
  onImport: (records: BPRecord[]) => void;
  onClose: () => void;
}

const BulkImport: React.FC<BulkImportProps> = ({ onImport, onClose }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<BPRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAIParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `你是一个专业的医疗数据提取助手。请从用户提供的这段文本中解析出血压测量记录。
      
      用户输入：
      """
      ${text}
      """
      
      规则：
      1. 提取内容：日期时间、收缩压(SYS)、舒张压(DIA)、心率/脉搏(HR)、手臂(左手/右手/未指定)、备注。
      2. 时间处理：如果只有月日没写年份，默认使用 ${new Date().getFullYear()} 年。
      3. 备注提取：除了数值和部位之外的描述（如“早上刚起来”、“打篮球运动完”）都放入备注字段。
      4. 输出：必须输出有效的 JSON 数组。
      5. 字段名：timestamp(ISO格式), systolic, diastolic, heartRate, arm(只能是'左手','右手'或'未指定'), note。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                systolic: { type: Type.NUMBER },
                diastolic: { type: Type.NUMBER },
                heartRate: { type: Type.NUMBER },
                arm: { type: Type.STRING },
                note: { type: Type.STRING }
              },
              required: ["timestamp", "systolic", "diastolic", "heartRate", "arm", "note"]
            }
          }
        },
      });

      // Extract generated text directly from the text property
      const parsedData = JSON.parse(response.text || '[]');
      const recordsWithIds = parsedData.map((r: any) => ({
        ...r,
        id: Math.random().toString(36).substr(2, 9)
      }));
      setPreview(recordsWithIds);
    } catch (err) {
      console.error(err);
      setError('AI 无法解析该段文字，请检查格式或尝试提供更清晰的信息。');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onImport(preview);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 bg-slate-50/50 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-xl">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">AI 批量文本导入</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {!preview ? (
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-2xl flex gap-3 items-start">
                <Sparkles className="w-5 h-5 text-indigo-500 mt-1 shrink-0" />
                <p className="text-sm text-indigo-700 leading-relaxed">
                  您可以直接粘贴微信聊天记录或日记。例如：<br/>
                  <code className="bg-white/50 px-1 rounded">1.18 8:56 左手 130 89 79 刚起床</code>
                </p>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在此粘贴记录文本..."
                rows={10}
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-mono text-sm leading-relaxed"
              />
              <button
                onClick={handleAIParse}
                disabled={loading || !text.trim()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                {loading ? 'AI 解析中...' : '智能识别并生成列表'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-700">识别结果预览 ({preview.length})</h4>
                <button onClick={() => setPreview(null)} className="text-sm text-indigo-600 font-medium hover:underline">重新录入</button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {preview.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                          {r.arm}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {r.systolic}/{r.diastolic} <small className="text-slate-400">mmHg</small>
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          {/* Corrected: Added Heart to imports from lucide-react */}
                          <Heart className="w-3 h-3 text-rose-500" /> {r.heartRate}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(r.timestamp).toLocaleString()} {r.note && `· ${r.note}`}
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                ))}
              </div>
              <button
                onClick={handleConfirm}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]"
              >
                确认并存入记录
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImport;
