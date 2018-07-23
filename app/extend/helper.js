'use strict';
const now = new Date();
let nowDate = now.getDate();
let nowMonth = now.getMonth()+1;
const moment=require('moment')
console.log('mmmmmmmmmm',nowMonth)
if(nowDate < 10){
	nowDate = "0"+nowDate
}
if(nowMonth < 10){
	nowMonth = "0"+nowMonth
}
let nowYear = now.getFullYear();

module.exports = {
	//获取昨天的时间戳
	getLastDay(){
		const date = `${nowYear}-${nowMonth}-${nowDate}`
		console.log("date", date);
		const time = new Date(date).getTime(); //获取今日的时间戳
		console.log("time", time);
		const lastTime = (time/1000)-24*3600
		return lastTime
	},

	//获取本周开始的时间戳
	getWeek(){
		let nowDayofWeek = now.getDay();
		console.log('lllllllllllll',nowDayofWeek)
		if(nowDayofWeek == 0){
			nowDayofWeek == 7
		}
		const date = `${nowYear}-${nowMonth}-${nowDate}`
		console.log("date", date);
		const time = new Date(date).getTime(); //获取今日的时间戳
		const week = (time/1000)-(nowDayofWeek-1)*24*3600;
		console.log('this is week',week)
		console.log('lkkkkkkkkkkkkkkkkkkk',moment(week*1000).format('YYYY-MM-DD'))
		return week;
	},

	//获取上月开始和结束时间戳
	getLastMonth(){
		let lastMonth = (nowMonth-1);
		let year = nowYear;
		let date ;
		if(lastMonth < 10){
			lastMonth = "0"+lastMonth
		}
		if(lastMonth == 0){
			lastMonth = 12;
			year = nowYear - 1;
			date = `${year}-${lastMonth}-01`
		}else{
			date = `${nowYear}-${lastMonth}-01`
		}
		console.log('date',date)
		const endTime = new Date(`${nowYear}-${nowMonth}-01`).getTime()/1000; //获取本月开始的时间戳
		const startTime = new Date(date).getTime()/1000;  //获取上个月开始的时间戳
		console.log("startTime", startTime);
		console.log("endTime", endTime);
		return {startTime, endTime}
	},
	getTimeSection(startTime, endTime){
		return {start, end};
	}
}