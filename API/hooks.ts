import express from "express"
import { CreateHookPayloadSchema, combineErrorStrings, ActivateHookPayload } from "./validationSchemas.js"
import dbConn from "./db.js"
const router = express.Router()
import { uuid } from 'uuidv4';
import e from "express";

router.post("/api/create-hook", async (req, res) => {

    const { api_key } = req.query

    if (!api_key) {
        return res.status(400).json({
            success: false,
            error: "no api_key query param"
        })
    }

    const apiKeyRecord = await dbConn.apiKey.findUnique({
        where: { key: api_key as string },
    });

    if (!apiKeyRecord) {
        return res.status(401).json({
            success: false,
            error: "invalid API key"
        })
    }

    const { value, error } = CreateHookPayloadSchema.validate(req.body)

    if (error) {
        return res.status(400).json({
            success: false,
            error: combineErrorStrings(error)
        })
    }

    if (!value) {
        return res.status(400).json({
            error: "create-hook payload must be a JSON with participants, url, body and headers"
        })
    }

    const { participants, url, body, headers } = value

    try {
        // Create the hook

        const hook_id = uuid()

        const all_participant_ids = Array.from({ length: participants }).map((el, index) => uuid())

        await dbConn.hooks.create({
            data: {
                url,
                headers: headers,
                body: body,
                apiKeyId: apiKeyRecord.id,
                hook_id,
                participant_ids: {
                    create: Array.from({ length: participants }).map((el, index) => ({
                        participant_id: all_participant_ids[index],
                        consented: false,
                        body: {}
                    }))
                }
            },
        });

        return res.status(201).json({
            hook_id,
            participants_id: all_participant_ids
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "something went wrong, try again later!"
        })
    }
})


const didAllConsent = async (hook_id) => {
    try {
        const participants = await dbConn.participantId.findMany({
            where: {
                hook: {
                    hook_id,
                },
            },
        });

    
        const all_consented = participants.every((participant) => participant.consented);

        if (all_consented) {
            return participants
        }

      } catch (error) {
        return false
      }
}

const resetHook = async (hook_id) => {
    try {
        const hook = await dbConn.hooks.findUnique({
            where: {
                hook_id: hook_id as string,
            },
            include: {
                participant_ids: true,
            },
        });

        const newBody = hook.body

        hook.participant_ids.forEach((participant) => delete newBody[participant.participant_id as string]);
    
        await dbConn.hooks.update({
            where: {
                hook_id: hook_id as string
            },
            data: {
                body: newBody
            }
        })

        await dbConn.participantId.updateMany({
            where: {
                hookId:  { in: hook.participant_ids.map(participant_id => participant_id.hookId) }
            },
            data: {
                consented: false,
            },
        });

        return true

    } catch (err) {
        return false
    }

}

router.post("/api/activate-hook", async (req, res) => {
    const { participant_id, hook_id } = req.query

    if (!participant_id || !hook_id) {
        res.status(400).json({
            success: false,
            error: "activate-hook requires both the hook_id and the participant_id"
        })
    }

    const { value: participantPayload, error } = ActivateHookPayload.validate(req.body)

    if (error) {
        return res.status(400).json({
            success: false,
            error: combineErrorStrings(error)
        })
    }

    if (!participantPayload) {
        return res.status(400).json({
            error: "activate-hook payload must be a non empty JSON object"
        })
    }

    try {
        const hook = await dbConn.hooks.findFirst({
            where: {
                participant_ids: {
                    some: {
                        participant_id: participant_id as string
                    },
                },
                hook_id: hook_id as string
            },
        });
    
        if (!hook) {
            return res.status(400).json({
                success: false,
                error: "participant_id or hook_id are invalid"
            })
        }

  
        const updated = await dbConn.participantId.update({
            where: {
                participant_id: participant_id as string,
            },
            data: {
                consented: true,
                body: participantPayload,
            },
        })

        const allConsented = await didAllConsent(hook_id)

        if (allConsented) {

            const { url, body, headers } = hook

            body["payloads"] = {} as Object

            allConsented.forEach(consented => {
                body["payloads"][consented.participant_id] = consented.body
            })

            let resp

            try {
                resp = await fetch(url, {
                    method: "POST",
                    headers: headers as HeadersInit,
                    body: JSON.stringify(body)
                })
            } catch (err) {
                return res.status(200).json({
                    hook,
                    allConsented: true,
                    response: error.message
                })
            }

            let respData

            try {
                respData = await resp.json()
            } catch (err) {
                try {
                    respData = await resp.text()
                } catch (err) {
                }
            }

            const respStatus = resp.status

            await resetHook(hook_id)

            return res.status(200).json({
                success: true,
                allConsented: true,
                response: {
                    data: respData,
                    status: respStatus
                }
            })

        }

        return res.status(200).json({
            success: true,
            allConsented: false
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "something went wrong, try again later!"
        })
    }


})




export default router