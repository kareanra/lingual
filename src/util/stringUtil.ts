export const equalIgnoreCase = (s1: string, s2: string) => 
    s1.toLowerCase() === s2.toLowerCase()

export const startsWithIgnoreCase = (s: string, prefix: string) => 
    s.toLowerCase().startsWith(prefix.toLowerCase())
