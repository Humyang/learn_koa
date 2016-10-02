# KOA

Application

A Koa application is an object containing an array of middleware generator functions which are composed and executed in a stack-like manner upon request. Koa is similar to many other middleware systems that you may have encountered such as Ruby's Rack, Connect, and so on - however a key design decision was made to provide high level "sugar" at the otherwise low-level middleware layer. This improves interoperability, robustness, and makes writing middleware much more enjoyable.

Koa 应用程序是一个包含 generator function 中间件数组的对象，它组合这些中间件以类似栈的方式处理接收到的请求。Koa 类似许多其它的中间件系统因此你可能会经常遇到如 Ruby 的 Rack，Connect 等 - 总的来说关键的设计是在低级别的中间件层提供高级别的语法糖。提高了互操作性，稳健性，和制作中间件时更享受这个过程。

This includes methods for common tasks like content-negotiation, cache freshness, proxy support, and redirection among others. Despite supplying a reasonably large number of helpful methods Koa maintains a small footprint, as no middleware are bundled.

这些中间件包含通用的任务例如内容转发，缓存刷新，代理，和重定向。尽管 Koa 支持大量的辅助方法但为了保持轻量，Koa 未包含任何中间件。

The obligatory hello world application:
这里是一个简单的 hello world 程序。

```javascript
var koa = require('koa');
var app = koa();

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(3000);

```

## 前置知识

generator 是 koa 的基础，要学习 koa 首先要会 generator。

后面你会发现，koa 中的 generator 用法与常规有些区别，这是因为 koa 使用了 co 封装优化 gennerator 控制流。

### Iterators + For..Of

ES 6 新添加的语法 `for ... of` 类似 `for ... in`，任何内部实现了 Iterators  的对象，都可以通过 `for ... of` 进行遍历。

```javascript
let fibonacci = {
  [Symbol.iterator]() {
    let pre = 0, cur = 1;
    return {
      next() {
        [pre, cur] = [cur, pre + cur];
        return { done: false, value: cur }
      }
    }
  }
}

for (var n of fibonacci) {
  // truncate the sequence at 1000
  if (n > 1000)
    break;
  console.log(n);
}
```  

`for ... of` 每次遍历都会执行 `next()`，当 done 为 `true` 时即结束循环。

### generator

generators 是简化生成 iterator 的方式，使用 `function*` 和 `yield` 实现。一个 `function` 如果定义为 `function*` 则会返回一个 generator 实例。generator 是 iterator 的字类型包含额外的关键字 `next` 和 `throw`。这些使得值可以回传回 generator，因此 yield 包含了表达式的返回 (或抛出 (throw)) 值。

例如上面的代码可以这样改造：

```javascript
var fibonacci = {
  [Symbol.iterator]: function*() {
    var pre = 0, cur = 1;
    for (;;) {
      var temp = pre;
      pre = cur;
      cur += temp;
      yield cur;
    }
  }
}

for (var n of fibonacci) {
  // truncate the sequence at 1000
  if (n > 1000)
    break;
  console.log(n);
}
```

generator 还可以这样用：

```javascript
var r = 3;

function* infinite_ap(a) {
    for( var i = 0; i < 3 ; i++) {
        a = a + r ;
        yield a;
    }
}

var sum = infinite_ap(5);

console.log(sum.next()); // returns { value : 8, done : false }
console.log(sum.next()); // returns { value : 11, done: false }
console.log(sum.next()); // returns { value : 14, done: false }
console.log(sum.next()); //return { value: undefined, done: true }

```

### yield 的理解

yield 并不能使使一个函数获得异步效果，他的作用仅仅是标识函数的暂停位置。

与 return 类似，return 在函数结束时返回，yield 当 generator 实例调用 `next()` 时，值在返回的 object 的 value 中。

# co

## co 是什么

co 是基于 Generator 的控制流，让你写出非 blocking 的漂亮的代码。

通过 co 可以按顺序执行 `function*` 内所有的 yield。

KOA 的 generator 与常规的用法不同就是因为使用了 co。

## co 实现原理和注释

内容来源：http://book.apebook.org/minghe/koa-action/co/co.html

注释代码：https://github.com/Humyang/learn_koa

## co 返回值

在以前的版本，co 返回的是 Thunk，可以调用回调方法和可选参数。现在，co 返回的是 promise。

```javascript
co(function* () {
  var result = yield Promise.resolve(true);
  return result;
}).then(function (value) {
  console.log(value);
}, function (err) {
  console.error(err.stack);
});
```

## Thunks 函数

CO 支持传入 Thunk ，那什么是 Thunk？

Thunks are functions that only have a single argument, a callback. Thunk support only remains for backwards compatibility and may be removed in future versions of co.

Thunk 是只有单独的参数和一个回调方法的函数。Thunk 的支持是为了向前兼容可能会在未来的 co 版本移除。

## Thunk 与 Promise 对比

co 的功能其实就是自动顺序执行 generator function 内所有 yield，就版本的实现方式通过将 yield 后面的操作封装成 thunk，例如：

```javascript

function read(file){
    return function(fn){
        fs.readFile(file,'utf-8',fn);
    }
}

```

文件读取完后立刻执行 fn，co 将内部封装的 `_next()` 方法传递给 read 返回的 function，即 fn。通过这样的方式执行 generator function 内所有的 yield，直到结束。

4.0 的 co 使用 Promise 替代 thunk，仍然可以使用 thunk 仅仅为了支持旧版本。

Promise 的实现：

```javascript

var promise = new P

```


## co 的简单实用



```javascript
var co = require('co');
var fs = require('fs');

function read(file) {
  return function(fn){
    fs.readFile(file, 'utf8', fn);
  }
}
co(function *(){

  var a = yield read('.gitignore');
  console.log(a.length);

  var b = yield read('package.json');
  console.log(b.length);
});
```

# 参考资料

ES 6语法简介
https://github.com/lukehoban/es6features
