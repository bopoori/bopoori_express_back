import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import {Request, Response, NextFunction} from 'express';
import MariaQuery from '../data/MariaConnection';
import * as req_type from '../../types/index';

export const secret_key : Secret = `${process.env.JWT_SECRET}`

export type jwt_payload = {
  user_number : number,
  nick_name : string,
  type : token_types
}


export enum token_types {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH'
}

/**
 * 
 * @param req 
 * @param res 
 * @param data 
 * @description 초기 액세스 및 리프레쉬 토큰 발급 함수.
 */
export function CreateAccessAndRefreshToken(req :Request, res:Response, data : any) {
  console.log('data :>> ', data);
  const access_payload : jwt_payload = {
    user_number : data.closet_data.user_number,
    nick_name : data.closet_data.closet_name,
    type : token_types.ACCESS,
  }
  console.log('access_payload :>> ', access_payload);
  jwt.sign({
    access_payload,
    },
    secret_key,
    { 
      algorithm: "HS256",
      expiresIn: "3s",
      issuer: "bopool administrator",
    }, async (err, token) => {
      if(err) res.status(500).json({success : false, message : "토큰 발급 오류"})
      else {
        let refresh = CreateRefreshToken(access_payload) // res, access_payload
        await InsertRefreshToken(refresh)
        res.header({Authorization : token}).json({success : true, message : "토큰 발급 완료.", closet_sequence : data.closet_sequence})
      }
    })
}

/**
 * 
 * @param pay_load jwt payload
 * @returns 리프레쉬 토큰
 * @description 리프레쉬 토큰 발급 함수
 */
export function CreateRefreshToken(pay_load : jwt_payload) : string {
  const payload = {
    user_number : pay_load.user_number,
    nick_name : pay_load.nick_name,
    type : token_types.REFRESH
  }
  let result = jwt.sign({
    payload,
    },
    secret_key,
    { 
      algorithm: "HS256",
      expiresIn: "30d",
      issuer: "bopool administrator",
    })
    return result
}

/**
 * 
 * @param req 
 * @param res 
 * @param next
 * @description 토큰 검증하는 미들웨어, 토큰 만료시엔 리프레쉬토큰 검증
 */
export async function VerifyToken(req : Request, res : Response, next : NextFunction) {
  try {
    console.log(`VerifyToken`)
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if(!token) res.status(401).json({success : false, message : "토큰 정보 확인 불가."})

    let decode : any = jwt.verify(token as string, secret_key)

    let check = await CheckUserNumber(decode.payload)
    console.log("check",check)
    check?.success === false ? res.status(401).json(check) : next()

  } catch (error : any) {
    console.log("error !!", error.name)
    if(error.name === 'TokenExpiredError') {
      // db에서 토큰 검증하고 
      const token = req.header('Authorization')?.replace('Bearer ', '');
      let decode : any = jwt.decode(token as string)
      const {user_number} = decode.access_payload
      let result : any = await GetRefreshToken(user_number)
      result.success === true ? RefreshTokenVerify(result.refresh_token, req, res, next) : res.status(401).json({success :false, message : "인증이 만료되었습니다. 재로그인 바랍니다."})
    }
    else res.status(401).json({success : false,  message : "유효한 접근이 아닙니다. 재 로그인 바랍니다."})
  }
}

/**
 * 
 * @param payload jwt payload
 * @returns object 결과 여부
 * @description jwt payload 에 있는 회원번호와 닉네임으로 실제 db에 회원이 있는지 조회
 */
export async function CheckUserNumber (payload:jwt_payload) {
  try {
    console.log('payload :>> ', payload);
    const {nick_name, user_number} = payload

    const sql = `SELECT * FROM user_information WHERE user_uid = ${user_number} AND user_nickname = '${nick_name}'`
    let result = await MariaQuery(sql, [])

    let return_object
    return_object = result.length === 0 ?  {success : false, message : "요청자 정보 없음"} : {success : true}
    return return_object

  } catch (error) {
    console.log("CheckUserNumber 에러", error)
    return ({success : false, message : "회원 인증 과정 오류, 관리자 문의."})
  }
}

/**
 * 
 * @param refresh_token 리프레쉬토큰
 * @returns object
 * @description db에 리프레쉬 토큰 저장
 */
export async function InsertRefreshToken(refresh_token:string) : Promise<object> {
  try {
    let decode : any = jwt.verify(refresh_token, secret_key)
    const {user_number} = decode.payload
    console.log('decode :>> ', decode);
    const sql = `INSERT INTO token_repository (user_number, refresh_token) VALUES(?, ?)`
    let insert_data = [user_number, refresh_token]
    
    await MariaQuery(sql, insert_data)
    return {success : true}

  } catch (error) {
    console.log("InsertRefreshToken 함수 에러", error)
    return {success : false, message : "토큰 삽입 에러"}
  }
}

/**
 * 
 * @param user_number 회원고유번호
 * @returns 성공 실패 여부
 * @description 리프레쉬토큰 db 조회 후 리턴 하는 함수
 */
async function GetRefreshToken(user_number : number) {
  try {
    const sql = `SELECT refresh_token FROM token_repository WHERE user_number = ${user_number}`
    console.log('sql :>> ', sql);
    let result = await MariaQuery(sql, [])
    console.log('result :>> ', result.length);
    return result.length !== 1 ? {success :false} : {success : true, refresh_token : result[0].refresh_token}
  } catch (error) {
    console.log("GetRefreshToken 에러", error)
    return {success : false}
  }
}

/**
 * 
 * @param data jwt payload
 * @returns access token
 * @description 액세스 토큰 만들어서 리턴
 */
async function CreateAccessToken(data : jwt_payload) : Promise<any> {
  try {
    const access_payload : jwt_payload = {
      user_number : data.user_number,
      nick_name : data.nick_name,
      type : token_types.ACCESS,
    }
    let result = jwt.sign({
      access_payload,
      },
      secret_key,
      { 
        algorithm: "HS256",
        expiresIn: "1m",
        issuer: "bopool administrator",
      })
      return result
  } catch (error) {
    console.log("CreateAccessToken 함수 에러", error)
    return error 
  }
}

/**
 * 
 * @param refresh_token 리프레쉬 토큰
 * @param req 요청
 * @param res 응답
 * @param next 진행미들웨어
 * @description 리프레쉬토큰 검증 하고, 새로운 액세스토큰 발급하거나, 새로 로그인 하게 만드는 미들웨어
 */
async function RefreshTokenVerify(refresh_token:string, req : Request, res : Response, next : NextFunction) {
  try {
    let decode : any = jwt.verify(refresh_token, secret_key)
    let {user_number, nick_name} = decode.payload
    console.log('decode :>> ', decode);

    let data = {
      user_number : user_number,
      nick_name : nick_name,
      type : token_types.ACCESS
    }

    let access_token : string = await CreateAccessToken(data)
    req.decoded = access_token

    next()
  } catch (error) {
    console.log("RefreshTokenVerify 함수 오류", error)

    let decode : any = jwt_decode(refresh_token)
    let {user_number} = decode.payload

    const sql = `DELETE FROM token_repository WHERE user_number = ${user_number}`
    await MariaQuery(sql, [])

    res.status(401).json({success : false, message : "인증 만료 재 로그인 바랍니다."})
  }
}