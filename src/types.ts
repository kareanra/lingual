export type Guess = {
    language: Language
    rank?: number
}

export type Language = {
    code: string
    name: string
    country: string
}
