# Hades' Kitten

A NationStates bot for Discord, written in TypeScript.

Developed by [Arnav](https://github.com/ArnavDevelops/) and [iris](https://github.com/heyirisdotdev/)

## Developing

First off, make sure that you have [Bun](https://bun.sh) installed. Bun is a drop-in replacement for npm and Node that
supports TypeScript out of the box. Make sure you're on v1.2.0 or later.

Then, clone the repository and install the dependencies:

```bash
git clone https://github.com/Hades-Kitten/Hades-Kitten.git ./hades-kitten/
cd hades-kitten
bun install
```

To run the bot, you need to have a Discord bot token. You can get one by creating a new bot on the
[Discord Developer Portal](https://discord.dev/), and then copying the token.

Create a file called `.env` in the root of the project, and add the following lines to it:

```env
TOKEN=""
CLIENT_ID=""
USER_AGENT=""
```

You then need to initialize the database by running:

```bash
bun db:sync
```

You will also need to do this whenever changes are made in the database models.

Finally, you can run the bot with:

```bash
bun start
bun dev # if you want the bot to restart automatically when you make changes
```

### Formatting and Linting

We use [Biome](https://biomejs.dev/) for formatting and linting. They offer extensions for all major editors.

When developing, it's recommended that you use the extension for your editor, and that you run make sure that:
- your code is error free with `biome:lint`, you can apply safe fixes with `biome:lint:apply`, and
- your code adheres by a standard format with `biome:format`.

You can run both of these all-in-one with `biome:check`, or `biome:check:apply` to apply safe fixes.
You can also append `:staged` so that only your staged changes are checked.

## Roadmap

- [X] All types of Information Command (i.e., nation info, region info, nation info by mention)
- [X] Comparison Command
- [X] Twatter; An in-built social media platform
- [ ] Trade Command
- [x] Nation Verification System
- [ ] Activity logger

## Copying

Hades' Kitten is licensed under the copyleft GNU Affero General Public License v3.0. You can find a copy of the license
in the [LICENSE](./LICENSE) file.

All files in this repository are licensed under the same GNU Affero General Public License v3.0 unless explicitly stated
otherwise.

In simple terms, this means that you are free to use, modify, and distribute this software, as long as you provide the
source code to your users and distribute it under the same license. Commercial use is allowed, but you must provide the
source code to your users. This does not constitute legal advice; please read the full license text and/or consult a
lawyer if you have any questions.
