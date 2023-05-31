import express, {Request, Response, NextFunction} from 'express';
const router = express.Router()

router.get('/', (req : Request, res : Response) => {
    res.render('index', { 
        title: 'bopoori api root page', 
        version: "V000000", 
        date: "2023-04-17 09:00"
    })
})


export default router