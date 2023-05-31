import sharp from 'sharp';
import fs from 'fs';
import {clothes, closet, cloth_count} from '../../model/closet'
import MariaQuery from '../MariaConnection';
import { clothes_model } from '../../schemas/clothes';

export function FileResizing(file: any) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            let path = file.path
            sharp(file.path)
            .resize({width : 600})
            .withMetadata()
            .toBuffer()
            .then(data => {
                fs.writeFile(path, data, (err) => {
                    if(err) reject({success : false, message : "파일 압축 에러, 관리자 문의."})
                    else resolve({file : file})
                })
            })
        } catch (error) {
            console.log("FileResizing error", error)
            reject({success : false, message : "파일 압축과정 에러, 관리자 문의"})
        }
    });
}

export function InsertClothesInfo(body : clothes, file : any, insert_id : string) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            console.log('file :>> ', file.file.path);
            let path = JSON.stringify(file.file.path)
            let {brand, buy_date, table_name, color, explain, name, price, category} = body
            const sql = `INSERT INTO closet_${table_name} 
                        (item_number, ${table_name}_name, ${table_name}_color, ${table_name}_brand, ${table_name}_explain, ${table_name}_buy_date, ${table_name}_price, path, category)
                        VALUES(${insert_id}, '${name}', '${color}', '${brand}', '${explain}', '${buy_date}', ${price}, ${path}, '${category}')`
            await MariaQuery(sql, [])
            resolve({success : true, message : "옷 등록 완료."})
        } catch (error) {
            console.log("InsertClothesInfo 함수 에러", error)
            reject({success : false, message : "옷 정보 삽입 에러, 관리자 문의."})
        }
    });
}

export function CreateUserCloset(body : closet) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const {user_number, closet_name, gender} = body
            const sql = `INSERT INTO user_closet (user_number, closet_name, gender) VALUES (?, ?, ?)`
            let data = [user_number, closet_name, gender]
            await MariaQuery(sql, data)
            resolve({})
        } catch (error) {
            console.log("")
            reject({success : false, message : "옷장 생성 오류, 관리자 문의."})
        }
    });
}

export function UserClosetList(user_number: Number ) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = 'SELECT * FROM user_closet WHERE user_number = ?'
            let rows = await MariaQuery(sql, [user_number])
            resolve({success : true, result : rows})
        } catch (error) {
            console.log("UserClosetList 함수 에러", error)
            reject({success : false, message : "옷장 정보 호출 에러, 관리자 문의."})
        }
    });
}

export function CountClothes(closet_sequence : number) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT table_name, COUNT(table_name) as cnt
                            FROM clothes_sequence
                            WHERE closet_number = ${closet_sequence}
                            GROUP BY table_name`
            let result = await MariaQuery(sql, [])
            let object : cloth_count = {
                "top" : 0,
                "bottom" : 0,
                "outer" : 0,
                "accessory" : 0,
                "shoes" : 0
            }
            result.filter((category : any) => object[category.table_name] = category.cnt)
            resolve(object)
        } catch (error) {
            console.log("CountClothes 함수 에러", error)
            reject({success : false, message : "대시보드 카운팅 과정 에러."})
        }
    });
}

export function InsertItemNumber(file : any, closet_sequence : string, clothes_kinds : string) : Promise<any>{
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `INSERT INTO clothes_sequence (closet_number, table_name) VALUES(${closet_sequence},'${clothes_kinds}')`
            let result = await MariaQuery(sql, [])
            !result.insertId ? reject({success : false, message : "옷 등록 에러, 관리자 문의"}) : resolve({file : file, insert_id : result.insertId})
        } catch (error) {
            console.log("InsertItemNumber error", error)
            reject({success : false, message : "옷 등록과정 에러, 관리자 문의."})
        }
    });
}

export function GetUsersAccsssory(closet_sequence : any) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT ca.accessory_sequence, ca.item_number, ca.path
                        FROM clothes_sequence AS cs
                        INNER JOIN closet_accessory AS ca ON cs.image_number = ca.item_number
                        WHERE cs.closet_number = ${closet_sequence}`
            let rows = await MariaQuery(sql, [])
            rows.map((item : any) => item.path = `http://3.39.118.55:12023/${item.path}`)
            resolve(rows)
        } catch (error) {
            console.log("GetUsersAccsssory 에러", error)
            reject({success : false, message : "악세사리 목록 호출 에러, 관리자 문의"})
        }
    });
}

