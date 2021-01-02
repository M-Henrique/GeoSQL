import { Pool } from 'pg';

declare global {
   const pool: Pool;
   const geomColumns: Array<string>;
}
