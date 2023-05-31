import {db} from "./maria";
import MariaQuery from "./MariaConnection";
import axios from 'axios';


export function KakaoOauth (query : any) : Promise<String> {
    return new Promise(async(resolve, reject) => {
        try {
            const form_data = {
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_API_KEY,
                redirect_uri: process.env.REDIRECT_URI,
                code : query,
                client_secret: process.env.KAKAO_CLIENT_SECRET,
            }
            await axios({
                method : "post",
                url : `https://kauth.kakao.com/oauth/token`,
                data : query,
                headers : {
                    'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'grant-type' : ''
                }
            }).then(result => console.log(result.data))
        } catch (error) {
            console.log("error !", error)
            reject({success : false, message : "에러"})
        }
    });
}