export function GetUsersTop(closet_sequence : any) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT ct.top_sequence, ct.item_number, ct.path
                        FROM clothes_sequence AS cs
                        INNER JOIN closet_top AS ct ON cs.image_number = ct.item_number
                        WHERE cs.closet_number = ${closet_sequence}`
            let rows = await MariaQuery(sql, [])
            rows.map((item : any) => item.path = `http://3.39.118.55:12023/${item.path}`)
            resolve(rows)
        } catch (error) {
            console.log("GetUsersTop 에러", error)
            reject({success : false, message : "상의 목록 호출 에러, 관리자 문의"})
        }
    });
}

export function GetUsersBottom(closet_sequence : any) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT cb.bottom_sequence, cb.item_number, cb.path
                        FROM clothes_sequence AS cs
                        INNER JOIN closet_bottom AS cb ON cs.image_number = cb.item_number
                        WHERE cs.closet_number = ${closet_sequence}`
            let rows = await MariaQuery(sql, [])
            rows.map((item : any) => item.path = `http://3.39.118.55:12023/${item.path}`)
            resolve(rows)
        } catch (error) {
            console.log("GetUsersBottom 에러", error)
            reject({success : false, message : "하의 목록 호출 에러, 관리자 문의"})
        }
    });
}

export function GetUsersShoes(closet_sequence : any) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT s.shoes_sequence, s.item_number, s.path
                        FROM clothes_sequence AS cs
                        INNER JOIN closet_shoes AS s ON cs.image_number = s.item_number
                        WHERE cs.closet_number = ${closet_sequence}`
            let rows = await MariaQuery(sql, [])
            rows.map((item : any) => item.path = `http://3.39.118.55:12023/${item.path}`)
            resolve(rows)
        } catch (error) {
            console.log("GetUsersShoes 에러", error)
            reject({success : false, message : "신발 목록 호출 에러, 관리자 문의"})
        }
    });
}

export function GetUsersOuter(closet_sequence : any) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT co.outer_sequence, co.item_number, co.path
                        FROM clothes_sequence AS cs
                        INNER JOIN closet_outer AS co ON cs.image_number = co.item_number
                        WHERE cs.closet_number = ${closet_sequence}`
            let rows = await MariaQuery(sql, []) 
            rows.map((item : any) => item.path = `http://3.39.118.55:12023/${item.path}`)
            resolve(rows)
        } catch (error) {
            console.log("GetUsersOuter 에러", error)
            reject({success : false, message : "아우터 목록 호출 에러, 관리자 문의"})
        }
    });
}

export function ModifyClothes(body:clothes, sequence : number, table_name : string) : Promise<string> {
    return new Promise(async(resolve, reject) => {
        try {
            let {brand, buy_date, color, explain, name, price, category} = body
            const sql = `UPDATE closet_${table_name} SET 
                        ${table_name}_brand = '${brand}', ${table_name}_buy_date = '${buy_date}', category = '${category}',
                        ${table_name}_color = '${color}', ${table_name}_explain = '${explain}', ${table_name}_name = '${name}', ${table_name}_price = '${price}' 
                        WHERE item_number = ${sequence}`
            console.log('sql :>> ', sql);
            await MariaQuery(sql)
            resolve(table_name)
        } catch (error) {
            console.log("ModifyClothes 함수 에러", error)
            reject({success : false, message : "옷 정보 수정 에러, 관리자 문의."})
        }
    });
}

