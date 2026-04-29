import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  loadProfiles,
  saveProfiles,
  getProfile,
  setProfile,
  deleteProfile,
  listProfiles,
} from './profileStore';

const CONFIG_FILE = path.join(os.homedir(), '.stackdiff', 'profiles.json');

beforeEach(() => {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ profiles: {} }, null, 2));
  }
});

describe('profileStore', () => {
  it('returns empty store when no config file exists', () => {
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
    const store = loadProfiles();
    expect(store).toEqual({ profiles: {} });
  });

  it('sets and retrieves a profile', () => {
    setProfile({ name: 'myapp', staging: '.env.staging', production: '.env.prod' });
    const profile = getProfile('myapp');
    expect(profile).toBeDefined();
    expect(profile?.staging).toBe('.env.staging');
    expect(profile?.production).toBe('.env.prod');
  });

  it('deletes an existing profile', () => {
    setProfile({ name: 'todelete', staging: 'a', production: 'b' });
    const result = deleteProfile('todelete');
    expect(result).toBe(true);
    expect(getProfile('todelete')).toBeUndefined();
  });

  it('returns false when deleting non-existent profile', () => {
    const result = deleteProfile('ghost');
    expect(result).toBe(false);
  });

  it('lists all profiles', () => {
    setProfile({ name: 'app1' });
    setProfile({ name: 'app2' });
    const profiles = listProfiles();
    const names = profiles.map((p) => p.name);
    expect(names).toContain('app1');
    expect(names).toContain('app2');
  });
});
