const express=require('express');
const User=require("../model/user.js");

//token config
const jwt=require("jsonwebtoken");
const { verifyToken } = require('../middleware/auth.js');

const app=express();

//Bingo
app.get('/bingo', (req,res)=>{
	res.sendFile('bingo.html', { root: 'public/' });
	// res.status(200).json({
	// 	ok:true,
	// 	message:'loaded'
	// });
});

app.post('/registrar', (req,res)=>{
	let body=req.body;

	User.findOne({email:body.email}, (err, currentUser)=>{
		if(err){
			return res.status(400).json({
				ok:false,
				message:err
			});
		}

		if(currentUser){

			if(currentUser.document==body.document && currentUser.type_doc==body.type_document){

				let token=jwt.sign({
					user:currentUser
				}, 'SECREET-SEED-999',{expiresIn:60*60*24*30});
				// res.send("Registrado");
				return res.status(200).json({
					ok:true,
					user:currentUser,
					token
				});
			}else{
				return res.status(404).json({
					ok:false,
					code:'user',
					message:'Usuario no encontrado'
				});
			}

		}else{
			let user=new User({
				name:body.name,
				email:body.email,
				type_doc:body.type_document,
				document:body.document
			});

			user.save((error, newUser)=>{
				if(error){
					return res.status(400).json({
						ok:false,
						message:error
					});
				}
				let token=jwt.sign({
					user:newUser
				}, 'SECREET-SEED-999',{expiresIn:60*60*24*30});
				// res.send("Registrado");
				return res.status(200).json({
					ok:true,
					user:newUser,
					token
				});
			});
		}
	});

});

module.exports=app;