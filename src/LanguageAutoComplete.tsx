import { Autocomplete, TextField } from "@mui/material"
import { Language } from "./types"

interface AutoCompleteProps {
    options: Language[]
    onOpen: () => void
    onSubmit: (value: Language) => void
}

export const LanguageAutoComplete = ({ options, onOpen, onSubmit }: AutoCompleteProps) => {
    const handleChange = (newValue: Language | null) => {
        if (newValue) {
            onSubmit(newValue)
        }
    }

    return (
        <Autocomplete 
            id="language-autocomplete"
            options={options}
            renderInput={params => (
                <TextField {...params} label="Language" variant="outlined" />
            )}
            autoHighlight
            getOptionLabel={option => `${option.name} (${option.country})`}
            onChange={(_event, newValue) => handleChange(newValue)}
            onOpen={() => onOpen()}
        />
    )
}
