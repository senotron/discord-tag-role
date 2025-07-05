const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');

const TOKEN = '';
const TAG = 'DTX';
const ROLE_ID = '';
const GUILD_ID = '';
const LOG_CHANNEL_ID = '';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.GuildMember]
});

const userCooldowns = new Map();

async function checkTags(guild, logChannel) {
  if (!logChannel) return;

  const members = await guild.members.fetch();

  for (const [_, member] of members) {
    if (member.user.bot) continue;
    await new Promise(r => setTimeout(r, 800));

    try {
      const userData = await client.rest.get(`/users/${member.id}`);
      const currentGuildID = userData?.clan?.identity_guild_id || null;
      const currentTag = userData?.clan?.tag || null;
      const hasTag = currentGuildID === GUILD_ID && currentTag === TAG;
      const hasRole = member.roles.cache.has(ROLE_ID);

      if (hasTag && !hasRole) {
        await member.roles.add(ROLE_ID);
        await logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('🎉 Role Added')
              .setDescription(`<@!${member.id}> received the **DTX** tag and was given the <@&${ROLE_ID}> role.`)
              .setColor('Green')
              .setTimestamp()
          ]
        });
      } else if (!hasTag && hasRole) {
        await member.roles.remove(ROLE_ID);
        await logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('⚠️ Role Removed')
              .setDescription(`<@!${member.id}> changed tag and the <@&${ROLE_ID}> role was removed.`)
              .setColor('Red')
              .setTimestamp()
          ]
        });
      }
    } catch (err) {
      console.log(`⚠️ Error for ${member.user.tag}:`, err?.message || err);
    }
  }
}

client.once('ready', async () => {
  console.log(`✅ Logged in as: ${client.user.tag}`);
  const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
  if (!guild || !logChannel) return console.log('❌ Guild or log channel not found.');

  await checkTags(guild, logChannel);
  setInterval(() => checkTags(guild, logChannel), 1000 * 60 * 10);
});

client.on('messageCreate', async (msg) => {
  if (!msg.guild || msg.author.bot) return;
  if (msg.content.toLowerCase() !== '!check') return;

  const cooldown = 1000 * 60 * 30;
  const now = Date.now();
  const lastUsed = userCooldowns.get(msg.author.id);

  if (lastUsed && now - lastUsed < cooldown) {
    const remaining = Math.ceil((cooldown - (now - lastUsed)) / 60000);
    return msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('⏳ Please Wait')
          .setDescription(`Please try again in **${remaining} minutes**.`)
          .setColor('Orange')
          .setTimestamp()
      ]
    });
  }

  userCooldowns.set(msg.author.id, now);

  const loadingEmbed = new EmbedBuilder()
    .setTitle('🔍 Checking...')
    .setDescription(`Checking data for <@${msg.author.id}>...`)
    .setColor('Blue')
    .setTimestamp();

  const loadingMessage = await msg.reply({ embeds: [loadingEmbed] });

  const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
  if (!guild || !logChannel) return loadingMessage.edit({ content: '❌ An error occurred.', embeds: [] });

  const member = await guild.members.fetch(msg.author.id).catch(() => null);
  if (!member) return loadingMessage.edit({ content: '❌ Member not found.', embeds: [] });

  try {
    const userData = await client.rest.get(`/users/${member.id}`);
    const currentTag = userData?.clan?.tag || 'No Tag';
    const hasTag = currentTag === TAG;
    const hasRole = member.roles.cache.has(ROLE_ID);
    let action = 'No changes made.';
    let color = 'Yellow';

    if (hasTag && !hasRole) {
      await member.roles.add(ROLE_ID);
      action = `✅ Role <@&${ROLE_ID}> **added**.`;
      color = 'Green';
      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('🎉 Role Added')
            .setDescription(`<@!${member.id}> received the **DTX** tag and was given the role.`)
            .setColor('Green')
            .setTimestamp()
        ]
      });
    } else if (!hasTag && hasRole) {
      await member.roles.remove(ROLE_ID);
      action = `⚠️ Role <@&${ROLE_ID}> **removed**.`;
      color = 'Red';
      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('⚠️ Role Removed')
            .setDescription(`<@!${member.id}> changed tag and the role was removed.`)
            .setColor('Red')
            .setTimestamp()
        ]
      });
    }

    const resultEmbed = new EmbedBuilder()
      .setTitle('📋 Check Result')
      .setDescription(`**User:** <@!${member.id}>\n**Current Tag:** \`${currentTag}\`\n\n**Role Action:**\n${action}`)
      .setColor(color)
      .setTimestamp();

    await loadingMessage.edit({ embeds: [resultEmbed] });
  } catch (err) {
    await loadingMessage.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle('❌ Error Occurred')
          .setDescription(`Error during check:\n\`${err?.message || err}\``)
          .setColor('Red')
          .setTimestamp()
      ]
    });
  }
});

client.login(TOKEN);
