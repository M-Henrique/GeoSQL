import { Request, Response } from 'express';
import { Client } from 'pg';

export default class TablesController {
   public async index(request: Request, response: Response) {
      const { database } = request.query;

      const client = new Client({
         host: 'greenwich.lbd.dcc.ufmg.br',
         database: database as string,
         port: 5432,

         user: 'geosql',
         password: 'ge0sq1',
      });

      try {
         await client.connect();

         // Retorna as tabelas junto de suas respectivas colunas (para saber qual coluna pertence a qual tabela).
         const { rows: tablesColumns } = await client.query(
            `SELECT DISTINCT table_name as table, column_name as name FROM information_schema.columns WHERE table_schema = 'geodata' ORDER BY table_name;`
         );

         // Retorna apenas as tabelas (para facilitar a indexação).
         const { rows: tables } = await client.query(
            `SELECT DISTINCT table_name as name FROM information_schema.columns WHERE table_schema = 'geodata' ORDER BY table_name;`
         );

         client.end();

         return response.json({ tablesColumns, tables });
      } catch (error) {
         if (client) {
            client.end();
         }

         return response.status(400).json((error as Error).message);
      }
   }
}
