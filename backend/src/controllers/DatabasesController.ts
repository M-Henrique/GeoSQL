import { Request, Response } from 'express';
import { Client } from 'pg';

export default class DatabasesController {
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
         const { rows: databases } = await client.query(
            `SELECT datname FROM pg_database WHERE datname like 'geosql_%';`
         );

         client.end();

         return response.json({ databases });
      } catch (error) {
         if (client) {
            client.end();
         }

         return response.status(400).json(error.message);
      }
   }
}
