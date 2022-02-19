import { useEffect, useState } from "react"

interface AudioPlayerProps {
    language: string
    onError: () => void
}
  
const AudioPlayer = ({ language, onError }: AudioPlayerProps) => {
  const [url, setUrl] = useState<any>()

  const handleError = (e: any) => {
    console.log(e)
    onError()
  }

  useEffect(() => {
    try {
      setUrl(`http://s3.amazonaws.com/word-puzzles/${language}.mpga`)
    } catch (e) {
      handleError(e)
    }
  }, [])

  return (
    <audio src={url} controls onError={event => handleError(event)} />
  )
}

export default AudioPlayer
