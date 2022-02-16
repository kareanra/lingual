import { Cancel, CheckCircle, QuestionMark } from "@mui/icons-material"
import { Alert, Button, FormGroup, Grid, InputAdornment, List, ListItem, ListItemIcon, ListItemText, Snackbar, TextField, Typography } from "@mui/material"
import JSConfetti from "js-confetti"
import moment from "moment"
import { useState } from "react"
import AudioClipPlayer from "./AudioClipPlayer"
import translationsJson from "./translations.json"
import similarityJson from "./lexical-similarity-data-sw.json"
import { SimilarityIndicator } from "./SimilarityIndicator"

type Guess = {
    languageName: string
    rank?: number
}

export const AppContainer = () => {
    const [guesses, setGuesses] = useState<Guess[]>([])
    const [currentGuess, setCurrentGuess] = useState<string>('')
    const [solved, setSolved] = useState(false)
    const [error, setError] = useState<string>()
    const [audioPlayerShowing, setAudioPlayerShowing] = useState(true)

    const today = moment().dayOfYear()
    const offset = today % 110

    const languageWithTranslation = translationsJson[offset]
    const answer = languageWithTranslation['language']['language']
    const answerName = languageWithTranslation['language']['name']
    const sentence = languageWithTranslation['translation']

    const languages = translationsJson.map(str => {
        return {
            language: str.language.language,
            name: str.language.name,
        }
    })
    languages.sort((l1, l2) => l1.name.localeCompare(l2.name))

    const filteredLanguages = languages.filter(l => {
        let notYetGuessed = guesses.find(g => l.name.toLowerCase() === g.languageName.toLowerCase()) === undefined
        let currentGuessMatches = !currentGuess || l.name.toLowerCase().startsWith(currentGuess.toLowerCase())
        return notYetGuessed && currentGuessMatches
    })

    const languageNames = translationsJson.map(str => str['language']['name'])

    if (solved) {
        const jsConfetti = new JSConfetti()
        jsConfetti.addConfetti()
    }

    const handleSubmit = (guess: string) => {
        let guessInLower = guess.toLowerCase()
        if (filteredLanguages.length === 1) {
            guessInLower = filteredLanguages[0].name.toLowerCase()
        }

        if (guesses.find(ln => ln.languageName.toLowerCase() === guessInLower) !== undefined) {
            setError(`You already guessed ${guess}!`)
            setCurrentGuess('')
        } else if (guessInLower.toLowerCase() === answerName.toLowerCase()) {
            setGuesses(guesses.concat({
                languageName: answerName,
                rank: undefined,
            }))
            setSolved(true)
        } else if (languageNames.find(ln => ln.toLowerCase() === guessInLower) === undefined) {
            setError(`${guess} is not in the list of languages!`)
            setCurrentGuess('')
        } else {
            // incorrect guess
            let newGuess = {
                languageName: guessInLower,
                rank: similarityJson.find(row => row.l1 === answerName && row.l2.toLowerCase() === guessInLower)?.value,
            }
            setError(`Guess again!`)
            setGuesses(guesses.concat(newGuess))
            setCurrentGuess('')
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

    // TODO: typeahead?
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
                autoHideDuration={1000}
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
                        <AudioClipPlayer language={answer} onError={() => {
                            setError('Audio unavailable for this language')
                            setAudioPlayerShowing(false)
                        }} />
                        :
                        <strong>Audio unavailable</strong>
                    }
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
            <Grid item>
                <List>
                    {guesses.map((guess, i) => {
                        const language = languages.find(l => l.name.toLowerCase() === guess.languageName.toLowerCase())!
                        const isCorrect = solved && answerName.toLowerCase() === guess.languageName.toLowerCase()

                        return (
                            <ListItem 
                                key={`guess-${i}`} 
                                style={{ margin: 10, width: 400 }}
                                secondaryAction={!isCorrect && <SimilarityIndicator rank={guess.rank} />}
                            >
                                <ListItemIcon>
                                    {isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />}
                                </ListItemIcon>
                                <ListItemText primary={language.name} />
                            </ListItem>
                        )
                    })}
                    {filteredLanguages.map((language, i) => {
                        return (
                            <ListItem 
                                key={`language-${i}`} 
                                style={{ margin: 10 }}
                                button 
                                onClick={() => handleClick(language.name)}
                            >
                                <ListItemIcon>
                                    <QuestionMark />
                                </ListItemIcon>
                                <ListItemText primary={language.name} />
                            </ListItem>
                        )
                    })}
                </List>
            </Grid>
            }
        </Grid>
    )
}