export function GetProductDetail(table_name: string, item_number : number) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT closet.*, cs.bookmark
                            FROM closet_${table_name} AS closet
                            LEFT JOIN clothes_sequence AS cs ON cs.image_number = closet.item_number 
                            WHERE cs.image_number = ${item_number}`
            let data = await MariaQuery(sql)
            console.log('data :>> ', data);
            data[0]['path'] = `${process.env.BASE_URL}/${data[0].path}`
            resolve(data)
        } catch (error) {
            console.log("GetProductDetail 함수 에러", error)
            reject({success : false, message : "옷 정보 호출 에러, 관리자 문의."})
        }
    });
}

export function DeleteUserClothes(item_number : string) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `DELETE FROM clothes_sequence WHERE image_number = ${item_number}`
            await MariaQuery(sql, [])
            resolve({success : true, message : "삭제 완료."})
        } catch (error) {
            console.log("DeleteUserClothes 함수 에러", error)
            reject({success : false, message : "옷삭제 에러, 관리자 문의."})
        }
    });
}

export function GetProductPath(table_name: string, item_number : string) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT path, item_number from closet_${table_name} WHERE item_number = ${item_number}`
            let data = await MariaQuery(sql, [])
            console.log('data :>> ', data);
            resolve(data)
        } catch (error) {
            console.log("GetProductDetail 함수 에러", error)
            reject({success : false, message : "옷 정보 호출 에러, 관리자 문의."})
        }
    });
}

export function UnlinkImageFile(clothes:any) : Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            fs.unlinkSync(clothes[0].path)
            resolve(clothes[0].item_number)
        } catch (error) {
            console.log("UnlinkImageFile 함수 에러", error)
            reject({success : false, message : "파일 삭제 에러, 관리자 문의."})
        }
    });
}

export function UpdateNewPath(data:any, table_name : string, item_number : string) : Promise<void> {
    return new Promise(async(resolve, reject) => {
        try {
            console.log('file :>> ', data);
            const sql = `UPDATE closet_${table_name} SET path = ${JSON.stringify(data.file.path)} WHERE item_number = ${item_number}`
            await MariaQuery(sql, [])
            resolve()
        } catch (error) {
            console.log("UpdateNewPath 함수 에러", error)
            reject({success : false, message : "파일 경로 업데이트 에러."})
        }
    });
}

export function WearingClothesReg(data:any, date : string, user_number : string) : Promise<object | null> {
    return new Promise(async(resolve, reject) => {
        try {
            console.log('data :>> ', data);
            let clothes : any = {}
            data.map((item:any) => {
                item.path = `http://3.39.118.55:12023/${item.path}`
                clothes[item.category] = item
            })
            let existing_data = await clothes_model.findOne({
                user_number : user_number,
                schedule_date : date
            })
            let result : object | null
            if(existing_data) {
                await clothes_model.updateMany({
                    user_number : user_number,
                    schedule_date : date
                }, {$set : {
                    clothes : clothes
                }})
                result = await clothes_model.findOne({
                    user_number : user_number,
                    schedule_date : date
                })
                console.log('result :>> ', result);
            }
            else {
                result = await clothes_model.insertMany({user_number : user_number, clothes : clothes, schedule_date : date})
                console.log('result :>> ', result);
            }
            resolve(result)
        } catch (error) {
            console.log("WearingClothesReg 함수 오류", error)
            reject({success : false, message : "입을 옷 등록 오류, 관리자 문의."})
        }
    });
}

export function GetPathFromWholeTable(body : any) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            console.log("GetPathFromWholeTable 진입 >>", body)
            
            const top_sql = `SELECT category, item_number, path FROM closet_top WHERE item_number = '${body.top}';`
            const bottom_sql = `SELECT category, item_number, path FROM closet_bottom WHERE item_number = '${body.bottom}';`
            const outer_sql = `SELECT category, item_number, path FROM closet_outer WHERE item_number = '${body.outer}';`
            const shoes_sql = `SELECT category, item_number, path FROM closet_shoes WHERE item_number = '${body.shoes}';`
            const accessory_sql = `SELECT category, item_number, path FROM closet_accessory WHERE item_number = '${body.accessory}';`
            const one_piece_sql = `SELECT category, item_number, path FROM closet_top WHERE item_number = '${body.one_piece}';`
            const cap_sql = `SELECT category, item_number, path FROM closet_accessory WHERE item_number = '${body.cap}';`
            const bag_sql = `SELECT category, item_number, path FROM closet_accessory WHERE item_number = '${body.bag}';`
            
            const sql = top_sql + bottom_sql + outer_sql + shoes_sql + accessory_sql + one_piece_sql + cap_sql + bag_sql
            console.log('sql :>> ', sql);
            let result = await MariaQuery(sql)
            let data = result.flat()
            console.log('data :>> ', data);
            resolve(data)
        } catch (error) {
            console.log("GetPathFromWholeTable 함수 에러", error)
            reject({success : false, message : "내일 입을 옷 등록 에러."})
        }
    });
}

