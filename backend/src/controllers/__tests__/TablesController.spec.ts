import request from 'supertest';

import { pool } from '../../database';

import app from './TestApp';

describe('TablesController', () => {
   afterAll(() => {
      pool.end();
   });

   it('should retrieve tables from the database', async () => {
      const { body } = await request(app).get('/query').query({ database: 'minasgerais' });

      expect(body).toHaveProperty('tables');
      expect(body).toHaveProperty('tablesColumns');
   });
});
