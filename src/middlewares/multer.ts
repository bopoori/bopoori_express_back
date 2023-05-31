import fs from 'fs';
const fs_prom = fs.promises;
import multer from 'multer';
import {Request} from 'express';


const CurrentTime = () => {
    return new Promise((resolve, reject) => { 
        const today = new Date();
        const year = today.getFullYear();
        const month = ('0' + (today.getMonth() + 1)).slice(-2);
        const day = ('0' + today.getDate()).slice(-2);
        const hours = ('0' + today.getHours()).slice(-2); 
        const minutes = ('0' + today.getMinutes()).slice(-2);
        const seconds = ('0' + today.getSeconds()).slice(-2); 
        resolve(`${year}-${month}-${day} ${hours} ${minutes} ${seconds}`)
    });
}

const storage = multer.diskStorage({
    destination: (req : Request, file, cb) => {
        try {
            console.log("req.header", req.headers)
            console.log('file :>> ', file);
            const dir = "uploads/"
            const folder = req.headers.user_number
            console.log('folder :>> ', folder);
            if (!fs.existsSync(`${dir}${folder}`)) {
                fs_prom.mkdir(`${dir}${folder}`)
                .then(() => cb(null, `${dir}${folder}`))
            }else cb(null, `${dir}${folder}`)
        } catch (error : any) {
            console.log("사진 destination 에러", error)
            return cb(error, "error")
        }
    },
    filename: async (req, file, cb) => {
        try {
            let time = await CurrentTime()
            file.originalname = process.env.NODE_ENV === 'local' ? file.originalname : Buffer.from(file.originalname, 'latin1').toString('utf8')
            console.log('time :>> ', time);
            return cb(null, time +"_"+ req.headers.user_number + "_" + file.originalname )
        } catch (error : any) {
            console.log("사진 filename 에러", error)
            return cb(error, "error")
        }
    }
    // limits: {fileSize: (50 * 1024 * 1024)}
})



export default storage