import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

morgan.token('body', (req, res) => JSON.stringify((req as any).body));
app.use(
   morgan(
      ':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'
   )
);

app.use(routes);

app.listen(3333, '0.0.0.0', () => {
   console.log('🚀 Server started on port 3333! ');
});

export default app;
