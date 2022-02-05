const express = require('express')
const mongoose = require('mongoose')
const moment = require('moment')
const router = express.Router()

const { Question, Record } = require('../util/dbcon')
const { respondMsg } = require('../util/response');
const { verifySubject, verifyQuestionID, verifyType } = require('../util/verifyData')
const { questionTotalNum } = require('../util/processData')

//获取某科目的所有题目
router.get('/getSubject', (req, res) => {
  let obj = req.query;
  if (!verifySubject(obj.subject)) {
    respondMsg(res, 1, '科目输入不合法');
    return;
  }
  Question.find({ subject: obj.subject }, null, { chapterNumber: 1, quesNumber: 1 }, (err, resObj) => {
    if (err) {
      respondMsg(res, 1, '数据库操作失败');
      return;
    }
    let data = [];
    resObj.forEach(item => {
      data.push({
        id: item.id,
        correctRate: item.doneNum == 0 ? 0 : parseInt((item.doneNum - item.wrongNum) / item.doneNum * 100),
        chapterNumber: item.chapterNumber,
        chapter: item.chapter,
        type: item.type,
        quesNumber: item.quesNumber,
        question: item.question,
        A: item.A,
        B: item.B,
        C: item.C,
        D: item.D,
        answer: item.answer,
        tip: item.tip
      })
    });
    respondMsg(res, 0, '查询成功', data);
  })
})

//获取某科目某章节的所有题目
router.get('/getChapter', (req, res) => {
  let obj = req.query;
  if (!verifySubject(obj.subject)) {
    respondMsg(res, 1, '科目输入不合法');
    return;
  }
  Question.find({ subject: obj.subject, chapterNumber: obj.chapterNumber }, null, { chapterNumber: 1, quesNumber: 1 }, (err, resObj) => {
    if (err) {
      respondMsg(res, 1, '数据库操作失败');
      return;
    }
    let data = [];
    resObj.forEach(item => {
      data.push({
        id: item.id,
        correctRate: item.doneNum == 0 ? 0 : parseInt((item.doneNum - item.wrongNum) / item.doneNum * 100),
        chapterNumber: item.chapterNumber,
        chapter: item.chapter,
        type: item.type,
        quesNumber: item.quesNumber,
        question: item.question,
        A: item.A,
        B: item.B,
        C: item.C,
        D: item.D,
        answer: item.answer,
        tip: item.tip
      })
    });
    data.sort((a, b) => {
      return Math.random() - 0.5;
    })
    respondMsg(res, 0, '查询成功', data);
  })
})

//获取随机的20道题
router.get('/getRandom', (req, res) => {
  Question.find((err, resObj) => {
    if (err) {
      respondMsg(res, 1, '数据库操作失败');
      return;
    }
    let arr = [];
    resObj.forEach(item => {
      arr.push(item);
    });
    let data = [], randArr = [], len = arr.length;
    while (randArr.length < 20) {
      let tmp = parseInt(Math.random() * len);
      if (randArr.includes(tmp)) {
        continue;
      }
      randArr.push(tmp);
      //题目arr[tmp]的正确率
      let item = arr[tmp];
      data.push({
        id: item.id,
        correctRate: item.doneNum == 0 ? 0 : parseInt((item.doneNum - item.wrongNum) / item.doneNum * 100),
        chapterNumber: item.chapterNumber,
        chapter: item.chapter,
        type: item.type,
        quesNumber: item.quesNumber,
        question: item.question,
        A: item.A,
        B: item.B,
        C: item.C,
        D: item.D,
        answer: item.answer,
        tip: item.tip
      })
      if (data.length == 20) {
        respondMsg(res, 0, '查询成功', data);
      }
    }
  });
})

//获取一套模拟题（单选16道，多选17道）
router.get('/getSimulation', (req, res) => {
  //单选
  Question.find((err, resObj) => {
    if (err) {
      respondMsg(res, 1, '数据库操作失败');
      return;
    }
    let arr = [];
    resObj.forEach(item => {
      arr.push(item);
    });
    let dataSingle = [], randArrSingle = [], len = arr.length,
      dataPlural = [], randArrPlural = [];
    while (randArrSingle.length < 16) {
      let tmp = parseInt(Math.random() * len);
      if (randArrSingle.includes(tmp)) {
        continue;
      }
      let item = arr[tmp];
      if (item.type == 1) { //单选
        randArrSingle.push(tmp);
        dataSingle.push({
          id: item.id,
          correctRate: item.doneNum == 0 ? 0 : parseInt((item.doneNum - item.wrongNum) / item.doneNum * 100),
          chapterNumber: item.chapterNumber,
          chapter: item.chapter,
          type: item.type,
          quesNumber: item.quesNumber,
          question: item.question,
          A: item.A,
          B: item.B,
          C: item.C,
          D: item.D,
          answer: item.answer,
          tip: item.tip
        });
      }
    }
    while (randArrPlural.length < 17) {
      let tmp = parseInt(Math.random() * len);
      if (randArrPlural.includes(tmp)) {
        continue;
      }
      let item = arr[tmp];
      if (item.type == 2) { //多选
        randArrPlural.push(tmp);
        dataPlural.push({
          id: item.id,
          correctRate: item.doneNum == 0 ? 0 : parseInt((item.doneNum - item.wrongNum) / item.doneNum * 100),
          chapterNumber: item.chapterNumber,
          chapter: item.chapter,
          type: item.type,
          quesNumber: item.quesNumber,
          question: item.question,
          A: item.A,
          B: item.B,
          C: item.C,
          D: item.D,
          answer: item.answer,
          tip: item.tip
        });
      }
    }
    respondMsg(res, 0, '查询成功', {
      single: dataSingle,
      plural: dataPlural
    })
  })
})

