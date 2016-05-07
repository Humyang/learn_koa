var co = require('co');

function SimpleKoa(){
    this.middlewares = [];
}
SimpleKoa.prototype = {
    // 注入中间件
    use:function(gf){
        this.middlewares.push(gf);
    },
    //
    listen:function(){
        this._run();
    },
    _run:function(){
        var ctx = this;
        var middlewares = ctx.middlewares;

        // 将 middlewares 内的 generator function 按相反的顺序执行
        // 然后用 co 自动执行所有 yield。
        return co(function *(){
            var prev = null;
            var i = middlewares.length;

            while(i--){
                // 将上一个中间件传递给当前中间件。
                prev = middlewares[i].call(ctx,prev);
            }
            // 首先会执行这里，此时 prev 是第一个中间件
            // 因为 prev 是 generator function 所以会嵌套使用 co 执行
            // 嵌套执行到第一个 yield next，next 是在上面的 while 内传递的，
            // 即上一个中间件，同时类型是 generator function，所以继续嵌套 co
            // 跳转到最后一个中间件，没有 yield 了，就会跳出 co

            // 在跳出 co 后如果如果又发现的 yield next，就继续用 co 封装
            // 但 next 已经被上一个 co 执行，所以不会执行下一个 middleware 的 yield 部分。
            yield prev;
        });
    }
}
var app = new SimpleKoa();

app.use(function *(next){
    this.body = '1';
    yield next;
    this.body +='5';
    yield next;
    this.body +='-3.6-';
    console.log(this.body);
});

app.use(function *(next){
    this.body +='2';
    yield next;
    this.body +='4';
    yield next;
    this.body +='-3.5-'
    console.log(this.body);
});

app.use(function *(next){
    this.body +='3';
});
app.listen();
