import ReactAudioPlayer from "react-audio-player"

interface AudioClipPlayerProps {
    language: string
    text: string
    onAudioPlayerError: () => void
}

export const AudioClipPlayer = ({ language, text, onAudioPlayerError }: AudioClipPlayerProps) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}-${language.toUpperCase()}&client=tw-ob&q=${encodeURIComponent(text)}`

    return (
        <ReactAudioPlayer
            src={url}
            controls
            onError={() => onAudioPlayerError()}
        />
    )
}
