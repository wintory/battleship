let mongo = require('mongodb').MongoClient
// collection in db
var  map = 'Map'
var game_host = 'Game_host'
var game_info = 'Game_Info'
var url = 'mongodb://127.0.0.1:27017/mydb';


class mongoDB{
	constructor(config, callback) {
        this.config = config;
        mongo.connect(url, (err, db) => {
            if (err) { callback ? callback(err) : ''; return; }
            if (callback) callback();
        })
    }

    async connect() { 

        let _this = this;
        return new Promise((resolve, reject) => {
            if (_this.db) {
                resolve();
            } else {
                mongo.connect(url)
                    .then((database) => {
                        _this.db = database.db("mydb")
                        resolve(true);
                    }, (err) => {
                        // console.log("Error connecting to database : " + err.message);
                        reject(err.message);
                    }
                    );
            }
        })
    }

    close() {
        this.db.close();
        // delete this;
    }

    async findMap(map_id) {
        return new Promise((resolve, reject) => {
            this.db.collection("Game_Info").findOne({map_id : map_id}, (err, data) => {
                if (err) { reject(err); return; }
                resolve(data);
            })
        });
    }

    async checkGame(username){
    	return new Promise((resolve, reject) => {
			this.db.collection("Game_Host").update({username : username, game_status : false}, { $set: {"game_status" : true}}, (err, data) =>{
				if(err){reject(err);return;}
				resolve(data ? true:false)
			})
		})
    }

    async newGame(username){
		return new Promise(async(resolve, reject) => {
			let i = await this.checkGame(username)
			let data = await this.play(username).then((data) => {
				console.log(data)
				resolve(data)
			})
			
		})
	}

    async play(username){
    	return new Promise(async(resolve, reject) => {
    		if(await this.findGameStatus(username)){
    			let currentGame = await this.findCurrentGame(username)
    			let currentMap = await this.findMap(currentGame.map_id)
    			
    			resolve({
    				msg : "Your game is not end",
    				game_data : currentGame,
    				mapData : currentMap.mapData,
    				shipData : currentMap.shipData
    		})
    		}else{ //Generate new game
	    		let totalMap = await this.getMapID();
	    		let map = await this.createMap();
	    		let mapData = {
	    			map_id: totalMap+1, 
	    			map : map,
	    		}
	    		//let data = await insertGameInfo(mapData.shipData)
	    		let data = await this.randomShipPlacement(mapData)
	    		let qq = await this.insertGameInfo(data)
	    		let game_id = await this.getGameID()
	    		let game_data = {
	    			username : username,
	    			game_id : game_id+1,
	    			map_id : mapData.map_id,
	    			game_status : false,
	    			action : [],
	    			ship_destroyed : 0,
	    			missed_shot : 0,
                    score : 0
	    		}
	    		this.db.collection("Game_Host").insertOne(game_data, (err,res) => {
    			if(err) { reject(err); return;}
    			resolve({msg : "game has been create",
    					 game_data : game_data,
    					 mapData : data.mapData,
    					 shipData : data.shipData
    					})
	    		})
	    		// this.db.collection("Map").insertOne(mapData, (err,res) => {
	    		// 	if (err) { reject(err); return; }
	    		// 	resolve({msg : "game has been create"})
	    		// })
    		}
    	})
    }
    //game_status true = not end,  false = already end
    async findCurrentGame(username){
    	return new Promise(async(resolve, reject) => {
    		this.db.collection("Game_Host").findOne({username:username, game_status : false}, (err, data) => {
    			if(err){ reject(err); return;}
    			resolve(data)
    		})
    	})
    }
    

    async findGameStatus(username){
    	return new Promise(async(resolve, reject) => {
    		this.db.collection("Game_Host").findOne({username:username, game_status : false}, (err, data) => {
    			if(err){ reject(err); return;}
    			resolve(data ? true : false)
    		})
    	})
    }

    async insertGameInfo(data){
    	this.db.collection("Game_Info").insertOne(data, (err,res) => {
    			if (err) { reject(err); return; }
    		})
    }

    async getMapID(){
    	return new Promise((resolve, reject) => {
            this.db.collection("Game_Info").count((err, data) => {
                if (err) { reject(err); return; }
                resolve(data);
            })
        });
    }

    async getGameID(){
    	return new Promise((resolve, reject) => {
            this.db.collection("Game_Host").count((err, data) => {
                if (err) { reject(err); return; }
                resolve(data);
            })
        });
    }

    async createMap(){
    	return new Promise(async(resolve, reject) => {
            
    	var map = new Array(10).fill(0).map(()=>new Array(10).fill(0));
    		
    		resolve(map)
        });
    }

