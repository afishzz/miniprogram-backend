const mongoose = require('mongoose')

const url = 'mongodb://localhost/ques'

//创建集合
function createSet(dbase, setName) {
    dbase.createCollection(setName, (err, res) => {
        if(err) {
            console.log('创建集合失败')
            return;
        }
        console.log('创建集合成功')
        dbase.close();
    })
}

mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
    .then(() => console.log('数据库连接成功'))
    .catch((err) => console.log('数据库连接失败'))

const db = mongoose.connection;

//集合规则
const questionSchema = new mongoose.Schema({
    subject: String,
    chapterNumber: String,
    chapter: String,
    type: String,
    quesNumber: String,
    question: String,
    A: String,
    B: String,
    C: String, 
    D: String,
    answer: String,
    tip: String
})
const userInfoSchema = new mongoose.Schema({
    openID: {
        type: String,
        unique: true,
    },
    avatar: String,
    nickname: String,
    gender: {
        type: Number,
        enum: [1, 2]
    },
    school: String,
    goal: Number,
    motto: String,
    days_of_persistence: Number,
    correct_ratio: {
        type: Number,
        max: 1,
        min: 0
    },
})

//创建集合并应用规则
exports.Question = mongoose.model('Question', questionSchema);
exports.UserInfo = mongoose.model('Userinfo', userInfoSchema);