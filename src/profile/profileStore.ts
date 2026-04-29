import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Profile {
  name: string;
  staging?: string;
  production?: string;
  format?: 'text' | 'json' | 'table';
  maskSensitive?: boolean;
}

export interface ProfileStore {
  profiles: Record<string, Profile>;
}

const CONFIG_DIR = path.join(os.homedir(), '.stackdiff');
const CONFIG_FILE = path.join(CONFIG_DIR, 'profiles.json');

export function loadProfiles(): ProfileStore {
  if (!fs.existsSync(CONFIG_FILE)) {
    return { profiles: {} };
  }
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw) as ProfileStore;
  } catch {
    return { profiles: {} };
  }
}

export function saveProfiles(store: ProfileStore): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export function getProfile(name: string): Profile | undefined {
  const store = loadProfiles();
  return store.profiles[name];
}

export function setProfile(profile: Profile): void {
  const store = loadProfiles();
  store.profiles[profile.name] = profile;
  saveProfiles(store);
}

export function deleteProfile(name: string): boolean {
  const store = loadProfiles();
  if (!store.profiles[name]) return false;
  delete store.profiles[name];
  saveProfiles(store);
  return true;
}

export function listProfiles(): Profile[] {
  const store = loadProfiles();
  return Object.values(store.profiles);
}
