import { rest } from 'msw';

// Mock Data
const locations = [
  {
    id: '1000',
    name: 'Location',
    shortName: 'loc',
    description: 'This is an example location',
    image: '53a9fe58-3036-47d3-838f-6e3e5300f322',
    width: 123,
    height: 456,
  },
  {
    id: '2000',
    name: 'Location 2',
    shortName: 'loc2',
    description: 'This is another example location',
  },
];
export const markers = [
  {
    id: '1',
    lat: 1496,
    lng: 3676,
    name: 'First person',
    icon: 'person',
    type: 'person',
    rotation: 90,
    image: 'c4c980ca-328c-417e-a0dd-881afec4dfe3',
    attributes: {
      Post: 'Employee',
      Skype: 'skyper01',
      Email: 'first.person@example.com',
      Website: 'https://www.example.com',
      Phone_office: '',
      Phone_cell: '',
      Fax: '',
      Twitter: '',
      Team: '',
    },
  },
  {
    id: '2',
    lat: 1496,
    lng: 3676,
    name: 'Some Room',
    icon: 'bookable',
    type: 'room',
    rotation: 0,
    image: '',
    attributes: {
      Description: 'Some description',
    },
  },
];

// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = [
  rest.get('api', (req, res, ctx) => {
    return res(ctx.status(200), ctx.text('dummy'));
  }),

  rest.get('api/locations', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(locations));
  }),

  rest.post('api/locations', async (req, res, ctx) => {
    const newLocation = await req.json();
    return res(ctx.status(200), ctx.json(newLocation));
  }),

  rest.get('api/locations/:locationId', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(locations[0]));
  }),

  rest.put('api/locations/:locationId', async (req, res, ctx) => {
    const newLocation = await req.json();
    return res(ctx.status(200), ctx.json(newLocation));
  }),

  rest.delete('api/locations/:locationId', async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),

  // marker endpoints
  rest.get('api/locations/:locationId/markers', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(markers));
  }),

  rest.post('api/locations/:locationId/markers', async (req, res, ctx) => {
    const newMarker = await req.json();
    return res(ctx.status(200), ctx.json(newMarker));
  }),

  rest.put('api/locations/:locationId/markers/1', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(markers[0]));
  }),

  rest.put('api/locations/:locationId/markers/2', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(markers[1]));
  }),

  rest.delete('api/locations/:locationId/markers/1', async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
];
