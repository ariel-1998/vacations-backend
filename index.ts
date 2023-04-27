import express, { json } from "express";
import { errorHandler } from "./3-middleware/errorHandler";
import { authController } from "./6-controller/auth-controller";
import { likesRouter } from "./6-controller/likes-controller";
import { vacationsRouter } from "./6-controller/vacations-controller";
import cors from 'cors';
import fileUpload from "express-fileupload";

const server = express();

server.use(cors())
server.use(json());
server.use(fileUpload())
server.use('/api/auth',authController);
server.use('/api/vacations',vacationsRouter);
server.use('/api/likes', likesRouter);

server.use(errorHandler)

server.listen(3001, () => console.log('listening on port 3001'))