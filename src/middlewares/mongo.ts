import mongoose from 'mongoose';
import 'dotenv/config'

export default () => {
    function connect() {
      mongoose.set('strictQuery', false).connect(`${process.env.MONGO_URI}`, {
          dbName: process.env.DB_NAME,
          // useNewUrlParser: true,
          // useUnifiedTopology: true,
          keepAlive: true, 
          keepAliveInitialDelay: 300000,
        },(error : any) => {
          if (error) {
            console.log("mongoDB connection Error!", error);
          } else {
            console.log("mongodb connection success!");
          }
        }
      );
    }
    // 연결이 끊겼을시 콜백 함수를 통해 자동으로 재접속 합니다.
    connect()
    // mongoose.connection.on('disconnected', connect);
}
  
  
