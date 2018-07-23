module.exports=app=>{
	return class homecontroller extends app.Controller{
		async index(){
			const {ctx} = this
			ctx.body = 'zzzzzzz'
		}
	}
}