export const sendSMS = () => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append(
    "Authorization",
    "Basic amFtZXN0ZW5nMjAxMEBnbWFpbC5jb206VGVuZ1NNUzA3MDIh"
  );

  var raw = JSON.stringify({
    messages: [
      {
        body: "test message, please ignore",
        to: "+61414636286",
        from: "JAMES",
      },
    ],
  });

  var requestOptions: any = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("https://rest.clicksend.com/v3/sms/send", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
};