export function GetUserTomorrowClothesById(id:string) : Promise<object>{
    return new Promise(async(resolve, reject) => {
        await clothes_model.findById({_id : id})
        .then(object => {
            console.log('obejct :>> ', object);
            resolve({success : true, data : object})})
        .catch(error => reject({success : false, message : "입을 옷 호출 에러, 관리자 문의."}))
    });
}

export function GetUserTomorrowClothesByUserNumber(user_number:string, date : string) : Promise<object>{
    return new Promise(async(resolve, reject) => {
        await clothes_model.findOne({user_number : user_number, schedule_date : date})
        .then(object => resolve({success : true, data : object}))
        .catch(error => reject({success : false, message : "입을 옷 호출 에러, 관리자 문의.", error : error}))
    });
}

export function GetUserTomorrowClothesByDate(user_number:any) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            const tomorrow = date.toISOString().slice(0, 10);
            console.log('tomorrow :>> ', tomorrow);
            let result = await clothes_model.find({user_number : user_number, schedule_date : tomorrow})
            result.length === 0 ? reject({success : false, message : "내일 입을옷이 등록되지 않았어요."}) : resolve({success : true , result : result})
        } catch (error) {
            console.log("GetUserTomorrowClothesByDate 에러", error)
            reject({success : false, message : "내일 옷 호출 에러, 관리자 문의."})
        }
    });
}

export function UpdateWearingFlag(id:string) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            await clothes_model.findByIdAndUpdate(id, {
                $set : {wearing_weather : 1}
            }).then((result : object | null) => {
                result!==null ? resolve(result) : reject({success : false, message : "업데이트 에러, 관리자 문의."})
            })
        } catch (error) {
            console.log("UpdateWearingFlag 함수 에러", error)
            reject({success : false, message : "처리 에러, 관리자 문의."})
        }
    });
}

export function IncreaseWearingCount(result : any) : Promise<void>{
    return new Promise(async(resolve, reject) => {
        try {
            console.log('result :>> ', result.clothes);
            let sql = ''
            for(let i in result.clothes) sql += `UPDATE closet_${result.clothes[i].category} SET wear_count = wear_count + 1 WHERE item_number = ${result.clothes[i].item_number}; \n`
            await MariaQuery(sql, [])
            resolve()
        } catch (error) {
            console.log("IncreaseWearingCount 함수 에러", error)
            reject({success : false, message : "입은 옷 처리 에러, 관리자 문의."})
        }
    });
}

export function DeleteTomorrowClothes(id : string) : Promise<void> {
    return new Promise(async(resolve, reject) => {
        try {
            await clothes_model.findByIdAndRemove(id).exec()
            resolve()
        } catch (error) {
            console.log("DeleteTomorrowClothes 함수 에러",  error)
            reject({success : false, message : '내일 입을 옷 삭제 에러, 관리자 문의.'})
        }
    });
}

