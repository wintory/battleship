var request = require('request')

async function x(path) {
  var k = await new Promise(function(resolve, reject) {
  	var result = false
    request(path, function(err,res,body) {
    	console.log(body)
    	if(res.statusCode == 201){
    		result = true
    	}
    })
    resolve(result)
  });
}


for(let i = 1; i <11; i++){
	for(let k = 1; k< 11; k++){
		let path = 'http://localhost:5000/shoot/'+i+','+k
		if(!x(path)){
			console.log('really ?')
			break
		}
	}
}