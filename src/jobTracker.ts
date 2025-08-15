import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { getConfig } from './config';

const JOBS_FILENAME = ".commiter-jobs.json";

export interface JobLog {
  id: string;
  name: string;
  timestamp: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  totalTokens: number;
  cost: number;
  model?: string;
}

export function generateJobId(): string {
  return randomBytes(8).toString('hex');
}

export async function logJob(jobName: string, inputTokens: number, outputTokens: number, cost?: number, model?: string, cachedTokens?: number): Promise<string> {
  const jobId = generateJobId();
  
  const job: JobLog = {
    id: jobId,
    name: jobName,
    timestamp: new Date().toISOString(),
    inputTokens,
    outputTokens,
    cachedTokens,
    totalTokens: inputTokens + outputTokens + (cachedTokens || 0),
    cost: cost || await calculateCost(inputTokens, outputTokens, cachedTokens, model),
    model
  };
  
  const jobs = await getJobLogs();
  jobs.push(job);
  
  const home = os.homedir() || process.env.HOME || process.env.USERPROFILE || ".";
  const jobsPath = path.join(home, JOBS_FILENAME);
  await fs.writeFile(jobsPath, JSON.stringify(jobs, null, 2), { encoding: "utf8", mode: 0o600 });
  
  return jobId;
}

async function calculateCost(inputTokens: number, outputTokens: number, cachedTokens: number = 0, model?: string): Promise<number> {
  const config = getConfig();
  const actualInputTokens = inputTokens - cachedTokens;
  const inputCost = (actualInputTokens / 1000000) * (config.inputTokenCost || 0.15);
  const outputCost = (outputTokens / 1000000) * (config.outputTokenCost || 0.6);
  const cachedCost = (cachedTokens / 1000000) * (config.cachedTokenCost || 0.075);
  return inputCost + outputCost + cachedCost;
}

export async function getJobLogs(): Promise<JobLog[]> {
  const home = os.homedir() || process.env.HOME || process.env.USERPROFILE || ".";
  const jobsPath = path.join(home, JOBS_FILENAME);
  
  try {
    const contents = await fs.readFile(jobsPath, "utf8");
    return JSON.parse(contents);
  } catch {
    return [];
  }
}