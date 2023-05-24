import express from 'express';
import bodyParser from "body-parser";
import usersRouter from "./API/users.js"
import apiKeysRouter from "./API/apiKeys.js"
import hooksRouter from "./API/hooks.js"
import * as dotenv from 'dotenv'
import cors from "cors"

dotenv.config()

const app = express();

app.use(cors({ origin: "*" }))

app.use(bodyParser.json())

app.use(usersRouter)

app.use(apiKeysRouter)

app.use(hooksRouter)


export default app