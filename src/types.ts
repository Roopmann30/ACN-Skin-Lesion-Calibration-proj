export type TabType = 'upload' | 'result' | 'calibration';
export type AppView = 'home' | 'auth' | 'app';

export interface UserProfile {
  name: string;
  role: string;
  institution: string;
  avatarLetter: string;
}

export interface CalibrationBin {
  bin: string;
  confidence: number;
  uncalibratedAcc: number;
  fixedTAcc: number;
  acnAcc: number;
}

export interface ClassProbability {
  code: string;
  name: string;
  logit: number;
  uncalibrated: number;
  fixedT: number;
  acn: number;
}

export interface ModelMetricSet {
  method: string;
  ece: number;
  mce: number;
  brier: number;
  nll: number;
  accuracy: number;
  highlight?: boolean;
}

export interface ExtractedSignals {
  featureDim: number;
  featureNorm: number;
  featureSample: number[];
  logits: number[];
  maxSoftmaxProb: number;
  predictiveEntropy: number;
  classProbabilities: ClassProbability[];
}

export interface LesionSample {
  id: string;
  code: string;
  name: string;
  category: 'malignant' | 'benign';
  features: string[];
  imageSrc: string;
  predictedClass: string;
  hamClassCode: 'mel' | 'nv' | 'bcc' | 'bkl' | 'akiec' | 'vasc' | 'df';
  uncalibratedConfidence: number;
  fixedT: number;
  fixedConfidence: number;
  tx: number;
  acnConfidence: number;
  uncalibratedEce: number;
  fixedEce: number;
  acnEce: number;
  bins: CalibrationBin[];
  signals: ExtractedSignals;
  comparisonMetrics: ModelMetricSet[];
}
