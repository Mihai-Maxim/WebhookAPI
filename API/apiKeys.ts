import express from "express"

import dbConn from "./db.js"
const router = express.Router()
import authMiddleware from "./middleware/authMiddleware.js"
import { uuid } from 'uuidv4';

router.post("/api/generate-api-key", authMiddleware, async (req, res) => {

    const api_key = uuid()

    const user = (req as any).user

    const { email } = user

    try {
        await dbConn.user.update({
            where: { email },
            data: {
                apiKeys: {
                    create: {
                        key: api_key
                    }
                }
            },
            include: {
                apiKeys: true
            }
        });

        res.status(200).json({
            api_key
        })

      } catch (error) {
            return res.status(500).json({
                success: false,
                error: "something went wrong, try again later!"
            })
      }

})



export default router