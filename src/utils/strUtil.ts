var cookie = require('cookie');
const randomString = require('random-string');

export const getRandomStr = (strLen: number) => {
    return randomString({ length: strLen });
  };

  export const parseCookie = (cookieStr : string)=>{
    return cookie.parse(cookieStr)
  }