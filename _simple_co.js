var fs = require('fs');

function co(fn) {
    return function(done) {
        var ctx = this;
        var gen = fn.call(ctx);
        // 调用传入的 fn，因为类型是 function*,所以会返回一个 generator 实例
        var it = null;
        function _next(err, res) {
            if(err) res = err;
            it = gen.next(res);
            // gen 是 generator 实例
            // 调用 next 返回的是 {value:function(){},done:false|true},
            // 就是 read 函数的
            // return function(fn){
            //     fs.readFile(file, 'utf8', fn);
            // }
            if(!it.done){
                it.value(_next);
                // 如果未完成，执行 next 返回的 value (value 是一个函数)
                // value 执行完成之后，会调用传入的回调方法，即 _next
                // readFile 函数会传递 err,res 给 _next 函数
                // 这是 Node.js 回调函数的约定处理方式，即第一个参数是错误信息，第二个参数是操作结果对象。

                // 一次 co 的作用是自动执行 function* 类型的函数
            }
        }
        _next();
    }
}


//一个 thunk 函数
function read(file) {
    return function(fn){
        fs.readFile(file, 'utf8', fn);
    }
}
co(function *(){
    var a = yield read('ReadMe.md');
    // a 为什么是读取文件后的结果？
    console.log(a);
    console.log(a.length);

    var b = yield read('package.json');
    console.log(b.length);
})();

// var co = require('co');
// var fs = require('fs');
//
// function read(file) {
//   return function(fn){
//     fs.readFile(file, 'utf8', fn);
//   }
// }
//
//
//
// co(function *(){
//
// console.log(111);
//
//   // var a = yield read('.gitignore',function(){
//   //     console.log(222);
//   //     not output;
//   // });
//
//   var a = yield read('.gitignore');
//
//   console.log(a(function(){
//       console.log(222);
//   }));
//
//   console.log(a.length);
//
//   var b = yield read('package.json');
//   console.log(b.length);
//
// });
