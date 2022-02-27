import { Button } from "@mui/material"
import { useEffect, useState } from "react"
import { LanguageWithSimilarity } from "./types"

interface HintsContainerProps {
    nativeSpeakers?: string
    origin?: string
    country: string
    relative?: LanguageWithSimilarity
    isMobile: boolean
}

export const HintsContainer = ({ nativeSpeakers, origin, country, relative, isMobile } : HintsContainerProps) => {
    const [showNativeSpeakers, setShowNativeSpeakers] = useState(false)
    const [showLanguageOrigin, setShowLanguageOrigin] = useState(false)
    const [flagUrl, setFlagUrl] = useState<string>()
    const [showFlag, setShowFlag] = useState(false)
    const [showRelative, setShowRelative] = useState(false)

    useEffect(() => {
        try {
            setFlagUrl(require(`./flags/${country.toLowerCase()}.png`))
        } catch (e) {
            console.log(e)
        }
    }, [])
    

    return (
        <>
            {nativeSpeakers && 
                <h4>Number of native speakers: {showNativeSpeakers ? nativeSpeakers : <Button onClick={() => setShowNativeSpeakers(true)}>Show hint</Button>}</h4>
            }
            {origin && 
                <h4>Language origin: {showLanguageOrigin ? origin : <Button onClick={() => setShowLanguageOrigin(true)}>Show hint</Button>}</h4>
            }
            {relative && 
                <h4>Close relative: {showRelative ? `${relative.language} (${relative.similarity}/100)` : <Button onClick={() => setShowRelative(true)}>Show hint</Button>}</h4>
            }
            {flagUrl && 
                <h4>Flag: {showFlag ? <h4><img alt="flag" height={80} src={flagUrl} /></h4> : <Button onClick={() => setShowFlag(true)}>Show hint</Button>}</h4>
            }
        </>
    )
}
