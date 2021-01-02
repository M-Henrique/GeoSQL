import request from 'supertest';

import createPool from '../../database';
import app from './TestApp';

describe('QueryController', () => {
   beforeAll(() => {
      createPool('brasil');

      global.geomColumns = ['geom'];
   });

   afterAll(async (done) => {
      global.pool.end();
      done();
   });

   it('should execute a non geometric query', async () => {
      const query = `select sigla from estado where sigla='MG'`;
      const { body } = await request(app).post('/results').send({ query });

      expect(body[0].sigla).toBe('MG');
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
});
