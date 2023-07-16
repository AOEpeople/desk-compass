import { describe, expect, it, vi } from 'vitest';
import configuration from './configuration';

describe('configuration', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('initialized with default values', () => {
    const actual = configuration();

    expect(actual).toBeDefined();
    expect(actual.cors.allowedMethods).toEqual(['GET', 'PUT', 'POST', 'DELETE']);
    expect(actual.cors.allowedOrigins).toEqual([]);
    expect(actual.database.path).toBeUndefined();
    expect(actual.database.humanReadable).toBe(false);
    expect(actual.imageStoragePath).toBeUndefined();
    expect(actual.devMode).toBe(false);
    expect(actual.appPort).toBe(3030);
  });

  it('initialized from environment variables', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('API_PORT', '5555');
    vi.stubEnv('DATABASE_PATH', '../relative/path');
    vi.stubEnv('DATABASE_HUMAN_READABLE', 'true');
    vi.stubEnv('IMAGE_STORAGE_PATH', '/abc/def');
    vi.stubEnv('CORS_ALLOWED_METHODS', 'GET,DELETE');
    vi.stubEnv('CORS_ALLOWED_ORIGINS', 'localhost:3000$,127.0.0.1:3000$');

    const actual = configuration();

    expect(actual).toBeDefined();
    expect(actual.cors.allowedMethods).toContain('GET');
    expect(actual.cors.allowedMethods).toContain('DELETE');
    expect(actual.cors.allowedOrigins).toContain('localhost:3000$');
    expect(actual.cors.allowedOrigins).toContain('127.0.0.1:3000$');
    expect(actual.database.path).toBe('../relative/path');
    expect(actual.database.humanReadable).toBe(true);
    expect(actual.imageStoragePath).toBe('/abc/def');
    expect(actual.devMode).toBe(true);
    expect(actual.appPort).toBe('5555');
  });
});
