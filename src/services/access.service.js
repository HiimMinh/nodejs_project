"use strict";
const keyTokenModel = require('../models/keyToken.model')
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("../services/keyToken.service");
const { log } = require("console");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils/index");
const {
  BadRequestError,
  ForbiddenError,
  AuthFailureError,
} = require("../core/error.response");

// service //
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {

  /*
    check this token used
  */
  static handlerRefreshToken = async ( refreshToken ) => {

    // Checking did this token use?
    const foundToken = await KeyTokenService.findByRefreshTokenUsed( refreshToken)

    // if yes
    if(foundToken){
      // decode check user
      const { userId, email } = await verifyJWT( refreshToken, foundToken.privateKey)
      console.log({ userId, email});

      // delete keyStore
      await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenError(' Something wrong happened !! Pls relogin')
    }

    // if no 
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken )
    if(!holderToken) throw new AuthFailureError(' Shop not registered ')

    // verifyToken
    const { userId, email } = await verifyJWT( refreshToken, holderToken.privateKey)
    console.log('[2]--', {userId, email});

    // check userId
    const foundShop = await findByEmail( {email} )
    if(!foundShop) throw new AuthFailureError('Shop not registered ')

    // create new key pair
    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      holderToken.publicKey,
      holderToken.privateKey
    );

    // update token
    await keyTokenModel.findOneAndUpdate({
      user:  holderToken.user,
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokenUsed: refreshToken
      }
    })

    // await holderToken.updateOne({
    //   $set: {
    //     refreshToken: tokens.refreshToken
    //   },
    //   $addToSet: {
    //     refreshTokenUsed: refreshToken
    //   }
    // })

    return {
      user: { userId, email },
      tokens
    }
  }

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id)
    console.log( {delKey })
    return delKey
  }

  /*
    1 - Check email in dbs
    2 - Match password
    3 - Create AT vs RT and save
    4 - generate tokens
    5 - get data return login
  */
  static login = async ({ email, password, refreshToken = null }) => {
    //1.
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");
    //2.
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error");

    //3.
    // created privateKey, publicKey
    // const privateKey = crypto.randomBytes(64).toString("hex");
    // const publicKey = crypto.randomBytes(64).toString("hex");

    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'pkcs1', //pkcs8
          format: 'pem'
        },

        privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem'
        }
      });

    //4.
    const { _id: userId } = foundShop
    console.log(`check herrrrrrrrrrrrrrrrr:::::; ${userId}`);

    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      publicKey,
      privateKey
    );
    console.log(`check herrrrrrrrrrrrrrrrr:::::; ${tokens}`);

    await KeyTokenService.createKeyToken({
      userId,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken
    })
    console.log('check herrrrrrrrrrrrrrrrr');

    return {
      shop: getInfoData({
        fields: ['_id', 'name', 'email'],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    // try {

    // Step 1: Check email existed?

    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered!");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // created privateKey, publicKey
      // const privateKey = crypto.randomBytes(64).toString("hex");
      // const publicKey = crypto.randomBytes(64).toString("hex");

      const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'pkcs1', //pkcs8
          format: 'pem'
        },

        privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem'
        }
      });

      // Public key CryptoGraphy Standards !
      // console.log({
      //   privateKey,
      //   publicKey,
      // }); // save collection KeyStore
      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        return {
          // throw new BadRequestError('Error: Shop already registered!')
          code: "xxxx",
          message: "Shop already registered",
        };
      }

      // console.log({ privateKey, publicKey }); // save collection KeyStore

      // const publicKeyString = await KeyTokenService.createKeyToken({
      //   userId: newShop._id,
      //   publicKey,
      // });

      // if (!publicKeyString) {
      //   return {
      //     code: "xxxx",
      //     message: "Shop already registered",
      //   };
      // }

      // console.log(`publicKeyString::`, publicKeyString);
      // const publicKeyObject = crypto.createPublicKey( publicKeyString )

      // Create token pair
      const tokens = await createTokenPair(
        {
          userId: newShop._id,
          email,
        },
        publicKey,
        privateKey
      );

      // console.log(`Created Token Success::`, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
    // } catch (error) {
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     status: "error",
    //   };
    // }
  };
}

module.exports = AccessService;
