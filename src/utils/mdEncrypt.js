
import md5 from 'js-md5'
import * as Base64 from 'js-base64'
export default function encrypt(params) {
    //let encoded = Base64.encode(JSON.stringify(params))   //字符串转义,加密
    let encoded = params
    let md5Str = md5(encoded)    
    // console.log("字符串",encoded);  
    // console.log("md5",md5Str);        //和后台约定好的签名
    return { encoded, md5Str }
}