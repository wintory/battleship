'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const mongodb = require('mongodb')
const assert = require('assert');
var db;
let config = require('./config')
let mongoDB = require("./models/databaseManager")
let User = require("./models/user")
var user;


// mongodb.connect('mongodb://127.0.0.1:27017/mydb', function(err,database) {
//     if(err) { console.error(err) }
//     db = database // once connected, assign the connection to the global variable
// })

db = new mongoDB(config.Database, (err) => {
	if(!err){
		console.log("Test db connection")
		db.connect().then(() => {

			console.log("DB connection successfull")
		})
	}else{
		console.log("Test db connection failed")
	}
})
exports.db = db




app.get('/shoot/:coord', function(req, res){
	if(user == null || user == undefined){
		res.send("Login first")
	}else{
		user.shoot(req.params.coord).then((data) =>{
		res.status(data.status).send(data.msg)
	})
	}
	
})
	
app.get('/newgame/:username', function (req, res) {
	db.newGame(req.params.username).then((data) => {
		user = new User(data)
		res.send(data.msg)
	})
})

app.get('/play/:username', function(req,res){
	db.play(req.params.username).then((data) => {
		user = new User(data)
		res.send(data.msg)
	})
})

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
	res.send({"name":"hello world"})
})

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})