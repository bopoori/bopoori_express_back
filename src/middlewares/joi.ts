import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const userSchema = Joi.object({
  user_id: Joi.string().email().required().messages({
    'any.required' : '아이디는 필수 입력 사항입니다.'
  }),
  user_nickname: Joi.string().required().messages({
    'any.required' : '닉네임은 필수 입력 사항입니다.'
  }),
  user_pw: Joi.string().min(8).pattern(/^(?=(.*[a-zA-Z]){1,})(?=(.*\d){1,})(?=(.*[~!@#$%^&*()_+]){1,})[a-zA-Z\d~!@#$%^&*()_+]{8,25}$/).required().messages({
    'string.pattern.base' : '비밀번호는 알파벳 소문자, 숫자, 특수문자(~, !, @, #, $, %, ^, &, *, (, ), _, +)를 포함하여 8자 이상이여야 합니다.',
    'string.min' : '비밀번호는 8자이상 입니다.',
    'any.required' : '비밀번호는 필수 입력 사항입니다.',
  }),
  user_weight: Joi.number().integer().max(999).messages({
    'number.max' : '입력하신 몸무게의 값이 잘못되었습니다.'
  }),
  user_height : Joi.number().integer().max(999).messages({
    'number.max' : '입력하신 키의 값이 잘못되었습니다.'
  }),
  otp : Joi.number().integer().max(999999).required().messages({
    'number.max' : '잘못된 형식의 OTP입니다'
  }),
  user_gender : Joi.string()
});

const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }
  next();
}

export default validateUser;
