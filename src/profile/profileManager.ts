import {
  Profile,
  getProfile,
  setProfile,
  deleteProfile,
  listProfiles,
} from './profileStore';

export interface ProfileCreateOptions {
  name: string;
  staging?: string;
  production?: string;
  format?: 'text' | 'json' | 'table';
  maskSensitive?: boolean;
}

export function createProfile(options: ProfileCreateOptions): Profile {
  if (!options.name || options.name.trim() === '') {
    throw new Error('Profile name cannot be empty');
  }
  const profile: Profile = {
    name: options.name.trim(),
    staging: options.staging,
    production: options.production,
    format: options.format ?? 'text',
    maskSensitive: options.maskSensitive ?? true,
  };
  setProfile(profile);
  return profile;
}

export function updateProfile(
  name: string,
  updates: Partial<Omit<Profile, 'name'>>
): Profile {
  const existing = getProfile(name);
  if (!existing) {
    throw new Error(`Profile "${name}" not found`);
  }
  const updated: Profile = { ...existing, ...updates, name };
  setProfile(updated);
  return updated;
}

export function removeProfile(name: string): void {
  const removed = deleteProfile(name);
  if (!removed) {
    throw new Error(`Profile "${name}" not found`);
  }
}

export function resolveProfile(name: string): Profile {
  const profile = getProfile(name);
  if (!profile) {
    throw new Error(`Profile "${name}" does not exist. Use 'stackdiff profile add' to create it.`);
  }
  return profile;
}

export function getAllProfiles(): Profile[] {
  return listProfiles();
}
