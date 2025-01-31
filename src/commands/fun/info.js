const { DOMParser } = require('@xmldom/xmldom');

//Imports
const discord = require("discord.js");
const { ButtonStyle, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("khls")
        .addStringOption(s => s
            .setName("type")
            .setDescription("region or country")
            .addChoices(
                { name: "nation", value: "nation" },
                { name: "region", value: "region" }
            )
            .setRequired(true)
        )
        .addStringOption(s => s
            .setName("name")
            .setDescription("Name of the country/region")
            .setRequired(true)
        )
        .setDMPermission(false),
    async execute(interaction, client) {
        const type = interaction.options.getString("type")
        const name = interaction.options.getString("name")

        let Totalpages = 5
        let page = 1;

        function updatePage(newPage) {
            page = newPage;
        }

        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`info:previous:${page}`)
                .setLabel(`Previous`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId(`info:next:${page}`)
                .setLabel(`Next`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === Totalpages)
        );

        const select = new StringSelectMenuBuilder()
            .setCustomId('row')
            .setPlaceholder('Choose or choose chooses you.')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('General Information')
                    .setDescription('General Information about the Nation')
                    .setValue('general'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Economy')
                    .setDescription('Check the Economy')
                    .setValue('economy'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Expenditure')
                    .setDescription('Check the Expenditure')
                    .setValue('expenditure'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Policies')
                    .setDescription('Check the Nation\'s policies')
                    .setValue('policies'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Factbooks')
                    .setDescription('Factbooks and Dispatches of the Country')
                    .setValue('factbooks'),
            );
        const row = new discord.ActionRowBuilder()
            .addComponents(select);

        if (type === "nation") {
            const url = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${name}&q=name+tax+majorindustry+region+influence+industrydesc+demonym+banner+foundedtime+capital+tax+leader+religion+region+census+flag+currency+fullname+freedom+motto+factbooklist+policies+govt+sectors&scale=1+48+72+4+73+74+3+76`

            fetch(url, {
                method: "GET",
                headers: {
                    'User-Agent': "node"
                }
            })
                .then(async response => {
                    if (!response.ok) {
                        const embed = new EmbedBuilder()
                            .setDescription(`**:warning: A HTML Error occured while executing this command! Status: ${response.status}**`)
                            .setColor("Red")
                        return await interaction.reply({ embeds: [embed], ephemeral: true })
                    }
                    return response.text();
                })
                .then(async (data) => {
                    console.log("here!");
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(data, "text/xml");
                    //const serialized = new XMLSerializer().serializeToString(xmlDoc)

                    const nationElement = xmlDoc.getElementsByTagName("NATION")[0];

                    const nameElement = nationElement ? nationElement.getElementsByTagName("NAME")[0] : null;
                    const nationName = nameElement ? nameElement.textContent : "Unknown";

                    const urlnameElement = nationElement ? nationElement.getAttribute("id") : null;


                    const fnElement = nationElement ? nationElement.getElementsByTagName("FULLNAME")[0] : null;
                    const fullname = fnElement ? fnElement.textContent : "Unknown";


                    const flagElement = nationElement ? nationElement.getElementsByTagName("FLAG")[0] : null;
                    let flag = flagElement ? flagElement.textContent : "Unknown";
                    if (flag.endsWith('.svg')) {
                        flag = flag.replace('.svg', '.png')
                    } else {
                        flag = flag
                    }

                    const mottoElement = nationElement ? nationElement.getElementsByTagName("MOTTO")[0] : null;
                    const motto = mottoElement ? mottoElement.textContent : "Unknown";

                    const bannerElement = nationElement ? nationElement.getElementsByTagName("BANNER")[0] : null;
                    const banner = bannerElement ? bannerElement.textContent : "Unknown";


                    const capitalElement = nationElement ? nationElement.getElementsByTagName("CAPITAL")[0] : null;
                    const capital = capitalElement ? capitalElement.textContent : "Unknown";

                    const currencyElement = nationElement ? nationElement.getElementsByTagName("CURRENCY")[0] : null;
                    const currency = currencyElement ? currencyElement.textContent : "Unknown";

                    const leaderElement = nationElement ? nationElement.getElementsByTagName("LEADER")[0] : null;
                    const leader = leaderElement ? leaderElement.textContent : "John F. Kennedy";

                    const religionElement = nationElement ? nationElement.getElementsByTagName("RELIGION")[0] : null;
                    const religion = religionElement ? religionElement.textContent : "Whatever my parents believe in";

                    const ftElement = nationElement ? nationElement.getElementsByTagName("FOUNDEDTIME")[0] : null;
                    const foundedTime = ftElement ? ftElement.textContent : "Unknown";

                    const industrydescElement = nationElement ? nationElement.getElementsByTagName("INDUSTRYDESC")[0] : null;
                    const industrydesc = industrydescElement ? industrydescElement.textContent : "Unknown";

                    const demonymElement = nationElement ? nationElement.getElementsByTagName("DEMONYM")[0] : null;
                    const demonym = demonymElement ? demonymElement.textContent : "Unknown";

                    const freedomElement = nationElement ? nationElement.getElementsByTagName("FREEDOM")[0] : null;
                    const civilElement = freedomElement ? freedomElement.getElementsByTagName("CIVILRIGHTS")[0] : null;
                    const civilrights = civilElement ? civilElement.textContent : " Unknown";

                    const economyElement = freedomElement ? freedomElement.getElementsByTagName("ECONOMY")[0] : null;
                    const economy = economyElement ? economyElement.textContent : " Unknown";

                    const politicalfreedomElement = freedomElement ? freedomElement.getElementsByTagName("POLITICALFREEDOM")[0] : null;
                    const politicalfreedom = politicalfreedomElement ? politicalfreedomElement.textContent : " Unknown";

                    const regionElement = nationElement ? nationElement.getElementsByTagName("REGION")[0] : null;
                    const region = regionElement ? regionElement.textContent : " Unknown";

                    const influenceElement = nationElement ? nationElement.getElementsByTagName("INFLUENCE")[0] : null;
                    const influence = influenceElement ? influenceElement.textContent : " Unknown";

                    const govElement = nationElement ? nationElement.getElementsByTagName("GOVT")[0] : null;

                    const adminsitrationElement = govElement ? govElement.getElementsByTagName("ADMINISTRATION")[0] : null;
                    const defenceElement = govElement ? govElement.getElementsByTagName("DEFENCE")[0] : null;
                    const educationElement = govElement ? govElement.getElementsByTagName("EDUCATION")[0] : null;
                    const environmentElement = govElement ? govElement.getElementsByTagName("ENVIRONMENT")[0] : null;
                    const healthcareElement = govElement ? govElement.getElementsByTagName("HEALTHCARE")[0] : null;
                    const commerceElement = govElement ? govElement.getElementsByTagName("COMMERCE")[0] : null;
                    const internationalaidElement = govElement ? govElement.getElementsByTagName("INTERNATIONALAID")[0] : null;
                    const lawandorderelement = govElement ? govElement.getElementsByTagName("LAWANDORDER")[0] : null;
                    const publicTransportElement = govElement ? govElement.getElementsByTagName("PUBLICTRANSPORT")[0] : null;
                    const socialEqualityElement = govElement ? govElement.getElementsByTagName("SOCIALEQUALITY")[0] : null;
                    const spriritualityElement = govElement ? govElement.getElementsByTagName("SPIRITUALITY")[0] : null;
                    const welfareElement = govElement ? govElement.getElementsByTagName("WELFARE")[0] : null;

                    const sectorsElement = nationElement ? nationElement.getElementsByTagName("SECTORS")[0] : null;
                    const govRateElement = sectorsElement ? sectorsElement.getElementsByTagName("GOVERNMENT")[0] : null;
                    const govRate = govRateElement ? govRateElement.textContent : "Unknown";

                    const policiesElement = nationElement ? nationElement.getElementsByTagName("POLICIES")[0] : null;
                    const policyElement = policiesElement ? policiesElement.getElementsByTagName("POLICY") : [];

                    const majorindustryElement = nationElement ? nationElement.getElementsByTagName("MAJORINDUSTRY")[0] : null;
                    const majorindustry = majorindustryElement ? majorindustryElement.textContent : "Unknown";

                    const taxElement = nationElement ? nationElement.getElementsByTagName("TAX")[0] : null;
                    const tax = taxElement ? taxElement.textContent : "Unknown";

                    let factbookembed = [""]

                    const minifactbooksElement = nationElement ? nationElement.getElementsByTagName("FACTBOOKLIST")[0] : null;
                    if (minifactbooksElement.childNodes.length > 0 ) {
                        const factbooksElement = minifactbooksElement ? minifactbooksElement.getElementsByTagName("FACTBOOK") : "Unknown";

                        for (let i = 0; i < factbooksElement.length; i++) {
                            const id = factbooksElement[i] ? factbooksElement[i].getAttribute("id") : "Unknown";

                            const title = factbooksElement[i].getElementsByTagName("TITLE")[0].textContent
                            const extractedTitle = title.replace(/<!\[CDATA\[\]\]>/, '').trim();

                            const subcat = factbooksElement[i].getElementsByTagName("SUBCATEGORY")[0].textContent

                            factbookembed += [
                                `-> **[${extractedTitle} - ${subcat}](https://www.nationstates.net/nation=${urlnameElement}/detail=factbook/id=${id})**`
                            ].join('\n') + "\n"
                            if (factbookembed.length > 4090) {
                                factbookembed = factbookembed.toString().substring(0, 4090)
                            }
                        }
                    } else {
                        factbookembed += ["Unknown"]
                    }

                    let policyembed = [""];
                    let economicsystem = "";
                    for (let i = 0; i < policyElement.length; i++) {
                        const name = policyElement[i].getElementsByTagName("NAME")[0].textContent;
                        const category = policyElement[i].getElementsByTagName("CAT")[0].textContent;
                        const desc = policyElement[i].getElementsByTagName("DESC")[0].textContent;

                        policyembed += [
                            `**${name} - ${category}**`,
                            `--> ${desc}`
                        ].join('\n') + "\n";

                        if (name == "Capitalism") {
                            economicsystem = ":dollar: Capitalism - an economic and political system in which property, business, and industry are controlled by private owners rather than by the state, with the purpose of making a profit";
                        } else if (name === "Socialism") {
                            economicsystem = ":classical_building: Socialism - a social and economic doctrine that calls for public rather than private ownership or control of property and natural resources.";
                        }
                    };
                    const censusElement = nationElement ? nationElement.getElementsByTagName("CENSUS")[0] : null;
                    const scaleElements = censusElement ? censusElement.getElementsByTagName("SCALE") : [];

                    let economy2 = "";
                    let ecofre = "";
                    let nomgdp = "";
                    let nomgdppercap = "";
                    let populationcensus = "";
                    let poorincome = "";
                    let richincome = "";
                    let wealthgaps = "";

                    for (let i = 0; i < scaleElements.length; i++) {
                        let scale = scaleElements[i].getAttribute("id");
                        const scoreElement = scaleElements[i].getElementsByTagName("SCORE")[0];
                        const score = scoreElement ? scoreElement.textContent : 1;

                        if (scale == "1") {
                            economy2 = score;
                        } else if (scale === "48") {
                            ecofre = score;
                        } else if (scale === "76") {
                            nomgdp = score;
                        } else if (scale === "72") {
                            nomgdppercap = score
                        } else if (scale === "3") {
                            populationcensus = score
                        } else if (scale === "73") {
                            poorincome = score
                        } else if (scale === "74") {
                            richincome = score
                        } else if (scale === "4") {
                            wealthgaps = score
                        }
                    };
                    let ppp = (economy2 / 75) * (Math.pow(Math.pow((ecofre / 500), 2), 0.5) + 1)
                    let GPPP = ppp * nomgdp

                    const factbooksEmbed = new EmbedBuilder()
                        .setTitle("Factbooks")
                        .setDescription(factbookembed || "No Factbooks, only fat Citizens")
                        .setFooter({ text: "5/5", iconURL: flag })
                    const expenditureEmbed = new EmbedBuilder()
                        .setTitle(`Expenditure of ${nationName}`)
                        .setDescription(`About ${govRate}% of ${formatNumberWithCommas(nomgdp)} Nominal GDP is spent on expenditures (${formatNumberWithCommas(Math.round(nomgdp * (govRate / 100)))} Nominal GDP)`)
                        .addFields(
                            { name: "Administration", value: adminsitrationElement ? adminsitrationElement.textContent : "Unknown", inline: true },
                            { name: "Defence", value: defenceElement ? defenceElement.textContent : "Unknown", inline: true },
                            { name: "Education", value: educationElement ? educationElement.textContent : "Unknown", inline: true },
                            { name: "Environment", value: environmentElement ? environmentElement.textContent : "Unknown", inline: true },
                            { name: "Healthcare", value: healthcareElement ? healthcareElement.textContent : "Unknown", inline: true },
                            { name: "Commerce", value: commerceElement ? commerceElement.textContent : "Unknown", inline: true },
                            { name: "International Aid", value: internationalaidElement ? internationalaidElement.textContent : "Unknown", inline: true },
                            { name: "Law and Order", value: lawandorderelement ? lawandorderelement.textContent : "Unknown", inline: true },
                            { name: "Public Transport", value: publicTransportElement ? publicTransportElement.textContent : "Unknown", inline: true },
                            { name: "Social Equality", value: socialEqualityElement ? socialEqualityElement.textContent : "Unknown", inline: true },
                            { name: "Sprirituality", value: spriritualityElement ? spriritualityElement.textContent : "Unknown", inline: true },
                            { name: "Welfare", value: welfareElement ? welfareElement.textContent : "Unknown", inline: true },
                        )
                        .setFooter({ text: "3/5", iconURL: flag })
                    const policiesEmbed = new EmbedBuilder()
                        .setTitle("Policies")
                        .setDescription(policyembed)
                        .setFooter({ text: "4/5", iconURL: flag })
                    const economyEmbed = new EmbedBuilder()
                        .setTitle(`Economy of ${nationName}`)
                        .setDescription(`The economic system of ${nationName} is ${economicsystem}\n\n${industrydesc}`)
                        .addFields(
                            { name: "**GDP (Nominal)**", value: formatNumberWithCommas(Math.round(nomgdp)) },
                            { name: "**GDP Per Capita (Nominal)**", value: formatNumberWithCommas(parseInt(nomgdppercap).toFixed(2)) },
                            { name: "**Average Income of Poor (Nominal)**", value: formatNumberWithCommas(parseInt(poorincome).toFixed(2)), inline: true },
                            { name: "**Average Income of Rich (Nominal)**", value: formatNumberWithCommas(parseInt(richincome).toFixed(2)), inline: true },
                            { name: "**Economic Freedom**", value: formatNumberWithCommas(ecofre) },
                            { name: "**Economy**", value: formatNumberWithCommas(economy2) },
                            { name: "**Purchasing Power Parity (PPP)**", value: `$ ${formatNumberWithCommas((ppp.toFixed(2)))}` },
                            { name: "**GDP PPP**", value: `$ ${formatNumberWithCommas(Math.round(GPPP))}` },
                            { name: "**GDP PPP Per Capita**", value: `$ ${formatNumberWithCommas((GPPP / populationcensus).toFixed(2))}` },
                            { name: "**Average Income of Poor (PPP)**", value: formatNumberWithCommas(parseInt(poorincome * ppp).toFixed(2)), inline: true },
                            { name: "**Average Income of Rich (PPP)**", value: formatNumberWithCommas(parseInt(richincome * ppp).toFixed(2)), inline: true },
                            { name: "**Wealth gap**", value: wealthgaps, inline: true },
                            { name: "**Tax Rates**", value: tax, inline: true },
                            { name: "**:factory: Major Industry**", value: majorindustry },
                        )
                        .setFooter({ text: 'Page 2/5', iconURL: flag })
                    const embed = new EmbedBuilder()
                        .setTitle(fullname)
                        .setAuthor({ name: nationName, iconURL: flag })
                        .setDescription(motto)
                        .addFields([
                            { name: "Civil Rights", value: civilrights, inline: true },
                            { name: "Economy", value: economy, inline: true },
                            { name: "Political Freedom", value: politicalfreedom, inline: true },
                            { name: "Capital", value: capital, inline: true },
                            { name: "Population", value: formatNumberWithCommas(populationcensus), inline: true },
                            { name: "Currency", value: currency, inline: true },
                            { name: "Leader", value: leader, inline: true },
                            { name: "Religion", value: religion, inline: true },
                            { name: "Demonym", value: demonym, inline: true },
                            { name: "Region", value: `[${region}](https://www.nationstates.net/region=${region})`, inline: true },
                            { name: "Regional Infuence", value: `${influence}`, inline: true }
                        ])
                        .setImage(`https://www.nationstates.net/images/banners/${banner}.jpg`)
                        .setTimestamp(new Date(foundedTime * 1000))
                        .setFooter({ text: `Page: 1/5 | Founded on`, iconURL: flag })

                    const msg = await interaction.reply({ embeds: [embed], components: [buttonRow, row] });

                    const buttonCollector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 });
                    const actionRowCollector = msg.createMessageComponentCollector({ componentType: ComponentType.SelectMenu, time: 600000 });

                    buttonCollector.on('collect', async i => {
                        const { customId } = i
                        if (i.user.id === interaction.user.id) {
                            if (customId && customId.startsWith("info:")) {
                                if (customId.startsWith("info:next:")) {
                                    updatePage(page + 1);
                                }

                                else if (customId.startsWith(`info:previous:`)) {
                                    updatePage(page - 1);
                                }
                            }
                        } else {
                            const embed = new EmbedBuilder()
                                .setDescription("**:warning: Only the user of this command can use this button!**")
                                .setColor("Red")
                            return await i.reply({ embeds: [embed], ephemeral: true })
                        }

                        const buttonRow2 = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`info:previous:${page}`)
                                .setLabel(`Previous`)
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(page === 1),
                            new ButtonBuilder()
                                .setCustomId(`info:next:${page}`)
                                .setLabel(`Next`)
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(page === Totalpages)
                        );

                        if (page === 1) {
                            await i.update({ embeds: [embed], components: [buttonRow2, row] })
                        }
                        if (page === 2) {
                            await i.update({ embeds: [economyEmbed], components: [buttonRow2, row] })
                        } else if (page === 3) {
                            await i.update({ embeds: [expenditureEmbed], components: [buttonRow2, row] })
                        } else if (page === 4) {
                            await i.update({ embeds: [policiesEmbed], components: [buttonRow2, row] })
                        } else if (page === 5) {
                            await i.update({ embeds: [factbooksEmbed], components: [buttonRow2, row] })
                        }
                    });
                    actionRowCollector.on('collect', async i => {
                        const { values, value, customId } = i

                        if (i.user.id === interaction.user.id) {
                            if (customId === "row") {
                                updatePage(i.values[0] === "general" ? 1 : i.values[0] === "economy" ? 2 : i.values[0] === "expenditure" ? 3 : i.values[0] === "policies" ? 4 : 5);

                                const buttonRow2 = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`info:previous:${page}`)
                                        .setLabel(`Previous`)
                                        .setStyle(ButtonStyle.Primary)
                                        .setDisabled(page === 1),
                                    new ButtonBuilder()
                                        .setCustomId(`info:next:${page}`)
                                        .setLabel(`Next`)
                                        .setStyle(ButtonStyle.Primary)
                                        .setDisabled(page === Totalpages)
                                );

                                if (values[0] === "general") {
                                    await i.update({ embeds: [embed], components: [buttonRow2, row] })
                                } else if (values[0] === "economy") {
                                    await i.update({ embeds: [economyEmbed], components: [buttonRow2, row] })
                                }
                                else if (values[0] === "expenditure") {
                                    await i.update({ embeds: [expenditureEmbed], components: [buttonRow2, row] })
                                }
                                else if (values[0] === "policies") {
                                    await i.update({ embeds: [policiesEmbed], components: [buttonRow2, row] })
                                } else if (values[0] === "factbooks") {
                                    await i.update({ embeds: [factbooksEmbed], components: [buttonRow2, row] })
                                }
                            }
                        } else {
                            const embed = new EmbedBuilder()
                                .setDescription("**:warning: Only the user of this command can use this button!**")
                                .setColor("Red")
                            return await i.reply({ embeds: [embed], ephemeral: true })
                        }
                    });
                })
        } else if (type === "region") {
            const url = `https://www.nationstates.net/cgi-bin/api.cgi?region=${name}&q=name+flag+bannerurl+power+numnations+nations+embassies+foundedtime+governor+officers+delegate+wanations`
            fetch(url, {
                method: "GET",
                headers: {
                    'User-Agent': "node"
                }
            })
                .then(async response => {
                    if (!response.ok) {
                        const embed = new EmbedBuilder()
                            .setDescription(`**:warning: A HTML Error occured while executing this command! Status: ${response.status}**`)
                            .setColor("Red")
                        return await interaction.reply({ embeds: [embed], ephemeral: true })
                    }
                    return response.text();
                })
                .then(async data => {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(data, "text/xml");

                    const regionElement = xmlDoc.getElementsByTagName("REGION")[0];

                    const name = regionElement ? regionElement.getElementsByTagName("NAME")[0].textContent : "Unknown";
                    const banner = regionElement ? regionElement.getElementsByTagName("BANNERURL")[0].textContent : "Unknown";
                    const flag = regionElement ? regionElement.getElementsByTagName("FLAG")[0].textContent : "Unknown";
                    const numnations = regionElement ? regionElement.getElementsByTagName("NUMNATIONS")[0].textContent : "Unknown";
                    const nations = regionElement ? regionElement.getElementsByTagName("NATIONS")[0].textContent : "Unknown";
                    const embassiesElement = regionElement ? regionElement.getElementsByTagName("EMBASSIES")[0] : null;
                    const embassiesArray = [];
                    const embassyElement = embassiesElement ? embassiesElement.getElementsByTagName("EMBASSY") : [];
                    for (let i = 0; i < embassyElement.length; i++) {
                        const embassyElemen = embassyElement[i];
                        const embassyName = embassyElemen.textContent.trim();
                        if (embassyElemen.getAttribute("type") !== "Rejected") {
                            embassiesArray.push(embassyName);
                        }
                    }
                    let nonRejectedEmbassies = embassiesArray.join(", ");

                    const nationsBtn = new ButtonBuilder()
                        .setCustomId("nations")
                        .setLabel(`Nations [${numnations}]`)
                        .setStyle(ButtonStyle.Primary)
                    const embassiesBtn = new ButtonBuilder()
                        .setCustomId("embassies")
                        .setLabel(`Embassies`)
                        .setStyle(ButtonStyle.Primary)
                    const row = new ActionRowBuilder().addComponents(nationsBtn, embassiesBtn)

                    const power = regionElement ? regionElement.getElementsByTagName("POWER")[0].textContent : "Unknown";
                    const foundedtime = regionElement ? regionElement.getElementsByTagName("FOUNDEDTIME")[0].textContent : "Unknown";

                    let wadelegate = "";
                    const wadelegateElement = regionElement.getElementsByTagName("DELEGATE")[0].textContent;
                    if (wadelegateElement) {
                        wadelegate = `[${wadelegateElement}](https://www.nationstates.com/nation=${wadelegateElement})`
                    } else {
                        wadelegate = `Power Vaccum`
                    }

                    const governor = regionElement ? regionElement.getElementsByTagName("GOVERNOR")[0].textContent : "Unknown";
                    const officersElement = regionElement ? regionElement.getElementsByTagName("OFFICERS")[0] : null;
                    const officers = officersElement ? officersElement.getElementsByTagName("OFFICER") : [];

                    let officersEmbed = [""];
                    for (let i = 0; i < officers.length; i++) {
                        const nation = officers[i].getElementsByTagName("NATION")[0].textContent;
                        const office = officers[i].getElementsByTagName("OFFICE")[0].textContent;
                        const time = officers[i].getElementsByTagName("TIME")[0].textContent;

                        officersEmbed += [
                            `**${office}**: [${nation}](https://www.nationstates.net/nation=${nation}) and, has been in office since <t:${time}:R>`,
                        ].join('\n') + "\n\n";
                    };

                    const embed = new EmbedBuilder()
                        .setAuthor({ name: name, iconURL: flag })
                        .setImage(`https://www.nationstates.net${banner}`)
                        .setDescription(`**Governor:** [${governor}](https://www.nationstates.net/nation=${governor})\n\n **WA Delegate:** ${wadelegate}\n\n ${officersEmbed}`)
                        .addFields(
                            { name: "Global Power", value: power, inline: true },
                            { name: "Founded on", value: `<t:${foundedtime}>`, inline: true }
                        )
                    const msg = await interaction.reply({ embeds: [embed], components: [row] });
                    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 });

                    collector.on('collect', async (i) => {
                        const { customId } = i;

                        if (customId == "nations") {
                            const fixedNations = nations.replaceAll(":", ",");
                            let replacedText = fixedNations.match(/[^,]+/g).map((nation) => `[${nation}](https://www.nationstates.com/nation=${nation})`).join(',');
                            if (replacedText.length > 4085) {
                                replacedText = replacedText.toString().substring(0, 4085)
                            }
                            console.log(replacedText)

                            const embed = new EmbedBuilder()
                                .setTitle("Nations")
                                .setDescription(`Nations: ${replacedText || "Unknown"}`)
                                .setFooter({ text: name, iconURL: flag })
                            return await i.reply({ embeds: [embed], ephemeral: true })
                        } else if (customId == "embassies") {
                            let replacedNonRejectedEmbassies;
                            if (nonRejectedEmbassies.length > 4096) {
                                replacedNonRejectedEmbassies = nonRejectedEmbassies.toString().substring(0, 4096)
                            } else {
                                replacedNonRejectedEmbassies = nonRejectedEmbassies
                            }
                            const embed = new EmbedBuilder()
                                .setTitle("Nations")
                                .setDescription(`${replacedNonRejectedEmbassies || "Unknown"}`)
                                .setFooter({ text: name, iconURL: flag })
                            return await i.reply({ embeds: [embed], ephemeral: true })
                        }
                    })
                })
        }

        function formatNumberWithCommas(number) {
            const parts = number.toString().split(".");
            const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const fractionalPart = parts[1] ? parts[1].replace(/\B(?=(\d{3})+(?!\d))/g, "") : "";
            return integerPart + "." + fractionalPart;
        }
    },
};
