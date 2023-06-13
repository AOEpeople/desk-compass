import { beforeEach, describe, expect, it } from 'vitest';
import { MarkerMapperService } from './marker-mapper.service';
import { CreateMarkerDto } from '../dto/create-marker.dto';
import { Marker } from '../entities/marker.entity';
import { UpdateMarkerDto } from '../dto/update-marker.dto';
import { MarkerDto } from '../dto/marker.dto';

describe('MarkerMapperService', () => {
  let service: MarkerMapperService;
  const objData = {
    id: 'abc-123',
    name: 'This is a test',
    lat: 3.141,
    lng: 42,
    image: 'asd87fs-97sdf-sd8789-dfh43',
    type: 'Person',
    icon: 'person_with_table',
    rotation: 0,
    attributes: {
      post: 'Employee',
      skype: 'skyper01',
      email: 'first.person@example.com',
      website: 'https://www.example.com',
      phone_office: '',
      phone_cell: '',
      fax: '',
      twitter: '',
      team: '',
    },
  };

  beforeEach(async () => {
    service = new MarkerMapperService();
  });

  describe('dtoToEntity', () => {
    it('should create Marker entity from CreateMarkerDto', async () => {
      const createObjData = structuredClone(objData);
      delete createObjData.id;

      const input = createObjData as CreateMarkerDto; //new CreateMarkerDto();
      // Object.assign(input, objData);

      const actual = service.dtoToEntity(input);

      expect(actual.id).toBeUndefined();
      expectProperties(actual);
    });

    it('should create Marker entity from UpdateMarkerDto', async () => {
      const input = objData as UpdateMarkerDto;

      const actual = service.dtoToEntity(input);

      expect(actual.id).toBe(objData.id);
      expectProperties(actual);
    });
  });

  describe('entityToDto', () => {
    it('should create MarkerDto from Marker entity', async () => {
      const input = new Marker(objData);

      const actual = service.entityToDto(input);

      expect(actual.id).toBe(objData.id);
      expectProperties(actual);
    });
  });

  const expectProperties = (actual: Marker | MarkerDto) => {
    expect(actual.lat).toBe(objData.lat);
    expect(actual.lng).toBe(objData.lng);
    expect(actual.name).toBe(objData.name);
    expect(actual.icon).toBe(objData.icon);
    expect(actual.rotation).toBe(objData.rotation);
    expect(actual.image).toBe(objData.image);
    expect(actual.type).toBe(objData.type);
    expect(actual.attributes).toBeDefined();
    expect(actual.attributes['fax']).toBe(objData.attributes.fax);
    expect(actual.attributes['post']).toBe(objData.attributes.post);
    expect(actual.attributes['team']).toBe(objData.attributes.team);
    expect(actual.attributes['skype']).toBe(objData.attributes.skype);
    expect(actual.attributes['email']).toBe(objData.attributes.email);
    expect(actual.attributes['website']).toBe(objData.attributes.website);
    expect(actual.attributes['twitter']).toBe(objData.attributes.twitter);
    expect(actual.attributes['phone_cell']).toBe(objData.attributes.phone_cell);
    expect(actual.attributes['phone_office']).toBe(
      objData.attributes.phone_office,
    );

    expect(actual['team']).toBeUndefined();
  };
});
