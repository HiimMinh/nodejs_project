'use strict'

const keyTokenModel = require('../models/keyToken.model')

class KeyTokenService {
    
    static createKeyToken = async ({
        userId,
        publicKey
    }) => {
        try {
            console.log(`KeyToken::publicKeyString::`, publicKey);

            const publicKeyString = publicKey.toString()
            console.log(`KeyToken::publicKeyString::`, publicKeyString);

            const tokens = await keyTokenModel.create({
                user: userId,
                publicKey: publicKeyString
            })

            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }
}

module.exports = KeyTokenService