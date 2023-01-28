import { getRandomCode } from "./dataUtils";

const MongoClient = require('mongodb').MongoClient;


// Connection URL
const url = 'mongodb+srv://admin:txh750702@cluster0.vzjtf.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url)
// Database Name
const dbName = 'chatroom';

export const generateVerifyCode = async (identityNumber : any)=>{
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('verify_code');    
    const foundVerifyCode = await  collection.findOne({mobile : identityNumber,used : false})

    console.log("find code is , ",foundVerifyCode)
    
    if(!foundVerifyCode){
        const verifyCode =  getRandomCode();
        await collection.insertOne({mobile : identityNumber,code :verifyCode ,used : false})

        return verifyCode;
    }
    else{
        return foundVerifyCode.code
    }
}
