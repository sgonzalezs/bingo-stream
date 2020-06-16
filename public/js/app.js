$(document).ready(function(){
	firstLoad();
});

var tablero = {
	'b' : [],
	'i' : [],
	'n' : [],
	'g' : [],
	'o' : []
};

var tabla = {
	'b' : [],
	'i' : [],
	'n' : [],
	'g' : [],
	'o' : [],
	'checked':false
};

var ballots=[];
function firstLoad(){
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
				<li class="item" id="${letra}${e}")"><p >${e}</p></li>
			`);
			ballots.push({ballot:e, checked:false});
		});

		tablero[letra].sort(function(a, b){return a-b});
		tablero[letra].forEach((e, i)=>{
			$("#main_"+letra).append(`
				<td class="main_number"><p>${e}</p></td>
			`);
		});
	}

	var letters=['b','i','n','g','o'];
	
	for(var i=0; i<letters.length; i++){
		tabla[letters[i]].forEach((e,indx)=>{
			
			var checked=false;
			$("#"+letters[i]+e+" p").click(function(){
				if(!checked){
					checked=true;
					$(this).css("background", "#ff3386");
					ballots.forEach((el, ind)=>{
						if(el.ballot===e){
							el.checked=true;
						}
					})
				}else{
					checked=false;
					$(this).css("background", "#ffffff");
					ballots.forEach((el, ind)=>{
						if(el.ballot===e){
							el.checked=false;
						}
					})
				}
			});
		});
	}

}

// var checked=false;
// var ballots=[];
// function getNumber(letter, num){

// }

var tablewin=[];
function bingoWin(){

	tablewin=[];
	ballots.forEach((e, i)=>{
		if(e.checked==true){
			tablewin.push(ballots[i]);
		}
	});
	// console.log(tablewin.length);
	if(tablewin.length==25){
		// console.log(tablewin);
		tablewin=[];
	}else{
		console.log("Debes marcar todas las balotas");
	}

}

function connectBingo(){
	var socket;
    socket=io();
    socket.on("connect", function(){
    });

    socket.on("disconnect", function(){
    });
}