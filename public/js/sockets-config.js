
$(document).ready(function(){
    ConnectSocketIO();
});

var label_img = 1001;
var dataID_img = 0;
var dataLength_img = 0;
var receivedLength_img = 0;
var dataByte_img = new Uint8Array(0);
var ReadyToGetFrame_img = true;

var label_aud = 2001;
var dataID_aud = 0;
var dataLength_aud = 0;
var receivedLength_aud = 0;
var dataByte_aud = new Uint8Array(100);
var ReadyToGetFrame_aud = true;
var SourceSampleRate = 44100;
var SourceChannels = 1;
var ABuffer = new Float32Array(0);

var socket;

function ConnectSocketIO()
{
    // var IP = document.getElementById("IpAddress").value;
    var IP = "https://bingo-stream.herokuapp.com/";
    var IPL = "http://localhost:3000/";
    socket = io.connect(IPL);
    var socket = io.connect('https://bingo-stream.herokuapp.com/');
    socket.on("errConn", function(data){
        if(data.conn){
            $("#loaderModal").modal("show");
        }else{
            $("#loaderModal").modal("hide");
        }
    });

    socket.on("updateTable", function(request){
        request.forEach((e, i)=>{
            var new_data=JSON.parse(e.DataString);
            $("#main_"+new_data["letter"].toLowerCase()).each(function(){
                let ballNum=$(this).find("td");
                for(var i=1; i<=15; i++){
                    if(ballNum.filter(`:eq(${i})`).find("p").text()==new_data["number"]){
                        ballNum.filter(`:eq(${i})`).find("p").css("background", "yellow");
                    }
                }
            });

        });
    });

     socket.on("new_balota", function(resp){

        var data=JSON.parse(resp.DataString);
        // console.log(data["letter"].toLowerCase());
        $("#main_"+data["letter"].toLowerCase()).each(function(){
            let ballNum=$(this).find("td");
            for(var i=1; i<=15; i++){
                if(ballNum.filter(`:eq(${i})`).find("p").text()==data["number"]){
                    ballNum.filter(`:eq(${i})`).find("p").css("background", "yellow");
                }
            }
        });
    });

    socket.on("playerWinner", function(data){
        swal(data.DataString);
    });

    socket.on("bingoWinner", function(data){
        console.log(data);
        socket.emit("OnReceiveData", data);    
     });

    socket.on('OnReceiveData', function (data)
    {
        // document.getElementById("StatusTextConnection").innerHTML = "Status: " + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds();
        // console.log(data);
        // if(data.DataByte.length > 0) document.getElementById("StatusTextBytes").innerHTML = "(byte)" + data.DataByte.length;
        // if(data.DataString.length > 0)document.getElementById("StatusTextString").innerHTML = "(string)" + data.DataString;

        label_img = 1001;
        label_aud = 2001;

        var _byteData = new Uint8Array(data.DataByte);
        var _label = ByteToInt32(_byteData, 0);

        if (_label == label_img) {
            var _dataID = ByteToInt32(_byteData, 4);
            if (_dataID != dataID_img) receivedLength_img = 0;

            dataID_img = _dataID;
            dataLength_img = ByteToInt32(_byteData, 8);
            //var _offset = ByteToInt32(_byteData, 12);
            var _GZipMode = (_byteData[16] == 1) ? true : false;

            if (receivedLength_img == 0) dataByte_img = new Uint8Array(0);
            receivedLength_img += _byteData.length - 17;

            //----------------add byte----------------
            dataByte_img = CombineInt8Array(dataByte_img, _byteData.slice(17, _byteData.length));
            //----------------add byte----------------

            if (ReadyToGetFrame_img)
            {
                if (receivedLength_img == dataLength_img) ProcessImageData(dataByte_img, _GZipMode);
            }
        }

        if (_label == label_aud)
        {
            var _dataID = ByteToInt32(_byteData, 4);
            if (_dataID != dataID_aud) receivedLength_aud = 0;

            dataID_aud = _dataID;
            dataLength_aud = ByteToInt32(_byteData, 8);
            //var _offset = ByteToInt32(_byteData, 12);
            var _GZipMode = (_byteData[16] == 1) ? true : false;

            if (receivedLength_aud == 0) dataByte_aud = new Uint8Array(0);
            receivedLength_aud += _byteData.length - 17;
            //----------------add byte----------------
            dataByte_aud = CombineInt8Array(dataByte_aud, _byteData.slice(17, _byteData.length));
            //----------------add byte----------------
            if (ReadyToGetFrame_aud)
            {
                if (receivedLength_aud == dataLength_aud) ProcessAudioData(dataByte_aud, _GZipMode);
            }
        }
    });


    var startTime = 0;
    var audioCtx = new AudioContext();

    function ProcessAudioData(_byte, _GZipMode) {
        ReadyToGetFrame_aud = false;

        var bytes = new Uint8Array(_byte);
        if(_GZipMode)
        {
           var gunzip = new Zlib.Gunzip (bytes);
           bytes = gunzip.decompress();
        }

        //read meta data
        SourceSampleRate = ByteToInt32(bytes, 0);
        SourceChannels = ByteToInt32(bytes, 4);

        //conver byte[] to float
        var BufferData = bytes.slice(8, bytes.length);
        AudioFloat = new Float32Array(BufferData.buffer);

        //=====================playback=====================
        if(AudioFloat.length > 0) StreamAudio(SourceChannels, AudioFloat.length, SourceSampleRate, AudioFloat);
        //=====================playback=====================

        ReadyToGetFrame_aud = true;
        // document.getElementById("StatusTextAudioInfo").innerHTML = "info: " + SourceChannels + "x" + SourceSampleRate + " | " + (_GZipMode ? ("Zip("+Math.round((_byte.length/bytes.length) * 100) + "%)") : "Raw");
        // document.getElementById("StatusTextAudio").innerHTML = "(kB)" + Math.round(_byte.length/1000);
    }

    function StreamAudio(NUM_CHANNELS, NUM_SAMPLES, SAMPLE_RATE, AUDIO_CHUNKS)
    {
        var audioBuffer = audioCtx.createBuffer(NUM_CHANNELS, (NUM_SAMPLES / NUM_CHANNELS), SAMPLE_RATE);
        for (var channel = 0; channel < NUM_CHANNELS; channel++)
        {
            // This gives us the actual ArrayBuffer that contains the data
            var nowBuffering = audioBuffer.getChannelData(channel);
            for (var i = 0; i < NUM_SAMPLES; i++)
            {
                var order = i * NUM_CHANNELS + channel;
                nowBuffering[i] = AUDIO_CHUNKS[order];
            }
        }

        var source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;

        source.connect(audioCtx.destination);
        source.start(startTime);

        startTime += audioBuffer.duration;
    }

    function ProcessImageData(_byte, _GZipMode)
    {
        ReadyToGetFrame_img = false;

        var binary = '';

        var bytes = new Uint8Array(_byte);
        if(_GZipMode)
        {
            var gunzip = new Zlib.Gunzip (bytes);
            bytes = gunzip.decompress();
        }

        //----conver byte[] to Base64 string----
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++)
        {
            binary += String.fromCharCode(bytes[i]);
        }
        //----conver byte[] to Base64 string----

        //----display image----
        var img = document.getElementById('DisplayImg');
        img.src = 'data:image/jpeg;base64,' + btoa(binary);
        //img.width = data.Width;
        //img.height = data.Height;
        //----display image----

        ReadyToGetFrame_img = true;

        // document.getElementById("StatusTextVideoInfo").innerHTML = "info: " + img.width + "x" + img.height + " | " + (_GZipMode ? ("Zip("+Math.round((_byte.length/bytes.length) * 100) + "%)") : "Raw");
        // document.getElementById("StatusTextVideo").innerHTML = "(kB)" + Math.round(_byte.length/1000);
    }

    function CombineInt8Array(a, b)
    {
        var c = new Int8Array(a.length + b.length);
        c.set(a);
        c.set(b, a.length);
        return c;
    }
    function CombineFloat32Array(a, b)
    {
        var c = new Float32Array(a.length + b.length);
        c.set(a);
        c.set(b, a.length);
        return c;
    }

    function ByteToInt32(_byte, _offset)
    {
        return (_byte[_offset] & 255) + ((_byte[_offset + 1] & 255) << 8) + ((_byte[_offset + 2] & 255) << 16) + ((_byte[_offset + 3] & 255) << 24);
        //return _byte[_offset] + _byte[_offset + 1] * 256 + _byte[_offset + 2] * 256 * 256 + _byte[_offset + 3] * 256 * 256 * 256;
    }


}

