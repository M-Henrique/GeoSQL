import request from 'supertest';

import pool from '../../database';
import app from './TestApp';

describe('TablesController', () => {
   afterAll(async () => {
      await pool.end();
   });

   it('should retrieve tables from the database', async () => {
      const { body } = await request(app).get('/query');

      expect(body).toHaveProperty('tables');
      expect(body).toHaveProperty('tablesColumns');
   });

   it('should fail to retrieve tables from the database when no client is available', async () => {
      await pool.end();
      const { body } = await request(app).get('/query');

      expect(body).not.toHaveProperty('tables');
      expect(body).not.toHaveProperty('tablesColumns');
   });
});