//错题重练（随机20道， 小于则全返回）
router.post('/getWrong', (req, res) => {
  let obj = req.body;
  Record.aggregate([
    {
      $lookup: {
        from: 'questions',
        localField: 'quesID',
        foreignField: 'id',
        as: 'wrong'
      }
    },
    { $match: { openID: obj.openID, isWrong: true } },
    { $unwind: '$wrong' },
    // {$limit: 20}
  ]).exec((err, records) => {
    if (err) {
      respondMsg(res, 1, '数据库操作失败');
      return;
    }
    if (records.length == 0) {
      respondMsg(res, 1, '暂无错题记录');
      return;
    }
    let arr = [];
    records.forEach((item, index) => {
      arr.push({
        id: item.quesID,
        correctRate: item.wrong.doneNum == 0 ? 0 : parseInt((item.wrong.doneNum - item.wrong.wrongNum) / item.wrong.doneNum * 100),
        isCollected: item.isCollected,
        subject: item.wrong.subject,
        chapter: item.wrong.chapter,
        type: item.wrong.type,
        quesNumber: item.wrong.quesNumber,
        question: item.wrong.question,
        A: item.wrong.A,
        B: item.wrong.B,
        C: item.wrong.C,
        D: item.wrong.D,
        answer: item.wrong.answer,
        tip: item.wrong.tip
      });
    });
    let len = arr.length;
    if (len < 20) {
      for (let i = len - 1; i >= 0; i--) {
        let rand = Math.floor(Math.random() * len);
        let tmp = arr[i];
        arr[i] = arr[rand];
        arr[rand] = tmp;
      }
      respondMsg(res, 0, '查询成功', arr);
    }
    else {
      let data = [], randArr = [];
      while (data.length < 20) {
        let rand = Math.floor(Math.random() * len);
        if (!randArr.includes(rand)) {
          randArr.push(rand);
          data.push(arr[rand]);
        }
      }
      respondMsg(res, 0, '查询成功', data);
    }
  })
})

//获取收藏的题目
router.post('/getCollected', (req, res) => {
  let obj = req.body;
  if (!verifySubject(obj.subject)) {
    respondMsg(res, 1, '科目输入不合法');
    return;
  }
  Record.aggregate([
    {
      $lookup: {
        from: 'questions',
        localField: 'quesID',
        foreignField: 'id',
        as: 'collected'
      }
    },
    { $match: { openID: obj.openID, isCollected: true, 'collected.subject': obj.subject } },
    { $unwind: '$collected' }
  ]).exec((err, records) => {
    if (err) {
      respondMsg(res, 1, '数据库操作失败');
      return;
    };
    if (records.length == 0) {
      respondMsg(res, 1, '暂无收藏的题目');
      return;
    }
    let data = [];
    records.forEach((item) => {
      data.push({
        id: item.quesID,
        collectedTime: moment(item.collectedTime).format('YYYY-MM-DD HH:mm'),
        chapterNumber: item.collected.chapterNumber,
        chapter: item.collected.chapter,
        type: item.collected.type,
        quesNumber: item.collected.quesNumber,
        question: item.collected.question,
        A: item.collected.A,
        B: item.collected.B,
        C: item.collected.C,
        D: item.collected.D,
        answer: item.collected.answer,
        tip: item.collected.tip
      });
    })
    respondMsg(res, 0, '查询成功', data);
  })
})

