import { Router } from 'express';

import client from '../database';

import QueryService from '../services/QueryService';

const routes = Router();

// Todas as tabelas do banco
routes.get('/query', async (request, response) => {
   try {
      const { rows: tablesColumns } = await client.query(
         `SELECT DISTINCT table_name as table, column_name as name FROM information_schema.columns WHERE table_schema = 'geodata' ORDER BY table_name;`
      );

      const { rows: tables } = await client.query(
         `SELECT DISTINCT table_name as name FROM information_schema.columns WHERE table_schema = 'geodata' ORDER BY table_name;`
      );

      return response.json({ tablesColumns, tables });
   } catch (error) {
      return response.status(400).json(error.message);
   }
});

// Resultados da query realizada
routes.post('/results', async (request, response) => {
   const query = request.body.query;

   try {
      const queryService = new QueryService();
      const { rows } = await queryService.execute(query);

      return response.json(rows);
   } catch (error) {
      return response.json(error.message);
   }
});

export default routes;
