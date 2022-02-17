interface CountryInfoProps {
    country: string
    flagIconName?: string
}

export const CountryInfo = ({ country, flagIconName }: CountryInfoProps) => {
    return (
        <>{country}</>
    )
}
