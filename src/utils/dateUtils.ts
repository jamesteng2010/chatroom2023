const moment = require('moment');
export const getNow = (dateFormat?: any) => {
  if (dateFormat) {
    return moment().format(dateFormat);
  } else {
    return moment().valueOf();
  }
};
