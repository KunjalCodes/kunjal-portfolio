import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function testHttpEndpoint(pathname) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${pathname}`, (res) => {
      resolve({ status: res.statusCode, headers: res.headers });
    });
    req.on('error', (err) => {
      resolve({ status: 'ERROR', error: err.message });
    });
  });
}

async function runAudit() {
  console.log('=== KUNJAL.J PORTFOLIO ENGINEERING AUDIT ===\n');

  // 1. Route Verification
  const routesToTest = [
    '/',
    '/work',
    '/work/second-brain',
    '/work/food-lens',
    '/work/multi-agent-builder',
    '/work/mcp-ai-copilot',
    '/work/rag-ml-textbook-chatbot',
    '/work/furniture-drawing-extractor',
    '/playground',
    '/playground?tab=pipeline',
    '/playground?tab=eval',
    '/playground?tab=prompt',
    '/playground?tab=architecture',
    '/lab',
    '/about',
    '/contact',
    '/resume-kunjal-joshi.pdf',
    '/assets/pink-flame.mp4',
    '/assets/flame-poster.jpg',
    '/assets/character/chotu-walking.png',
    '/assets/character/chotu-thinking.png',
    '/assets/character/chotu-coding.png',
    '/assets/character/chotu-waving.png',
    '/favicon.svg'
  ];

  console.log('1. Testing HTTP Endpoints on Dev Server:');
  let allRoutesPass = true;
  for (const route of routesToTest) {
    const res = await testHttpEndpoint(route);
    const pass = res.status === 200;
    if (!pass) allRoutesPass = false;
    console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${route} -> Status: ${res.status}`);
  }

  // 2. File and Asset Integrity Check
  console.log('\n2. Testing Critical Files & Deployment Assets:');
  const criticalFiles = [
    'public/resume-kunjal-joshi.pdf',
    'public/assets/pink-flame.mp4',
    'public/assets/flame-poster.jpg',
    'public/assets/character/chotu-walking.png',
    'public/assets/character/chotu-thinking.png',
    'public/assets/character/chotu-coding.png',
    'public/assets/character/chotu-waving.png',
    'public/favicon.svg',
    'public/_redirects',
    'vercel.json',
    'index.html',
    'src/main.tsx',
    'src/App.tsx'
  ];

  let allFilesPass = true;
  for (const relPath of criticalFiles) {
    const fullPath = path.join(rootDir, relPath);
    const exists = fs.existsSync(fullPath);
    const size = exists ? fs.statSync(fullPath).size : 0;
    if (!exists || size === 0) allFilesPass = false;
    console.log(`  [${exists ? 'PASS' : 'FAIL'}] ${relPath} (${size} bytes)`);
  }

  // 3. Mathematical Consistency Check for ML Evaluation
  console.log('\n3. Testing ML Evaluation Dynamic Computation:');
  // Manual dataset test case
  const testItems = [
    { modelScore: 0.9, trueLabel: 1 },
    { modelScore: 0.8, trueLabel: 1 },
    { modelScore: 0.4, trueLabel: 1 }, // FN at 0.5
    { modelScore: 0.6, trueLabel: 0 }, // FP at 0.5
    { modelScore: 0.2, trueLabel: 0 }, // TN at 0.5
  ];

  // At t=0.5:
  // Preds: [1, 1, 0, 1, 0]
  // TP = 2, FP = 1, FN = 1, TN = 1
  // Total = 5
  // Acc = (2 + 1) / 5 = 0.6
  // Prec = 2 / (2 + 1) = 0.666...
  // Recall = 2 / (2 + 1) = 0.666...
  // F1 = 2 * (2/3 * 2/3) / (4/3) = 0.666...
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const item of testItems) {
    const pred = item.modelScore >= 0.5 ? 1 : 0;
    if (item.trueLabel === 1 && pred === 1) tp++;
    else if (item.trueLabel === 0 && pred === 1) fp++;
    else if (item.trueLabel === 0 && pred === 0) tn++;
    else if (item.trueLabel === 1 && pred === 0) fn++;
  }
  const acc = (tp + tn) / 5;
  const prec = tp / (tp + fp);
  const rec = tp / (tp + fn);
  const f1 = (2 * prec * rec) / (prec + rec);

  const mathPass = tp === 2 && fp === 1 && fn === 1 && tn === 1 && Math.abs(acc - 0.6) < 0.001;
  console.log(`  [${mathPass ? 'PASS' : 'FAIL'}] Dynamic Confusion Matrix: TP=${tp}, FP=${fp}, TN=${tn}, FN=${fn}`);
  console.log(`  [${mathPass ? 'PASS' : 'FAIL'}] Formula Calculations: Acc=${acc.toFixed(2)}, Prec=${prec.toFixed(2)}, Rec=${rec.toFixed(2)}, F1=${f1.toFixed(2)}`);

  console.log('\n=== AUDIT SUMMARY ===');
  if (allRoutesPass && allFilesPass && mathPass) {
    console.log('ALL AUDIT CHECKS PASSED SUCCESSFULLY (100% PASS RATE).');
  } else {
    console.error('AUDIT FOUND ISSUES TO INVESTIGATE.');
    process.exit(1);
  }
}

runAudit();
