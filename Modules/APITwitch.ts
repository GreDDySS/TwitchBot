import axios, { type AxiosRequestConfig } from "axios";
import { config } from "../Config/config";
import { Logger } from "./Logger";
import pc from "picocolors";

const BASE_URL = "https://api.twitch.tv/helix/";
const ID_URL = "https://id.twitch.tv/oauth2/token/";

/**
 * Twitch API authentication 
 */
const twitchAuth = async (endpoint: string, options?: AxiosRequestConfig) => {
  try {
    const {data} = await axios.request({
      url: `${ID_URL}${endpoint}`,
      ...options,
    });
    return data;
  } catch (error: any) {
    Logger.error(`${pc.red("[TWITCH AUTH]")} || Error: ${error.message}`);
    throw error;
  }
};

/**
 * Generic API request
 */
const request = async (endpoint: string, options?: AxiosRequestConfig) => {
  try {
    const {data} = await axios.request({
      url: `${BASE_URL}${endpoint}`,
      headers: {
        "Client-ID": config.twitch.clientID,
        Authorization: `Bearer ${config.twitch.bearer}`,
      },
      ...options,
    });
    return data;
  } catch (error: any) {
    Logger.error(`${pc.red("[TWITCH API]")} || Error: ${error.message}`);
    throw error;
  }
};

/**
 * Get login info
 */
const getLoginInfo = async (login: string) => {
  const endpoint = `users?login=${login}`;
  return await request(endpoint);
};

/**
 * Get stream info 
 */
const getStreamInfo = async (login: string) => {
  const endpoint = `streams?user_login=${login}`;
  return await request(endpoint);
};

/**
 * Get game info
 */
const getGameInfo = async (gameID: string) => {
  const endpoint = `games?id=${gameID}`;
  return await request(endpoint);
};

/**
 * Get user info by ID
 */
const getIdInfo = async (id: string) => {
  const endpoint = `users?id=${id}`;
  return await request(endpoint);
};

/**
 * Get sub age
 */
const getSubAge = async (userID: string, broadcasterID: string) => {
  const endpoint = `subscriptions/user?broadcaster_id=${broadcasterID}&user_id=${userID}`;
  return await request(endpoint);
};

/**
 * Get follow age
 */
const getFollowAge = async (fromID: string, toID: string) => {
  const endpoint = `users/follows?from_id=${fromID}&to_id=${toID}`;
  return await request(endpoint);
};

/**
 * Get VIP and Mod status
 */
const getVipMod = async (broadcasterID: string, userID: string) => {
  const endpoint = `moderation/moderators?broadcaster_id=${broadcasterID}&user_id=${userID}`;
  const mods = await request(endpoint);

  const vipEndpoint = `channels/vips?broadcaster_id=${broadcasterID}&user_id=${userID}`;
  const vips = await request(vipEndpoint);

  return { isMod: !!mods.data.length, isVip: !!vips.data.length };
};

export { twitchAuth, getLoginInfo, getStreamInfo, getGameInfo, getIdInfo, getSubAge, getFollowAge, getVipMod };