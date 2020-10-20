import { Request, Response } from 'express';

import pool from '../database/index';

export default class TablesController {
   public async index(request: Request, response: Response) {
      let client;

      try {
         client = await pool.connect();

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
         return response.status(400).json(error.message);
      }
   }
}
