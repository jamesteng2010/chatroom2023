const moment = require('moment');
export const getNow = (dateFormat?: any) => {
  if (dateFormat) {
    return moment().format(dateFormat);
  } else {
    return moment().valueOf();
  }
};

// unit values are :
// years, months, weeks, days, hours, minutes, and seconds
export const getDiffFromNow = (compareDateTime:any, unit:any, comparedFormatStr?:any) => {
  const now = moment();
  var comparedMoment = null;
  if(comparedFormatStr){
     comparedMoment = moment(compareDateTime, comparedFormatStr);
  }
  else{
    comparedMoment = moment(compareDateTime);
  }
 
  return now.diff(comparedMoment, unit);
};

export const getTimeBetweenNow=(unit : any, howLong : any)=>{
    return moment().add(howLong,unit).valueOf()
}


