import * as profileStore from './profileStore';
import {
  createProfile,
  updateProfile,
  removeProfile,
  resolveProfile,
  getAllProfiles,
} from './profileManager';

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('profileManager', () => {
  it('creates a profile with defaults', () => {
    jest.spyOn(profileStore, 'setProfile').mockImplementation(() => {});
    const profile = createProfile({ name: 'demo', staging: '.env.staging' });
    expect(profile.name).toBe('demo');
    expect(profile.format).toBe('text');
    expect(profile.maskSensitive).toBe(true);
  });

  it('throws when creating profile with empty name', () => {
    expect(() => createProfile({ name: '  ' })).toThrow('Profile name cannot be empty');
  });

  it('updates an existing profile', () => {
    jest.spyOn(profileStore, 'getProfile').mockReturnValue({
      name: 'myapp',
      staging: 'old.env',
      format: 'text',
    });
    jest.spyOn(profileStore, 'setProfile').mockImplementation(() => {});
    const updated = updateProfile('myapp', { staging: 'new.env', format: 'json' });
    expect(updated.staging).toBe('new.env');
    expect(updated.format).toBe('json');
    expect(updated.name).toBe('myapp');
  });

  it('throws when updating non-existent profile', () => {
    jest.spyOn(profileStore, 'getProfile').mockReturnValue(undefined);
    expect(() => updateProfile('ghost', { staging: 'x' })).toThrow('Profile "ghost" not found');
  });

  it('removes a profile successfully', () => {
    jest.spyOn(profileStore, 'deleteProfile').mockReturnValue(true);
    expect(() => removeProfile('myapp')).not.toThrow();
  });

  it('throws when removing non-existent profile', () => {
    jest.spyOn(profileStore, 'deleteProfile').mockReturnValue(false);
    expect(() => removeProfile('ghost')).toThrow('Profile "ghost" not found');
  });

  it('resolves an existing profile', () => {
    const mock = { name: 'prod', production: '.env.prod' };
    jest.spyOn(profileStore, 'getProfile').mockReturnValue(mock);
    expect(resolveProfile('prod')).toEqual(mock);
  });

  it('throws when resolving missing profile', () => {
    jest.spyOn(profileStore, 'getProfile').mockReturnValue(undefined);
    expect(() => resolveProfile('missing')).toThrow("Profile \"missing\" does not exist");
  });
});
