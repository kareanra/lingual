import { Cancel, CheckCircle, QuestionMark } from "@mui/icons-material"
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material"
import { CountryInfo } from "./CountryInfo"
import { SimilarityIndicator } from "./SimilarityIndicator"
import { Guess, Language } from "./types"
import { equalIgnoreCase } from "./util/stringUtil"

interface LanguageListProps {
    guesses: Guess[]
    filteredLanguages: Language[]
    solved: boolean
    answer: Language
    handleClick: (languageName: string) => void
}

export const LanguageList = ({ 
    guesses, 
    filteredLanguages, 
    solved,
    answer,
    handleClick,
}: LanguageListProps) => {
    return (
        <List>
            {guesses.map((guess, i) => {
                const isCorrect = solved && equalIgnoreCase(answer.name, guess.language.name)

                return (
                    <ListItem 
                        key={`guess-${i}`} 
                        style={{ margin: 10, width: 380 }}
                        secondaryAction={!isCorrect && <SimilarityIndicator rank={guess.rank} />}
                    >
                        <ListItemIcon>
                            {isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />}
                        </ListItemIcon>
                        <ListItemText primary={guess.language.name} secondary={<CountryInfo country={guess.language.country} />} />
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
                        <ListItemText primary={language.name} secondary={<CountryInfo country={language.country} />} />
                    </ListItem>
                )
            })}
        </List>
    )
}
