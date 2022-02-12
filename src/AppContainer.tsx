import { Cancel, CheckCircle, QuestionMark } from "@mui/icons-material"
import { Alert, Button, FormGroup, List, ListItem, ListItemIcon, ListItemText, Paper, Snackbar, TextField, Typography } from "@mui/material"
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

    const today = moment().dayOfYear()
    const offset = today % 111

    const answer = languages[offset]

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
                    setLanguages(languages)
                })
        }
    }, [answer])

    // TODO: typeahead for language? flag icons? maybe flag just for correct answer
    return <>
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
        {sentence ?
            <Paper>
                <h2>{sentence}</h2>
                {solved ? <h2>{answer.name}</h2> : 
                    <FormGroup row>
                        <TextField 
                            value={currentGuess} 
                            onChange={event => setCurrentGuess(event.target.value)} 
                            autoFocus 
                            onKeyPress={e => handleKeyPress(e)} 
                        />
                        <Button 
                            variant="contained" 
                            onClick={() => handleSubmit()} disabled={currentGuess === ''} 
                            disableElevation
                        >Submit guess</Button>
                    </FormGroup>
                }
            </Paper>
        :
            <Paper>
                <Typography color="textSecondary">
                    Loading...
                </Typography>
            </Paper>
        }
        {languages &&
            <List>
                {guesses.map(guess => {
                    const language = languages.find(l => l.name.toLowerCase() === guess)!
                    const isCorrect = solved && answer.name.toLowerCase() === guess

                    return (
                        <ListItem>
                            <ListItemIcon>
                                {isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />}
                            </ListItemIcon>
                            <ListItemText primary={language.name} />
                        </ListItem>
                    )
                })}
                {languages.filter(l => guesses.find(g => l.name.toLowerCase() === g) === undefined).map(language => {
                    return (
                        <ListItem>
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
