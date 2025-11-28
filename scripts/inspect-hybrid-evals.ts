import fs from 'node:fs';
import path from 'node:path';

type EvalCase = {
  id: string;
  jobType: string;
  expectedRouting: string[];
};

function loadEvalCases(): EvalCase[] {
  const evalPath = path.join(process.cwd(), 'automation', 'evals', 'hybrid-routing-evals.json');
  const raw = fs.readFileSync(evalPath, 'utf8');
  return JSON.parse(raw) as EvalCase[];
}

function summarize(cases: EvalCase[]) {
  const byJobType = new Map<string, EvalCase[]>();

  for (const testCase of cases) {
    const bucket = byJobType.get(testCase.jobType) ?? [];
    bucket.push(testCase);
    byJobType.set(testCase.jobType, bucket);
  }

  console.log('📊 Hybrid Routing Evaluation Set Summary');
  console.log(`Total cases: ${cases.length}`);
  console.log('---------------------------------------');

  for (const [jobType, bucket] of byJobType.entries()) {
    const hostedPreferred = bucket.filter((item) =>
      item.expectedRouting.some((step) => step.includes(':hosted')),
    ).length;
    const localPreferred = bucket.filter((item) =>
      item.expectedRouting.some((step) => step.includes(':local')),
    ).length;

    console.log(
      `${jobType.padEnd(18)} • ${bucket.length.toString().padStart(2)} cases  |  hosted-pref=${hostedPreferred
        .toString()
        .padStart(2)}  local-pref=${localPreferred.toString().padStart(2)}`,
    );
  }

  console.log('---------------------------------------');
  console.log('Use this set inside the agents repo to benchmark hybrid routing decisions.');
}

try {
  const cases = loadEvalCases();
  summarize(cases);
} catch (error) {
  console.error('❌ Unable to load evaluation set:', error);
  process.exitCode = 1;
}

