import { QueryResult } from 'pg';

import client from '../database';

export default class QueryService {
   public async execute(query: string): Promise<QueryResult> {
      await client.query(`DROP TABLE IF EXISTS resultados;`);

      await client.query(`CREATE TEMP TABLE resultados as ${query}`);

      const tempTable = await client.query(`SELECT * FROM resultados`);

      for (let i in tempTable.fields) {
         if (tempTable.fields[i].name === 'geom') {
            return await client.query(
               `SELECT *, ST_GeometryType(geom) AS Geometria, ST_AsGeoJSON (geom) AS geojson FROM resultados;`
            );
         }
      }

      return tempTable;
   }
}
