import bcrypt from 'bcrypt';
const salt_rounds = 10;

export async function PasswordHashing(password : any ) : Promise<String> {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, salt_rounds)
        .then(hashed => resolve(hashed))
        .catch(error => reject({success : false, message : "비밀번호 암호화 에러.", error : error}))
    });
}

export async function ComparePassword(user_data : any, password : string) : Promise<Object> {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password , user_data.user_pw)
        .then(check => {
            console.log('check :>> ', check);
            delete user_data.user_pw
            check === true ? resolve({success : true, data : user_data}) : reject({success : false, message : " 아이디 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요."})
        })
        .catch(error => {
            console.log(error)
            reject({success : false, message : "서버 에러, 관리자 문의 바랍니다."})})
    });
}

export async function CheckPassword( user_pw : string, hashed : string) : Promise<Object> {
    return new Promise((resolve, reject) => {
        bcrypt.compare(user_pw, hashed)
        .then((result) => {
            result === true ? resolve({success : true, message : "비밀번호 일치 !"}) : reject({success : false, message : "비밀번호가 일치하지 않습니다, 확인 바랍니다."})
        }).catch((error) => {
            console.log(error)
            reject({success : false, message : "서버 에러. 관리자 문의 바랍니다."})
        });

    });
}