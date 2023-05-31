import { Request, Response, NextFunction } from "express";
import { CheckDuplicatedId, CheckUserOtp, CreateUserCloset, DeletePastOtp, DeleteUserInformation, GetUserByUid, GetUserClosetSequence, GetUserInfoById, GetUserPassword, InsertSecessionUser, InsertUserInfo, InsertUserOtp, ModifyUserInformation } from "../data/user/function";
import { CheckPassword, ComparePassword } from "../functions/bcrypt";
import { SendEmail } from "../functions/mail";
import { CreateAccessAndRefreshToken } from "../middlewares/jwt";



export async function InsertUserInformation(req: Request, res : Response) {
    console.log("InsertUserController")
    await CheckUserOtp(req.body)
    .then(result =>CheckDuplicatedId(result))
    .then(result => InsertUserInfo(req.body, result))
    .then(result => CreateUserCloset(result))
    .then(result => CreateAccessAndRefreshToken(req, res, result))
    .catch(error => res.json(error))
}

export async function LoginController(req: Request, res : Response) {
    console.log("Login Controller")
    await GetUserInfoById(req.body)
    .then(user_data => ComparePassword(user_data, req.body.user_pw))
    .then(data => res.json(data))
    .catch(error => res.json(error))
}

export async function MailController(req: Request, res : Response) {
    console.log("MailController", req.body)
    await DeletePastOtp(req.body.user_id)
    .then(() =>SendEmail(req.body.user_id))
    .then(result => InsertUserOtp(result))
    .then(result => res.json(result))
    .catch(error => res.json(error))
}

export async function SecessionUserController(req: Request, res : Response) {
    console.log("SecessionUser controller", req.body)
    await InsertSecessionUser(req.body)
    .then(() => DeleteUserInformation(req.body.user_uid))
    .then(result => res.json(result))
    .catch(error => res.json(error))
}

export async function ModifyUserController(req: Request, res : Response) {
    console.log("ModifyUserController", req.body)
    await ModifyUserInformation(req.body, req.params.user_number)
    .then(() => GetUserByUid(Number(req.params.user_number)))
    .then(result => res.json(result))
    .catch(error => res.json(error))
}

export async function CheckPasswordController(req : Request, res : Response) {
    console.log("CheckPasswordController")
    await GetUserPassword(req.body.user_uid)
    .then(result => CheckPassword(req.body.user_pw, result))
    .then(result => res.json(result))
    .catch(error => res.json(error))
}

export async function UserClosetInfoController(req : Request, res : Response) {
    await GetUserClosetSequence(req.query.user_number)
    .then(result => res.json(result))
    .catch(error => res.json(error))
}