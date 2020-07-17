const mongoose=require("mongoose");
const uniqueValidator=require("mongoose-unique-validator");

let Schema=mongoose.Schema;

let userSchema=new Schema({
	name:{
		type:String,
		required:[true, "El Nombre es requerido"]
	},
	email:{
		type:String,
		required:[true, "El Correo es requerido"],
		unique:true
	},
	document:{
		type:String,
		required:[true, "La clave es obligatoria"],
		unique:true
	},
	type_doc:{
		type:String,
		default: "CC"
	},
	state:{
		type:Boolean,
		default:true
	}
});

userSchema.methods.toJSON=function(){
	let usuario=this;
	let userObject=usuario.toObject();
	delete userObject.password;

	return userObject;
}

userSchema.plugin(uniqueValidator, {message:'{PATH} debe ser único'});

module.exports=mongoose.model("User", userSchema);

