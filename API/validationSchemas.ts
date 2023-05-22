import Joi, { ValidationError } from "joi";


const UserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(10).required(),
})


const CreateHookPayloadSchema = Joi.object({
    participants: Joi.number().integer().positive().required().min(1),
    url: Joi.string().uri().required(),
    headers: Joi.object(),
    body: Joi.object().required()
});

const ActivateHookPayload = Joi.object().min(1).required()

const combineErrorStrings = (error: ValidationError) => {
    return error.details.map(err => err.message)
}


export {
    UserSchema,
    combineErrorStrings,
    CreateHookPayloadSchema,
    ActivateHookPayload
}