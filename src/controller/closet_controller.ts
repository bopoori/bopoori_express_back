import {Response, Request} from 'express';
import { CountClothes, CreateUserCloset, DeleteTomorrowClothes, DeleteUserClothes, FileResizing, ForgottenClothes, FrequentlyClothes, GetClothesCategory, GetItemBookmark, GetPathFromWholeTable, GetProductDetail, GetProductPath, GetTableName, GetUsersAccsssory, GetUsersBottom, GetUsersOuter, GetUsersShoes, GetUsersTop, GetUserTomorrowClothesByDate, GetUserTomorrowClothesByUserNumber, IncreaseWearingCount, InsertClothesInfo, InsertItemNumber, ModifyClothes, UnlinkImageFile, UpdateBookmark, UpdateNewPath, UpdateWearingFlag, UserClosetList, WearingClothesReg } from '../data/closet/functions';
import { SwitchTable } from '../functions/switch';

/**
 * 
 * @param req Request
 * @param res Response
 * @description 파일 업로드 및 압축 컨트롤러
 */
export async function UploadController (req:Request, res : Response) {
    console.log("ShaprController ", req.body)
    await FileResizing(req.file)
    .then(file => InsertItemNumber(file, req.body.closet_number, req.body.table_name))
    .then(result => InsertClothesInfo(req.body, result.file, result.insert_id))
    .then(result => res.json(result))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req Request
 * @param res Response
 * @description 옷장 생성 컨트롤러
 */
export async function CreateClosetController(req : Request, res : Response) {
    console.log("CreateClosetController", req.body)
    await CreateUserCloset(req.body)
    .then(() => UserClosetList(req.body.user_number))
    .then(result => res.json(result))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req Request
 * @param res Response
 * @description 옷장 요약정보 컨트롤러
 */
export async function ClosetInfoDashboardController(req : Request, res : Response) {
    console.log("ClosetInfoController", req.params)
    await Promise.all([
        CountClothes(Number(req.params.closet_sequence)),
        FrequentlyClothes(Number(req.params.closet_sequence)),// 자주 입는 옷 추가
        ForgottenClothes(Number(req.params.closet_sequence))// 잊고 있던 옷 추가
    ])
    .then(result => res.json({success : true, clothes_count : result[0], frequently_clothes : result[1], forgotten_clothes : result[2]}))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req Request
 * @param res Response
 * @description 옷장 정보 컨트롤러
 */
export async function ClosetInfoController(req : Request, res : Response) {
    console.log("ClosetInfoController sequence >>", req.query.closet_sequence)
    let sequence = req.query.closet_sequence
    await Promise.all([
        GetUsersAccsssory(sequence),
        GetUsersBottom(sequence),
        GetUsersOuter(sequence),
        GetUsersShoes(sequence),
        GetUsersTop(sequence)
    ]).then(result => res.json({accessory : result[0], bottom : result[1], outer : result[2], shoes : result[3], top : result[4]}))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req 
 * @param res 
 * @description 옷 수정 컨트롤러
 */
export async function ModifyClothesController(req : Request, res : Response) {
    console.log("ModifyClothesController 실행", req.body)
    await GetTableName(Number(req.params.sequence))
    .then(table_name => ModifyClothes(req.body, Number(req.params.sequence), table_name))
    .then(table_name => GetProductDetail(table_name, Number(req.params.sequence)))
    .then(result => res.json({success : true, item : result}))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req 
 * @param res 
 * @description 선택 옷 세부정보 호출 컨트롤러
 */
export async function ItemDetailController(req : Request, res : Response) {
    console.log("ItemDetailController 실행", req.query)
    await GetProductDetail(req.query.table_name as string, Number(req.query.item_number))
    .then(result => res.json({success : true, item : result}))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req 
 * @param res 
 * @description 옷 삭제 요청 컨트롤러
 */
export async function ItemDeleteController(req : Request, res : Response) {
    console.log("ItemDeleteController 실행")
    await GetProductPath(req.body.table_name, req.params.item_number)
    .then(result => UnlinkImageFile(result))
    .then(item_number => DeleteUserClothes(item_number))
    .then(result => res.json(result))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req 
 * @param res 
 * @description 옷 사진 수정 컨트롤러
 */
export async function ImageModifyController(req : Request, res : Response) {
    console.log("ImageModifyController 실행", req.file)
    const {table_name, item_number} = req.body
    await Promise.all([
        FileResizing(req.file),
        GetProductPath(table_name, item_number)
    ]).then(result => Promise.all([
        UpdateNewPath(result[0], table_name, item_number),
        UnlinkImageFile(result[1])
    ]))
    .then(() => GetProductDetail(table_name, item_number))
    .then(result => res.json({success : true , item : result}))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req 
 * @param res 
 * @description 내일 입을 옷 등록 컨트롤러
 */
export async function ClothesScheduleController(req : Request, res : Response) {
    const {user_number, date} = req.body
    await GetPathFromWholeTable(req.body)
    .then(result => WearingClothesReg(result, date, user_number))
    .then((result : any) => res.json({success : true, message : "입을 옷 등록 완료.", data : result}))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req 
 * @param res 
 * @description 옷장 별 리스트 출력 컨트롤러
 */
export async function SelectClosetController(req : Request, res : Response) {
    console.log("SelectClosetController req.query >> ", req.query)
    await SwitchTable(req.query.table_name as string, req.query.closet_sequence as string)
    .then(result => res.json(result))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req 
 * @param res 
 * @description 내일 입을 옷 호출 컨트롤러
 */
export async function GetScheduleClothesController(req : Request, res : Response) {
    console.log("GetScheduleClothesController", req.query)
    GetUserTomorrowClothesByDate(req.query.user_number as string)
    .then(result => res.json(result))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req 
 * @param res 
 * @description 선택 날짜 입을 옷 컨트롤러
 */
export async function GetPastClothesController(req : Request, res : Response) {
    await GetUserTomorrowClothesByUserNumber(req.query.user_number as string, req.query.date as string)
    .then(result => res.json(result))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req 
 * @param res 
 * @description 입은 옷 확정 컨트롤러.
 */
export async function ClothesFlagController(req : Request, res : Response) {
    await UpdateWearingFlag(req.params.id)
    .then(result => IncreaseWearingCount(result))
    .then(() => res.json({success : true, message : "입은 옷 확정 완료."}))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req 
 * @param res 
 * @description 내일 입을 옷 삭제 컨트롤러
 */
export async function DeleteTomorrowClothesController(req : Request, res : Response) {
    await DeleteTomorrowClothes(req.params.id)
    .then(() => res.json({success : true, message : "삭제 완료."}))
    .catch(error => res.json(error))
}

/**
 * 
 * @param req 
 * @param res 
 * @description 옷 카테고리 호출 컨트롤러
 */
export async function ClothesCategoryController(req : Request, res : Response) {
    try {
        const clothes_category = await GetClothesCategory()
        res.json({success : true, list : clothes_category})
    } catch (error) {
        res.json(error)
    }
}
/**
 * 
 * @param req 
 * @param res 
 * @description 옷 즐겨찾기 설정 컨트롤러
 */
export async function BookmarkController(req : Request, res : Response) {
    try {
        await UpdateBookmark(Number(req.params.image_number), Number(req.body.flag))
        res.json({success : true})
    } catch (error) {
        res.json(error)
    }
}

export async function BookmarkFlagController(req : Request, res : Response) {
    try {
        let item = await GetItemBookmark(Number(req.params.item_number))
        res.json({success  :true, item})
    } catch (error) {
        res.json(error)
    }
}