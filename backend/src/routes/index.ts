import { Router, response } from 'express';

const routes = Router();

routes.get('/', (request, response) => {
   return response.json({ message: 'Hello' });
});

export default routes;