    // random ship placement
    // ship type = 4 , 3 , 2 ,1 (type == hp)
    // direction 1 = vertical , 0 = horizontal
    // place bigger ship first.
    async randomShipPlacement(mapData){
    	return new Promise((async(resolve, reject) => {
    		var ship_info = []
    		var i = 4;
    		var ship = 1; // if ship = 10 then stop placement
    		while(i > 0){
    			var placement = false;
    			while(!placement){
    				let x = this.getRandomInt(10);
    				let y = this.getRandomInt(10);
    				let direction = this.getRandomInt(2);
    				placement = this.checkAdjacent(x,y,i,direction, mapData.map)
    				if(placement){
    						//increase y
    						if(direction){
    							if((y + i) <= 9){
    								for(let plot = 0;plot<i;plot++){
    									mapData.map[x][y+plot] = ship
    								}
    							}else{
    								for(let plot = 0;plot<i;plot++){
    									mapData.map[x][y-plot] = ship
    								}
    							}
    						}else{ //increase x
    							if((x + i) <= 9){
    								for(let plot = 0;plot<i;plot++){
    									mapData.map[x+plot][y] = ship
    								}
    							}else{
    								for(let plot = 0;plot<i;plot++){
    									mapData.map[x-plot][y] = ship
    								}
    							}
    						}
    					//place 1 ship successfull
    					ship_info.push({
    						"ship_id" : ship,
    						"ship_type" : i,
    						"ship_hp" : i
    					})
    					ship++;
    				}
    			}
    			if(ship == 2){
    				i--;
    			}else if(ship == 4){
    				i--;
    			}else if(ship == 7){
    				i--;
    			}else if(ship == 11){
    				i--;
    			}
    		}
    		var game_info = {
    			mapData : mapData.map,
    			ship_info
    		}

    		resolve({
    			map_id : mapData.map_id,
    			mapData : mapData.map,
    			shipData : ship_info
    		})
    	}))
    }
    // direction 1 = vertical , 0 = horizontal
    // vertical > place up, place down
    // horizontal > place right, place left
    checkAdjacent(x,y,type,direction, mapData){
    	let freespace = 0;
    	if(type == 4){
    		return true
    	}
    	if(direction){
    		if((y + type) <= 9){ //place up
    			for(let i = -1;i<2;i++){
    				// if(i == -1 || i == 1){
    					for(let k = -1;k <= type;k++){
    						if((x+i > 0) && (x+i < 10) && mapData[x+i][y+k] != undefined){
    							freespace += mapData[x+i][y+k];
    						}
    					}
    				}
    		}else{
    			for(let i = -1;i<2;i++){ //place down
    				// if(i == -1 || i == 1){
    					for(let k = -type;k <= 1;k++){
    						if((x+i > 0) && (x+i < 10) &&mapData[x+i][y+k] != undefined){
    							freespace += mapData[x+i][y+k];
    						}
    					}
    			 }
    		}
    	}else{
    		if((x + type) <= 9){ //place right
    			for(let i = -1;i<2;i++){
    				// if(i == -1 || i == 1){
    					for(let k = -1;k <= type;k++){
    						if((x+k > 0) && (x+k < 10)&&mapData[x+k][y+i] != undefined){
    							freespace += mapData[x+k][y+i];
    						}
    					}
    			}
    		}else{
    			for(let i = -1;i<2;i++){ //place left
    				// if(i == -1 || i == 1){
    					for(let k = -type;k <= 1;k++){
    						if((x+k > 0) && (x+k < 10) &&mapData[x+k][y+i] != undefined){
    							freespace += mapData[x+k][y+i];
    						}
    					}
    			}
    		}
    	}
    	if(freespace){ // freespace > 0 = has ship around this position. 
    		return false
    	}else{
    		return true
    	}
    }

    getRandomInt(max) {
  		return Math.floor(Math.random() * Math.floor(max));
	}

	async updateHP(map_id,shipData){
		return new Promise((resolve, reject) => {
			this.db.collection("Game_Info").update({map_id : map_id}, { $set: { "shipData" : shipData } } ,(err, data) => {
                if (err) { reject(err); return; }
                resolve(data);
            })
		})
	}

	async collectAction(game_id, action, ship_destroyed, missed_shot){
		return new Promise((resolve, reject) => {
			this.db.collection("Game_Host").update({game_id : game_id}, { $set: {"action" : action , "ship_destroyed" : ship_destroyed, "missed_shot" : missed_shot}}, (err, data) => {
                if (err) { reject(err); return; }
                resolve(data);
            })
		})
	}

	async updateGameStatus(game_id, score){
		return new Promise((resolve, reject) => {
			this.db.collection("Game_Host").update({game_id : game_id}, { $set: {"game_status" : true, "score" : score}}, (err, data) =>{
				if(err){reject(err);return;}
				resolve(data)
			})
		})
	}
    async showHistory(username){
        return new Promise((resolve, reject) => {
            this.db.collection("Game_Host").find({username : username, game_status : true}, (err, data) => {
                if(err){reject(err);return;}
                resolve(data)
            })
        })
    }
    async getHighestScore(username){
        return new Promise((resolve, reject) => {
            this.db.collection("Game_Host").find({username : username}, {sort : {score: -1}, limit : 1}, function(err,data){
                if(err){reject(err);return}
                resolve(data)
            })
        })
    }

    async getLeaderBoard(){
        return new Promise((resolve, reject) => {
            this.db.collection("Game_Host").find({}, {sort : {score: -1}, limit : 10}, function(err,data){
                if(err){reject(err);return}
                resolve(data)
            })
        })
    }
}

module.exports = mongoDB