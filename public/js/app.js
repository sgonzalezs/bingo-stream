$(document).ready(function(){
	firstLoad();  
});


var params = new URLSearchParams(window.location.search);

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
};

var tablewin=[];
var l_tablewin=[];
var x_tablewin=[];
var t_tablewin=[];

var socket;
socket=io();


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
		tabla[letra] = mano.sort(function(a, b){return a-b});
		
		// localStorage.removeItem('table_'+localStorage.getItem('user'));
		// console.log(localStorage.getItem('table_'+localStorage.getItem('user')));
		if(localStorage.getItem('table_'+localStorage.getItem('user'))){
			// console.log(localStorage.getItem('user'));
			tabla=JSON.parse(localStorage.getItem('table_'+localStorage.getItem('user')));
		}

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

	if(!localStorage.getItem('table_'+localStorage.getItem('user'))) {
		localStorage.setItem('table_'+localStorage.getItem('user'), JSON.stringify(tabla));
	}

	var letters=['b','i','n','g','o'];

	for(var i=0; i<letters.length; i++){

	}
	
	var gameL=[];
	var gameX=[];
	var gameT=[];
	for(var x=0;x<5;x++){
		//game L
		gameL.push({num:tabla[letters[0]][x], check:false});
		gameL.push({num:tabla[letters[x]][4], check:false});
		
		//game X
		gameX.push({num:tabla[letters[x]][x]});
		gameX.push({num:tabla[letters[4-x]][x]});

		gameT.push({num:tabla[letters[x]][0], check:false});
		gameT.push({num:tabla[letters[2]][x], check:false});
	}

	//ciclo ganador juego completo
	for(var i=0; i<letters.length; i++){

		tabla[letters[i]].forEach((e,indx)=>{
			var checked=false;
			$("#"+letters[i]+e+" p").click(function(){
				var currentItem=parseInt($(this).text());

				// console.log(gameL);

				if(!checked){
					//push juego principal
					checked=true;
					$(this).css("background", "#ff3386");
					ballots.forEach((el, ind)=>{
						if(el.ballot===e){
							el.checked=true;
						}
					});
					//push minijuego L
					gameL.forEach((el, ind)=>{
						if(el.num==e){
							el.check=true;
						}
					});
					//push minijuego X
					gameX.forEach((el, ind)=>{
						if(el.num==e){
							el.check=true;
						}
					});
					//push minijuego T
					gameT.forEach((el, ind)=>{
						if(el.num==e){
							el.check=true;
						}
					});
				}else{
					checked=false;
					$(this).css("background", "#ffffff");
					ballots.forEach((el, ind)=>{
						if(el.ballot===e){
							el.checked=false;
						}
					});
					gameL.forEach((el, ind)=>{
						if(el.num==e){
							el.check=false;
						}
					});
					gameX.forEach((el, ind)=>{
						if(el.num==e){
							el.check=false;
						}
					});
					gameT.forEach((el, ind)=>{
						if(el.num==e){
							el.check=false;
						}
					});
				}

				//validate game L
				l_tablewin=[{userName:localStorage.getItem('name'), type:'bingo_L'}];
				gameL.forEach((e, i)=>{
					if(e.check==true){
						l_tablewin.push(gameL[i]);
					}
				});
				//validate game X
				x_tablewin=[{userName:localStorage.getItem('name'), type:'bingo_X'}];
				gameX.forEach((e, i)=>{
					if(e.check==true){
						x_tablewin.push(gameX[i]);
					}
				});
				//validate game T
				t_tablewin=[{userName:localStorage.getItem('name'), type:'bingo_T'}];
				gameT.forEach((e, i)=>{
					if(e.check==true){
						t_tablewin.push(gameT[i]);
					}
				});

				tablewin=[{userName:localStorage.getItem('name'), type:'bingo'}];
				ballots.forEach((e, i)=>{
					if(e.checked==true){
						tablewin.push(ballots[i]);
					}
				});
				// console.log(x_tablewin[0]["type"]);
				if(x_tablewin.length==11){
					$(".btnMiniBingoX").css("display", "block");
				}else{
					$(".btnMiniBingoX").css("display", "none");
				}

				if(l_tablewin.length==11){
					$(".btnMiniBingoL").css("display", "block");
				}else{
					$(".btnMiniBingoL").css("display", "none");
				}

				if(t_tablewin.length==11){
					$(".btnMiniBingoT").css("display", "block");
				}else{
					$(".btnMiniBingoT").css("display", "none");
				}

				if(tablewin.length==26){
					$(".btnBingo").css("display", "block");
				}else{
					$(".btnBingo").css("display", "none");
				}
			});
		});
	}

}

function bingoWin(){

	socket.emit("bingoWin", tablewin);
	tablewin=[];
	swal("Bingo! Tu tabla será revisada en breve");
	$(".btnBingo").attr("disabled", true);
}

function MinibingoWinL(){
	socket.emit("bingoWin", l_tablewin);
	l_tablewin=[];
	swal("Mini Bingo!","Tu tabla será revisada en breve");
	$(".btnMiniBingoL").attr("disabled", true);
}

function MinibingoWinX(){
	socket.emit("bingoWin", x_tablewin);
	x_tablewin=[];
	swal("Mini Bingo!","Tu tabla será revisada en breve");
	$(".btnMiniBingoX").attr("disabled", true);
}

function MinibingoWinT(){
	socket.emit("bingoWin", t_tablewin);
	t_tablewin=[];
	swal("Mini Bingo!","Tu tabla será revisada en breve");
	$(".btnMiniBingoT").attr("disabled", true);
}

socket.on("", function(winner){
	
});
