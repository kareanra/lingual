import axios from 'axios'
import QueryString from 'qs'

const sentence = 'I wonder what language this is'

export type Language = {
    language: string
    name: string
}

export const getLanguages = async () => {
    const headers = {
        'accept-encoding': 'application/gzip',
        'x-rapidapi-key': process.env.REACT_APP_API_KEY as string,
        'x-rapidapi-host': 'google-translate1.p.rapidapi.com',
        'useQueryString': true,
    }

    const response = await axios.get('https://google-translate1.p.rapidapi.com/language/translate/v2/languages?target=en', { headers: headers})

    return response.data['data']['languages'] as Language[]
}

export const translate = async (language: string) => {
    const headers = {
        'content-type': 'application/x-www-form-urlencoded',
        'accept-encoding': 'application/gzip',
        'x-rapidapi-key': process.env.REACT_APP_API_KEY as string,
        'x-rapidapi-host': 'google-translate1.p.rapidapi.com',
        'useQueryString': true,
    }

    const data = {
        'q': sentence,
        'target': language,
        'source': 'en',
    }

    let dataString = QueryString.stringify(data)

    const response = await axios.post('https://google-translate1.p.rapidapi.com/language/translate/v2', dataString, { headers: headers })

    return response.data['data']['translations'][0]['translatedText']
}
