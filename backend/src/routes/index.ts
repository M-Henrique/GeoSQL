import { Router, request, response, json } from 'express';

import client from '../database';

const routes = Router();

// Todas as tabelas do banco
routes.get('/query', async (request, response) => {
   try {
      const tables = await client.query(
         `SELECT DISTINCT table_name, column_name FROM information_schema.columns WHERE table_schema = 'geodata'`
      );

      return response.json(tables.rows);
   } catch (error) {
      return response.status(400).json(error.message);
   }
});

// Resultados da query realizada
routes.get('/results', async (request, response) => {
   const query = request.body.query;

   try {
      const result = await client.query(query);

      return response.json(result);
   } catch (error) {
      return response.status(400).json(error.message);
   }
});

export default routes;
