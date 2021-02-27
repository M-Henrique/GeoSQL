import { Request, Response } from 'express';
import { Pool, PoolClient } from 'pg';

import { pool, geomColumns } from '../database';

export default class QueryController {
   public async show(request: Request, response: Response) {
      const { query }: { query: string } = request.body;

      let client: PoolClient | undefined;

      try {
         client = await pool.connect();

         // Cria uma tabela temporária para armazenar os resultados da consulta realizada, e recupera o conteúdo da mesma.
         await client.query(`DROP TABLE IF EXISTS resultados;`);

         await client.query(`CREATE TEMP TABLE resultados as ${query}`);

         let results = await client.query(`SELECT * FROM resultados`);

         // Caso a consulta englobe uma coluna geométrica, é necessário um tratamento extra para evitar quebra de interface (em caso de coordenadas muito grandes (mostramos apenas a geometria ao invés da coordenada inteira, através da função ST_GeometryType)) e permitir ao Openlayers acesso ao geojson (ST_AsGeoJson) respectivo da consulta (para criação das camadas).
         for (let i in results.fields) {
            if (geomColumns.includes(results.fields[i].name) || results.fields[i].name === 'geom') {
               const geomColumn = results.fields[i].name;

               results = await client.query(
                  `SELECT *, ST_GeometryType(ST_Transform(${geomColumn},4678)::geometry) AS geometria, ST_AsGeoJSON (ST_Transform(${geomColumn},4678)::geometry) AS geojson FROM resultados;`
               );

               // Coordenadas não serão mais necessárias
               results.rows.forEach((row) => {
                  delete row[geomColumn];
               });

               break;
            }
         }

         client.release();

         return response.json(results.rows);
      } catch (error) {
         if (client) {
            client.release();
         }

         return response.json(error.message);
      }
   }
}
