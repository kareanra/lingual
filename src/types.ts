export type Guess = {
    language: Language
    rank?: number
}

export type Language = {
    code: string
    name: string
    country: string
    nativeSpeakers?: string
    origin?: string
}

export type SimilarityIndex = {
    l1: string
    l2: string
    value: number
}

export type LanguageWithTranslation = {
    language: Language
    translation: string
}
