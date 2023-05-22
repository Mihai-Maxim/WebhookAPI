const Tokens = function () {
    const tokens = {

    }

    const getAll = () => {
        return tokens
    }

    const set = (token: string, isValid: boolean) => {
        tokens[token] = isValid
    }

    const get = (token: string) => {
        return tokens[token]
    }

    return {
        getAll,
        set,
        get
    }
}

const authTokens = Tokens()

export default authTokens