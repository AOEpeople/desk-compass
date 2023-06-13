import { getApiUrl } from './ApiUrl';

describe('ApiUrl: getApiUrl()', () => {
  describe('generate API URL from browser location', () => {
    test('without relative path, should provide base API path', () => {
      const actual = getApiUrl();

      expect(actual.toString()).toEqual('http://localhost:3000/api');
    });

    test('should provide absolute API path to resource', () => {
      const actual = getApiUrl('abc/def');

      expect(actual.toString()).toEqual('http://localhost:3000/api/abc/def');
    });
  });

  describe('generated API URL from ENV variable', () => {
    test('without relative path, should provide base API path', () => {
      import.meta.env.VITE_API_URL = 'https://my.floorplan.org/v1';
      const actual = getApiUrl();

      expect(actual.toString()).toEqual('https://my.floorplan.org/v1');
    });

    test('should provide absolute API path to resource', () => {
      import.meta.env.VITE_API_URL = 'https://my.floorplan.org/v1';
      const actual = getApiUrl('abc/def');

      expect(actual.toString()).toEqual('https://my.floorplan.org/v1/abc/def');
    });
  });
});
