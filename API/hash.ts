import bycrypt from "bcrypt"

const saltRounds = 10


const hash = async (password) => {
    return new Promise((resolve, reject) => {
        bycrypt.hash(password, saltRounds, function(err, hash) {
            if (err) reject(err)
            resolve(hash)
        });

    })
}

const compareHash = async (password, hash) => {
    return new Promise((resolve, reject) => {
        bycrypt.compare(password, hash, function(err, result) {
            if (err) reject(err)
            resolve(result)
          });
    })
}


export {
    hash,
    compareHash
}
