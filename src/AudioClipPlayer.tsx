import { VolumeUp } from "@mui/icons-material";
import { IconButton } from "@mui/material";

interface AudioClipPlayerProps {
    language: string
    onError: () => void
}
  
const AudioClipPlayer = ({ language, onError }: AudioClipPlayerProps) => {
  const url = `http://s3.amazonaws.com/word-puzzles/${language}.mpga`
  const audio = new Audio(url)

  const playAudio = async () => {
    try {
      await audio.play()
    } catch (err) {
      console.log(err)
      onError()
    }
  }

  return (
    <IconButton
      aria-label="play"
      onClick={() => playAudio()}
      size="large">
        <VolumeUp />
    </IconButton>
  )
}

export default AudioClipPlayer
