import { Grid, Typography } from "@mui/material";

interface HeaderProps {
    isMobile: boolean
}

export const Header = ({ isMobile } : HeaderProps) => (
    <>
        {isMobile ? <br/> : 
        <>
            <h2>Lingual</h2>
            <h4>(I'm a backend engineer, in case you couldn't tell)</h4>
        </>
        }

        <Grid item xs={6}>
            <Typography color="textPrimary">
                Try to guess the language in the fewest possible guesses!
                <br/> 
                In English the sentence is 
            </Typography>
            <h3>What language is this?</h3>
        </Grid>   
    </>
)
