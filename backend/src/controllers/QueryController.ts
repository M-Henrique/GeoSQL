import { Request, Response } from 'express';
import { Client } from 'pg';

export default class QueryController {
   public async show(request: Request, response: Response) {
      const { query, database }: { query: string; database: string } = request.body;

      const client = new Client({
         host: 'greenwich.lbd.dcc.ufmg.br',
         database,
         port: 5432,

         user: 'geosql',
         password: 'ge0sq1',
      });

      try {
         await client.connect();

         // Armazena os nomes das colunas geométricas para diferente tratamento.
         const geomColumnsObj = await client.query(
            `SELECT f_geometry_column FROM geometry_columns;`
         );
         const geomColumns = [...new Set(geomColumnsObj.rows.map((row) => Object.values(row)[0]))];

         // Cria uma tabela temporária para armazenar os resultados da consulta realizada, e recupera o conteúdo da mesma.
         await client.query(`DROP TABLE IF EXISTS resultados;`);

         await client.query(`CREATE TEMP TABLE resultados as ${query}`);

         let results = await client.query(`SELECT * FROM resultados`);

         // Caso a consulta englobe uma coluna geométrica, é necessário um tratamento extra para evitar quebra de interface (em caso de coordenadas muito grandes (mostramos apenas a geometria ao invés da coordenada inteira, através da função ST_GeometryType)) e permitir ao Openlayers acesso ao geojson (ST_AsGeoJson) respectivo da consulta (para criação das camadas).
         for (let i in results.fields) {
            if (geomColumns.includes(results.fields[i].name) || results.fields[i].name === 'geom') {
               const geomColumn = results.fields[i].name;

               results = await client.query(
                  `SELECT *, ST_GeometryType(ST_Transform(${geomColumn},4678)::geometry) AS geometria, ST_AsGeoJSON(ST_Transform(ST_CurveToLine(${geomColumn},0,0,0),4678)::geometry) AS geojson FROM resultados;`
               );

               // Coordenadas não serão mais necessárias
               results.rows.forEach((row) => {
                  delete row[geomColumn];
               });

               break;
            }
         }

         client.end();

         return response.json(results.rows);
      } catch (error) {
         if (client) {
            client.end();
         }

         return response.status(400).json((error as Error).message);
      }
   }
}
