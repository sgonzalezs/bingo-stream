$(document).ready(function(){

	$("#loginForm").on('submit', function(e){
		e.preventDefault();

		var url='/registrar';
		var data = {
			name: $("#nombre").val(),
			email: $("#email").val(),
			type_document: $("#slc_documento").val(),
			document: $("#txt_documento").val()
		};

		fetch(url, {
		  method: 'POST', 
		  body: JSON.stringify(data),
		  headers:{
		    'Content-Type': 'application/json'
		  }
		})
		.then(function(res){
			return res.json();
		})
		.then(function(response){
			if(!response.ok){
				if(response.code=='user'){
					$(".loginAlert").css("display", "block");
					$(".loginAlert").text();
					$(".loginAlert").text(response.message);
				}

			}else{
				localStorage.removeItem('user');
				localStorage.setItem('token', response.token);
				localStorage.setItem('user', response.user.email);
				localStorage.setItem('name', response.user.name);
				// console.log(localStorage.getItem('user'));
				window.location.replace('/bingo');
				// fetch('/bingo', {
				//   method: 'GET',
				//   headers:{
				//     'Authorization': response.token
				//   }
				// })
				// .then(function(request){
				// 	return request;
				// })
				// .then(function(redirect){
				// });
			}
		})
		.catch(function(err){
			console.log('Error:', err)
		});

	});

});