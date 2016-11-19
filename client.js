

/**客户端的业务逻辑实现代码
 */

(function(){
    var d = document,
        w = window,
        p = parseInt,
        dd = d.documentElement,
        db = d.body,
        dc = d.compatMode == 'CSS1Compat',
        dx = dc? dd: db,
        ec = encodeURIComponent;

    w.CHAT = {
        msgObj: d.getElementById("message"),
        screenheight: w.innerHeight ? w.innerHeight:dx.clientHeight,
        username: null,
        userid: null,
        socket: null,
        //让浏览器滚动到底部
        scrollBottom: function () {
            w.scrollTo(0, this.msgObj.clientHeight);
        },
        logout: function () {
            this.socket.disconnect();
            location.reload();
        },
        //提交聊天信息内容
        submit: function () {
            var content = d.getElementById("content").value;
            if ( content != ''){
                var obj = {
                    userid: this.userid,
                    username: this.username,
                    content: content
                };
                this.socket.emit("message", obj);
                d.getElementById('content').value='';
            }
            return false;
        },

        /* 更新系统消息*/
        updateSysMsg: function (o, action) {
            /*  更新在线用户列表*/
            var onlineUsers = o.onlineUsers,
                /*   更新在线人数*/
                onlineCount = o.onlineCount,
                /* 入用户信息*/
                user = o.user;

            var userhtml = '';
            var separator = '';

            for(key in onlineUsers){
                if(onlineUsers.hasOwnProperty(key)){
                    userhtml += separator+ onlineUsers[key];
                    separator = '、';
                }
            }
            d.getElementById("onlinecount").innerHTML = 'now has '+onlineCount+'users online';
            /* 添加系统信息*/
            var html = '';
            html += '<div class="msg-system">';
            html += user.username;
            html += (action =='login') ? '加入了聊天室':'退出了聊天室';
            html += '</div>';
            var section = d.createElement('section');
            section.className = 'system linkWrap cutMsg';
            section.innerHTML = html;
            this.msgObj.appendChild(section);
            this.scrollToBottom();

        },
        //初始化
        start: function(){
            var name = document.getElementById('username').value;

            if(name != ''){
                this.init(username);
            }
            return false;

        },

        init: function (username) {
            // var util = require('util');

            this.userid = process.getuid();
            this.username = username;

            d.getElementById("showusername").innerHTML = this.username;
            this.msgObj.style.minHeight  = (this.screenheight - db.clientHeight + this.msgObj.clientHeight);
            this.scrollToBottom();

            //连接websocket后端服务器
            this.socket = io.disconnect('http:localhost:3000');
            this.socket.emit('login', {userid: this.userid, username: this.username});

            tis.socket.on('login', function (o) {
                CHAT.updateSysMsg(o, 'login');
            });

            this.socket.on('logout', function (o) {
                CHAT.updateSysMsg(o, 'logout');
            });

            this.socket.on('message', function (o) {
                var isme = ((o.userid = CHAT.userid) ? true: false);
                var contentDiv = '<div>'+ o.content+'</div>';
                var usernameDiv = '<span>'+o.username+'</span>';

                var section = d.createElement('section');
                if(isme){
                    section.className = 'user';
                    section.innerHTML = contentDiv + usernameDiv;
                } else {
                    section.className = 'service';
                    section.innerHTML = usernameDiv + contentDiv;
                }
                CHAT.msgObj.appendChild(section);
                CHAT.scrollToBottom();
            });

        }


    };

    //通过“回车”提交信息
    d.getElementById("content").onkeydown = function(e) {
        e = e || event;
        if (e.keyCode === 13) {
            CHAT.submit();
        }
    };
})();
