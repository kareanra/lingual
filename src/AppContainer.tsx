import { Cancel, CheckCircle, QuestionMark } from "@mui/icons-material"
import { Alert, Button, FormGroup, InputAdornment, List, ListItem, ListItemIcon, ListItemText, Paper, Snackbar, TextField, Typography } from "@mui/material"
import { Box } from "@mui/system"
import JSConfetti from "js-confetti"
import moment from "moment"
import { useEffect, useState } from "react"
import { getLanguages, Language, translate } from "./api"

export const AppContainer = () => {
    const [guesses, setGuesses] = useState<string[]>([])
    const [currentGuess, setCurrentGuess] = useState<string>('')
    const [solved, setSolved] = useState(false)
    const [sentence, setSentence] = useState<string>()
    const [languages, setLanguages] = useState<Language[]>([])
    const [error, setError] = useState<string>()

    const indices = [
        37, 38, 84, 48, 96, 103, 43, 88, 35, 71, 54, 85, 80, 
        90, 25, 62, 58, 83, 16, 45, 87, 52, 41, 74, 77, 72, 
        1, 69, 15, 47, 53, 18, 27, 2, 79, 81, 89, 6, 49, 63, 
        97, 24, 55, 21, 73, 4, 44, 59, 105, 102, 61, 92, 75, 
        13, 36, 76, 0, 11, 99, 3, 8, 22, 28, 98, 40, 106, 31, 
        57, 29, 50, 10, 82, 12, 86, 14, 39, 68, 65, 46, 64, 70, 
        32, 17, 95, 5, 26, 23, 19, 109, 30, 56, 33, 101, 93, 91, 
        78, 67, 60, 108, 42, 100, 110, 7, 104, 66, 107, 51, 
        34, 20, 9, 94
    ]

    const today = moment().dayOfYear()
    const offset = today % 110

    const answer = languages[indices[offset]]

    const languageNames = languages.map(l => l.name.toLowerCase())

    if (solved) {
        const jsConfetti = new JSConfetti()
        jsConfetti.addConfetti()
    }

    const handleSubmit = () => {
        const guessInLower = currentGuess.toLowerCase()

        if (guesses.find(ln => ln === guessInLower) !== undefined) {
            setError(`You already guessed ${currentGuess}!`)
            setCurrentGuess('')
        } else if (guessInLower.toLowerCase() === answer?.name.toLowerCase()) {
            setGuesses(guesses.concat(guessInLower))
            setSolved(true)
        } else if (languageNames.find(ln => ln === guessInLower) === undefined) {
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

    useEffect(() => {
        if (answer) {
            translate(answer.language)
                .then(sentence => {
                    setSentence(sentence)
                })
        } else {
            getLanguages()
                .then(languages => {
                    let filtered = languages.filter(l => l.language !== 'en')
                    setLanguages(filtered)
                })
        }
    }, [answer])

    // TODO: typeahead for language? flag icons? maybe flag just for correct answer
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
            <h3><i>I wonder what language this is</i></h3>
        </Box>

        {sentence ?
            <Paper>
                <Typography color="textPrimary">
                    Translated (by Google) into the mystery language, the sentence is:
                </Typography>
                <h2>{sentence}</h2>
                {solved ? <h2>{answer.name}</h2> : 
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
                    const isCorrect = solved && answer.name.toLowerCase() === guess

                    return (
                        <ListItem key={`guess-${i}`}>
                            <ListItemIcon>
                                {isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />}
                            </ListItemIcon>
                            <ListItemText primary={language.name} />
                        </ListItem>
                    )
                })}
                {languages.filter(l => guesses.find(g => l.name.toLowerCase() === g) === undefined).map((language, i) => {
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
