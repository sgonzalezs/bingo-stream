$(document).ready(function(){
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
				<li class="list-group-item">${e}</li>
			`);
		});

		tablero[letra].sort(function(a, b){return a-b});
		tablero[letra].forEach((e, i)=>{
			$("#main_"+letra).append(`
				<td class="main_number"><p>${e}</p></td>
			`);
		});
	}
});