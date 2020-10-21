import { Request, Response } from 'express';

import pool from '../database/index';

export default class QueryController {
   public async show(request: Request, response: Response) {
      const query = request.body.query;
      let client;

      try {
         client = await pool.connect();

         await client.query(`DROP TABLE IF EXISTS resultados;`);

         await client.query(`CREATE TEMP TABLE resultados as ${query}`);

         let results = await client.query(`SELECT * FROM resultados`);

         for (let i in results.fields) {
            if (results.fields[i].name === 'geom') {
               results = await client.query(
                  `SELECT *, ST_GeometryType(geom::geometry) AS Geometria, ST_AsGeoJSON (geom::geometry) AS geojson FROM resultados;`
               );

               break;
            }
         }

         client.release();
         // REMOVER AO SUBIR PRA PRODUÇÃO
         await pool.end();

         return response.json(results.rows);
      } catch (error) {
         if (client) {
            client.release();
         } else {
         }

         return response.json(error.message);
      }
   }
}
