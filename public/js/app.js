$(document).ready(function(){
	firstLoad();

	var info = {
    		state: "Active", 
    		letter: "b", 
    		number: 1
    	};

    	$("#main_"+info["letter"]).each(function(){
    		let ballNum=$(this).find("td");
    		for(var i=1; i<=15; i++){
				if(ballNum.filter(`:eq(${i})`).find("p").text()==info["number"]){
					ballNum.filter(`:eq(${i})`).find("p").css("background", "yellow");
				}
    		}
    	});

    	$("#rowTable td ul#"+info["letter"]).each(function(){
    		let number=$(this).find("li");
    		for(var i=0; i<=5; i++){
    			if(number.filter(`:eq(${i})`).find("p").text()==info["number"]){
    				number.filter(`:eq(${i})`).find("p").css("background", "#ff3386");
    			}
    		}
    	});
});

function firstLoad(){
	var tablero = {
			'b' : [],
			'i' : [],
			'n' : [],
			'g' : [],
			'o' : []
		};
	for (var e = 0; e < 75; e++) {
		if (e+1 <= 15) {
			tablero.b.push(e+1);
		}else if (e+1 <= 30) {
			tablero.i.push(e+1);
		}else if (e+1 <= 45) {
			tablero.n.push(e+1);
		}else if (e+1 <= 60) {
			tablero.g.push(e+1);
		}else if (e+1 <= 75) {
			tablero.o.push(e+1);
		}
	}

	var tabla = {
		'b' : [],
		'i' : [],
		'n' : [],
		'g' : [],
		'o' : []
	};

	//generar tablero con los 75 numeros

	function bola(letra, tablero) {
		var bola = tablero[letra];
		bola = bola.sort(function() { return Math.random() - 0.5 });
		return bola;
	}

	var cuadro = 0;
	for (var i = 0; i < 5; i++) {
		var letra;
		cuadro += 5;
		if (cuadro <= 5) {
			//b
			letra = 'b';
		}else if(cuadro <= 10) {
			//i
			letra = 'i';
		}else if(cuadro <= 15) {
			//n
			letra = 'n';
		}else if(cuadro <= 20) {
			//g
			letra = 'g';
		}else if(cuadro <= 25) {
			//o
			letra = 'o';
		}
		var bolas = bola(letra, tablero);
		var mano = bolas.slice(0,5);
		tabla[letra] = mano;

		tabla[letra].forEach((e, i)=>{
			$("#"+letra).append(`
				<li class="item"><p >${e}</p></li>
			`);
		});

		tablero[letra].sort(function(a, b){return a-b});
		tablero[letra].forEach((e, i)=>{
			$("#main_"+letra).append(`
				<td class="main_number"><p>${e}</p></td>
			`);
		});
	}
}

function connectBingo(){
	var socket;
    socket=io();
    socket.on("connect", function(){
        // console.log("connected to server from client");
    });

    socket.on("disconnect", function(){
        // console.log("disconnected ");
    });

    socket.emit("enviarMensaje", {
        user:"thiago",
        message:"new bingo"
    });

    socket.on("new_balota", function(resp){
    	
    	var info = {
    		state: "Active", 
    		letter: "I", 
    		number: 16
    	};

    	var data=JSON.parse(resp.DataString);
 		// console.log(data);
    	
    	$("#main_"+info["letter"]).each(function(){
    		let ballNum=$(this).find("td");
    		for(var i=1; i<=15; i++){
				if(ballNum.filter(`:eq(${i})`).find("p").text()==info["number"]){
					ballNum.filter(`:eq(${i})`).find("p").css("background", "yellow");
				}
    		}
    	});
    });
}