import express, {Request, Response, NextFunction} from 'express';
import multer from 'multer';
import storage from "../../middlewares/multer";
import { BookmarkController, BookmarkFlagController, ClosetInfoController, ClosetInfoDashboardController,  ClothesCategoryController,  ClothesFlagController,  ClothesScheduleController, CreateClosetController, DeleteTomorrowClothesController, GetPastClothesController, GetScheduleClothesController, ImageModifyController, ItemDeleteController, ItemDetailController, ModifyClothesController, SelectClosetController, UploadController } from '../../controller/closet_controller';
const upload = multer({storage : storage})
const router = express.Router()

/**
 * @description 옷장 생성 요청
 */
router.post('/', (req : Request, res : Response) => {
    CreateClosetController(req, res)
})

/**
 * @description 옷 카테고리 요청
 */
router.get('/list', (req : Request, res : Response) => {
    ClothesCategoryController(req, res)
})

/**
 * @description 아이템 업로드 요청
 */
router.post('/img', upload.single('image'), (req : Request, res : Response) => { 
    console.log('req.file :>> ', req.file);
    UploadController(req, res)
})

/**
 * @description 선택 옷장 요약정보 요청
 */
router.get('/dashboard/:closet_sequence', (req : Request, res : Response) => {
    ClosetInfoDashboardController(req, res)
})

/**
 * @description 선택 옷장 정보 요청
 */
router.get('/info', (req : Request, res : Response) => {
    ClosetInfoController(req, res)
})

/**
 * @description 옷 상세 정보 요청
 */
router.get('/info/detail', (req : Request, res : Response) => {
    ItemDetailController(req, res)
})

/**
 * @description 옷 정보 수정 요청
 */
router.put('/info/detail/:sequence', (req : Request, res : Response) => {
    ModifyClothesController(req, res)
})

/**
 * @description 옷 삭제 요청
 */
router.delete('/info/detail/:item_number', (req : Request, res : Response) => {
    ItemDeleteController(req, res)
})

/**
 * @description 옷 사진 변경 요청
 */
router.patch('/info/detail/image', upload.single('image'),  (req : Request, res : Response) => {
    ImageModifyController(req, res)
})

/**
 * @description 옷 즐겨찾기 변경
 */
router.patch('/info/detail/bookmark/:image_number', (req : Request, res : Response) => {
    BookmarkController(req, res)
})

/**
 * @description 옷장 별 목록 출력
 */
router.get('/info/tomorrow', (req : Request, res : Response) => {
    SelectClosetController(req, res)
})

/**
 * @description 내일 입을 옷 등록
 */
router.post('/info/tomorrow/clothes', (req : Request, res : Response) => {
    ClothesScheduleController(req, res)
})

/**
 * @description 내일 입을 옷 불러오기
 */
router.get('/info/tomorrow/clothes', (req : Request, res : Response) => {
    GetScheduleClothesController(req, res)
})

/**
 * @description 선택한 날짜 옷 불러오기
 */
router.get('/info/tomorrow/my-clothes', (req : Request, res : Response) => {
    GetPastClothesController(req, res)
})

/**
 * @description 입은옷 확정
 */
router.patch('/info/tomorrow/my-clothes/:id', (req : Request, res : Response) => {
    ClothesFlagController(req, res)
})

/**
 * @description 입을 옷 삭제
 */
router.delete('/info/tomorrow/my-clothes/:id', (req : Request, res : Response) => {
    DeleteTomorrowClothesController(req, res)
})

// router.post('/', (req : Request, res : Response) => {
    
// })
export default router