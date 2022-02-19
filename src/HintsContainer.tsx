import { Button } from "@mui/material"
import { useState } from "react"

interface HintsContainerProps {
    nativeSpeakers?: string
    origin?: string
    country: string
    isMobile: boolean
}

export const HintsContainer = ({ nativeSpeakers, origin, country, isMobile } : HintsContainerProps) => {
    const [showNativeSpeakers, setShowNativeSpeakers] = useState(false)
    const [showLanguageOrigin, setShowLanguageOrigin] = useState(false)
    const [showFlag, setShowFlag] = useState(false)

    const flagUrl = require(`./flags/${country.toLowerCase()}.png`)

    return (
        <>
            {nativeSpeakers && 
                <h4>Number of native speakers: {showNativeSpeakers ? nativeSpeakers : <Button onClick={() => setShowNativeSpeakers(true)}>Show hint</Button>}</h4>
            }
            {origin && 
                <h4>Language origin: {showLanguageOrigin ? origin : <Button onClick={() => setShowLanguageOrigin(true)}>Show hint</Button>}</h4>
            }
            <h4>Flag: {!showFlag && <Button onClick={() => setShowFlag(true)}>Show hint</Button>}</h4>
            {showFlag && <img alt="flag" height={80} src={flagUrl} />}
        </>
    )
}
