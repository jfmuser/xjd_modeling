import Encrypt from "@/utils/mdEncrypt"
// param 转换
import Generalmethod from "@/utils/changeParams"
function getConfig(config,signs) {
    let sign = ""
    
    if (config.url != "/user/login" && config.url != "/user/currentUser"&& config.url != "/user/getDetail") {
        // 1.获取后端返回的严密
        // const signs = localStorage.getItem('sign')
        // 2.拿到加密后path数据
        const FINISH = Generalmethod.Encryptions(config, signs)
        //3.加密 在请求头上添加严
        const rs = Encrypt(FINISH)
        sign = rs.md5Str
        // console.log(sign, "加密了吗");
    }
    return sign
}
export default {
    getConfig
}