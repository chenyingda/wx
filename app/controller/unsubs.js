module.exports=app=>{
	return class unsubcontroller extends app.Controller{
		async code(){
			const {ctx} = this
			const createRule={
				'page':'string',
				'pagesize':'string'
			}
			try{
				ctx.validate(createRule)
			}catch(err){
				ctx.body={
					code:400,
					error:'校验不通过'
				}
			}
			const body=ctx.request.body
			const {page,pagesize}=body
			const codeid=ctx.params['id']
			let now=Math.floor(new Date().getTime()/1000)
			let finalselect={
				'$between':[0,now]
			}
			const allunsubs=await ctx.service.wxuserrecord.publicallunsubs(codeid,finalselect)
			const codeunsubuser=await ctx.service.wxuserrecord.codeunsubuser(codeid,finalselect,page,pagesize)
			let array=[]
			let maleamounts=0
			let femaleamouts=0
			let examouts=0
			for(let i in codeunsubuser){
				let form={}
				let userid=codeunsubuser[i].userid
				const user=await this.service.wxUser.finduserbyid(userid)
				form.headimgurl=user.headimgurl
				form.nickname=user.nickname
				form.sex=user.sex
				form.unsubscribe_time=codeunsubuser[i].unsubscribe_time
				if(user.sex===1){
					maleamounts+=1
				}
				else if(user.sex===2){
					femaleamouts+=1
				}else{
					examouts+=1
				}
				array.push(form)
			}
			let result={}
			result.count=allunsubs
			result.maleamounts=maleamounts
			result.femaleamouts=femaleamouts
			result.examouts=examouts
			result.rows=array
			ctx.body={
				code:200,
				data:result
			}
		}
		async public(){
			const {ctx} = this
			const createRule={
				'page':'string',
				'pagesize':'string'
			}
			try{
				ctx.validate(createRule)
			}catch(err){
				ctx.body={
					code:400,
					error:'校验不通过'
				}
			}
			const body=ctx.request.body
			const {page,pagesize}=body
			const codeid={
				'$ne':null
			}
			let now=Math.floor(new Date().getTime()/1000)
			let finalselect={
				'$between':[0,now]
			}
			const allunsubs=await ctx.service.wxuserrecord.allunsubs(codeid,finalselect)
			const codeunsubuser=await ctx.service.wxuserrecord.publicunsubuser(codeid,finalselect,page,pagesize)
			let array=[]
			let maleamounts=0
			let femaleamouts=0
			let examouts=0
			for(let i in codeunsubuser){
				let form={}
				let userid=codeunsubuser[i].userid
				const user=await this.service.wxUser.finduserbyid(userid)
				form.headimgurl=user.headimgurl
				form.nickname=user.nickname
				form.sex=user.sex
				form.unsubscribe_time=codeunsubuser[i].unsubscribe_time
				if(user.sex===1){
					maleamounts+=1
				}
				else if(user.sex===2){
					femaleamouts+=1
				}else{
					examouts+=1
				}
				array.push(form)
			}
			let result={}
			result.count=allunsubs
			result.maleamounts=maleamounts
			result.femaleamouts=femaleamouts
			result.examouts=examouts
			result.rows=array
			ctx.body={
				code:200,
				data:result
			}
		}		
	}
}