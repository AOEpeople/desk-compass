import { rest } from 'msw';

// Mock Data
export const markers = [
  {
    id: 1,
    lat: 1496,
    lng: 3676,
    name: 'First person',
    icon: 'person',
    type: 'person',
    rotation: 90,
    image: '',
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
    id: 1,
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
  rest.get('api/info', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ width: 1000, height: 1000 }));
  }),

  // marker endpoints
  rest.get('api/marker', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(markers));
  }),

  rest.put('api/marker/1', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(markers[0]));
  }),

  rest.post('api/marker', async (req, res, ctx) => {
    const newMarker = await req.json();
    return res(ctx.status(200), ctx.json(newMarker));
  }),

  rest.delete('api/marker/1', async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
];
