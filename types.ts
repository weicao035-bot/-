
export enum BPLevel {
  NORMAL = '正常',
  ELEVATED = '正常高值',
  STAGE1 = '1级高血压',
  STAGE2 = '2级高血压',
  CRISIS = '高血压危象'
}

export type ArmType = '左手' | '右手' | '未指定';

export interface BPRecord {
  id: string;
  timestamp: string; // ISO string
  systolic: number;  // 收缩压 (高压)
  diastolic: number; // 舒张压 (低压)
  heartRate: number; // 心率
  note: string;      // 备注
  arm: ArmType;      // 测量手臂
}

export interface AIReport {
  id: string;
  timestamp: string;
  content: string;
  recordCount: number;
}

export interface BPStats {
  averageSystolic: number;
  averageDiastolic: number;
  averageHeartRate: number;
  totalRecords: number;
}