export function FrequentlyClothes(closet_sequence: number) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT cs.bookmark, cs.table_name, cs.closet_number, clothes.*
                        FROM clothes_sequence AS cs
                        LEFT JOIN 
                        (
                        SELECT item_number, top_name AS clothes_name, wear_count, path FROM closet_top
                        UNION 
                        SELECT item_number, accessory_name AS clothes_name, wear_count, path FROM closet_accessory
                        UNION
                        SELECT item_number, bottom_name AS clothes_name, wear_count, path FROM closet_bottom
                        UNION
                        SELECT item_number, shoes_name AS clothes_name, wear_count, path FROM closet_shoes
                        UNION
                        SELECT item_number, outer_name AS clothes_name, wear_count, path FROM closet_outer
                        ) AS clothes 
                        ON cs.image_number = clothes.item_number
                        WHERE cs.closet_number = ${closet_sequence}
                        AND cs.bookmark = 1
                        LIMIT 0, 3`
            let result = await MariaQuery(sql, [])
            resolve(result)
        } catch (error) {
            console.log("FrequentlyClothes 함수 오류", error)
            reject({success :false, message : "자주 입는 옷 호출 오류, 관리자 문의"})
        }
    });
}

export function ForgottenClothes(closet_sequence:any) : Promise<object> {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT cs.bookmark, cs.table_name, cs.closet_number, clothes.*
                            FROM clothes_sequence AS cs
                            LEFT JOIN 
                            (
                            SELECT item_number, top_name AS clothes_name, wear_count, path FROM closet_top
                            UNION 
                            SELECT item_number, accessory_name AS clothes_name, wear_count, path FROM closet_accessory
                            UNION
                            SELECT item_number, bottom_name AS clothes_name, wear_count, path FROM closet_bottom
                            UNION
                            SELECT item_number, shoes_name AS clothes_name, wear_count, path FROM closet_shoes
                            UNION
                            SELECT item_number, outer_name AS clothes_name, wear_count, path FROM closet_outer
                            ) AS clothes 
                            ON cs.image_number = clothes.item_number
                            WHERE cs.closet_number = ${closet_sequence}
                            AND cs.bookmark = 0
                            AND clothes.wear_count = 0
                            LIMIT 0, 3`
            let result = await MariaQuery(sql, [])
            resolve(result)
        } catch (error) {
            console.log("ForgottenClothes 함수 오류", error)
            reject({success :false, message : "옷 호출 오류, 관리자 문의"})
        }
    });
}

export async function GetClothesCategory() : Promise<object> {
    try {
        let return_data : any = {'outer' : [], 'top' : [], 'bottom' : [], 'shoes' : [], 'accessory' : []}
        const sql = `SELECT category_code, table_name, second_category as category, CASE gender 
        WHEN 1 THEN '여자' 
        ELSE '공용' 
      END as gender FROM closet_category;`
        let categories = await MariaQuery(sql)

        categories.forEach((category : any) => {
            const { table_name : tableName } = category;
            if (tableName in return_data) {
                return_data[tableName].push(category);
            }
        });
        return return_data
    } catch (error) {
        console.error("GetClothesCategory 함수 에러", error)
        throw {success : false}
    }
}

export async function CheckTomorrowClothes(user_number:string, date : string) : Promise<void> {
    try {
        let result = await clothes_model.find({
            user_number : user_number,
            schedule_date : date
        })
        if(result.length === 0) return
        else throw new Error("옷 등록 중복.")
    } catch (error) {
        console.log("CheckTomorrowClothes 에러", error)
        throw {success : false, message : "이미 해당 날짜에 입을 옷이 등록되어 있습니다."}
    }
}

export async function UpdateBookmark(image_number:number, flag : number) : Promise<void> {
    try {
        const sql = `UPDATE clothes_sequence SET bookmark = ${flag} WHERE image_number = ?`
        await MariaQuery(sql, image_number)
        return
    } catch (error) {
        console.error("UpdateBookmark 함수 에러", error)
        throw {success : false, message : "즐겨찾기 설정 에러."}
    }
}

export async function GetTableName(item_number : number) : Promise<string> {
    try {
        const sql = `SELECT table_name FROM clothes_sequence WHERE image_number = ?`
        let data = await MariaQuery(sql, item_number)
        return data[0].table_name
    } catch (error) {
        console.log("GetTableName 함수 에러", error)
        throw {success : false, message : "옷 정보 수정 에러! 관리자 문의."}
    }
}

export async function GetItemBookmark(item_number:number) : Promise<object>{
    try {
        const select_query = `SELECT image_number, bookmark FROM clothes_sequence WHERE image_number = ?`
        let result = await MariaQuery(select_query, item_number)
        return result[0]
    } catch (error) {
        console.error("GetItemBookmark 함수 에러", error)
        throw {succes : false, message : "북마크 호출 에러."}
    }
}