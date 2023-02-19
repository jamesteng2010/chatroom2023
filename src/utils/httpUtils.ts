
export const sendRequest = async (url: any, options: any) => {
  const modifiedOptions = {
    ...options, 
    rejectUnauthorized: false,
  
  }
  console.log("modified options is , ",modifiedOptions)
  const requestResult = await fetch(`${url}`, options);
  //console.log("options is , ", options);
  try {
    const result = await requestResult.json();
    //console.log("request result is , ", result);
    return result;
  } catch (e) {
    return {
      error: true,
      errMsg: e,
    };
  }
};

export const sleep =(ms:any)=> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
