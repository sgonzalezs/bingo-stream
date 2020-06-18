var express = require('express');
var app = express();
const path = require('path');
app.use(express.static(__dirname + '/public'));

app.get("/bingo", (req,res)=>{
    res.sendFile(__dirname+'/Bingo/index.html');
});

var http = require('http').createServer(app);
var io = require('socket.io')(http);
let port = process.env.PORT || 3000;
http.listen(port, function(){ console.log('listening on *:3000');});

var serverID = undefined;
var users=[];
io.on('connection', function (socket){

    if(!serverID){
        socket.emit("errConn", {conn:false});
    }

    io.emit("updateTable", users);
    // console.log(users);
    console.log('a user connected: ' + socket.id + " (server: " + serverID + " )");
    //register the server id, received the command from unity
    socket.on('RegServerId', function (data){
        // console.log(data);
        serverID = socket.id;
        users=[];
        console.log('reg server id : ' + serverID);
    });

    socket.on('disconnect', function(){
        if (serverID == socket.id)
        {
           serverID = 'undefined';
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

    socket.on('OnReceiveData', function (data){
        
        // socket.emit()    

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
