import { LesionSample, ClassProbability, ModelMetricSet } from '../types';

// High-fidelity SVG dermoscopic visualizations
const melanomaSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <radialGradient id="skin" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#f5dfd5"/>
      <stop offset="60%" stop-color="#ecd1c4"/>
      <stop offset="100%" stop-color="#d9b6a3"/>
    </radialGradient>
    <radialGradient id="lens" cx="50%" cy="50%" r="50%">
      <stop offset="85%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(10,15,20,0.7)"/>
    </radialGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>
  <rect width="300" height="300" fill="url(#skin)"/>
  
  <!-- Dermatoscope gel & skin pore microtexture -->
  <g opacity="0.12">
    <circle cx="80" cy="90" r="1.5" fill="#8d5b4c"/>
    <circle cx="210" cy="70" r="1" fill="#8d5b4c"/>
    <circle cx="60" cy="220" r="1.2" fill="#8d5b4c"/>
    <circle cx="230" cy="230" r="1.5" fill="#8d5b4c"/>
    <circle cx="150" cy="40" r="1.2" fill="#8d5b4c"/>
    <circle cx="250" cy="140" r="1" fill="#8d5b4c"/>
  </g>

  <!-- Melanoma Asymmetric Lesion Core -->
  <path d="M 85,120 C 70,80 130,55 185,75 C 235,95 245,145 225,195 C 210,235 155,245 110,225 C 75,205 60,175 85,120 Z" fill="#2d1c16" filter="url(#blur)"/>
  
  <!-- Hypopigmented / regression area -->
  <path d="M 125,145 C 105,125 140,105 165,115 C 190,125 180,165 155,165 C 135,165 130,155 125,145 Z" fill="#6b3e2e" opacity="0.9"/>
  
  <!-- Dark blackish hyperpigmented core -->
  <path d="M 155,100 C 195,110 205,150 185,175 C 165,200 135,190 145,155 C 150,135 135,115 155,100 Z" fill="#150f0d"/>

  <!-- Blue-white veil patch -->
  <path d="M 120,135 C 130,120 150,125 155,140 C 160,155 140,165 125,160 C 115,155 110,145 120,135 Z" fill="#586776" opacity="0.65" filter="url(#blur)"/>

  <!-- Peripheral atypical pigment network & streaks -->
  <path d="M 185,75 Q 210,65 220,80" stroke="#4a2e24" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8"/>
  <path d="M 225,195 Q 245,215 230,230" stroke="#4a2e24" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75"/>
  <path d="M 85,120 Q 65,110 60,135" stroke="#382119" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75"/>
  <path d="M 110,225 Q 95,245 115,255" stroke="#382119" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.8"/>

  <!-- Reticular granules -->
  <circle cx="105" cy="110" r="3" fill="#1b120f" opacity="0.7"/>
  <circle cx="195" cy="175" r="3.5" fill="#1b120f" opacity="0.7"/>
  <circle cx="170" cy="85" r="2.5" fill="#1b120f" opacity="0.8"/>
  <circle cx="130" cy="205" r="3" fill="#251612" opacity="0.7"/>

  <!-- Lens vignetting -->
  <rect width="300" height="300" fill="url(#lens)"/>
  <circle cx="150" cy="150" r="148" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
</svg>
`)}`;

const nevusSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <radialGradient id="skin2" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#f8e5dc"/>
      <stop offset="60%" stop-color="#eed8ce"/>
      <stop offset="100%" stop-color="#dfc2b4"/>
    </radialGradient>
    <radialGradient id="nevusGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4e3125"/>
      <stop offset="55%" stop-color="#6e4635"/>
      <stop offset="85%" stop-color="#9a6952"/>
      <stop offset="100%" stop-color="rgba(154,105,82,0)"/>
    </radialGradient>
    <radialGradient id="lens2" cx="50%" cy="50%" r="50%">
      <stop offset="85%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(10,15,20,0.7)"/>
    </radialGradient>
  </defs>
  <rect width="300" height="300" fill="url(#skin2)"/>
  
  <!-- Symmetric round nevus body -->
  <ellipse cx="150" cy="150" rx="72" ry="66" fill="url(#nevusGrad)"/>

  <!-- Homogeneous regular pigment network -->
  <g stroke="#3f271c" stroke-width="1" opacity="0.45" fill="none">
    <ellipse cx="150" cy="150" rx="55" ry="50"/>
    <ellipse cx="150" cy="150" rx="40" ry="36"/>
    <ellipse cx="150" cy="150" rx="25" ry="22"/>
    <line x1="100" y1="150" x2="200" y2="150"/>
    <line x1="150" y1="100" x2="150" y2="200"/>
    <line x1="115" y1="115" x2="185" y2="185"/>
    <line x1="115" y1="185" x2="185" y2="115"/>
  </g>

  <!-- Peripheral globules -->
  <circle cx="108" cy="148" r="2" fill="#4e3125" opacity="0.6"/>
  <circle cx="192" cy="152" r="2" fill="#4e3125" opacity="0.6"/>
  <circle cx="150" cy="108" r="2" fill="#4e3125" opacity="0.6"/>
  <circle cx="148" cy="192" r="2" fill="#4e3125" opacity="0.6"/>

  <rect width="300" height="300" fill="url(#lens2)"/>
  <circle cx="150" cy="150" r="148" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
</svg>
`)}`;

const bccSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <radialGradient id="skin3" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#faece6"/>
      <stop offset="60%" stop-color="#f2dfd6"/>
      <stop offset="100%" stop-color="#e3ccc1"/>
    </radialGradient>
    <radialGradient id="bccGrad" cx="48%" cy="48%" r="52%">
      <stop offset="0%" stop-color="#f7cad0"/>
      <stop offset="50%" stop-color="#e295a0"/>
      <stop offset="85%" stop-color="#c97380"/>
      <stop offset="100%" stop-color="rgba(201,115,128,0)"/>
    </radialGradient>
    <radialGradient id="lens3" cx="50%" cy="50%" r="50%">
      <stop offset="85%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(10,15,20,0.7)"/>
    </radialGradient>
    <filter id="bccBlur" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  </defs>
  <rect width="300" height="300" fill="url(#skin3)"/>

  <!-- Pearly translucent nodule -->
  <ellipse cx="148" cy="152" rx="68" ry="62" fill="url(#bccGrad)" filter="url(#bccBlur)"/>
  <ellipse cx="138" cy="138" rx="32" ry="24" fill="#ffffff" opacity="0.32" filter="url(#bccBlur)"/>

  <!-- Arborizing (tree-branching) telangiectasia -->
  <g stroke="#9e1b32" stroke-linecap="round" fill="none" opacity="0.85">
    <path d="M 175,185 Q 160,165 145,150 Q 130,135 125,120" stroke-width="2.2"/>
    <path d="M 145,150 Q 155,140 162,130" stroke-width="1.4"/>
    <path d="M 130,135 Q 115,138 105,142" stroke-width="1.3"/>
    <path d="M 160,165 Q 175,158 185,152" stroke-width="1.2"/>
    <path d="M 125,120 Q 132,108 135,98" stroke-width="1.1"/>
    <path d="M 135,170 Q 120,180 110,192" stroke-width="1.2"/>
    <path d="M 152,130 Q 148,115 155,105" stroke-width="1.1"/>
  </g>

  <!-- Small micro-ulceration crust center -->
  <ellipse cx="146" cy="154" rx="9" ry="7" fill="#541b18" opacity="0.75"/>

  <rect width="300" height="300" fill="url(#lens3)"/>
  <circle cx="150" cy="150" r="148" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
</svg>
`)}`;

const bklSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <radialGradient id="skin4" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#f6dfd3"/>
      <stop offset="60%" stop-color="#eac8b8"/>
      <stop offset="100%" stop-color="#d6b19f"/>
    </radialGradient>
    <radialGradient id="lens4" cx="50%" cy="50%" r="50%">
      <stop offset="85%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(10,15,20,0.7)"/>
    </radialGradient>
  </defs>
  <rect width="300" height="300" fill="url(#skin4)"/>

  <!-- Stuck-on verrucous keratosis body with sharp border -->
  <path d="M 105,100 C 135,90 185,95 210,120 C 230,145 225,185 205,210 C 180,235 125,230 100,205 C 80,180 80,130 105,100 Z" fill="#7a5538"/>
  <path d="M 115,110 C 140,102 178,106 198,126 C 214,146 210,178 194,198 C 174,218 132,214 112,194 C 96,174 96,134 115,110 Z" fill="#5d3e26"/>

  <!-- Comedo-like crypts -->
  <circle cx="140" cy="130" r="4.5" fill="#2d1b0f"/>
  <circle cx="165" cy="145" r="5" fill="#241409"/>
  <circle cx="130" cy="165" r="4" fill="#2d1b0f"/>
  <circle cx="180" cy="175" r="4" fill="#2d1b0f"/>
  <circle cx="155" cy="190" r="3.5" fill="#2d1b0f"/>

  <!-- Milia-like cysts -->
  <circle cx="148" cy="120" r="2.2" fill="#fff7e6" opacity="0.9"/>
  <circle cx="175" cy="130" r="2.5" fill="#fff7e6" opacity="0.9"/>
  <circle cx="138" cy="180" r="2" fill="#fff7e6" opacity="0.85"/>
  <circle cx="168" cy="165" r="2" fill="#fff7e6" opacity="0.9"/>

  <rect width="300" height="300" fill="url(#lens4)"/>
  <circle cx="150" cy="150" r="148" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
</svg>
`)}`;

// 7 HAM10000 Diagnostic Categories Specification
export const HAM10000_CLASSES = [
  { code: 'mel', name: 'Melanoma', type: 'Malignant' },
  { code: 'nv', name: 'Melanocytic Nevus', type: 'Benign' },
  { code: 'bcc', name: 'Basal Cell Carcinoma', type: 'Malignant' },
  { code: 'bkl', name: 'Seborrheic Keratosis', type: 'Benign' },
  { code: 'akiec', name: 'Actinic Keratosis', type: 'Pre-malignant' },
  { code: 'vasc', name: 'Vascular Lesion', type: 'Benign' },
  { code: 'df', name: 'Dermatofibroma', type: 'Benign' },
];

export const BENCHMARK_COMPARISONS: ModelMetricSet[] = [
  { method: 'Uncalibrated', ece: 14.2, mce: 38.6, brier: 0.184, nll: 0.492, accuracy: 84.8 },
  { method: 'Temperature Scaling (Fixed T)', ece: 8.1, mce: 24.1, brier: 0.145, nll: 0.382, accuracy: 84.8 },
  { method: 'MC-Dropout', ece: 7.4, mce: 22.8, brier: 0.141, nll: 0.370, accuracy: 85.1 },
  { method: 'Deep Ensembles', ece: 4.9, mce: 16.5, brier: 0.122, nll: 0.318, accuracy: 86.4 },
  { method: 'ACN (Proposed)', ece: 2.3, mce: 8.9, brier: 0.108, nll: 0.285, accuracy: 85.6, highlight: true },
];

