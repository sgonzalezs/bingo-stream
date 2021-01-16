//main require
var express = require('express');
const mongoose=require('mongoose');
const bodyParser=require("body-parser");
var app = express();
const path = require('path');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(require('./server/routes/user.js'));

var http = require('http').createServer(app);
var io = require('socket.io')(http);
let port = process.env.PORT || 3000;
http.listen(port, function(){ console.log('listening on *:3000');});

//mongoose connect
let local='mongodb://localhost:27017/bingo_db';
let web='mongodb://thiago23:Thiago23@ds137283.mlab.com:37283/bingo_db';
let web_atlas="mongodb+srv://admin_user:AdminPass@cluster0.kkgd8.mongodb.net/db_bingo?retryWrites=true&w=majority";
mongoose.connect(web_atlas, {useNewUrlParser:true, useUnifiedTopology:true}, (err)=>{
    if(err) throw err;
        console.log('db connected');
});

var serverID = "undefined";
var users=[];
// var userWin={ EmitType: 2, DataString: 'El ganador es User 1', DataByte: [ 0 ] };
io.on('connection', function (socket){

    // io.emit("errConn", {conn:true});

    io.emit("updateTable", users);
    // console.log(users);
    console.log('a user connected: ' + socket.id + " (server: " + serverID + " )");

    if(serverID=="undefined"){
        io.emit("errConn", {conn:true});
    }else{
        io.emit("errConn", {conn:false});
    }
    //register the server id, received the command from unity
    socket.on('RegServerId', function (data){
        io.emit("errConn", {conn:false});
        serverID = socket.id;
        users=[];
        console.log('reg server id : ' + serverID);
    });


    socket.on('disconnect', function(){
        io.emit("errConn", {conn:true});
        if (serverID == socket.id)
        {
            users=[];
            io.emit("updateTable", users);
            serverID = "undefined";
            console.log('removed Server: ' + socket.id);
        }
        else
        {
           console.log('user disconnected: ' + socket.id);
        }
    });

    socket.on('balota', function(data){
        // console.log(data);
        users.push(data);
        io.emit("new_balota", data);
    });

    socket.on("bingoWin", (data)=>{

        // io.emit("bingoWinner", data);
        io.emit("OnReceiveData", {DataString: JSON.stringify(data)});
    });

    socket.on("winner", function(request){
        io.emit("playerWinner", request);
    });

    socket.on('OnReceiveData', function (data){
        
        if(serverID == "undefined"){
            io.emit("errConn", {conn:true});
        }else{
            io.emit("errConn", {conn:false});
        }    

        if (serverID != 'undefined')
        {
            switch(data.EmitType)
            {
                //emit type: all;
                case 0: io.emit('OnReceiveData', { DataString: data.DataString, DataByte: data.DataByte }); break;
                //emit type: server;
                case 1: io.to(serverID).emit('OnReceiveData', { DataString: data.DataString, DataByte: data.DataByte }); break;
                //emit type: others;
                case 2: socket.broadcast.emit('OnReceiveData', { DataString: data.DataString, DataByte: data.DataByte }); break;
            }
        }
        else
        {
            console.log('cannot find any active server');
        }
    });
});
