var request = require('request')

async function x(path) {
  return new Promise(async function(resolve, reject) {
  	var result = false
    request(path, function(err,res,body) {
    	console.log(res.body)
    	if(res.statusCode == 201){
    		result = true
    	}
    })
    resolve(result)
  });
}

async function simmulate(){
	for(let i = 1; i <11; i++){
		for(let k = 1; k< 11; k++){
			let path = 'http://localhost:5000/shoot/'+i+','+k
			let check = await x(path)
			if(!check){
				continue
			}else{
				break
			}
		}
	}
}

simmulate()
