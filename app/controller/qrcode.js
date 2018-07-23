const fs=require('fs')
const sendtowormhole=require('stream-wormhole')
const awaitwritestream=require('await-stream-ready').write
const gm=require('gm').subClass({imageMagick: true});
const moment=require('moment')
module.exports=app=>{
	return class qrcodecontroller extends app.Controller{
		async create(){
			const {ctx}= this
			const body=ctx.request.body
			const createRule={
				"username":"string",
				"userinfo":"string",
				"visible":{
					type:'enum',
					values:['true','false']//true代表可见，false代表屏蔽
				}
			}
			try{
				ctx.validate(createRule)
			}catch(error){
				ctx.body={
					code:400,
					error:'校验不通过'
				}
				return
			}
				const {username,userinfo,visible}= body
				const code=await this.service.wxcode.findbyusername(username)
				if(code){
					ctx.body={
						code:400,
						error:'用户名已存在'
					}
				}else{
					let createtime=new Date(new Date().setHours(0,0,0,0))/1000
					body.createtime=createtime
					const code=await this.service.wxcode.create(body)
					const codeid=code.id
					const result=await ctx.service.wxcode.createqrcode(codeid)
					const api=await this.service.wechatApi.index()
					const url=await api.showQRCodeURL(result.ticket);
					const updates={
						imgurl:url
					}
					await ctx.service.wxcode.update(code,updates)
					const wxcoderesult=await ctx.service.wxcode.download(url,codeid)
					await ctx.service.wxcode.downloadimage(wxcoderesult,codeid)
					ctx.body={
						code:200,
						data:url
					}
				}
		}
		async getallcode(){
			const {ctx}= this
			const body=ctx.request.body
			const createRule={
				"page":"string",
				"pagesize":"string",
				'visible':{
					type:'enum',
					values:['true','false'],
					required:false
				},
				"sort":{
					type:'enum',
					values:['subssort','unsubssort','clearsubssort','realsubssort'],
					required:false
				},
				'sorttype':{
					type:'enum',
					values:['ascending','descending'],
					required:false
				}
			}
			try{
			    ctx.validate(createRule)
			}catch(error){
				ctx.body={
					code:400,
					error:'校验不通过，检查参数或参数值是否正确'
				}
				return
			}
			    let {page,pagesize,visible,sort,sorttype}=body
				page=parseInt(page)
				pagesize=parseInt(pagesize)
				let thevisible
				if(!body.visible||body.visible==='true'){
					thevisible='true'
				}else{
					thevisible='false'
				}
				console.log('this is thevisible', thevisible)
				let result=await ctx.service.wxcode.getallcodevisible(page,pagesize,thevisible)
				let finalselect={
						'$between':[new Date(new Date().setHours(0,0,0,0))/1000,Math.floor(new Date().getTime()/1000)]
				}
				let realsubsselect = {
					'$between' : [0, Math.floor(new Date().getTime()/1000)]
				}
				let starttime = new Date(new Date().setHours(0,0,0,0))/1000
				let dayselect = {
					'$between' : [starttime, Math.floor(new Date().getTime()/1000)]
				}
				console.log('--------------dayselect----------------',dayselect)

				let array=[]
				for(let i in result){
					let allunsubspercent = 0 
					let form={}
					let code_id=result[i].id
					code_id=code_id.toString()
					const allsubs=await this.service.wxuserrecord.publicallsubs(code_id,finalselect)
					const allunsubs=await this.service.wxuserrecord.publicallunsubs(code_id,finalselectse)
					const clearsubs=await allsubs-allunsubs
					const realsubs=await this.service.wxuserrecord.realsubs(code_id,realsubsselect)
					const todayallsubs = await this.service.wxuserrecord.publicallsubs(code_id,dayselect)
					const todayallunsubs = await this.service.wxuserrecord.publicallunsubs(code_id,dayselect)
					console.log('this is realsubs', realsubs)
					form.id=result[i].id
					form.username=result[i].username
					form.userinfo=result[i].userinfo
					form.imgurl=result[i].imgurl
					form.visible=result[i].visible
					form.smallimgurl="http://"+ctx.host+'/public/codeimage/'+code_id+'small.jpg'
					form.mediumimgurl="http://"+ctx.host+'/public/codeimage/'+code_id+'medium.jpg'
					form.largeimgurl="http://"+ctx.host+'/public/codeimage/'+code_id+'large.jpg'
					form.allsubs=allsubs
					form.allunsubs=allunsubs
					form.allclearsubs=clearsubs
					form.allrealsubs=realsubs
					if(todayallsubs === 0){
						allunsubspercent = -todayallunsubs
					}else {
						if(todayallunsubs > todayallsubs){
							allunsubspercent = todayallunsubs / todayallsubs
							allunsubspercent = (allunsubspercent*100).toFixed(2)
							allunsubspercent += "%"
							allunsubspercent = "-"+allunsubspercent
						}else{
							allunsubspercent = todayallunsubs / todayallsubs
							allunsubspercent = (allunsubspercent*100).toFixed(2)
							allunsubspercent += "%"
						}
					}
					console.log('----------------------------------',todayallunsubs,todayallsubs)
					form.allunsubspercent = allunsubspercent
					array.push(form)
				}
				if(sort){
					if(sort==='subssort'){
						sort='allsubs'
					}else if(sort==='unsubssort'){
						sort='allunsubs'
					}else if(sort==='realsubssort'){
						sort='allrealsubs'
					}else if(sort==='clearsubssort'){
						sort='allclearsubs'
					}else{

					}
					if(sorttype==='ascending'){
						array=await ctx.service.wxuserrecord.sortasc(array,sort)
					}else{
						array=await ctx.service.wxuserrecord.sortdesc(array,sort)
					}
				}

				ctx.body={
					code:200,
					data:{
						count:result.length,
						rows:array
					}
				}				
		}
		async update(){
			const {ctx}= this
			const createRule={
				"username":"string",
				"userinfo":"string",
				"visible":{
					type:"enum",
					values:['true','false']
				}
			}
			try{
				ctx.validate(createRule)
			}catch(error){
				ctx.body={
					code:400,
					error:'校验不通过'
				}
				return
			}
			const id=ctx.params['id']
			const qrcode=await ctx.service.wxcode.findcodebyid(id)
			try{
				console.log(qrcode.id)
			}catch(error){
				ctx.body={
					code:400,
					error:'没有这个二维码'
				}
				return
			}
			const body=ctx.request.body
			let {username,userinfo,visible}=body
			if(qrcode.username===username){
				await ctx.service.wxcode.update(qrcode,body)
				ctx.body={
					code:200,
					data:'修改成功'
				}
			}else{
				const findonecode=await ctx.service.wxcode.findbyusername(username)
				console.log('this is findonecode', findonecode)
				if(findonecode===null){
					await ctx.service.wxcode.update(qrcode,body)
					ctx.body={
						code:200,
						data:'修改成功'
					}
				}else{
					ctx.body={
						code:400,
						data:'已存在该用户名，请重新修改'
					}
				}
			}
		}
		async codeinfo(){
			const {ctx}=this
			const createRule={
				"page":"string",
				"pagesize":"string"
			}
			try{
				ctx.validate(createRule)
			}catch(error){
				ctx.body={
					code:400,
					error:"校验不通过，检查参数或参数值是否正确"
				}
				return
			}
			const code_id=ctx.params['id']
			let now=Math.floor(new Date().getTime()/1000)
			let finalselect={
				'$between':[0,now]
			}
			const body=ctx.request.body
			const {page,pagesize}=body
			console.log('this is code_id',code_id)
			const realsubs=await ctx.service.wxuserrecord.realsubs(code_id,finalselect)
			console.log('this is realsubs', realsubs)
			const coderealsubsuser=await ctx.service.wxuserrecord.coderealsubsuser(code_id,finalselect,page,pagesize)//100条数据
			console.log('coderealsubsuser', coderealsubsuser)
			let array=[]
			let maleamounts=0
			let femaleamouts=0
			let examouts=0
			for(let i=0;i<coderealsubsuser.length;i++){
				let form={}
				let userid=coderealsubsuser[i].userid
				const user=await this.service.wxUser.finduserbyid(userid)
				form.headimgurl=user.headimgurl
				form.nickname=user.nickname
				form.sex=user.sex
				form.subscribe_time=coderealsubsuser[i].subscribe_time
				form.unsubscribe_time='未知'
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
			result.count=realsubs
			result.maleamounts=maleamounts
			result.femaleamouts=femaleamouts
			result.examouts=examouts
			result.rows=array
			ctx.body={
				code:200,
				data:result
			}
		}
		async publicinfo(){
			const {ctx}=this
			const createRule={
				"page":"string",
				"pagesize":"string"
			}
			try{
				ctx.validate(createRule)
			}catch(error){
				ctx.body={
					code:400,
					error:"校验不通过，检查参数或参数值是否正确"
				}
				return

			}
			const code_id={
				'$ne':null
			}
			let now=Math.floor(new Date().getTime()/1000)
			let finalselect={
				'$between':[0,now]
			}
			const body=ctx.request.body
			const {page,pagesize}=body
			console.log('this is code_id',code_id)
			const realsubs=await ctx.service.wxuserrecord.realsubs(code_id,finalselect)
			console.log('this is realsubs', realsubs)
			const coderealsubsuser=await ctx.service.wxuserrecord.coderealsubsuser(code_id,finalselect,page,pagesize)//100条数据
			console.log('coderealsubsuser', coderealsubsuser)
			let array=[]
			let maleamounts=0
			let femaleamouts=0
			let examouts=0
			for(let i=0;i<coderealsubsuser.length;i++){
				let form={}
				let userid=coderealsubsuser[i].userid
				const user=await this.service.wxUser.finduserbyid(userid)
				form.headimgurl=user.headimgurl
				form.nickname=user.nickname
				form.sex=user.sex
				form.subscribe_time=coderealsubsuser[i].subscribe_time
				form.unsubscribe_time='未知'
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
			result.count=realsubs
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