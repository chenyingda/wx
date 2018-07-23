const urlencode=require('urlencode')
const path=require('path')
const fs=require('fs')
const sendtowormhole=require('stream-wormhole')
const awaitwritestream=require('await-stream-ready').write
const gm=require('gm').subClass({imageMagick: true});
const sharp=require('sharp')
module.exports=app=>{
	return class wxcodeservice extends app.Service{
		async createqrcode(username){  //访问微信二维码接口返回新建二维码的url
			const {ctx}= this
			const api=await ctx.service.wechatApi.index()
			const ticket=await api.createLimitQRCode(username)
			console.log('this is ticket', ticket)
			return ticket
		}
		async create(body){        //创建code
			const transaction=await this.ctx.model.transaction({
				isolationLevel:app.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
			})
			try{
				const wxcode=await this.ctx.model.Wxcode.create(body,{transaction})
				await transaction.commit()
				return wxcode
			}catch(error){
				await transaction.rollback()
				return this.ctx.throw(404)
			}
		}
		async update(wxcode,updates){
			const transaction=await this.ctx.model.transaction({
				isolationLevel:app.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
			})
			try{
				const result=await wxcode.update(updates,{transaction})
				await transaction.commit()
				return result
			}catch(error){
				await transaction.rollback()
				return this.ctx.throw(404)
			}
		}
		async findbyusername(username){  //通过用户名查找code
			const transaction=await this.ctx.model.transaction({
				isolationLevel:app.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
			})
			try{
				const wxcode=await this.ctx.model.Wxcode.findOne({where:{'username':username}},transaction)
				await transaction.commit()
				return wxcode
			}catch(err){
				await transaction.rollback()
				return this.ctx.throw(404)
			}
		}
		async findcodebyid(id){           //通过id查找所有code数据
			const transaction=await this.ctx.model.transaction({
				isolationLevel:app.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
			})
			try{
				const wxcode=await this.ctx.model.Wxcode.findOne({where:{'id':id}},transaction)
				await transaction.commit()
				return wxcode
			}catch(err){
				await transaction.rollback()
				return this.ctx.throw(404)
			}
		}
		async getallcode(page,pagesize){     //分页查询所有用户数据
			const {ctx}= this
			const { Wxcode } = ctx.model;
			console.log('this is Wxcode', Wxcode)
			const result=await Wxcode.findAndCountAll({
					order:[['id','DESC']],
					offset:(page-1)*pagesize,
					limit:pagesize
				})
			console.log('this is result', result)
		return result	
		}
		async getallcodevisible(page,pagesize,visible){     //分页查询所有用户数据
			const {ctx}= this
			const { Wxcode } = ctx.model;
			const result=await Wxcode.findAll({
					where:{'visible':visible},
					order:[['id','DESC']],
					offset:(page-1)*pagesize,
					limit:pagesize
				})
			console.log('this is result', result)
		return result	
		}
		async allcodes(){
			const {ctx}=this
			const {Wxcode}=ctx.model
			console.log('aaaaa')
			const result=await Wxcode.findAndCountAll({
				order:[['id','DESC']]
			})
			return result.count
		}
		async download(url,code_id){
			const {ctx}=this
			const res=await ctx.curl(url,{
				streaming:false
			})
			const stream=res.res.data
			code_id=code_id.toString()
			const target=path.join(__dirname,'../public/codeimage/'+code_id+'.jpg')
			fs.writeFileSync(target,stream,'utf8')
			return target
		}
		async downloadimage(wxcoderesult,code_id){
			const readStream=fs.createReadStream(wxcoderesult);
			const smallimg=path.join(__dirname,'../public/codeimage/'+code_id+'small.jpg')
			const mediumimg=path.join(__dirname,'../public/codeimage/'+code_id+'medium.jpg')
			const largeimg=path.join(__dirname,'../public/codeimage/'+code_id+'large.jpg')
			const smallstream=fs.createWriteStream(smallimg);
			const mediumstream=fs.createWriteStream(mediumimg);
			const largestream=fs.createWriteStream(largeimg);
			const newsharp = sharp().resize(258).on('info',info => {
				console.log('----info-----',info)
			});
			console.log('aaaaaa',newsharp)
			const newsharp1 = sharp().resize(430).on('info',info => {
				console.log('----info-----',info)
			});
			const newsharp2 = sharp().resize(860).on('info',info => {
				console.log('----info-----',info)
			});
			readStream.pipe(newsharp).pipe(smallstream);
			readStream.pipe(newsharp1).pipe(mediumstream);
			readStream.pipe(newsharp2).pipe(largestream);
		}
		async getearlistcode(){
			const {ctx} = this
			const {Wxcode} = ctx.model
			let code=await Wxcode.findAndCountAll({
				order:[['id','ASC']]
			})
			code=code.rows
			return code[0]
		}	
	}
}

//设置二维码用户名字唯一

