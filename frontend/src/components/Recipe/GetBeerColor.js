export const getBeerColor = (EBC) => {
    if (EBC >= 0 && EBC <= 2) return "#FFE699"; // Muito clara, quase transparente
    if (EBC <= 4) return "#FFE37A"; // Amarelo palha claro
    if (EBC <= 6) return "#FFD878"; // Amarelo dourado
    if (EBC <= 8) return "#FFCA5A"; // Dourado claro
    if (EBC <= 10) return "#FFBF42"; // Dourado padrão
    if (EBC <= 12) return "#FFB742"; // Dourado intenso
    if (EBC <= 14) return "#FFA846"; // Laranja claro
    if (EBC <= 17) return "#F49C44"; // Laranja médio
    if (EBC <= 20) return "#E98F36"; // Âmbar claro
    if (EBC <= 23) return "#D77A32"; // Âmbar médio
    if (EBC <= 26) return "#BF5B23"; // Âmbar escuro
    if (EBC <= 29) return "#A64F1E"; // Marrom claro
    if (EBC <= 32) return "#8E3C1A"; // Marrom médio
    if (EBC <= 35) return "#6F2F1A"; // Marrom avermelhado
    if (EBC <= 40) return "#5D2614"; // Marrom escuro
    if (EBC <= 45) return "#4E1F0D"; // Marrom intenso
    if (EBC <= 50) return "#3B1E0E"; // Preto com reflexos marrons
    if (EBC <= 55) return "#2E160B"; // Preto com bordas marrons
    if (EBC <= 60) return "#26150C"; // Preto opaco com reflexos suaves
    if (EBC <= 70) return "#1C1009"; // Preto profundo com bordas marrons
    if (EBC <= 80) return "#16100C"; // Preto intenso e opaco
    if (EBC <= 90) return "#0F0D08"; // Preto muito profundo
    if (EBC <= 100) return "#080707"; // Preto absoluto
    return "#000000"; // Preto total, sem reflexos
};