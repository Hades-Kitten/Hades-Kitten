const { DOMParser, XMLSerializer } = require('@xmldom/xmldom')

module.exports = {
    name: "ready",
    async execute(message, client) {
        async function fetchRecentEvents() {
            let url = `https://www.nationstates.net/cgi-bin/api.cgi?region=milwartia&q=happenings+messages`

            fetch(url, {
                method: "GET",
                headers: {
                    'User-Agent': "node"
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(async data => {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(data, "text/xml");
                    //const serialized = new XMLSerializer().serializeToString(xmlDoc)


                    const regionElement = xmlDoc.getElementsByTagName("REGION")[0];
                    const activityElement = regionElement ? regionElement.getElementsByTagName("HAPPENINGS")[0] : null;
                    const msgElement = regionElement ? regionElement.getElementsByTagName("MESSAGES")[0] : null;

                    const events = activityElement.getElementsByTagName("EVENT")
                    const posts = msgElement.getElementsByTagName("POST")
                    const now = Date.now() / 1000;

                    let recentEventFound = false;
                    
                    for (let i = 0; i < posts.length; i++) {
                        const pollElement = posts[i];
                        const timestamp = pollElement.getElementsByTagName("TIMESTAMP")[0].textContent;
                        let nation = pollElement.getElementsByTagName("NATION")[0].textContent
                        if(nation === "arntina") {
                            nation = "<:arntina:1328892917510705172> **[Arntina](https://www.nationstates.net/nation=arntina)**"
                        }
                        else if(nation === "duminan_federal_union") {
                            nation = "<:arntina:1328892917510705172> **[Duminan Federal Union](https://www.nationstates.net/nation=duminan_federal_union)**"
                        }
                        else if(nation === "gace") {
                            nation = "<:arntina:1328892917510705172> **[Gace](https://www.nationstates.net/nation=gace)**"
                        }
                        else if(nation === "hudilidation") {
                            nation = "<:arntina:1328892917510705172> **[Hudilidation](https://www.nationstates.net/nation=hudilidation)**"
                        }
                        else if(nation === "khls") {
                            nation = "<:arntina:1328892917510705172> **[Khls](https://www.nationstates.net/nation=khls)**"
                        }
                        else if(nation === "kronokracia") {
                            nation = "<:arntina:1328892917510705172> **[Kronokracia](https://www.nationstates.net/nation=kronokracia)**"
                        }
                        else if(nation === "mlemsland") {
                            nation = "<:mlemsland:1328893417387982888>  **[Mlemsland](https://www.nationstates.net/nation=mlemsland)**"
                        }
                        else if(nation === "nossberg") {
                            nation = "<:arntina:1328892917510705172> **[Nossberg](https://www.nationstates.net/nation=nossberg)**"
                        }
                        else if(nation === "preledia") {
                            nation = "<:arntina:1328892917510705172> **[Preledia](https://www.nationstates.net/nation=preledia)**"
                        }
                        else if(nation === "rictas_buggarceasuis") {
                            nation = "<:arntina:1328892917510705172> **[Rictas_buggarceasuis](https://www.nationstates.net/nation=rictas_buggarceasuis)**"
                        }
                        else if(nation === "sorority") {
                            nation = "<:arntina:1328892917510705172> **[Sorority](https://www.nationstates.net/nation=sorority)**"
                        }
                        else if(nation === "valthif") {
                            nation = "<:arntina:1328892917510705172> **[Valthif](https://www.nationstates.net/nation=valthif)**"
                        }
                        else if(nation) {
                            nation = `:${nation}: **[${nation}](**https://www.nationstates.net/nation=${nation}**)`
                        }
                    
                        const eventText = pollElement.getElementsByTagName("MESSAGE")[0].textContent;

                        const eventTime = parseInt(timestamp, 10);
                        const timeDifference = now - eventTime;

                        const channel = client.channels.cache.get("1328858620645081108")

                        if (timeDifference <= 120) {
                            await channel.send(`On <t:${timestamp}> by ${nation}: ${eventText}`);
                            recentEventFound = true;
                        }
                    }

                    for (let i = 0; i < events.length; i++) {
                        const eventElement = events[i];
                        const timestamp = eventElement.getElementsByTagName("TIMESTAMP")[0].textContent;
                        const eventText = eventElement.getElementsByTagName("TEXT")[0].textContent;

                        const eventTime = parseInt(timestamp, 10);
                        const timeDifference = now - eventTime;

                        const channel = client.channels.cache.get("1328858620645081108")
                        if (timeDifference <= 120) {
                            await channel.send(`<t:${timestamp}>: ${eventText}`);
                            recentEventFound = true;
                        }
                    }

                    if (!recentEventFound) {
                        return;
                    }
                })
        }
        setInterval(fetchRecentEvents, 120000);
    }
}
