import request from 'supertest';

import app from './TestApp';

describe('TablesController', () => {
   afterAll(() => {
      global.pool.end();
   });

   it('should retrieve tables from the database', async () => {
      const { body } = await request(app).get('/query').query({ database: 'brasil' });

      expect(body).toHaveProperty('tables');
      expect(body).toHaveProperty('tablesColumns');
   });
});
