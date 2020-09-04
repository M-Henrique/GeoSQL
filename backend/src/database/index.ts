import { Client } from 'pg';

const client = new Client({
   user: 'geosql',
   host: 'greenwich.lbd.dcc.ufmg.br',
   database: 'brasil',
   password: 'ge0sq1',
   port: 5432,
});

client.connect();

export default client;
