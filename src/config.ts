export const GlobalConfig = {
    mongoDataAPI : 'https://data.mongodb-api.com/app/data-niulw/endpoint/data/v1/action/',
    mongoDataAPI_key : 'fdjkdzDxJEDjcZzZ5vj3hyGgj4BJqBeKQGwahBKxVAuYKvdtHusdYVZGg71CCUH4',
    databaseName : "chatroom",
    clientTokenExpire : 24*60*60*1000,
    backendAPI : {
        host : 'http://localhost:3003/',
        // host : 'https://www.backendapi.store:3003/'
    }
}

export enum SERVER_ERROR_TYPE {
    FAILED_GET_PEER_ID  = "-1",
    FAILED_CONNECT_SOCKET = "-2"
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
    REMOVE_FROM_CHAT = 3,
    UPDATE_MATCHING_TIMESTAMP = 4,
    TELL_SERVER_CLIENT_RECEIVED_MATCH = 5
}

export enum PEER_CMD{
    I_AM_HERE = '[CMD]:IAMHERE',
    PARTNER_STOP = '[CMD]:PARTNER_STOP',
    STOP_VIDEO = '[CMD]:STOP_VIDEO',
    STOP_AUDIO = '[CMD]:STOP_AUDIO'
}