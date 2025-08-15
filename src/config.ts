import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.commiter-config.json');

interface Config {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  inputTokenCost?: number;
  outputTokenCost?: number;
  cachedTokenCost?: number;
  serviceTier?: string;
  reasoningEffort?: string;
  temperature?: number;
  verbosity?: string;
}

export function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch {}
  return {};
}

export function saveConfig(config: Config): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch {}
}

export function getApiKey(): string | undefined {
  return loadConfig().apiKey;
}

export function getModel(): string | undefined {
  return loadConfig().model;
}

export function setApiKey(apiKey: string): void {
  const config = loadConfig();
  config.apiKey = apiKey;
  saveConfig(config);
}

export function setModel(model: string): void {
  const config = loadConfig();
  config.model = model;
  saveConfig(config);
}

export function showConfig(): string {
  const config = loadConfig();
  return `API Key: ${config.apiKey ? '***' + config.apiKey.slice(-4) : 'Not set'}\nModel: ${config.model || 'Not set'}\nMax Tokens: ${config.maxTokens || 'Not set'}\nInput Token Cost: ${config.inputTokenCost || 'Not set'}\nOutput Token Cost: ${config.outputTokenCost || 'Not set'}\nCached Token Cost: ${config.cachedTokenCost || 'Not set'}\nService Tier: ${config.serviceTier || 'Not set'}\nReasoning Effort: ${config.reasoningEffort || 'Not set'}\nTemperature: ${config.temperature || 'Not set'}\nVerbosity: ${config.verbosity || 'Not set'}`;
}

export function getMaxTokens(): number | undefined {
  return loadConfig().maxTokens;
}

export function setMaxTokens(maxTokens: number): void {
  const config = loadConfig();
  config.maxTokens = maxTokens;
  saveConfig(config);
}

export function getConfig(): Config {
  return loadConfig();
}

export function setInputTokenCost(cost: number): void {
  const config = loadConfig();
  config.inputTokenCost = cost;
  saveConfig(config);
}

export function setOutputTokenCost(cost: number): void {
  const config = loadConfig();
  config.outputTokenCost = cost;
  saveConfig(config);
}

export function setCachedTokenCost(cost: number): void {
  const config = loadConfig();
  config.cachedTokenCost = cost;
  saveConfig(config);
}

export function setServiceTier(tier: string): void {
  const config = loadConfig();
  config.serviceTier = tier;
  saveConfig(config);
}

export function setReasoningEffort(effort: string): void {
  const config = loadConfig();
  config.reasoningEffort = effort;
  saveConfig(config);
}

export function setTemperature(temp: number): void {
  const config = loadConfig();
  config.temperature = temp;
  saveConfig(config);
}

export function setVerbosity(verbosity: string): void {
  const config = loadConfig();
  config.verbosity = verbosity;
  saveConfig(config);
}