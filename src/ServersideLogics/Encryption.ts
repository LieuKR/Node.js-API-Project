// Encryption module
const crypto = require('crypto');

/**
 * @param inputString string
 * @return encrypted string
 */
const EncryptString = function(inputString : string){
    let key = crypto.pbkdf2Sync(inputString, process.env.CRYPTSALT, Number(process.env.CRYPTRUNNUM), Number(process.env.CRYPTBYTE), process.env.CRYPTMETHOD)
    let encryptedString : string = key.toString('hex');

    return encryptedString;
}
export {EncryptString}