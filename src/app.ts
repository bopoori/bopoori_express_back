import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import createError from "http-errors";
import dotenv from "dotenv";
import logger from "morgan"


dotenv.config({
    path: path.resolve(
      process.cwd(),
      process.env.NODE_ENV === "development"
        ? ".env.dev"
        : process.env.NODE_ENV === "local"
        ? ".env.local"
        : process.env.NODE_ENV === "staging"
        ? ".env.stg"
        : ".env"
    ),
});
  
// console.log('process.env :>> ', process.env);

import IndexRouter from './routes/index';
import AuthRouter from './routes/auth/index';
import ClosetRouter from './routes/closet/index';
import UserRouter from './routes/user/index';
import TipRouter from './routes/tips/index';

const app = express();
let a = __dirname.split('\\')
a.pop()
let file_path = a.join('\\')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger("dev"))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(file_path, 'uploads')));

app.use('/', IndexRouter);
app.use('/bopool', IndexRouter);
app.use('/bopool/closets', ClosetRouter);
app.use('/bopool/auth', AuthRouter);
app.use('/bopool/users', UserRouter);
app.use('/bopool/tips', TipRouter);

app.use(function(req, res, next) {
    next(createError(404));
});

app.use(function(err : any, req : any, res : any, next : any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

import MongoCon from './middlewares/mongo';

MongoCon();



export default app