const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const userScoreSchema = new Schema({
    regNo: String,
    name: String,
    marks: Number,
    mobileNo: Number,
    email: String,
    
})

const orgTestsSchema = new Schema({
    clubCode: String,
    testId: Number,
    start: Boolean,
    usersScores: [userScoreSchema],
    tests: String
})


const orgSchema = new Schema({
    clubCode: {
        type: String,
        required: true,
        uniqe:false
    },
    clubName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required:true,
        unique:false,
    },
    mobileNo: Number,
    expectedCandidates: {
        type: Number,
        default:0
    },
    extras: String,
    password: {
        type: String,
        required:true
    },
    testId: {
        type: Number,
        required:true,
        unique:false,
    }
});

const userScore = Mongoose.model('userScore', userScoreSchema)
const orgTests = Mongoose.model('orgTests', orgTestsSchema);
orgSchema.index({  clubCode:1,email:-1,testId:1 });

const Org = Mongoose.model("Org", orgSchema);
module.exports = {
    Org, userScore, orgTests
}
