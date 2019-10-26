import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserContoller from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserContoller.store);
routes.post('/sessions', SessionController.store);
// middleware global a partir daqui
routes.use(authMiddleware);

routes.put('/users', UserContoller.update);
routes.get('/providers', ProviderController.index);
routes.post('/files', upload.single('file'), FileController.store);
routes.post('/appointments', AppointmentController.store);

export default routes;
