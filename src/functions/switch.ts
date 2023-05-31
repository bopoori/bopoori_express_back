import { GetUsersAccsssory, GetUsersBottom, GetUsersOuter, GetUsersShoes, GetUsersTop } from "../data/closet/functions";

export const SwitchTable = (table_name : string, closet_sequence : string) => {
    return new Promise(async(resolve, reject) => {
        try {
            console.log("SwitchTable 진입.")
            let result
            switch (table_name) {
                case "top":
                    result = await GetUsersTop(closet_sequence)
                    break;
                case "outer":
                    result = await GetUsersOuter(closet_sequence)
                    break;
                case "shoes":
                    result = await GetUsersShoes(closet_sequence)
                    break;
                case "accssory":
                    result = await GetUsersAccsssory(closet_sequence)
                    break;            
                default:
                    result = await GetUsersBottom(closet_sequence)
                    break;
            }
            resolve({success : true, list : result})            
        } catch (error) {
            console.log("SwitchTable 에러", error)
            reject({success: false, message : "옷 정보 호출 분기 에러."})
        }
    });
}
