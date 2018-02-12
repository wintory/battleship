const server = require('../server')
var db;
var mongo = require('./databaseManager')
var shipName = ['Battleship','Cruisers','Cruiser','Destroyer','Destroyer','Destroyer','submarine','submarine','submarine','submarine']
class User{
	constructor(data){
		db = server.db
		this.username = data.game_data.username
		this.map_id = data.game_data.map_id
		this.game_id = data.game_data.game_id
		this.mapData = data.mapData
		this.shipData = data.shipData
		this.game_status = data.game_data.game_status
		this.coord = data.game_data.action //store coordination of firing shot.
		this.missed_shot = data.game_data.missed_shot
		this.ship_destroyed = data.game_data.ship_destroyed
		this.score = data.game_data.score
	}

	async shoot(coord){
		return new Promise(async(resolve, reject) => {
			let msg = ""
			let co = coord.split(",")
			if(this.game_status){
				return resolve({
					msg : "This game already end",
					status : 200
				})
			}
			if(this.coord.indexOf(coord) != -1){
				return resolve({
					msg : "This cell already been shot",
					status : 200
				})
			}

			if(this.username == undefined || this.username == null){
				return resolve({
					msg : "Login first",
					status : 200
				})
			}
			
			let x = co[1]-1
			let y = co[0]-1	
			if(x < 0 || x > 9 || y < 0 || y > 9){
				return resolve({
					msg : "wrong position",
					status : 200
				})
			}
			if(this.mapData[x][y] != 0){// Hit ! has ship in this cell !
				this.coord.push(coord) //save cell
				this.shipData[this.mapData[x][y]-1].ship_hp -= 1
					msg = "Hit !"
				if(this.shipData[this.mapData[x][y]-1].ship_hp == 0){ //destroyed
					this.ship_destroyed += 1
					msg = "You just sank the " + shipName[this.mapData[x][y]-1]
					if(this.checkGameStatus()){
						let query = await db.updateHP(this.map_id,this.shipData).then(async() => {
							await db.collectAction(this.game_id, this.coord,this.ship_destroyed, this.missed_shot).then(async() => {
								await db.updateGameStatus(this.game_id, this.coord.length - this.missed_shot)
							})
						})
						// await db.collectAction(this.game_id, this.coord, this.ship_destroyed, this.missed_shot )
						// await db.updateGameStatus(this.game_id)
						this.game_status = true
						msg = "Win ! You completed the game in " + this.coord.length + " moves" + "\nMissed shots : " + this.missed_shot
						return resolve({
							msg : msg,
							status : 201
							})
						
						// this.game_status = true
						// msg = "Win ! You completed the game in " + this.coord.length + " moves" + "\nMissed shots : " + this.missed_shot
						// return resolve({
						// 	msg : msg,
						// 	status : 201
						// })
					}
				}
				 // await db.updateHP(this.map_id,this.shipData)
				//this.updateHP(this.map_id, this.mapData[x][y])
			}else{ // Miss !
				this.missed_shot += 1
				this.coord.push(coord)
				msg = "Missed!"
			}
			let query = await db.updateHP(this.map_id, this.shipData).then(async() =>{
				await db.collectAction(this.game_id, this.coord, this.ship_destroyed, this.missed_shot )
			resolve({msg : msg,
					status : 200
				})
			})
		})
	}

	checkGameStatus(){
		if(this.ship_destroyed == 10){ //all ship has been destroyed
			return true
		}else{
			return false
		}
	}
	
}

module.exports = User