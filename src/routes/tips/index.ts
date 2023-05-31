import express, {Request, Response, NextFunction} from 'express';
import { CreateAccessAndRefreshToken, VerifyToken } from '../../middlewares/jwt';
const router = express.Router()

router.get('/', CreateAccessAndRefreshToken, (req : Request, res : Response) => res.json("create"))

router.get('/verify', VerifyToken, (req : Request, res : Response) => res.json("verify"))


export default router