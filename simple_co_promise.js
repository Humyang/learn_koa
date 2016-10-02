// var promise = require('promise');
var fs = require('fs');
// var Promise = require('Promise');
function read(file){
    return new Promise(function(resolve,reject){
        fs.readFile(file,'utf8',function(err,result){
            if(err)reject(err);
            else resolve(result);
        });
    });
}
var p = read('./ReadMe1.md');
// console.log(p);
console.log(Promise);
p.then(function(res){
    console.log(res);
});

p.catch(function(err){
    console.log(err);
})
