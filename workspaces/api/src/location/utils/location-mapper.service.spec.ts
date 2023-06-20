import { beforeEach, describe, expect, it } from 'vitest';
import { LocationMapperService } from './location-mapper.service';
import { CreateLocationDto } from '../dto/create-location.dto';
import { Location } from '../entities/location.entity';
import { UpdateLocationDto } from '../dto/update-location.dto';

describe('LocationMapperService', () => {
  let service: LocationMapperService;
  const objData = {
    id: 'abc-123',
    name: 'This is a test',
    shortName: 'T',
    description: 'A description text',
    image: 'def-456-ghi-789',
    width: 100,
    height: 200,
  };

  beforeEach(async () => {
    service = new LocationMapperService();
  });

  describe('dtoToEntity', () => {
    it('should create Location entity from CreateLocationDto', async () => {
      const createObjData = structuredClone(objData);
      delete createObjData.id;

      const input = createObjData as CreateLocationDto;

      const actual = service.dtoToEntity(input);

      expect(actual.id).toBeUndefined();
      expect(actual.name).toBe(objData.name);
      expect(actual.image).toBe(objData.image);
    });

    it('should create Location entity from UpdateLocationDto', async () => {
      const input = objData as UpdateLocationDto;

      const actual = service.dtoToEntity(input);

      expect(actual.id).toBe(objData.id);
      expect(actual.name).toBe(objData.name);
      expect(actual.image).toBe(objData.image);
    });
  });

  describe('entityToDto', () => {
    it('should create LocationDto from Location entity', async () => {
      const input = new Location(objData);

      const actual = service.entityToDto(input);

      expect(actual.id).toBe(objData.id);
      expect(actual.name).toBe(objData.name);
      expect(actual.image).toBe(objData.image);
    });
  });
});
