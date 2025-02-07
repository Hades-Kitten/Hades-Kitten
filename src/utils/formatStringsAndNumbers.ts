/**
 * Nation arrays must be in this format in order to work "NATIONA:NATIONB:NATIONC:NATIOND..."
 * @param {string} nationNames - The nations "NATIONA:NATIONB.."
 */
function formatNationsArray(nationNames: string): string {
    const nationsArray = nationNames.replaceAll(":", ",").split(",");
    const formattedNationsArray: string[] = [];


    function formatNationName(nationName: string): string {
        const formattedName = nationName
            .replace(/_/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        return formattedName;
    }


    function formatNationLink(nationName: string): string {
        const formattedName = formatNationName(nationName);
        return `[${formattedName}](https://www.nationstates.net/nation=${nationName})`;
    }

    for (let i = 0; i < nationsArray.length; i++) {
        const trimmedNation = nationsArray[i].trim();
        formattedNationsArray.push(formatNationLink(trimmedNation));
    }

    let formattedString = formattedNationsArray.join(", ");

    if (formattedString.length > 4096) {
        let lastFittingIndex = formattedNationsArray.length - 1;

        while (lastFittingIndex >= 0 && formattedString.length > 4096) {
            formattedString = formattedNationsArray.slice(0, lastFittingIndex).join(", ");
            const lastNation = nationsArray[lastFittingIndex].trim()
            const formattedLastName = formatNationName(lastNation)
            formattedString += `, ${formattedLastName}...`;

            lastFittingIndex--;
        }
    }

    if (formattedString.length > 4096) {
        formattedString = formattedString.substring(0, 4093) + "...";
    }
    return formattedString;
}

/**
 * Formats numbers and decimals. For example: 1000.442 -> 1.4K  
 * @param {number} num - The number
 */
function formatNumber(num: number): string {
    if (num >= 1000000000000) return `${(num / 1000000000000).toFixed(1)}T`;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    if (num >= 10) return `${(num / 10).toFixed(2)}`
    if (num >= 1) return `${(num / 1).toFixed(2)}`
    return num.toString();
}

/**
 * Formats flag that ends with svg to png
 * @param {string} flag - The string MUST be a link to an image. Example: "https://www.nationstates.net/images/flags/Sovereign_Military_Order_of_Malta.png"
 */
function FormatNSFlag(flag: string) {
    if (flag.endsWith('.svg')) return flag = flag.replace('.svg', '.png');
    else return flag = flag;
}

const formatter = { formatNationsArray, formatNumber, FormatNSFlag }

export default formatter;