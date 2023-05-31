import mongoose from 'mongoose';
const {Schema} = mongoose

const clothes = new Schema({
    user_number : {
        type : Number
    },
    clothes : {
        type : Object
    },
    wearing_weather : {
        type : Number,
        default : 0
    },
    schedule_date : {
        type : String
    }
}, {
    _id : true,
    versionKey : false
})

const clothes_model = mongoose.model('clothes', clothes, "clothes_to_wear")

export {clothes_model}