import authTokens from "../tokens.js"
import jwt from "jsonwebtoken"
import dbConn from "../db.js"
import { compareHash } from "../hash.js"

const authMiddleware = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization.split(" ")[1]

        jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {

            if (err) {
                return res.status(401).json({
                    error: "authentication required"
                })
            }

            if (!authTokens.get(authorization)) {
                return res.status(401).json({
                    error: "authentication required"
                })
            }

            const { email, password } = user

            try {
                const user = await dbConn.user.findFirst({
                    where: {
                        email,
                    }
                })

                if (!user) {
                    return res.status(401).json({
                        success: false,
                        error: "authentication required"
                    })
                }

                const passwordMatch = await compareHash(password, user.password)

                if (!passwordMatch) {
                    return res.status(401).json({
                        success: false,
                        error: "authentication required"
                    })
                }

                req.user = user

            } catch (err) {
                return res.status(401).json({
                        success: false,
                        error: "authentication required"
                    })
            }
    
            next()
        })

    } catch (err) {
        return res.status(401).json({
            error: "authentication required"
        })
    }
}


export default authMiddleware