import mailer from 'nodemailer';

export function SendEmail(email : string) : Promise<Object>{
    return new Promise((resolve, reject) => {
        try {
            console.log("SendEmail 함수 실행")
            let otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
            console.log('otp :>> ', otp);
            let transporter = mailer.createTransport({
                service: "gmail",
                // host: 'smtp.naver.com',
                // port : 465,
                auth: {
                    user:process.env.NodeMailer_USER,
                    pass:process.env.NodeMailer_PASS
                }
            })
            let mailOption = {
                from : process.env.NodeMailer_USER,
                to : email,
                subject : 'bopool email 인증번호 입니다.',
                // text : ``,
                html:  `<div>
                            <p>회원가입 인증번호는 <b>${otp}</b> 입니다. </p>
                        </div>`
            }
            transporter.sendMail(mailOption, (error, result) => {
                if(error){
                    console.log("Email 발송 에러", error)
                    return reject({success : false, message : "이메일 발송 오류"})
                }else{
                    console.log("email 발송 성공")
                    return resolve({email : email, otp : otp})
                }
            })
        } catch (error) {
            console.log("SendEmail 에러", error)
            reject({success : false, message : "메일 발송 과정 에러, 관리자 문의"})
        }
    });
}