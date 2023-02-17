export const GlobalConfig = {
    mongoDataAPI : 'https://data.mongodb-api.com/app/data-niulw/endpoint/data/v1/action/',
    mongoDataAPI_key : 'fdjkdzDxJEDjcZzZ5vj3hyGgj4BJqBeKQGwahBKxVAuYKvdtHusdYVZGg71CCUH4',
    databaseName : "chatroom",
    clientTokenExpire : 24*60*60*1000,
    backendAPI : {
        // host : 'http://localhost:3003/',
        host : 'http://13.239.4.184:3003/'
    }
}

export enum CHAT_STATUS {
    IDEL = 0,
    MATCHING =1 ,
    MASTER_SIGNAL = 2,
    SLAVE_ANSWER = 3,
    MASTER_CONFIRM = 4,
    CONNECTED = 5,
    ERROR = 6
}
export enum SOCKET_CMD{
    MASTER_SIGNAL = 0,
    SLAVE_ANSWER = 1,
    MASTER_CONFIRM = 2,
    REMOVE_FROM_CHAT = 3
}