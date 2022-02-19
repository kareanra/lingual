import { InputLabel, FormControl, MenuItem, Select } from "@mui/material"
import { Language } from "./types"

interface LanguageDropdownProps {
    options: Language[]
    onSubmit: (guess: string) => void
}

export const LanguageDropdown = ({ options, onSubmit }: LanguageDropdownProps) => {
    return (
        <FormControl fullWidth>
            <InputLabel id="language-dropdown-label">Language</InputLabel>
            <Select
                labelId="language-dropdown-label"
                id="language-dropdown"
                value={''}
                label="Language"
                onChange={event => onSubmit(event.target.value)}
            >
                {options.map(language => 
                    <MenuItem value={language.name}>{language.name} ({language.country})</MenuItem>
                )}
            </Select>
        </FormControl>
    )
}
