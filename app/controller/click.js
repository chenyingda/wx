const fs=require('fs')
const path=require('path')
const moment=require('moment')
module.exports=app=>{
	return class clickcontroller extends app.Controller{
		async past(){
			const {ctx}=this
			const body=ctx.request.body
			const createRule={
				"timeselector":'object',
				"timedefault":{
					type:'string',
					values:['true','false']
				}
			}
			try{
				ctx.validate(createRule)	
			}catch(error){
				ctx.body={
					code:400,
					error:'校验不通过,检查参数值或参数名'
				}
				return	
			}
			const code_id=ctx.params['id']
			const code=await ctx.service.wxcode.findcodebyid(code_id)
			let createtime=code.createtime
			createtime=parseInt(createtime)
			try{
				console.log(code.id)
			}catch(error){
				ctx.body={
					code:400,
					error:'不存在此二维码'
				}
				return
			}
			const {timeselector,timedefault} = body
			console.log('this is timeselector', timeselector)
			if(!timeselector.starttime){
				ctx.body={
					code:400,
					error:'检查参数格式'
				}
				return	
			}
			let start=timeselector.starttime
			let end=timeselector.endtime
			start=parseInt(start)
			end=parseInt(end)
			if(start>end){
				ctx.body={
					code:400,
					error:'起始时间不得大于终止时间'
				}
				return
			}
			if(start<createtime){
				start=createtime
			}
			const nowtime=new Date().getTime()
			console.log('this is nowtime', nowtime)
			let now = new Date(new Date().setHours(0,0,0,0))
			console.log('this is now',now)
			if(end>now){
				end=(now/1000)+3600*24
			}
			let datetimeselect={
				'$between':[start,end]
			}
			console.log('this is end', end)
			let select=''
			let str=3600*24
			let array=[]
			console.log('end-start',(end-start)/str)
			for(let i =0;i<(end-start)/str;i++){
				let form={}
				let allunsubspercent = 0
				select={
					'$between':[start+i*str,start+(i+1)*str]
				}
				let dateselect={
					'$between':[0,start+(i+1)*str]
				}
				console.log('select',select)
				form.date=moment((start+i*str)*1000).format('YYYY-MM-DD')
				form.allsubs=await ctx.service.wxuserrecord.publicallsubs(code_id,select)
				form.allunsubs=await ctx.service.wxuserrecord.publicallunsubs(code_id,select)
				form.realsubs=await ctx.service.wxuserrecord.realsubs(code_id,dateselect)
				form.clearsubs=form.allsubs-form.allunsubs
				if(form.allsubs === 0){
					allunsubspercent = -form.allunsubs
				}else{
					if(form.allunsubs > form.allsubs){
						allunsubspercent = form.allunsubs/form.allsubs
						allunsubspercent = (allunsubspercent*100).toFixed(2)
						allunsubspercent += "%"
						allunsubspercent = "-"+allunsubspercent
					}else{
						allunsubspercent = form.allunsubs/form.allsubs
						allunsubspercent = (allunsubspercent*100).toFixed(2)
						allunsubspercent += "%"
					}
				}
				form.allunsubspercent = allunsubspercent
				array.push(form)
			}
			let result={}
			let finalselect={
				'$between':[0,Math.floor(new Date().getTime()/1000)]
			}
			let arraylength=array.length
			let selectallunsubspercent = 0
			result.id=code.id											  //该二维码id
			result.url=code.imgurl									  //该二维码url
			result.username=code.username								  //该二维码用户名
			result.userinfo=code.userinfo 							  //该二维码用户备注
			result.selectallsubs=await ctx.service.wxuserrecord.publicallsubs(code_id,datetimeselect)
			result.selectallunsubs=await ctx.service.wxuserrecord.publicallunsubs(code_id,datetimeselect)
			result.selectclearsubs=result.selectallsubs-result.selectallunsubs
			result.selectrealsubs=array[arraylength-1].realsubs
			if(result.selectallsubs === 0){
				selectallunsubspercent = -result.selectallunsubs
			}else{
				if(result.selectallunsubs > result.selectallsubs){
					selectallunsubspercent = result.selectallunsubs/result.selectallsubs
					selectallunsubspercent = (selectallunsubspercent*100).toFixed(2)
					selectallunsubspercent += "%"
					console.log('-----------------',selectallunsubspercent)
					selectallunsubspercent = "-"+selectallunsubspercent
				}else {
					selectallunsubspercent = result.selectallunsubs/result.selectallsubs
					selectallunsubspercent = (selectallunsubspercent*100).toFixed(2)
					selectallunsubspercent += "%"
				}
			}
			result.selectallunsubspercent = selectallunsubspercent
			result.finalallsubs=await ctx.service.wxuserrecord.publicallsubs(code_id,finalselect)
			result.finalallunsubs=await ctx.service.wxuserrecord.publicallunsubs(code_id,finalselect)
			result.finalrealsubs=await ctx.service.wxuserrecord.realsubs(code_id,finalselect)
			result.finalclearsubs=result.finalallsubs-result.finalallunsubs
			result.daydata=array
			ctx.body={
				code:200,
				data:result
			}
		}
		async recommend(){
			const {ctx}=this
			const createRule={
				'timeselector':'object',
				"timedefault":{
					type:'string',
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
			let earlistcode=await ctx.service.wxcode.getearlistcode()
			console.log('earlistcode', earlistcode)
			if(earlistcode===undefined){
				earlistcode={}
			}
			let createtime=earlistcode.createtime
			const body=ctx.request.body
			const {timeselector,timedefault}=body
			console.log('this is timeselector', timeselector)
			if(!timeselector.starttime){
				ctx.body={
					code:400,
					error:'检查参数格式'
				}
				return	
			}
			let start=timeselector.starttime
			let end=timeselector.endtime
			start=parseInt(start)
			end=parseInt(end)
			if(start>end){
				ctx.body={
					code:400,
					error:'起始时间不得大于终止时间'
				}
				return
			}
			if(start<createtime){
				start=createtime
			}
			const nowtime=new Date().getTime()
			console.log('this is nowtime', nowtime)
			let now =  new Date(new Date().setHours(0,0,0,0))
			console.log('this is now',now)
			if(end>now){
				end=(now/1000)+3600*24
			}
			let datetimeselect={
				'$between':[start,end]
			}
			console.log('this is end', end)
			let select=''
			let str=3600*24
			let array=[]
			const code_id={
				'$ne':null
			}
			let codegroup=await ctx.service.wxuserrecord.getallcodes()
			console.log('this is codegroup', codegroup)
			console.log('end-start',(end-start)/str)
			for(let i =0;i<(end-start)/str;i++){
				let allunsubspercent = 0
				let allsubs=0
				let allunsubs=0
				let clearsubs=0
				let form={}
				select={
					'$between':[start+i*str,start+(i+1)*str]
				}
				let dateselect={
					'$between':[0,start+(i+1)*str]
				}
				for(let j=0;j<codegroup.length;j++){
					const codeid=codegroup[j].codeid
					allsubs+=await ctx.service.wxuserrecord.publicallsubs(codeid,select)
					allunsubs+=await ctx.service.wxuserrecord.publicallunsubs(codeid,select)
				}
				console.log('select',select)
				form.date=moment((start+i*str)*1000).format('YYYY-MM-DD')
				form.allsubs=allsubs
				form.allunsubs=allunsubs
				form.realsubs=await ctx.service.wxuserrecord.realsubs(code_id,dateselect)
				if(allsubs === 0){
					allunsubspercent = -allunsubs
				}else {
					if(allunsubs > allsubs){
						allunsubspercent = allunsubs / allsubs
						allunsubspercent = (allunsubspercent*100).toFixed(2)
						allunsubspercent += "%"
						allunsubspercent = "-"+allunsubspercent
					}else{
						allunsubspercent = allunsubs / allsubs
						allunsubspercent = (allunsubspercent*100).toFixed(2)
						allunsubspercent += "%"
					}
				}
				form.clearsubs=allsubs-allunsubs
				form.allunsubspercent = allunsubspercent
				array.push(form)
			}
			let finalselect={
				'$between':[0,Math.floor(new Date().getTime()/1000)]
			}
			let result={}
			let selectallsubs=0
			let selectallunsubs=0
			let finalallsubs=0
			let finalallunsubs=0
			let selectallunsubspercent = 0
			console.log('-----------------------cut-----------------------------')
			for(let h=0;h<codegroup.length;h++){
				console.log('clickcodegroup',codegroup)
				console.log('clickcodeid',codegroup[h].codeid)
				selectallsubs+=await ctx.service.wxuserrecord.publicallsubs(codegroup[h].codeid,datetimeselect)
				console.log('-------------click----------------')
				selectallunsubs+=await ctx.service.wxuserrecord.publicallunsubs(codegroup[h].codeid,datetimeselect)
				finalallsubs+=await ctx.service.wxuserrecord.publicallsubs(codegroup[h].codeid,finalselect)
				finalallunsubs+=await ctx.service.wxuserrecord.publicallunsubs(codegroup[h].codeid,finalselect)
			}
			let arraylength=array.length
			result.selectallsubs=selectallsubs
			result.selectallunsubs=selectallunsubs
			result.selectclearsubs=selectallsubs-selectallunsubs
			result.selectrealsubs=array[arraylength-1].realsubs

			if(selectallsubs === 0){
				selectallunsubspercent = -selectallunsubs
			}else {
				if(selectallunsubs > selectallsubs){
					selectallunsubspercent = selectallunsubs/selectallsubs
					selectallunsubspercent = (selectallunsubspercent*100).toFixed(2)
					selectallunsubspercent += "%"
					selectallunsubspercent = "-"+selectallunsubspercent
				}else{
					selectallunsubspercent = selectallunsubs/selectallsubs
					selectallunsubspercent = (selectallunsubspercent*100).toFixed(2)
					selectallunsubspercent += "%"
				}
			}
			result.selectallunsubspercent = selectallunsubspercent

			result.finalallsubs=finalallsubs
			result.finalallunsubs=finalallunsubs
			result.finalrealsubs=await ctx.service.wxuserrecord.realsubs(code_id,finalselect)
			result.finalclearsubs=finalallsubs-finalallunsubs
			let subspercent=result.finalrealsubs/result.finalallsubs
			subspercent=(subspercent*100).toFixed(2)
			subspercent+="%"
			result.subspercent=subspercent
			result.daydata=array
			ctx.body={
				code:200,
				data:result
			}
		}
	}
}