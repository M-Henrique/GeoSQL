import { Request, Response } from 'express';
import { PoolClient } from 'pg';

import { pool, changePool, changeGeomColumns } from '../database';

export default class TablesController {
   public async index(request: Request, response: Response) {
      const { database } = request.query;

      // Encerra a pool atual, e cria uma nova com a configuração adequada.
      changePool(database as string);
      let client: PoolClient | undefined;

      try {
         client = await pool.connect();

         // Armazena os nomes das colunas geométricas em uma variável, para posterior uso na realização das queries.
         const dbGeomColumns = await client.query(`SELECT f_geometry_column FROM geometry_columns`);

         // Passa um set contendo todos os nomes de colunas geométricas do banco.
         changeGeomColumns([
            ...new Set(dbGeomColumns.rows.map((column) => Object.values(column)[0])),
         ] as string[]);

         // Retorna as tabelas junto de suas respectivas colunas (para saber qual coluna pertence a qual tabela).
         const { rows: tablesColumns } = await client.query(
            `SELECT DISTINCT table_name as table, column_name as name FROM information_schema.columns WHERE table_schema = 'geodata' ORDER BY table_name;`
         );

         // Retorna apenas as tabelas (para facilitar a indexação).
         const { rows: tables } = await client.query(
            `SELECT DISTINCT table_name as name FROM information_schema.columns WHERE table_schema = 'geodata' ORDER BY table_name;`
         );

         client.release();

         return response.json({ tablesColumns, tables });
      } catch (error) {
         if (client) {
            client.release();
         }

         return response.status(400).json(error.message);
      }
   }
}
