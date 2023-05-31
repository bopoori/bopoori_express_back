import app from "./app";
import {createServer} from "http";

const port: number = Number(process.env.PORT) || 12023;
app.set('port', port);

const server = createServer(app);

server.listen(port);

console.log(`★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ `)
console.log('=================== port :>> ', port);
console.log(`=================== Current Server >> bopoori_express_back`)
console.log(`=================== NODE_ENV >> ${process.env.NODE_ENV}`)
console.log(`=================== TIME_ZONE >> ${Date()}`)
console.log(`★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ `)


export default server;