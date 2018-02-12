var request = require('request')
var sleep = require('sleep')

async function newgame(){
	return new Promise(async function(resolve, reject){
		request('http://localhost:5000/newgame/matus', function(err,res,body){
			console.log("Start !")
			if(res.statusCode == 200){
				resolve(true)
			}
			
		})
	})
}

async function x(path) {
  return new Promise(async function(resolve, reject) {
    request(path, function(err,res,body) {
    	console.log(res.body)
    	let result = res.statusCode
    	if(res.statusCode == 201){
    		result = false
    	}
    	resolve(result)
    })
  });
}

async function simmulate(){
	for(let i = 1; i <11; i++){
		for(let k = 1; k< 11; k++){
			let path = 'http://localhost:5000/shoot/'+i+','+k
			let check = await x(path)
			if(check){
				continue
			}else{
				break
			}
			sleep.msleep(200)
		}
	}		
}
async function test(){
	if(newgame()){
		sleep.msleep(500)
		simmulate()
	}
}

test()

