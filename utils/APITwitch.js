const axios = require("axios")

const getIdInfo = async (id, config) => {
    const { data } = await axios.request({
      url: `https://api.ivr.fi/v2/twitch/user?id=${id}`,
      timeout: 1500,
      ...config,
    });
    return data
};

const getLoginInfo = async (login, config) => {
    const { data } = await axios.request({
      url: `https://api.ivr.fi/v2/twitch/user?login=${login}`,
      timeout: 1500,
      ...config,
    });
    return data
};

const getVipMod = async (channel, config) => {
    const { data } = await axios.request({
      url: `https://api.ivr.fi/v2/twitch/modvip/${channel}`,
      timeout: 1500,
      ...config,
    });
    return data
};

const getSubage = async (user, channel, config) => {
    const { data } = await axios.request({
      url: `https://api.ivr.fi/v2/twitch/subage/${user}/${channel}`,
      timeout: 1500,
      ...config,
    });
    return data
};

module.exports = {getIdInfo, getLoginInfo, getSubage, getVipMod}