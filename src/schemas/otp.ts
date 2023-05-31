import mongoose from 'mongoose';
const {Schema} = mongoose

const OtpSchema = new Schema({
    user_email : {
        type : String
    },
    otp : {
        type : String
    }
}, {
    versionKey : false,
    timestamps : true
})

OtpSchema.index({createdAt : 1},{expireAfterSeconds: 180});

const otp_model = mongoose.model('Otp', OtpSchema, "OTP")

export {otp_model}