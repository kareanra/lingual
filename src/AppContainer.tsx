import { Cancel, CheckCircle, QuestionMark } from "@mui/icons-material"
import { Alert, Button, FormGroup, InputAdornment, List, ListItem, ListItemIcon, ListItemText, Paper, Snackbar, TextField, Typography } from "@mui/material"
import { Box } from "@mui/system"
import JSConfetti from "js-confetti"
import moment from "moment"
import { useState } from "react"
import AudioClipPlayer from "./AudioClipPlayer"
import translationsJson from "./translations.json"

export const AppContainer = () => {
    const [guesses, setGuesses] = useState<string[]>([])
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

    const filteredLanguages = languages.filter(l => 
        guesses.find(g => l.name.toLowerCase() === g) === undefined && (!currentGuess || l.name.toLowerCase().startsWith(currentGuess))
    )

    const languageNames = translationsJson.map(str => str['language']['name'])

    if (solved) {
        const jsConfetti = new JSConfetti()
        jsConfetti.addConfetti()
    }

    const handleSubmit = () => {
        let guessInLower = currentGuess.toLowerCase()
        if (filteredLanguages.length === 1) {
            guessInLower = filteredLanguages[0].name.toLowerCase()
        }

        if (guesses.find(ln => ln === guessInLower) !== undefined) {
            setError(`You already guessed ${currentGuess}!`)
            setCurrentGuess('')
        } else if (guessInLower.toLowerCase() === answerName.toLowerCase()) {
            setGuesses(guesses.concat(guessInLower))
            setSolved(true)
        } else if (languageNames.find(ln => ln.toLowerCase() === guessInLower) === undefined) {
            setError(`${currentGuess} is not in the list of languages!`)
            setCurrentGuess('')
        } else {
            // incorrect guess
            setError(`Guess again!`)
            setGuesses(guesses.concat(guessInLower))
            setCurrentGuess('')
        }
    }

    const handleKeyPress = (e: any) => {
        if (e.key === 'Enter' && currentGuess !== '') {
            handleSubmit()
        }
    }

    // TODO: typeahead?
    return <>
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

        <Box>
            <Typography color="textPrimary">
                Try to guess the language in the fewest possible guesses! In English the sentence is 
            </Typography>
            <h3><i>What language is this?</i></h3>
        </Box>

        {sentence ?
            <Paper>
                <Typography color="textPrimary">
                    Translated (by Google) into the mystery language, the sentence is:
                </Typography>
                <h2>{sentence}</h2>
                {audioPlayerShowing &&
                    <AudioClipPlayer language={answer} onError={() => setAudioPlayerShowing(false)} />
                }
                {solved ? <h2>{answerName}</h2> : 
                    <FormGroup row>
                        <TextField 
                            value={currentGuess} 
                            onChange={event => setCurrentGuess(event.target.value)} 
                            autoFocus 
                            onKeyPress={e => handleKeyPress(e)} 
                            InputProps={
                                {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button 
                                                variant="contained" 
                                                onClick={() => handleSubmit()} disabled={currentGuess === ''} 
                                                disableElevation
                                            >Guess</Button>
                                        </InputAdornment>
                                    )
                                }
                            }
                        />
                    </FormGroup>
                }
            </Paper>
        :
            <Paper>
                <Typography color="textSecondary">
                    Loading translation...
                </Typography>
            </Paper>
        }
        {languages &&
            <List>
                {guesses.map((guess, i) => {
                    const language = languages.find(l => l.name.toLowerCase() === guess)!
                    const isCorrect = solved && answerName.toLowerCase() === guess

                    return (
                        <ListItem key={`guess-${i}`}>
                            <ListItemIcon>
                                {isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />}
                            </ListItemIcon>
                            <ListItemText primary={language.name} />
                        </ListItem>
                    )
                })}
                {filteredLanguages.map((language, i) => {
                    return (
                        <ListItem key={`language-${i}`}>
                            <ListItemIcon>
                                <QuestionMark />
                            </ListItemIcon>
                            <ListItemText primary={language.name} />
                        </ListItem>
                    )
                })}
            </List>
        }
    </>
}
