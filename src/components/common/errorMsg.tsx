export default function  ErrorMsg(props:any){
    const {errMsg} = props
    return <div className="errorMsg">
        {errMsg}
    </div>
}