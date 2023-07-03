import { describe, expect, test } from 'vitest';
import { Location } from './Location';

describe('Location', () => {
  const locationPartial = {
    id: 'a',
    name: 'b',
    shortName: 'c',
    description: 'd',
    image: 'e',
    width: 111,
    height: 222,
  };
  const location = new Location(locationPartial);

  describe('create', () => {
    test('should create a location', () => {
      const actual = new Location(locationPartial);

      expect(actual).toBeDefined();
      expect(actual.id).toEqual('a');
      expect(actual.name).toEqual('b');
      expect(actual.shortName).toEqual('c');
      expect(actual.description).toEqual('d');
      expect(actual.image).toEqual('e');
      expect(actual.width).toEqual(111);
      expect(actual.height).toEqual(222);
    });
  });

  describe('getDto', () => {
    test('should create DTO', async () => {
      const actual = location.getDto();

      expect(actual).toBeDefined();
      expect(actual.id).toEqual('a');
      expect(actual.name).toEqual('b');
      expect(actual.shortName).toEqual('c');
      expect(actual.description).toEqual('d');
      expect(actual.image).toEqual('e');
      expect(actual.width).toEqual(111);
      expect(actual.height).toEqual(222);
    });
  });

  describe('getImageUrl', () => {
    test('should create image URL for location', async () => {
      const actual = location.getImageUrl();

      expect(actual).toEqual('http://localhost:3000/api/locations/a/image');
    });
  });

  describe('getDimensions', () => {
    test('should create image dimension from width and height', async () => {
      const actual = location.getDimensions();

      expect(actual).toBeDefined();
      expect(actual.width).toEqual(111);
      expect(actual.height).toEqual(222);
    });
  });
});
