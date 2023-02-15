var cookie = require('cookie');
const randomString = require('random-string');
var ab2str = require('arraybuffer-to-string')

export const getRandomStr = (strLen: number) => {
    return randomString({ length: strLen });
  };

  export const parseCookie = (cookieStr : string)=>{
    return cookie.parse(cookieStr)
  }

  export const convertUint8ToString = (arr:any)=>{
    return ab2str(arr)
  }