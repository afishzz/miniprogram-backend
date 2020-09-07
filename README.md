# MiniProgram-Backend
考研政治刷题小程序NodeJS后端代码

## 技术
+ node.js+express框架
+ mongodb数据库

## 功能
### 用户相关
+ 获取用户头像和昵称
+ 存入用户头像和昵称
+ 更新用户个人信息
+ 获取用户个人信息

### 题目相关
+ 获取某科目的所有题目
+ 获取某科目下某章节的所有题目
+ 获取随机的50道题
+ 获取某科目的一套模拟题（单选16道，多选17道）
+ 为某题添加或更新笔记
+ 将某题标记为错题
+ 将某题加入已做过的题目(做对)
+ 各科目总题数，(个人)做过的，正确率，进度
+ 某科目各章总题数+每章做过的题数
+ 收藏题目
+ 取消收藏某题
+ 某题的用户正确率（做对这题的人数/做过这题的人数）

## 将题目存入数据库
```
cd miniprogram-backend

cd util

node processData.js
```

## 运行
```
cd miniprogram-backend

npm install

node app.js
```
