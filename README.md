# ESX Discord Bot

### Basic Info

Written using [Akairo](https://discord-akairo.github.io/#/) and [Discord.js](https://discord.js.org/#/)

**External Dependencies**
* Node.js > 14.0.0
* [Postgres](https://www.postgresql.org/)

**Technology**
* TypeScript v4.x
* Discord Akairo
* Discord.js


### Running the Bot

1. Run `yarn` or `npm i` depending on package manager preference.
2. Fill out all relevant fields in `template.env` file. Then rename it to `.env`
3. Edit any of the config settings according to preference in `src/config.ts`

At this point the steps diverge depending on the environment

**Production**
1. Run the command `tsc` to compile the TypeScript into JS (outputs to `dist/`).
2. Run `dist/index.js` using either the `node` command or the `pm2` npm package (recommended).

**Development**
1. Run `npm run dev` or `yarn dev` to start a hot reloading development session.
