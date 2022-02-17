import { Alert, Button, FormGroup, Grid, InputAdornment, Snackbar, TextField, Typography } from "@mui/material"
import JSConfetti from "js-confetti"
import moment from "moment"
import { useEffect, useState } from "react"
import AudioClipPlayer from "./AudioClipPlayer"
import translationsJson from "./translations.json"
import { Guess, Language, SimilarityIndex, LanguageWithTranslation } from "./types"
import { equalIgnoreCase, startsWithIgnoreCase } from "./util/stringUtil"
import { LanguageList } from "./LanguageList"

export const AppContainer = () => {
    const [guesses, setGuesses] = useState<Guess[]>([])
    const [currentGuess, setCurrentGuess] = useState<string>('')
    const [solved, setSolved] = useState(false)
    const [error, setError] = useState<string>()
    const [audioPlayerShowing, setAudioPlayerShowing] = useState(true)
    const [languages, setLanguages] = useState<Language[]>([])
    const [sortedLanguages, setSortedLanguages] = useState<Language[]>([])
    const [similarityData, setSimilarityData] = useState<SimilarityIndex[]>([])
    const [answerWithTranslation, setAnswerWithTranslation] = useState<LanguageWithTranslation>()

    const [showNativeSpeakers, setShowNativeSpeakers] = useState(false)
    const [showLanguageOrigin, setShowLanguageOrigin] = useState(false)
    const [showFlag, setShowFlag] = useState(false)

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

        setAnswerWithTranslation({
            language: answer,
            translation: translationsJson[offset].translation,
        })

        loadSimilarityData(answer.code).then(data => 
            setSimilarityData(data)
        )
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
            setGuesses(guesses.concat({
                language: answerWithTranslation.language,
                rank: 100,
            }))
            setSolved(true)
        } else {
            let guessedLanguage = languages.find(l => equalIgnoreCase(l.name, guessInLower))
            if (guessedLanguage) {
                // incorrect guess
                let newGuess = {
                    language: guessedLanguage,
                    rank: similarityData.find(row => row.l1 === answerName && equalIgnoreCase(row.l2, guessInLower))?.value,
                }
                setError(`Guess again!`)
                setGuesses(guesses.concat(newGuess))
                setCurrentGuess('')
            } else {
                setError(`${guess} is not in the list of languages!`)
                setCurrentGuess('')
            }
        }
    }

    const handleClick = (language: string) => {
        handleSubmit(language)
    }

    const handleKeyPress = (e: any) => {
        if (e.key === 'Enter' && currentGuess !== '') {
            handleSubmit(currentGuess)
        }
    }

    return (
        <Grid 
            container 
            spacing={0} 
            direction="column" 
            alignItems="center" 
            justifyContent="center"
        >
            <h2>
                Lingual
            </h2>
            <h4>
                (I'm a backend engineer, in case you couldn't tell)
            </h4>

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

            <Grid item xs={6}>
                <Typography color="textPrimary">
                    Try to guess the language in the fewest possible guesses! In English the sentence is 
                </Typography>
                <h3>What language is this?</h3>
            </Grid>

            {sentence &&
                <Grid item xs={6}>
                    <Typography color="textPrimary">
                        Translated (by Google) into the mystery language, the sentence is
                    </Typography>
                    <h2>{sentence}</h2>
                    {audioPlayerShowing ?
                        <AudioClipPlayer language={answer.code} onError={() => {
                            setError('Audio unavailable for this language')
                            setAudioPlayerShowing(false)
                        }} />
                        :
                        <strong>Audio unavailable</strong>
                    }
                    {answer.nativeSpeakers && 
                        <>
                            <h4>Number of native speakers:</h4>
                            {showNativeSpeakers ? <h3>{answer.nativeSpeakers}</h3> : <Button onClick={() => setShowNativeSpeakers(true)}>Show hint</Button>}
                        </>
                    }
                    {answer.origin && 
                        <>
                            <h4>Language origin:</h4>
                            {showLanguageOrigin ? <h3>{answer.origin}</h3> : <Button onClick={() => setShowLanguageOrigin(true)}>Show hint</Button>}
                        </>
                    }
                    <h4>Flag:</h4>
                    {showFlag ? 
                        <img style={{ marginLeft: 10 }} height={50} src={`https://word-puzzles.s3.us-east-1.amazonaws.com/flags/${answer.country.toLowerCase()}.png`} /> : 
                        <Button onClick={() => setShowFlag(true)}>Show hint</Button>
                    }
                    <br /><br />
                    {solved ? <h2>{answerName}</h2> : 
                        <FormGroup>
                            <TextField 
                                value={currentGuess} 
                                onChange={event => setCurrentGuess(event.target.value)} 
                                autoFocus 
                                onKeyPress={e => handleKeyPress(e)} 
                                autoComplete="off"
                                InputProps={
                                    {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Button 
                                                    variant="contained" 
                                                    onClick={() => handleSubmit(currentGuess)} disabled={currentGuess === ''} 
                                                    disableElevation
                                                >Guess</Button>
                                            </InputAdornment>
                                        )
                                    }
                                }
                            />
                        </FormGroup>
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
                    />
                </Grid>
            }
        </Grid>
    )
}
