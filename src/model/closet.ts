export interface clothes {
    closet_number : any,
    sequence : String | Number,
    name : String,
    color : String,
    brand : String,
    explain : String,
    price : String,
    buy_date : String,
    wear_count : String | Number,
    category : String,
    path : String,
    table_name : String,
    season : String | Number
}

export interface closet {
    sequence? : String | Number,
    user_number : String | Number,
    closet_name? : String
    create_time? : String,
    gender : String | Number
}

export type cloth_count = {
    [key : string] : number
}