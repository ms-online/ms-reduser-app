// 引入模块
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// 初始化app
const app = express();

// 创建redis client
let client = redis.createClient();

client.on('connect', function(){
    console.log('Redis 已经连接...');
})
// 视图引擎
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// methodeOverride
app.use(methodOverride('_method'));

// 定义端口号
const Port = 4000;

// 查询主页
app.get('/', function(req, res, next){
    res.render('searchusers');
})

// 捕获searchusers form表单查询进程
app.post('/user/search', function(req,res,next){
    let id = req.body.id;

    client.hgetall(id, function(err, obj){
        if(!obj){
            res.render('searchusers', {
            error: '此用户不存在'
          });
        } else {
          obj.id = id;
          res.render('details', {
            user: obj
          });
        }
      });

})

// 添加用户页面
app.get('/user/add', function(req, res, next){
    res.render('adduser');
})

// 捕获adduser form表单查询进程
app.post('/user/add', function(req,res,next){
    let id = req.body.id;
    let name = req.body.name;
    let email = req.body.email;
    let phone =req.body.phone;

    // 添加到redis
    client.hmset(id, [
        'name', name,
        'email',email,
        'phone',phone
    ],function(err, reply) {
        if(err){
            console.log(err);

        }
        console.log(reply);
        res.redirect('/');
    })
})

// 删除用户
app.delete('/user/delete/:id', function(req, res, next){
    client.del(req.params.id);
    res.redirect('/');
  });
// 监听端口
app.listen(Port, () => console.log(`服务器已经在${Port}端口号运行...`))