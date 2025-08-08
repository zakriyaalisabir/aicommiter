import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.commiter-config.json');

interface Config {
  apiKey?: string;
  model?: string;
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
  return loadConfig().model || 'gpt-4o-mini';
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
  return `API Key: ${config.apiKey ? '***' + config.apiKey.slice(-4) : 'Not set'}\nModel: ${config.model || 'Not set'}`;
}