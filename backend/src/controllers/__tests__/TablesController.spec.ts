import request from 'supertest';

import app from './TestApp';

describe('TablesController', () => {
   it('should retrieve tables from the correct database', async () => {
      const { body: brasilTables } = await request(app).get('/query').query({ database: 'brasil' });

      expect(brasilTables).toHaveProperty('tables');
      expect(brasilTables).toHaveProperty('tablesColumns');

      expect(brasilTables.tables).toContainEqual({ name: 'estado' });
      expect(brasilTables.tables).toContainEqual({ name: 'refinaria' });
      expect(brasilTables.tables).toContainEqual({ name: 'munbrasil' });

      const { body: minasTables } = await request(app)
         .get('/query')
         .query({ database: 'minasgerais' });

      expect(minasTables).toHaveProperty('tables');
      expect(minasTables).toHaveProperty('tablesColumns');

      expect(minasTables.tables).toContainEqual({ name: 'clubebar' });
      expect(minasTables.tables).toContainEqual({ name: 'servico_salvamento' });
      expect(minasTables.tables).toContainEqual({ name: 'servico_saude' });
   });
});
