const moment=require('moment')
module.exports=app=>{
	return class wxuserrecordservice extends app.Service{
		async create(body){        //创建record
			const transaction=await this.ctx.model.transaction({
				isolationLevel:app.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
			})
			try{
				const record=await this.ctx.model.Wxuserrecord.create(body,{transaction})
				await transaction.commit()
				return record
			}catch(error){
				await transaction.rollback()
				return this.ctx.throw(404)
			}
		}
		async findspecsubrecordbyuserid(userid,select,order_by){
			const transaction=await this.ctx.model.transaction({
				isolationLevel:app.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
			})
			try{
				let record=await this.ctx.model.Wxuserrecord.findAll({where:{'userid':userid,'subscribe_time':select},
					order:[['id',order_by]]
				},transaction)
				await transaction.commit()
				return record
			}catch(error){
				await transaction.rollback()
				return this.ctx.throw(404)
			}
		}
		async findspecunsubrecordbyuserid(userid,select,order_by){
			const transaction=await this.ctx.model.transaction({
				isolationLevel:app.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
			})
			try{
				let record=await this.ctx.model.Wxuserrecord.findAll({where:{'userid':userid,'unsubscribe_time':select},
					order:[['id',order_by]]
				},transaction)
				await transaction.commit()
				return record
			}catch(error){
				await transaction.rollback()
				return this.ctx.throw(404)
			}
		}
		async publicfindspecsubrecordbyuserid(codeid,userid,select,order_by){
			const transaction=await this.ctx.model.transaction({
				isolationLevel:app.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
			})
			try{
				let record=await this.ctx.model.Wxuserrecord.findAll({where:{'userid':userid,'codeid':codeid,'subscribe_time':select},
					order:[['id',order_by]]
				},transaction)
				await transaction.commit()
				return record
			}catch(error){
				await transaction.rollback()
				return this.ctx.throw(404)
			}
		}
		async publicfindspecunsubrecordbyuserid(codeid,userid,select,order_by){
			const transaction=await this.ctx.model.transaction({
				isolationLevel:app.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
			})
			try{
				let record=await this.ctx.model.Wxuserrecord.findAll({where:{'userid':userid,'codeid':codeid,'unsubscribe_time':select},
					order:[['id',order_by]]
				},transaction)
				await transaction.commit()
				return record
			}catch(error){
				await transaction.rollback()
				return this.ctx.throw(404)
			}
		}		
		async publicallsubs(codeid,selecttime){
			const {ctx}=this
			const {Wxuserrecord}=ctx.model
			const recordgroup=await Wxuserrecord.findAll({where:{'codeid':codeid,'subscribe_time':selecttime},attributes:['userid'],group:'userid',raw:true})
			let allsubs=0
			for(let i=0;i<recordgroup.length;i++){
				const userid=recordgroup[i].userid
				let specselect={
					'$ne':null
				}
				let order_by='ASC'
				let specsubrecord=await this.publicfindspecsubrecordbyuserid(codeid,userid,specselect,order_by)
				specsubrecord=specsubrecord[0]
				console.log('this is specsubrecord', specsubrecord.subscribe_time)
				const subscribe_time=specsubrecord.subscribe_time
				console.log('this is finalselect', selecttime['$between'][0],selecttime['$between'][1])
				console.log(selecttime['$between'][0]<=subscribe_time<=selecttime['$between'][1])
				if(selecttime['$between'][0]<=subscribe_time&&subscribe_time<=selecttime['$between'][1]){
					console.log('222222222222222222222222')
					allsubs+=1
				}
				
			}
			console.log('codeid1111111111111111111111111111111',codeid)
			console.log('this is allsubsdshjjjjjjjjjjjjjjjjjj', allsubs)
			return allsubs
		}
		async allsubs(codeid,selecttime){
			const {ctx}=this
			const {Wxuserrecord}=ctx.model
			const recordgroup=await Wxuserrecord.findAll({where:{'codeid':codeid,'subscribe_time':selecttime},attributes:['userid'],group:'userid',raw:true})
			let allsubs=0
			for(let i=0;i<recordgroup.length;i++){
				const userid=recordgroup[i].userid
				let specselect={
					'$ne':null
				}
				let order_by='ASC'
				let specsubrecord=await this.findspecsubrecordbyuserid(userid,specselect,order_by)
				specsubrecord=specsubrecord[0]
				console.log('this is specsubrecord', specsubrecord.subscribe_time)
				const subscribe_time=specsubrecord.subscribe_time
				console.log('this is finalselect', selecttime['$between'][0],selecttime['$between'][1])
				console.log(selecttime['$between'][0]<=subscribe_time<=selecttime['$between'][1])
				if(selecttime['$between'][0]<=subscribe_time&&subscribe_time<=selecttime['$between'][1]){
					console.log('222222222222222222222222')
					allsubs+=1
				}
				
			}
			console.log('codeid1111111111111111111111111111111',codeid)
			console.log('this is allsubsdshjjjjjjjjjjjjjjjjjj', allsubs)
			return allsubs
		}
		async allunsubs(codeid,selecttime){  //总平台二维码取关用户列表
			const {ctx}=this
			const {Wxuserrecord}=ctx.model
			const recordgroup=await Wxuserrecord.findAll({where:{'codeid':codeid,'unsubscribe_time':selecttime},attributes:['userid'],group:'userid',raw:true})
			let allunsubs=0
			for(let i=0;i<recordgroup.length;i++){
				const userid=recordgroup[i].userid
				let specselect={
					'$ne':null
				}
				let order_by='ASC'
				let specsubrecord=await this.findspecunsubrecordbyuserid(userid,specselect,order_by)
				specsubrecord=specsubrecord[0]
				const unsubscribe_time=specsubrecord.unsubscribe_time
				console.log()
				if(selecttime['$between'][0]<=unsubscribe_time&&unsubscribe_time<=selecttime['$between'][1]){
					allunsubs+=1
				}
				
			}
			return allunsubs			
		}
		async publicallunsubs(codeid,selecttime){   //获取取关用户列表时每张二维码用户取关，获取总取关数时总平台二维码取关数
			const {ctx}=this
			const {Wxuserrecord}=ctx.model
			const recordgroup=await Wxuserrecord.findAll({where:{'codeid':codeid,'unsubscribe_time':selecttime},attributes:['userid'],group:'userid',raw:true})
			let allunsubs=0
			for(let i=0;i<recordgroup.length;i++){
				const userid=recordgroup[i].userid
				let specselect={
					'$ne':null
				}
				let order_by='ASC'
				let specsubrecord=await this.publicfindspecunsubrecordbyuserid(codeid,userid,specselect,order_by)
				specsubrecord=specsubrecord[0]
				const unsubscribe_time=specsubrecord.unsubscribe_time
				console.log()
				if(selecttime['$between'][0]<=unsubscribe_time&&unsubscribe_time<=selecttime['$between'][1]){
					allunsubs+=1
				}
				
			}
			return allunsubs			
		}
		async realsubs(codeid,selecttime){
			const {ctx}=this
			const {Wxuserrecord} = ctx.model
			const recordgroup=await Wxuserrecord.findAll({where:{'codeid':codeid,'recordtime':selecttime},attributes:['userid'],group:'userid',raw:true})
			let realsubs=0
			for(let i=0;i<recordgroup.length;i++){
				const userid=recordgroup[i].userid
				console.log('this is userid',userid)
				let userrecord=await Wxuserrecord.findAll({where:{'userid':userid,'codeid':codeid,'recordtime':selecttime},
					order:[['id','DESC']]})
				userrecord=userrecord[0]
				if(userrecord.subscribe===1){
					realsubs+=1
				}
			}
			return realsubs
		}
		async coderealsubsuser(codeid,selecttime,page,pagesize){
			//查累积关注人数
			const {ctx}=this
			const {Wxuserrecord} = ctx.model
			let now=Math.floor(new Date().getTime()/1000)
			const recordgroup=await Wxuserrecord.findAll({where:{'codeid':codeid,'recordtime':selecttime},attributes:['userid'],group:'userid',raw:true})
			let array=[]
			for(let i=0;i<recordgroup.length;i++){
				let form={}
				const userid=recordgroup[i].userid
				console.log('this is userid',userid)
				let userrecord=await Wxuserrecord.findAll({where:{'userid':userid,'codeid':codeid,'recordtime':selecttime},
					order:[['id','DESC']]})
				userrecord=userrecord[0]
				console.log('userrecord', userrecord)
				if(userrecord.subscribe===1){
					let subscribe_time=userrecord.subscribe_time
					subscribe_time=moment(subscribe_time*1000).format('YYYY-MM-DD HH:mm:ss')
					form.userid=userid
					form.subscribe_time=subscribe_time
					array.push(form)
				}
			}
				console.log('array', array)
				const newarray=await this.pagination(page,pagesize,array)
				return newarray
		}
		async codeunsubuser(codeid,selecttime,page,pagesize){
			const {ctx}=this
			const {Wxuserrecord} = ctx.model
			let now=Math.floor(new Date().getTime()/1000)
			const recordgroup=await Wxuserrecord.findAll({where:{'codeid':codeid,'recordtime':selecttime},attributes:['userid'],group:'userid',raw:true})
			console.log('this is recordgroup', recordgroup)
			let array=[]
			for(let i=0;i<recordgroup.length;i++){
				let form={}
				const userid=recordgroup[i].userid
				console.log('this is userid',userid)
				let userrecord=await Wxuserrecord.findAll({where:{'userid':userid,'codeid':codeid,'recordtime':selecttime},
					order:[['id','DESC']]})
				userrecord=userrecord[0]
				console.log('userrecord', userrecord)
				if(userrecord.subscribe===0){
					let unsubscribe_time=userrecord.unsubscribe_time
					unsubscribe_time=moment(unsubscribe_time*1000).format('YYYY-MM-DD HH:mm:ss')
					form.userid=userid
					form.unsubscribe_time=unsubscribe_time
					array.push(form)
				}
			}
				console.log('array', array)
				const newarray=await this.pagination(page,pagesize,array)
				return newarray
		}
		async publicunsubuser(codeid,selecttime,page,pagesize){
			const {ctx}=this
			const {Wxuserrecord} = ctx.model
			let now=Math.floor(new Date().getTime()/1000)
			const recordgroup=await Wxuserrecord.findAll({where:{'codeid':codeid,'recordtime':selecttime},attributes:['userid'],group:'userid',raw:true})
			let array=[]
			for(let i=0;i<recordgroup.length;i++){
				let form={}
				const userid=recordgroup[i].userid
				console.log('this is userid',userid)
				let userrecord=await Wxuserrecord.findAll({where:{'userid':userid,'recordtime':selecttime},
					order:[['id','DESC']]})
				userrecord=userrecord[0]
				console.log('userrecord', userrecord)
				if(userrecord.subscribe===0){
					let unsubscribe_time=userrecord.unsubscribe_time
					unsubscribe_time=moment(unsubscribe_time*1000).format('YYYY-MM-DD HH:mm:ss')
					form.userid=userid
					form.unsubscribe_time=unsubscribe_time
					array.push(form)
				}
			}
				console.log('array', array)
				const newarray=await this.pagination(page,pagesize,array)
				return newarray
		}
		async pagination(page, pagesize, array) {
				var offset = (page - 1) * pagesize;
				return (offset + pagesize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pagesize);
			}
		async getallcodes(){
			const {ctx}=this
			const {Wxuserrecord}=ctx.model
			const transaction=await ctx.model.transaction({
				isolationLevel:app.model.Transaction.ISOLATION_LEVELS.SERIALIZABLE
			})
			try{
				const codegroup=await Wxuserrecord.findAll({attributes:['codeid'],group:'codeid',raw:true})
				await transaction.commit()
				return codegroup
			}catch(error){
				await transaction.rollback()
				return ctx.throw(404)
			}
		}
		async sortdesc(array,sort){
			let a=0
			let b=0
			for(let i=0;i<array.length-1;i++){
				for(let j=0;j<array.length-i-1;j++){
					let c=array[j][sort]
					let d=array[j+1][sort]
					c=parseInt(c)
					d=parseInt(d)
					console.log(c,d)
					if(c<d){
						a=array[j]
						b=array[j+1]
						array[j]=b
						array[j+1]=a
					}
				}
			}
			return array
		}
		async sortasc(array,sort){
			let a=0
			let b=0
			for(let i=0;i<array.length-1;i++){
				for(let j=0;j<array.length-i-1;j++){
					let c=array[j][sort]
					let d=array[j+1][sort]
					c=parseInt(c)
					d=parseInt(d)
					console.log(c,d)
					if(c>d){
						a=array[j]
						b=array[j+1]
						array[j]=b
						array[j+1]=a
					}
				}
			}
			return array
		}
	}
}