// 不必要的注释很多，因为是边跟着敲边理解的原因。

// simple_co.js 里的 co 函数里，yield 后面只能接封装成 thunk 的异步函数
// 但经过改造后可以接收更多类型的参数
// 例如 function, promise, generator function, array, or object
// 现在通过改造使其可以接收 generator function。


function co(fn){
    return function(done){
        var ctx = this;
        var gen = fn.call(ctx);
        var it = null;

        function _next(err,res){
            if(err)res=err;
            it = gen.next(res);
            if(!it.done){
                // 判断 yield 后面的类型是否为 generator function
                if(isGeneratorFunction(it.value)){
                    // 如果是，调用 co 处理 generator，循环执行执行所有步骤
                    // 这里把 _next 函数传给了 co
                    co(it.value).call(ctx,_next);
                }else{
                    it.value(_next);
                }
            }else{
                // 首先判断 done 是否为空
                // 如果 co 正在嵌套处理 generator function 时会传递 _next 函数给 co，
                // 所以 done 不为空时就是 _next 函数
                // 当所有步骤执行完成之后，执行 done (即 _next 跳转到下一步)
                // 因为调用时传递了 ctx，所以跳转者是上层的 co。
                done && done.call(ctx);
            }
        }
        _next();
    }
}

// 判断是否 generator function
// 特征是 constructor.name === 'GeneratorFunction'
function isGeneratorFunction(obj){
    var constructor = obj.constructor;
    if(!constructor) {
        return false;
    }
    if('GeneratorFunction'===constructor.name || 'GeneratorFunction'===constructor.displayName){
        return true;
    }
    return isGenerator(constructor.prototype);
}
// 判断是否 Generator 对象
// 当初始化 generator function 后返回的是 generator 对象，特征是带有 next 与 throw 方法
function isGenerator(obj){
    return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}


// 调用

var fs = require('fs');

function read(file){
    return function(fn){
        fs.readFile(file,'utf8',fn);
    }
}

function *gf1(){
    this.a = yield read('ReadMe.md');
}

function *gf2(){
    this.b = yield read('package.json');
}
co(function *(){
    yield gf1;
    yield gf2;
    console.log(this.a.length);
    console.log(this.b.length);
})
