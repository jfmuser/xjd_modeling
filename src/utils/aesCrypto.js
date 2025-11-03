// crypto.js 文件
import CryptoJS from 'crypto-js';
//秘钥, 一般长度是16位
var key = CryptoJS.enc.Latin1.parse('crypt20230112key');
// 偏移量,  一般长度是16位
var iv = CryptoJS.enc.Latin1.parse('crypt20230112-iv');
export default {
  //加密
  encrypt(data) {
    var srcs = CryptoJS.enc.Utf8.parse(data);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding,
    });
    return encrypted.toString();
  },
  //解密
  decrypt(encrypted) {
    var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  },
};
