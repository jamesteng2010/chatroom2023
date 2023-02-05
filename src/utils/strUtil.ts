
const randomString = require('random-string');

export const getRandomStr = (strLen: number) => {
    return randomString({ length: strLen });
  };