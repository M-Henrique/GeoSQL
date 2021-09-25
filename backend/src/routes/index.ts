import { Router } from 'express';

import DatabasesController from '../controllers/DatabasesController';
import TemplatesController from '../controllers/TemplatesController';
import TablesController from '../controllers/TablesController';
import QueryController from '../controllers/QueryController';

const routes = Router();
const databasesController = new DatabasesController();
const templatesController = new TemplatesController();
const tablesController = new TablesController();
const queryController = new QueryController();

// Todas os bancos de dados disponíveis
routes.get('/databases', databasesController.index);

// Todas os templates disponíveis
routes.get('/templates', templatesController.index);

// Todas as tabelas do banco
routes.get('/query', tablesController.index);

// Resultados da query realizada
routes.post('/results', queryController.show);

export default routes;
