import rp from 'request-promise'
import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import pc from "picocolors";
import { Logger } from "@modules/Logger";
import { bot } from "@clients/Twitch"

// URL для парсинга
const urlMy = "https://my-calend.ru/holidays";

// Типизация для списка праздников
type Celebration = string[];
/**
 * Асинхронная функция для получения списка праздников.
 * Парсит сайт и сохраняет данные в JSON-файл.
 */
export const getListCelebration = async (): Promise<void> => {
  try {
    const celebration: Celebration = [];
    await rp(urlMy).then(html => {
      const $ = cheerio.load(html);
      const regex = /^\d*\n*|\n*\d*$/gm;
      for (let i = 0; i < 1; i++) {
        $(`article > section:nth-child(4) > ul > li`).each((i, elem) => {
          celebration.push(`${$(elem).text().replace(regex, "").trim()}`)
        });
      }

    })
    

    const filePath = path.resolve(__dirname, "../data/celebration.json");
    await fs.writeFile(filePath, JSON.stringify(celebration, null, 2), {
      encoding: "utf-8",
    });

    Logger.info(`${pc.green("[CELEBRATION]")} || Celebration list updated!`);
  } catch (error) {
    Logger.error(`${pc.red("[CELEBRATION ERROR]")} || ${error}`);
    bot.Utils.logError("CELEBRATION ERROR", (error as Error).message, (error as Error).stack || "");
  }
};

/**
 * Функция для регулярного обновления праздников каждые 2 часа.
 */
export const getCelebration = (): void => {
  setInterval(() => {
    getListCelebration();
  }, 7200 * 1000); // каждые 2 часа
};