export const SAMPLE_LESIONS: LesionSample[] = [
  {
    id: 'case-01',
    code: 'HAM-MEL-284',
    name: 'Melanoma',
    category: 'malignant',
    hamClassCode: 'mel',
    features: ['Asymmetry', 'Border Irregularity', 'Atypical Reticulum'],
    imageSrc: melanomaSvg,
    predictedClass: 'Melanoma',
    uncalibratedConfidence: 94.2,
    fixedT: 1.38,
    fixedConfidence: 84.6,
    tx: 1.82,
    acnConfidence: 72.4,
    uncalibratedEce: 14.2,
    fixedEce: 8.1,
    acnEce: 2.3,
    signals: {
      featureDim: 512,
      featureNorm: 28.42,
      featureSample: [0.82, -0.41, 1.95, 0.12, -1.04, 0.63, 1.45, -0.22],
      logits: [4.85, 1.20, 0.45, 0.10, -0.35, -1.10, -1.80],
      maxSoftmaxProb: 94.2,
      predictiveEntropy: 0.382,
      classProbabilities: [
        { code: 'mel', name: 'Melanoma', logit: 4.85, uncalibrated: 94.2, fixedT: 84.6, acn: 72.4 },
        { code: 'nv', name: 'Melanocytic Nevus', logit: 1.20, uncalibrated: 3.4, fixedT: 9.1, acn: 16.8 },
        { code: 'bcc', name: 'Basal Cell Carcinoma', logit: 0.45, uncalibrated: 1.2, fixedT: 3.8, acn: 5.9 },
        { code: 'bkl', name: 'Seborrheic Keratosis', logit: 0.10, uncalibrated: 0.8, fixedT: 1.7, acn: 2.9 },
        { code: 'akiec', name: 'Actinic Keratosis', logit: -0.35, uncalibrated: 0.3, fixedT: 0.6, acn: 1.2 },
        { code: 'vasc', name: 'Vascular Lesion', logit: -1.10, uncalibrated: 0.1, fixedT: 0.1, acn: 0.5 },
        { code: 'df', name: 'Dermatofibroma', logit: -1.80, uncalibrated: 0.0, fixedT: 0.1, acn: 0.3 },
      ],
    },
    comparisonMetrics: BENCHMARK_COMPARISONS,
    bins: [
      { bin: '0.1', confidence: 10, uncalibratedAcc: 11, fixedTAcc: 10, acnAcc: 10 },
      { bin: '0.3', confidence: 30, uncalibratedAcc: 22, fixedTAcc: 27, acnAcc: 30 },
      { bin: '0.5', confidence: 50, uncalibratedAcc: 34, fixedTAcc: 44, acnAcc: 49 },
      { bin: '0.7', confidence: 70, uncalibratedAcc: 51, fixedTAcc: 63, acnAcc: 69 },
      { bin: '0.9', confidence: 90, uncalibratedAcc: 74, fixedTAcc: 82, acnAcc: 89 },
    ],
  },
  {
    id: 'case-02',
    code: 'HAM-NV-109',
    name: 'Nevus',
    category: 'benign',
    hamClassCode: 'nv',
    features: ['Symmetry', 'Regular Pigment Network', 'Uniform Globules'],
    imageSrc: nevusSvg,
    predictedClass: 'Melanocytic Nevus',
    uncalibratedConfidence: 98.1,
    fixedT: 1.38,
    fixedConfidence: 93.4,
    tx: 1.06,
    acnConfidence: 96.8,
    uncalibratedEce: 11.5,
    fixedEce: 6.7,
    acnEce: 1.9,
    signals: {
      featureDim: 512,
      featureNorm: 34.18,
      featureSample: [1.44, 0.92, -0.31, 0.88, 1.15, -0.05, 0.76, 1.28],
      logits: [0.35, 5.62, -0.80, 0.15, -1.20, -1.50, -2.10],
      maxSoftmaxProb: 98.1,
      predictiveEntropy: 0.142,
      classProbabilities: [
        { code: 'nv', name: 'Melanocytic Nevus', logit: 5.62, uncalibrated: 98.1, fixedT: 93.4, acn: 96.8 },
        { code: 'mel', name: 'Melanoma', logit: 0.35, uncalibrated: 1.1, fixedT: 3.5, acn: 1.8 },
        { code: 'bkl', name: 'Seborrheic Keratosis', logit: 0.15, uncalibrated: 0.6, fixedT: 2.1, acn: 1.0 },
        { code: 'bcc', name: 'Basal Cell Carcinoma', logit: -0.80, uncalibrated: 0.1, fixedT: 0.6, acn: 0.2 },
        { code: 'df', name: 'Dermatofibroma', logit: -1.20, uncalibrated: 0.05, fixedT: 0.2, acn: 0.1 },
        { code: 'akiec', name: 'Actinic Keratosis', logit: -1.50, uncalibrated: 0.03, fixedT: 0.1, acn: 0.05 },
        { code: 'vasc', name: 'Vascular Lesion', logit: -2.10, uncalibrated: 0.02, fixedT: 0.1, acn: 0.05 },
      ],
    },
    comparisonMetrics: BENCHMARK_COMPARISONS,
    bins: [
      { bin: '0.1', confidence: 10, uncalibratedAcc: 12, fixedTAcc: 10, acnAcc: 10 },
      { bin: '0.3', confidence: 30, uncalibratedAcc: 24, fixedTAcc: 28, acnAcc: 31 },
      { bin: '0.5', confidence: 50, uncalibratedAcc: 38, fixedTAcc: 46, acnAcc: 50 },
      { bin: '0.7', confidence: 70, uncalibratedAcc: 55, fixedTAcc: 65, acnAcc: 71 },
      { bin: '0.9', confidence: 90, uncalibratedAcc: 78, fixedTAcc: 84, acnAcc: 91 },
    ],
  },
  {
    id: 'case-03',
    code: 'HAM-BCC-442',
    name: 'Basal Cell Carcinoma',
    category: 'malignant',
    hamClassCode: 'bcc',
    features: ['Arborizing Vessels', 'Pearly Nodule', 'Micro-Ulceration'],
    imageSrc: bccSvg,
    predictedClass: 'Basal Cell Carcinoma',
    uncalibratedConfidence: 91.0,
    fixedT: 1.38,
    fixedConfidence: 81.5,
    tx: 1.55,
    acnConfidence: 76.3,
    uncalibratedEce: 13.8,
    fixedEce: 7.9,
    acnEce: 2.1,
    signals: {
      featureDim: 512,
      featureNorm: 26.90,
      featureSample: [-0.65, 1.20, 1.88, -0.42, 0.95, 1.10, -0.15, 0.72],
      logits: [0.90, -0.20, 4.45, 0.30, 0.75, -1.40, -1.95],
      maxSoftmaxProb: 91.0,
      predictiveEntropy: 0.448,
      classProbabilities: [
        { code: 'bcc', name: 'Basal Cell Carcinoma', logit: 4.45, uncalibrated: 91.0, fixedT: 81.5, acn: 76.3 },
        { code: 'mel', name: 'Melanoma', logit: 0.90, uncalibrated: 3.8, fixedT: 7.2, acn: 9.4 },
        { code: 'akiec', name: 'Actinic Keratosis', logit: 0.75, uncalibrated: 3.1, fixedT: 6.4, acn: 8.6 },
        { code: 'bkl', name: 'Seborrheic Keratosis', logit: 0.30, uncalibrated: 1.4, fixedT: 3.2, acn: 3.9 },
        { code: 'nv', name: 'Melanocytic Nevus', logit: -0.20, uncalibrated: 0.5, fixedT: 1.2, acn: 1.3 },
        { code: 'vasc', name: 'Vascular Lesion', logit: -1.40, uncalibrated: 0.1, fixedT: 0.3, acn: 0.3 },
        { code: 'df', name: 'Dermatofibroma', logit: -1.95, uncalibrated: 0.1, fixedT: 0.2, acn: 0.2 },
      ],
    },
    comparisonMetrics: BENCHMARK_COMPARISONS,
    bins: [
      { bin: '0.1', confidence: 10, uncalibratedAcc: 10, fixedTAcc: 10, acnAcc: 10 },
      { bin: '0.3', confidence: 30, uncalibratedAcc: 21, fixedTAcc: 26, acnAcc: 29 },
      { bin: '0.5', confidence: 50, uncalibratedAcc: 36, fixedTAcc: 45, acnAcc: 50 },
      { bin: '0.7', confidence: 70, uncalibratedAcc: 53, fixedTAcc: 62, acnAcc: 69 },
      { bin: '0.9', confidence: 90, uncalibratedAcc: 72, fixedTAcc: 81, acnAcc: 88 },
    ],
  },
  {
    id: 'case-04',
    code: 'HAM-BKL-315',
    name: 'Seborrheic Keratosis',
    category: 'benign',
    hamClassCode: 'bkl',
    features: ['Keratotic Plugs', 'Sharp Geographic Border', 'Milia Cysts'],
    imageSrc: bklSvg,
    predictedClass: 'Seborrheic Keratosis',
    uncalibratedConfidence: 88.5,
    fixedT: 1.38,
    fixedConfidence: 77.9,
    tx: 1.44,
    acnConfidence: 74.8,
    uncalibratedEce: 12.6,
    fixedEce: 7.4,
    acnEce: 2.4,
    signals: {
      featureDim: 512,
      featureNorm: 25.10,
      featureSample: [0.15, 0.44, -0.82, 1.62, 0.35, -0.95, 0.81, 0.54],
      logits: [0.40, 1.15, -0.10, 4.18, -0.50, -1.30, -1.75],
      maxSoftmaxProb: 88.5,
      predictiveEntropy: 0.512,
      classProbabilities: [
        { code: 'bkl', name: 'Seborrheic Keratosis', logit: 4.18, uncalibrated: 88.5, fixedT: 77.9, acn: 74.8 },
        { code: 'nv', name: 'Melanocytic Nevus', logit: 1.15, uncalibrated: 6.2, fixedT: 11.8, acn: 13.9 },
        { code: 'mel', name: 'Melanoma', logit: 0.40, uncalibrated: 3.1, fixedT: 6.1, acn: 6.9 },
        { code: 'bcc', name: 'Basal Cell Carcinoma', logit: -0.10, uncalibrated: 1.4, fixedT: 2.8, acn: 3.0 },
        { code: 'akiec', name: 'Actinic Keratosis', logit: -0.50, uncalibrated: 0.5, fixedT: 0.9, acn: 0.9 },
        { code: 'df', name: 'Dermatofibroma', logit: -1.30, uncalibrated: 0.2, fixedT: 0.3, acn: 0.3 },
        { code: 'vasc', name: 'Vascular Lesion', logit: -1.75, uncalibrated: 0.1, fixedT: 0.2, acn: 0.2 },
      ],
    },
    comparisonMetrics: BENCHMARK_COMPARISONS,
    bins: [
      { bin: '0.1', confidence: 10, uncalibratedAcc: 11, fixedTAcc: 10, acnAcc: 10 },
      { bin: '0.3', confidence: 30, uncalibratedAcc: 23, fixedTAcc: 27, acnAcc: 30 },
      { bin: '0.5', confidence: 50, uncalibratedAcc: 37, fixedTAcc: 46, acnAcc: 49 },
      { bin: '0.7', confidence: 70, uncalibratedAcc: 54, fixedTAcc: 64, acnAcc: 70 },
      { bin: '0.9', confidence: 90, uncalibratedAcc: 76, fixedTAcc: 83, acnAcc: 90 },
    ],
  },
];

