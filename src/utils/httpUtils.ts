
export const sendRequest = async (url: any, options: any) => {
  const requestResult = await fetch(`${url}`, options);
  console.log("options is , ", options);
  try {
    const result = await requestResult.json();
    console.log("request result is , ", result);
    return result;
  } catch (e) {
    return {
      error: true,
      errMsg: e,
    };
  }
};
