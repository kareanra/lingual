import { Alert, Grid, Snackbar, Typography, useMediaQuery } from "@mui/material"
import JSConfetti from "js-confetti"
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import translationsJson from "./translations.json"
import { Guess, Language, SimilarityIndex, LanguageWithMetadata } from "./types"
import { equalIgnoreCase, startsWithIgnoreCase } from "./util/stringUtil"
import { LanguageList } from "./LanguageList"
import { LanguageAutoComplete } from "./LanguageAutoComplete"
import AudioPlayer from "./AudioPlayer"
import { Header } from "./Header"
import { HintsContainer } from "./HintsContainer"
import { LanguageDropdown } from "./LanguageDropdown"

export const AppContainer = () => {
    const [guesses, setGuesses] = useState<Guess[]>([])
    const [currentGuess, setCurrentGuess] = useState<string>('')
    const [solved, setSolved] = useState(false)
    const [error, setError] = useState<string>()
    const [audioPlayerShowing, setAudioPlayerShowing] = useState(true)
    const [languages, setLanguages] = useState<Language[]>([])
    const [sortedLanguages, setSortedLanguages] = useState<Language[]>([])
    const [similarityData, setSimilarityData] = useState<SimilarityIndex[]>([])
    const [answerWithTranslation, setAnswerWithTranslation] = useState<LanguageWithMetadata>()

    const isMobile = useMediaQuery(`(max-width: 760px)`)

    const endRef = useRef<null | HTMLDivElement>(null)

    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const loadSimilarityData = async (code: string) => {
        return await require(`./lexical-similarity-data-${code}.json`)
    }

    useEffect(() => {
        // parse languages
        const languages = translationsJson.map(str => {
            return {
                code: str.language.language,
                name: str.language.name,
                country: str.language.country,
                nativeSpeakers: str.language.nativeSpeakers,
                origin: str.language.origin,
            }
        })
        let sorted = [...languages]
        sorted.sort((l1, l2) => l1.name.localeCompare(l2.name))

        setLanguages(languages)
        setSortedLanguages(sorted)

        const today = moment().dayOfYear()
        const offset = today % languages.length

        const answer = languages[offset]

        loadSimilarityData(answer.code).then(data => {
            const similarityData: SimilarityIndex[] = data
            const relative = similarityData && similarityData.length ? {
                language: similarityData[1].l2,
                similarity: Math.round(100 - similarityData[1].value),
            } : undefined

            setSimilarityData(similarityData)

            setAnswerWithTranslation({
                language: answer,
                translation: translationsJson[offset].translation,
                relative: relative,
            })
        })
    }, [])

    useEffect(() => {
        if (solved) {
            const jsConfetti = new JSConfetti()
            jsConfetti.addConfetti()
        }
    }, [solved])

    if (!languages.length || !answerWithTranslation) {
        return <>Loading...</>
    }

    const answer = answerWithTranslation.language
    const answerName = answerWithTranslation.language.name
    const sentence = answerWithTranslation.translation

    const filteredLanguages = sortedLanguages.filter(l => {
        let notYetGuessed = guesses.find(g => equalIgnoreCase(l.name, g.language.name)) === undefined
        let currentGuessMatches = !currentGuess || startsWithIgnoreCase(l.name, currentGuess)
        return notYetGuessed && currentGuessMatches
    })

    const handleSubmit = (guess: string) => {
        let guessInLower = guess.toLowerCase()
        if (filteredLanguages.length === 1) {
            guessInLower = filteredLanguages[0].name.toLowerCase()
        }

        if (guesses.find(ln => equalIgnoreCase(ln.language.name, guessInLower)) !== undefined) {
            setError(`You already guessed ${guess}!`)
            setCurrentGuess('')
        } else if (guessInLower.toLowerCase() === answerName.toLowerCase()) {
            let newGuesses = guesses
            newGuesses.unshift({
                language: answerWithTranslation.language,
                rank: 100,
            })
            setGuesses(newGuesses)
            setSolved(true)
        } else {
            let guessedLanguage = languages.find(l => equalIgnoreCase(l.name, guessInLower))
            if (guessedLanguage) {
                // incorrect guess
                let newGuess = {
                    language: guessedLanguage,
                    rank: similarityData.find(row => row.l1 === answerName && equalIgnoreCase(row.l2, guessInLower))?.value,
                }
                let newGuesses = guesses
                newGuesses.unshift(newGuess)
                setGuesses(newGuesses)
                setError(`Guess again!`)
                setCurrentGuess('')
                scrollToBottom()
            } else {
                setError(`${guess} is not in the list of languages!`)
                setCurrentGuess('')
            }
        }
    }

    const handleClick = (language: string) => {
        handleSubmit(language)
    }

    return (
        <Grid 
            container 
            spacing={0} 
            direction="column" 
            alignItems="center" 
            justifyContent="center"
        >
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={error !== undefined}
                autoHideDuration={2000}
                onClose={() => setError(undefined)}
            >
                <Alert onClose={() => setError(undefined)} severity="error">
                {error}
                </Alert>
            </Snackbar>

            <Header isMobile={isMobile} />

            {sentence &&
                <Grid item xs={6}>
                    <Typography color="textPrimary">
                        Translated (by Google) into the mystery language, the sentence is
                    </Typography>
                    <h2>{sentence}</h2>
                    {audioPlayerShowing ?
                        <AudioPlayer language={answer.code} onError={() => {
                            setError('Audio unavailable for this language')
                            setAudioPlayerShowing(false) 
                        }} />
                        :
                        <strong>Audio unavailable</strong>
                    }
                    <HintsContainer 
                        nativeSpeakers={answer.nativeSpeakers}
                        origin={answer.origin}
                        country={answer.country} 
                        relative={answerWithTranslation.relative}
                        isMobile={isMobile}
                    />

                    <br /><br />
                    
                    {solved ? <h1>{answerName}</h1> : 
                        (isMobile ? 
                            <LanguageDropdown 
                                options={filteredLanguages} 
                                onSubmit={guess => handleSubmit(guess)}
                            />
                            :
                            <LanguageAutoComplete 
                                options={filteredLanguages} 
                                onOpen={() => null}
                                onSubmit={guess => handleSubmit(guess.name)} 
                            />
                        )
                    }
                </Grid>
            }
            {languages &&
                <Grid item xs={12}>
                    <LanguageList
                        guesses={guesses}
                        filteredLanguages={filteredLanguages}
                        solved={solved}
                        answer={answer}
                        handleClick={handleClick}
                        isMobile={isMobile}
                    />
                </Grid>
            }
            <div ref={endRef} />
        </Grid>
    )
}
