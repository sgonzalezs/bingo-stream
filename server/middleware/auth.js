const jwt=require("jsonwebtoken");

let verifyToken=(req, res, next)=>{

	let token=req.get('Authorization');
	let SEED='SECREET-SEED-999';
	jwt.verify(token, SEED, (err, decoded)=>{

		if(err){
			return res.status(401).json({
				ok:false,
				message:'NO AUTORIZADO'
			});
		}

		req.user=decoded.user;
		next();
	});

}

module.exports={
	verifyToken
}

