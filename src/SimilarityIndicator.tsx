import { CircularProgress, Tooltip } from "@mui/material"

interface SimilarityIndicatorProps {
    rank?: number
}

export const SimilarityIndicator = ({ rank }: SimilarityIndicatorProps) => {
    const adjustedRank = rank ? Math.round(100 - rank) : undefined

    return adjustedRank ?
        <Tooltip title={`Lexical similarity: ${adjustedRank}/100 (source: http://www.elinguistics.net/)`}>
            <CircularProgress
                color="success"
                variant="determinate"
                size={20}
                thickness={8}
                value={adjustedRank}
            />
        </Tooltip>
        :
        <strong>[No similarity data]</strong>
}
