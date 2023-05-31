import { PasswordHashing } from "../../functions/bcrypt";
import { closet } from "../../model/closet";
import { secession_user, user_email, user_info } from "../../model/user";
import { otp_model } from "../../schemas/otp";
import MariaQuery from "../MariaConnection";


export function CheckDuplicatedId(data : user_email) : Promise<user_email> {
    return new Promise(async(resolve, reject) => {
        try {
            console.log("CheckDuplicatedId 실행 user_id >>", data)
            const sql = `SELECT user_id FROM user_information WHERE user_id = ?`
            console.log('sql :>> ', sql);
            let result = await MariaQuery(sql, data.id)
            console.log('result :>> ', result);
            result.length > 0 ? reject({success : false, message : "중복된 아이디가 있습니다."}) : resolve(data)
        } catch (error) {
            console.log("CheckDuplicatedId 함수 에러", error)
            reject({success : false, message : "회원가입 과정 에러, 관리자 문의."})
        }
    });
}

export function InsertUserInfo(body : user_info, data : user_email) : Promise<closet> {
    return new Promise(async(resolve, reject) => {
        try {
            console.log("body" , body)
            const {user_nickname, user_pw, user_weight, user_height, user_gender} = body
            const {id, domain} = data
            let hashed = await PasswordHashing(user_pw)
            const sql = "INSERT INTO user_information (user_id, user_nickname, user_pw, user_gender, id_domain, user_weight, user_height) values(?, ?, ?, ?, ?, ?, ?)"
            let insert_data = [id, user_nickname, hashed, user_gender, domain, user_weight, user_height]
            let result = await MariaQuery(sql, insert_data)
            let closet_gender = user_gender === 'male' ? 0 : 1
            resolve({user_number : result.insertId, closet_name : user_nickname, gender : closet_gender})
        } catch (error) {
            console.log("InsertUserInfo 함수 에러", error)
            reject({success : false, message : "신규 유저 등록 과정 에러, 관리자 문의."})
        }
    });
}

export function GetUserInfoById(body : user_info) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            let email = body.user_id.split("@")
            let id = email[0]
            let domain = email[1]
            const sql = `SELECT * FROM user_information WHERE user_id = '${id}' AND id_domain = '${domain}'`
            let result = await MariaQuery(sql, [])
            console.log(result[0])
            result.length > 0 ? resolve(result[0]) : reject({success : false, message : "일치하는 정보가 없습니다. 아이디 혹은 패스워드를 확인해주세요."})
            
        } catch (error) {
            console.log("GetUserInfoById 에러",error)
            reject({success : false, message : "로그인 과정 에러, 관리자 문의."})
        }
    });
}

export function DeleteUserInformation( user_uid : string): Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = 'DELETE FROM user_information WHERE user_uid = ?'
            await MariaQuery(sql, user_uid)
            resolve({success : true})
        } catch (error) {
            console.log("DeleteUserInformation error", error)
            reject({success : false, message : "정보 삭제 에러, 관리자 문의."})
        }
    });
}

export function InsertSecessionUser(body : secession_user): Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `INSERT INTO secession_user (user_uid, reason, feedback) VALUES (?, ?, ?)`
            let insert_data = [body.user_uid, body.reason, body.feedback]
            await MariaQuery(sql, insert_data)
            resolve({})
        } catch (error) {
            console.log("InsertSecessionUser 함수 에러", error)
            reject({success : false, message :"탈퇴 과정 에러, 관리자 문의."})
        }
    });
}

export function ModifyUserInformation(body : user_info, user_number : string) : Promise<void> {
    return new Promise(async(resolve, reject) => {
        try {
            let hashed, data, sql
            if(body.user_pw) {
                hashed = await PasswordHashing(body.user_pw)
                sql = `UPDATE user_information SET user_pw = ?, user_nickname = ?, user_height = ?, user_weight = ? WHERE user_uid = ?`
                data = [hashed, body.user_nickname, body.user_height, body.user_weight, Number(user_number)]
            }else {
                sql = `UPDATE user_information SET user_nickname = ?, user_height = ?, user_weight = ? WHERE user_uid = ?`
                data = [body.user_nickname, body.user_height, body.user_weight, Number(user_number)]
            }
            console.log('data :>> ', data);
            await MariaQuery(sql, data)
            resolve()
        } catch (error) {
            console.log("ModifyUserInformation 함수 에러", error)
            reject({success : false, message : "회원 정보 수정 에러, 관리자 문의."})
        }
    });
}

