const axios = require("axios")

// Generic GET requests
const twitchAuth = async (link,  config) => {
  const { data } = await axios.request({
    url: `https://id.twitch.tv/${link}`,
    ...config,
  });
  return data;
};

// Twitch Helix API
const helix = async (link, config) => {
  const { data } = await axios.request({
    url: `https://api.twitch.tv/helix/${link}`,
    timeout: 1500,
    headers: {
      "Authorization": `Bearer ${bot.Config.bearer}`,
      "Client-Id": `${bot.Config.clientId}`
    },
    ...config,
  });
  return data;
};

// Twitch TMI API
const tmi = async (link, config) => {
  const { data } = await axios.request({
    url: `https://tmi.twitch.tv/${link}`,
    timeout: 3500,
    ...config,
  });
  return data;
};

const request = async(link, config) => {
  const { data } = await axios.request({
    url: `https://${link}`,
    timeout: 3500,
    ...config,
  })
  return data;
}

module.exports = {twitchAuth, helix, tmi, request}