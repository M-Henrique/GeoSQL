import { Request, Response } from 'express';
import { Client } from 'pg';

export default class TemplatesController {
   public async index(request: Request, response: Response) {
      const client = new Client({
         host: 'greenwich.lbd.dcc.ufmg.br',
         database: 'postgres',
         port: 5432,

         user: 'geosql',
         password: 'ge0sq1',
      });

      try {
         await client.connect();

         // Retorna todas as informações das funções utilizadas nos templates.
         const { rows: templates } = await client.query(
            `select item, grupo, titulo, proto, descr from templates.postgis_manual;`
         );

         client.end();

         return response.json({ templates });
      } catch (error) {
         if (client) {
            client.end();
         }

         return response.status(400).json((error as Error).message);
      }
   }
}