export function GetUserPassword( uid : String) : Promise<string> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT user_pw FROM user_information WHERE user_uid = ${uid}`
            let result = await MariaQuery(sql, uid)
            resolve(result[0].user_pw)
        } catch (error) {
            console.log("GetUserPassword 함수 에러", error)
            reject({success : false, message : "회원 수정 에러, 관리자 문의."})
        }
    });
}

export function InsertUserOtp(data : any) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            let {email, otp} = data
            let email_id = email.split("@")[0]
            await otp_model.insertMany({user_email : email_id, otp : otp})
            .then(() => resolve({success : true ,message : "이메일 발송 성공"}))
            .catch(error => reject({success : false, message : "OTP 저장 에러, 관리자 문의."}))
        } catch (error) {
            console.log("InsertUserOtp 함수 에러", error)
            reject({success : false, message : "OTP 저장 에러, 관리자 문의"})
        }
    });
}

export function CheckUserOtp(data : any) : Promise<user_email> {
    return new Promise(async(resolve, reject) => {
        console.log("CheckUserOtp >>", data )
        const {otp, user_id} = data
        let email_id = user_id.split("@")[0]
        let email_domain = user_id.split("@")[1]
        otp_model.findOne({user_email : email_id}).exec()
        .then((result : any) => {
            if(result === null) return reject({success : false, message : "인증 시간 초과하였습니다."})
            else if(result.otp == otp) return resolve({id : email_id, domain : email_domain})
            else return reject({success : false, message : "otp가 일치하지 않습니다."})
        })
        .catch(error => reject({success : false, message : "회원가입 과정 오류, 관리자 문의."}))
    });
}

export function GetUserClosetSequence(user_number:any) :Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT closet_sequence, closet_name, gender, create_time FROM user_closet WHERE user_number = ${user_number}`
            let data = await MariaQuery(sql, [])
            resolve({success : true, data : data})
        } catch (error) {
            console.log("GetUserClosetSequence 함수 에러", error)
            reject({success  : false, message : "옷장 정보 호출 에러, 관리자 문의."})
        }
    });
}

export function CreateUserCloset(closet_data: closet) : Promise<object>{
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `INSERT INTO user_closet (user_number, closet_name, gender) 
                        VALUES(${closet_data.user_number}, '${closet_data.closet_name}', ${closet_data.gender})`
            let closet = await MariaQuery(sql, [])
            resolve({closet_data, closet_sequence : closet.insertId})
        } catch (error) {
            console.log("CreateUserCloset 함수 에러", error)
            reject({success :false, message : "옷장 생성에러, 관리자 문의"})
        }
    });
}

export function DeletePastOtp(user_email : string) : Promise<void>{
    return new Promise((resolve, reject) => {
        const email = user_email.split("@")[0]
        otp_model.deleteOne({
            user_email : email
        }).exec()
        .then(() => resolve())
        .catch(error => reject({success : false, message : "회원가입 과정 에러, 관리자 문의 바랍니다."}))
    });
}

export async function GetUserByUid(user_number:number) : Promise<object> {
    try {
        const select_query = `SELECT 
                                user_uid, user_id, user_nickname, id_domain, user_height, user_weight, user_gender, reg_date 
                            FROM user_information 
                            WHERE user_uid = ${user_number}`
        let user_data = await MariaQuery(select_query)
        return {success : true, data : user_data[0]}
    } catch (error) {
        console.error("GetUserByUid 함수 에러", error)
        throw {success : false, message : "회원 정보 수정 과정 에러 !"}
    }
}