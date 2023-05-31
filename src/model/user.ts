export interface user_info {
    user_uid : Number,
    user_id : string,
    user_pw : string,
    user_nickname : string,
    user_weight : string,
    user_height : string,
    user_gender : string
}

export interface secession_user {
    user_uid : number,
    reason : string,
    feedback : string
}

export type user_email = {
    id : string,
    domain : string
}