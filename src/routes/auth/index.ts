import express, {Response, Request} from "express";
import { InsertUserInformation, LoginController, MailController, UserClosetInfoController } from "../../controller/user";
import { KakaoOauth } from "../../data/function";
import validateUser from "../../middlewares/joi";
const router = express.Router()

router.get('/kakao/callback', (req : Request, res : Response) => {
    console.log("kakao callback >>>>", req.query)
    KakaoOauth(req.query)
})

router.post('/registration', validateUser, (req : Request, res : Response) => {
    console.log("회원 가입 요청 req.body", req.body)
    InsertUserInformation(req, res)
})

router.post('/registration/mail', (req : Request, res : Response) => {
    MailController(req, res)
})

router.post('/log-in', (req : Request, res : Response) => {
    console.log("log in", req.body)
    LoginController(req, res)
})

router.get('/closet-info', (req : Request, res : Response) => {
    UserClosetInfoController(req, res)
})


export default router