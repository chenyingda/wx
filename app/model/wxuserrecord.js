module.exports=app=>{
	const {STRING,INTEGER,DATE,ENUM}=app.Sequelize
	const Wxuserrecord=app.model.define('wxuserrecord',{
		id:{
			type:INTEGER(11),
			primaryKey:true,
			autoIncrement:true
		},
		userid:INTEGER(11).UNSIGNED,
		codeid:INTEGER(11),
		subscribe:INTEGER(2),
		subscribe_time:INTEGER(11),
		unsubscribe_time:INTEGER(11),
		recordtime:INTEGER(11)
	},{
		tableName:'wxuserrecord'
	})
	Wxuserrecord.associate=function(){
		app.model.Wxuserrecord.belongsTo(app.model.Wxcode,{foreignKey:'codeid'})
		app.model.Wxuserrecord.belongsTo(app.model.WxUser,{foreignKey:'userid'})
	}
	return Wxuserrecord
}