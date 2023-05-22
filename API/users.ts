import express from "express"
import { UserSchema, combineErrorStrings } from "./validationSchemas.js"
import { hash, compareHash } from "./hash.js"
import authTokens from "./tokens.js"
import jwt from "jsonwebtoken"
import dbConn from "./db.js"
const router = express.Router()


const dbError = (res) => {
    return res.status(500).json({
        success: false,
        error: "something went wrong, try again later!"
    })
}


router.post("/api/login", async (req, res) => {
    const { value, error } = UserSchema.validate(req.body)

    if (error) {
        return res.status(400).json({
            success: false,
            error: combineErrorStrings(error)
        })
    }

    if (!value) {
        return res.status(400).json({
            error: "login payload must be a JSON with email and password!"
        })
    }

    const { email, password } = value

    try {
        const user = await dbConn.user.findFirst({
            where: {
                email,
            }
        })

        const passwordMatch = await compareHash(password, user.password)
        
        if (!user || !passwordMatch) {
            return res.status(401).json({
                success: false,
                error: "invalid credentials"
            })
        }

        const token = jwt.sign({ email, password }, process.env.ACCESS_TOKEN_SECRET)

        authTokens.set(token, true)

        return res.status(200).json({
            token
        })

    } catch (err) {
        return dbError(res)
    }

})

router.post("/api/register", async (req, res) => {

    const { value, error } = UserSchema.validate(req.body)

    if (error) {
        return res.status(400).json({
            success: false,
            error: combineErrorStrings(error)
        })
    }

    if (!value) {
        return res.status(400).json({
            error: "register payload must be a JSON with email and password!"
        })
    }

    const { email, password } = value

     // user already exists?

    try {
        const user = await dbConn.user.findFirst({
            where: {
                email
            }
        })
        
        if (user) {
            return res.status(409).json({
                success: false,
                error: "an user already exists with this email"
            })
        }
    } catch (err) {
        return dbError(res)
    }

    try {
        const hashedPassword = await hash(password)

        await dbConn.user.create({
            data: {
                email,
                password: hashedPassword as string,
            },
        });

        return res.status(200).json({
            success: true,
            message: "successfully created your account!"
        })

    } catch (error) {
        
        return dbError(res)
      }
    
})


export default router