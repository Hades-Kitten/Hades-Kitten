# HADES' KITTEN
## Developer: [arnav1001yt/ArnavDevelops](https://github.com/ArnavDevelops), Contributor: [iris/heyirisdotdev](https://github.com/heyirisdotdev).
I'm Hades' Kitten (perhaps), an useful nationstates.net bot for your server.

## Project Requirements
- bun, discord.js and other additional packages required for the bot.
- Completing the To-Do List.

## Developing

First, you need to have [Bun](https://bun.sh) installed, it's a drop-in replacement for npm and
Node and npm that supports Typescript out of the box. Make sure you're on v1.2.0 or later.

Then, clone the repository and install the dependencies
```
git clone https://github.com/ArnavDevelops/Hades-Kitten.git hades-kitten
cd hades-kitten
bun install
```

To run the bot, you need to have a Discord bot token. You can get one by creating a new bot
on the [Discord Developer Portal](https://discord.dev/), and then copying the token.

Create a file called `.env` in the root of the project, and add the following line to it:
```env
TOKEN="your-token-here"
CLIENT_ID="your-client-id-here"
DATE_CHANNEL_ID="your-date-channel-id-here"
```

You then need to initialize the database by running:
```bash
bun db:sync
```

you will also need to do this whenever changes are made in the database models.

Then, you can run the bot with:
```bash
bun start
bun dev # if you want the bot to restart automatically when you make changes
```

## Project's To-do List
- [ ] All types of Information Command (i.e., nation info, region info, nation info by mention)
- [ ] Nation Verification System
- [ ] Activity logger

## Miscellaneous
**Extra Information regarding the Discord bot**
- The Bot's invite will become public after the to-do list is completed.

## Relevant Links
https://discord.js.org/
https://www.bun.sh/
