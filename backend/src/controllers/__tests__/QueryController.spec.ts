import request from 'supertest';

import pool from '../../database';
import app from './TestApp';

describe('TablesController', () => {
   afterAll(async () => {
      await pool.end();
   });

   it('should execute a non geometric query', async () => {
      const query = `select sigla from estado where sigla='MG'`;
      const { body } = await request(app).post('/results').send({ query });

      expect(body[0]).toHaveProperty('sigla');
      expect(body[0]).not.toHaveProperty('geojson');
   });

   it('should execute a geometric query', async () => {
      const query = `select geom from estado where sigla='MG'`;
      const { body } = await request(app).post('/results').send({ query });

      expect(body[0]).toHaveProperty('geojson');
      expect(body[0]).not.toHaveProperty('sigla');
   });

   it('should fail to execute an incorrect query', async () => {
      const query = `select inexistentColumn from estado where sigla='MG'`;
      const { body } = await request(app).post('/results').send({ query });

      expect(typeof body).toBe('string');
   });

   it('should fail to execute a query when no client is available', async () => {
      await pool.end();

      const query = `select inexistentColumn from estado where sigla='MG'`;
      const { body } = await request(app).post('/results').send({ query });

      expect(typeof body).toBe('string');
   });
});