function FMEmitStringToAll(_string)
{
    var _DataString = _string;
    var _DataByteArray = new Array(1);
    _DataByteArray[0] = 0;
    socket.emit('OnReceiveData', { EmitType: 0, DataString: _DataString, DataByte: _DataByteArray});
}
function FMEmitStringToServer(_string)
{
  var _DataString = _string;
  var _DataByteArray = new Array(1);
  _DataByteArray[0] = 0;
  socket.emit('OnReceiveData', { EmitType: 1, DataString: _DataString, DataByte: _DataByteArray});
}
function FMEmitStringToOthers(_string)
{
  var _DataString = _string;
  var _DataByteArray = new Array(1);
  _DataByteArray[0] = 0;
  socket.emit('OnReceiveData', { EmitType: 2, DataString: _DataString, DataByte: _DataByteArray});
}

function FMEmitByteToAll(_DataByteLength)
{
    var _DataString = ' ';
    var _DataByteArray = new Array(_DataByteLength);
    for(var i = 0; i< _DataByteLength; i++) _DataByteArray[i] = 0;
    socket.emit('OnReceiveData', { EmitType: 0, DataString: _DataString, DataByte: _DataByteArray});
}
function FMEmitByteToServer(_DataByteLength)
{
    var _DataString = ' ';
    var _DataByteArray = new Array(_DataByteLength);
    for(var i = 0; i< _DataByteLength; i++) _DataByteArray[i] = 0;
    socket.emit('OnReceiveData', { EmitType: 1, DataString: _DataString, DataByte: _DataByteArray});
}
function FMEmitByteToOthers(_DataByteLength)
{
    var _DataString = ' ';
    var _DataByteArray = new Array(_DataByteLength);
    for(var i = 0; i< _DataByteLength; i++) _DataByteArray[i] = 0;
    socket.emit('OnReceiveData', { EmitType: 2, DataString: _DataString, DataByte: _DataByteArray});
}