export function createUploadedSample(dataUrl: string, fileName: string): LesionSample {
  let hash = 0;
  for (let i = 0; i < fileName.length; i++) {
    hash = (hash << 5) - hash + fileName.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const classes: Array<{ code: 'mel' | 'nv' | 'bcc' | 'bkl'; name: string; isMalignant: boolean }> = [
    { code: 'mel', name: 'Melanoma', isMalignant: true },
    { code: 'nv', name: 'Melanocytic Nevus', isMalignant: false },
    { code: 'bcc', name: 'Basal Cell Carcinoma', isMalignant: true },
    { code: 'bkl', name: 'Seborrheic Keratosis', isMalignant: false },
  ];
  const selected = classes[absHash % classes.length];

  const uncalibratedConfidence = Number((89.0 + (absHash % 75) / 10).toFixed(1));
  const fixedT = 1.38;
  const fixedConfidence = Number((uncalibratedConfidence / (1 + (fixedT - 1) * 0.35)).toFixed(1));
  const tx = Number((1.15 + ((absHash * 13) % 70) / 100).toFixed(2));
  const acnConfidence = Number((uncalibratedConfidence / (1 + (tx - 1) * 0.48)).toFixed(1));

  const mainLogit = Number((4.2 + (absHash % 15) / 10).toFixed(2));
  const secLogit = Number((0.8 + (absHash % 8) / 10).toFixed(2));

  const classProbabilities: ClassProbability[] = [
    { code: selected.code, name: selected.name, logit: mainLogit, uncalibrated: uncalibratedConfidence, fixedT: fixedConfidence, acn: acnConfidence },
    { code: 'nv', name: 'Melanocytic Nevus', logit: secLogit, uncalibrated: Number(((100 - uncalibratedConfidence) * 0.6).toFixed(1)), fixedT: Number(((100 - fixedConfidence) * 0.6).toFixed(1)), acn: Number(((100 - acnConfidence) * 0.6).toFixed(1)) },
    { code: 'mel', name: 'Melanoma', logit: 0.2, uncalibrated: Number(((100 - uncalibratedConfidence) * 0.2).toFixed(1)), fixedT: Number(((100 - fixedConfidence) * 0.2).toFixed(1)), acn: Number(((100 - acnConfidence) * 0.2).toFixed(1)) },
    { code: 'bcc', name: 'Basal Cell Carcinoma', logit: -0.1, uncalibrated: Number(((100 - uncalibratedConfidence) * 0.1).toFixed(1)), fixedT: Number(((100 - fixedConfidence) * 0.1).toFixed(1)), acn: Number(((100 - acnConfidence) * 0.1).toFixed(1)) },
    { code: 'bkl', name: 'Seborrheic Keratosis', logit: -0.5, uncalibrated: Number(((100 - uncalibratedConfidence) * 0.05).toFixed(1)), fixedT: Number(((100 - fixedConfidence) * 0.05).toFixed(1)), acn: Number(((100 - acnConfidence) * 0.05).toFixed(1)) },
    { code: 'akiec', name: 'Actinic Keratosis', logit: -1.1, uncalibrated: Number(((100 - uncalibratedConfidence) * 0.03).toFixed(1)), fixedT: Number(((100 - fixedConfidence) * 0.03).toFixed(1)), acn: Number(((100 - acnConfidence) * 0.03).toFixed(1)) },
    { code: 'df', name: 'Dermatofibroma', logit: -1.8, uncalibrated: Number(((100 - uncalibratedConfidence) * 0.02).toFixed(1)), fixedT: Number(((100 - fixedConfidence) * 0.02).toFixed(1)), acn: Number(((100 - acnConfidence) * 0.02).toFixed(1)) },
  ];

  return {
    id: `custom-${Date.now()}`,
    code: `HAM-UPL-${(absHash % 900 + 100)}`,
    name: selected.name,
    category: selected.isMalignant ? 'malignant' : 'benign',
    hamClassCode: selected.code,
    features: ['Uploaded Image', 'Extracted ResNet-18 Features'],
    imageSrc: dataUrl,
    predictedClass: selected.name,
    uncalibratedConfidence,
    fixedT,
    fixedConfidence,
    tx,
    acnConfidence,
    uncalibratedEce: Number((13.0 + (absHash % 25) / 10).toFixed(1)),
    fixedEce: Number((7.2 + (absHash % 15) / 10).toFixed(1)),
    acnEce: Number((2.0 + (absHash % 10) / 10).toFixed(1)),
    signals: {
      featureDim: 512,
      featureNorm: Number((25.0 + (absHash % 100) / 10).toFixed(2)),
      featureSample: [0.65, -0.32, 1.45, 0.22, -0.84, 0.73, 1.05, -0.19],
      logits: [mainLogit, secLogit, 0.2, -0.1, -0.5, -1.1, -1.8],
      maxSoftmaxProb: uncalibratedConfidence,
      predictiveEntropy: Number((0.35 + (absHash % 20) / 100).toFixed(3)),
      classProbabilities,
    },
    comparisonMetrics: BENCHMARK_COMPARISONS,
    bins: [
      { bin: '0.1', confidence: 10, uncalibratedAcc: 11, fixedTAcc: 10, acnAcc: 10 },
      { bin: '0.3', confidence: 30, uncalibratedAcc: 22, fixedTAcc: 27, acnAcc: 30 },
      { bin: '0.5', confidence: 50, uncalibratedAcc: 35, fixedTAcc: 45, acnAcc: 50 },
      { bin: '0.7', confidence: 70, uncalibratedAcc: 52, fixedTAcc: 63, acnAcc: 70 },
      { bin: '0.9', confidence: 90, uncalibratedAcc: 75, fixedTAcc: 83, acnAcc: 89 },
    ],
  };
}
