// 不必要的注释很多，因为是边跟着敲边理解的原因。

// 定义 co 函数
// 接收一个函数作为参数
// 这个函数只能是 function* 类型
function co(fn){
    // 返回一个函数，接收一个参数 (当出现 yeild function* 语句时，
    // 会遍历这个 function*,遍历完成后使用 done 跳转到下一个 yeild )
    return function(done){
        // 保存当前的 this
        var ctx = this;

        // 调用传入的 function*，返回的是 generator 实例
        var gen = fn.call(ctx);

        // 用于保存 fn 内 yeild 返回的数据。
        var it = null;

        function _next(err,res){
            if(err)res=err;
            // 调用 next 使 generator 实例执行下一步
            // 因为这里传入了 res 到 next，所以当前 yeild 返回的值就变成了 res
            // 所以传入给 co 的函数内，var a = yeild readFile('file')，得到的值是读取文件后的值
            // 而不是 readFile 返回的函数
            // 这段代码很妙。
            it = gen.next(res);

            // 如果未执行完成，把 _next 作为参数传递带 it.value
            // 因为 readFile 返回的是函数，并且需要一个函数类型的参数
            // 所以此时 it.value 是函数，需要一个函数类型的参数
            // 又因为 readFile 执行完成后会调用函数类型的参数
            // 所以 readFile 执行完成后会调用 _next
            // 就这样一值递归执行直到结束
            if(!it.done){
                it.value(_next);
            }
        }

        _next();
    }
}




// 调用

var fs = require('fs');

function read(file){
    // 返回一个函数，并且需要一个函数类型的参数
    // 当读读取文件完成会调用函数参数
    return function(fn){
        fs.readFile(file,'utf-8',fn);
    }
}

co(function* (){
    var c = 2;
    console.log(c);

    var a = yield read('_simple_co.js');
    console.log(a.length);

    var b = yield read('package.json');
    console.log(b.length);


})();
