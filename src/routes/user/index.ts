import express, {Response, Request} from "express";
import { CheckPasswordController, ModifyUserController, SecessionUserController } from "../../controller/user";
const router = express.Router()


router.post('/my-info/verification', (req : Request, res : Response) => {
    CheckPasswordController(req, res)
})

router.delete('/my-info/secession', (req : Request, res : Response) => {
    SecessionUserController(req, res)
})

router.put('/my-info/:user_number', (req : Request, res : Response) => {
    ModifyUserController(req, res)
})



export default router