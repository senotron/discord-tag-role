# Discord Tag Role Manager Bot

A Discord bot that automatically assigns or removes a role based on whether a user has a specific tag in their profile. It also supports manual checks with cooldowns to prevent spam.

## Features

- Periodically checks all guild members for a specific tag.
- Assigns a role if the member has the tag and doesn't already have the role.
- Removes the role if the member no longer has the tag but still has the role.
- Logs role changes in a designated log channel with embedded messages.
- Manual user check with a command `!check` in a specific channel with a 30-minute cooldown.
- Rate limiting included to avoid hitting Discord API rate limits.

## Requirements

- Node.js v16 or higher
- discord.js v14

## Configuration

Update the following constants in the source code:

- `TOKEN`: Your Discord bot token.
- `TAG`: The tag to check for (e.g., `'DTX'`).
- `ROLE_ID`: The ID of the role to assign/remove.
- `GUILD_ID`: The ID of your Discord server.
- `STATUS_CHANNEL_ID`: The ID of the status channel (used internally).
- `LOG_CHANNEL_ID`: The ID of the channel where logs will be sent.
- `!check` command is only accepted in the channel with ID `""`. Update this if needed.

## Installation

1. Clone the repository or copy the code.
2. Run `npm install discord.js`.
3. Replace the configuration constants with your own.
4. Run the bot with `node senotron.js` (or your filename).

## Usage

- The bot will automatically check members every 10 minutes.
- Users can manually check their tag and role status by sending `!check` in the specified channel.
- If a user tries to run `!check` within 30 minutes of their last use, they will receive a cooldown message.

## License

This project is open source and free to use.
