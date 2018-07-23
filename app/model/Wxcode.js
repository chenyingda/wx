const moment=require('moment')
module.exports=app=>{
	const {STRING,INTEGER,DATE,ENUM}=app.Sequelize
	const Wxcode=app.model.define('wx_code',{
		id:{
			type:INTEGER(11),
			primaryKey:true,
			autoIncrement:true
		},
		username:STRING(50),
		userinfo:STRING(256),
		imgurl:STRING(500),
		visible:{
			type:ENUM('true','false'),
			defaultValue:'true'
		},
		createtime:INTEGER(11)
	},{
		tableName:'wx_code'
	})
	return Wxcode
}
