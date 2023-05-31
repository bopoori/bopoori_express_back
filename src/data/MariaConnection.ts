import mysql from "mysql";

const connection = mysql.createPool({
    host: process.env.MARIA_HOST, 
    user: process.env.MARIA_USER, 
    password: process.env.MARIA_PASSWORD, 
    database: process.env.MARIA_DATABASE, 
    port: 3306,
    multipleStatements : true
  });
  
/**
 * Maria DB Connection
 *
 * @param query     쿼리
 * @param values    쿼리 파라미터 값
 */
const MariaQuery = (query : any, values? : any) : Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            await connection.getConnection((error : any, connection : any) => {
                connection.query(query, values, (error:any, rows : any) => {
                    if (error) {
                        console.log(`MariaQuery SQL Error`)
                        console.log(`message: ${error.message}`)
                        console.log(`sql: ${error.sql}`)
                        console.log(`code: ${error.code}`)
                        reject(error)
                    } else {
                        resolve(rows)
                    }
                })
                connection.release();   // Connectino Pool 반환
            })
        } catch (error) {
            console.log(`MariaQuery Error >> ${error}`)
            reject(error)
        }
    })
}

export default MariaQuery