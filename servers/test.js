const dynamicCode = "console.log('동적 코드 실행: ' + _arg); return 'abc';" ;
const func = new Function('_arg', dynamicCode);

const rsv = func('Hello World'); // 
console.log("rsv:",rsv);