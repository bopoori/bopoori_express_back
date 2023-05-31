import mysql from "mysql2";

const pool = mysql.createPool({
  host: process.env.MARIA_HOST, // 호스트 주소
  user: process.env.MARIA_USER, // mysql user
  password: process.env.MARIA_PASSWORD, // mysql password
  database: process.env.MARIA_DATABASE, // mysql 데이터베이스
  port: 3306,
});


export const db = pool.promise();

