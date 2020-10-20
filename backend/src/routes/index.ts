import { Router } from 'express';

import TablesController from '../controllers/TablesController';
import QueryController from '../controllers/QueryController';

const routes = Router();
const tablesController = new TablesController();
const queryController = new QueryController();

// Todas as tabelas do banco
routes.get('/query', tablesController.index);

// Resultados da query realizada
routes.post('/results', queryController.show);

export default routes;
