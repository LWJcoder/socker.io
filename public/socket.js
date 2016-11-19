/**
 * Created by Joh on 2016/10/27.
 */
var express = require('express');

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
//socket.io

var onlineUsers = {};
var  onlineCount = 0;

io.on('connection', function (socket) {
    console.log('a user connected');

    //监听新用户加入
    socket.on('login',function (obj) {
        socket.name = obj.userid;

        //检查在线列表
        if(! onlineUsers.hasOwnProperty(obj.userid)){
            onlineUsers[obj.userid] = obj.username;
            onlineCount++;
        }
        io.emit('login', {onlineUsers: onlineUsers,onlineCount: onlineCount });
        console.log(obj.username+'加入了聊天室');

    });

    io.on('disconnect', function () {
        //将退出的用户从在线列表中删除
        if (onlineUsers.hasOwnProperty(socket.name)){
            var obj = {userid: socket.name, username: onlineUsers[socket.name]};

            delete onlineUsers[socket.name];

            onlineCount--;

            io.emit('logout', {onlineUsers: onlineUsers, onlineCount: onlineCount,user: obj });

            console.log(obj.username+'退出了聊天室');

        }
    });

    socket.on('message', function (obj) {
        //向所有客户端发生广播消息
        io.emit('message', obj);
        console.log(obj.username+ '说：'+ obj.content);
    });


});