//获取某题目内容
router.post('/getOneQuestion', (req, res) => {
  let obj = req.body;
  verifyQuestionID(res, obj.id).then((isEffective) => {
    if (!isEffective) {
      respondMsg(res, 1, '题目id不合法');
      return;
    }
    Record.aggregate([
      {
        $lookup: {
          from: 'questions',
          localField: 'quesID',
          foreignField: 'id',
          as: 'question'
        }
      },
      { $unwind: '$question' },
      { $match: { openID: obj.openID, quesID: obj.id } }
    ]).exec((err, records) => {
      if (err) {
        respondMsg(res, 1, '数据库操作失败');
        return;
      }
      if (records.length == 0) {
        Question.findOne({ id: obj.id }, (err, item) => {
          if (err) {
            respondMsg(res, 1, '数据库操作失败');
            return;
          }
          respondMsg(res, 0, '无收藏记录或笔记', [{
            id: item.id,
            correctRate: item.doneNum == 0 ? 0 : parseInt((item.doneNum - item.wrongNum) / item.doneNum * 100),
            chapterNumber: item.chapterNumber,
            chapter: item.chapter,
            type: item.type,
            quesNumber: item.quesNumber,
            question: item.question,
            A: item.A,
            B: item.B,
            C: item.C,
            D: item.D,
            answer: item.answer,
            tip: item.tip
          }]);
          return;
        })
      }
      else {
        let record = records[0];
        respondMsg(res, 0, '查询成功', [{
          id: record.quesID,
          correctRate: record.question.doneNum == 0 ? 0 : parseInt((record.question.doneNum - record.question.wrongNum) / record.question.doneNum * 100),
          subject: record.question.subject,
          chapterNumber: record.question.chapterNumber,
          chapter: record.question.chapter,
          type: record.question.type,
          quesNumber: record.question.quesNumber,
          question: record.question.question,
          A: record.question.A,
          B: record.question.B,
          C: record.question.C,
          D: record.question.D,
          answer: record.question.answer,
          tip: record.question.tip,
          isCollected: record.isCollected,
          isWrong: record.isWrong,
          note: record.note == null ? null : record.note,
          noteCreatedTime: record.note == null ? null : moment(record.noteCreatedTime).format('YYYY-MM-DD HH:mm')
        }])
      }
    })
  });
})

//获取某科目下的所有章节名
router.get('/getChapterNames', (req, res) => {
  let obj = req.query;
  if (!verifySubject(obj.subject)) {
    respondMsg(res, 1, '科目输入不合法');
    return;
  }
  Question.distinct('chapterNumber', { subject: obj.subject }, (err, chapterNumberArr) => {
    if (err) {
      respondMsg(res, 1, '数据库操作失败');
      return;
    }
    let data = [], len = chapterNumberArr.length;
    chapterNumberArr.forEach(index => {
      Question.findOne({ chapterNumber: index, subject: obj.subject }, (err, resObj) => {
        if (err) {
          respondMsg(res, 1, '数据库操作失败');
          return;
        }
        data.push({
          chapterNumber: index,
          chapter: resObj.chapter
        })
        if (data.length == len) {
          data.sort((a, b) => {
            return a.chapterNumber - b.chapterNumber;
          })
          respondMsg(res, 0, '查询成功', data);
        }
      })
    })
  })
})

//新增一道题目
router.post('/createOneQuestion', (req, res) => {
  let obj = req.body;
  if (!verifySubject(obj.subject)) {
    respondMsg(res, 1, '科目输入不合法');
    return;
  }
  if (!verifyType(obj.type)) {
    respondMsg(res, 1, '类型输入不合法');
    return;
  }
  Question.findOne({ subject: obj.subject, chapterNumber: obj.chapterNmuber, type: obj.type, question: obj.question }, (err, resObj1) => {
    if (err) {
      respondMsg(res, 1, '数据库操作失败');
      return;
    }
    if (resObj1) {
      respondMsg(res, 1, '此题已存在，题目添加失败');
      return;
    }
    else {
      questionTotalNum().then(maxID => {
        return maxID;
      }).then(maxID => {
        Question.find({ subject: obj.subject, type: obj.type }, (err, resObj) => {
          let maxQuesNumber = null
          maxQuesNumber = resObj[0].quesNumber;
          Question.create({
            id: maxID + 1, subject: obj.subject, chapterNumber: obj.chapterNumber, chapter: obj.chapter,
            type: obj.type, question: obj.question, quesNumber: maxQuesNumber + 1,
            A: obj.A, B: obj.B, C: obj.C, D: obj.D, answer: obj.answer, tip: obj.tip
          }, (err, resObj2) => {
            if (err) {
              respondMsg(res, 1, '数据库操作失败');
              return;
            }
            respondMsg(res, 0, '题目添加成功');
            return;
          })
        }).sort({ quesNumber: -1 }).skip(0).limit(1);
      })
    }
  })

})

//(测试)获取所有题目
router.get('/questions', (req, res) => {
  Question.find({}, (err, resObj) => {
    if (err) {
      res.statusCode = 500;
      return;
    }
    respondMsg(res, 0, '查询成功', resObj)
  })
})

//(测试)获取某个题目
router.get('/questions/id', (req, res) => {
  let obj = req.query;
  Question.find({ id: obj.id }, (err, resObj) => {
    if (err) {
      res.statusCode = 500;
      return;
    }
    respondMsg(res, 0, '查询成功', resObj[0])
  })
})


module.exports = router
