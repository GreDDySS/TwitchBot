import humanize from "humanize-duration";
import pc from "picocolors";
import { query } from "../Modules/Database";

// **Настройка короткого формата для humanize-duration**
const shortHumanize = humanize.humanizer({
  language: "shortEn",
  languages: {
    shortEn: {
      y: () => "y",
      mo: () => "mo",
      w: () => "w",
      d: () => "d",
      h: () => "h",
      m: () => "m",
      s: () => "s",
      ms: () => "ms",
    },
  },
});

// **Форматирование времени для показа разницы**
export const humanizeDuration = (ms: number) => {
  const options: {
    units: Array<"y" | "mo" | "w" | "d" | "h" | "m" | "s" | "ms">; 
    largest: number;
    round: boolean;
    conjunction: string;
    spacer: string;
    language: string;
  } = {
    units: ["y", "d", "h", "m", "s"],
    largest: 3,
    round: true,
    conjunction: "",
    spacer: "",
    language: "shortEn",
  };
  return shortHumanize(ms, options);
};

// **Вычисление разницы во времени**
export const timeDelta = (time: number) => {
  const now = new Date().getTime();
  return humanizeDuration(now - time);
};

// **Аптайм бота**
export const uptime = () => {
  const ms = process.uptime() * 1000;
  return humanizeDuration(ms);
};

// **Случайный эмодзи**
export const randomConnectEmote = () => {
  const emotes = ["modCheck", "meow", "Lurk", "NaN", "peepoArrive", "ppHopper", "WatchingStream"];
  const randomIndex = Math.floor(Math.random() * emotes.length);
  return emotes[randomIndex];
};

// **Генерация случайного числа до заданного предела**
export const random = (num: number) => {
  return Math.floor(Math.random() * num) + 1;
};

// **Выбор случайного элемента из массива**
export const randomArg = <T>(arg: T[]): T => {
  const randomIndex = Math.floor(Math.random() * arg.length);
  return arg[randomIndex];
};

// **Логирование ошибок в базу данных**
export const logError = async (name: string, reason: string, stack: string) => {
  try {
    await query(
      `INSERT INTO "log" ("name", "message", "stack") VALUES ($1, $2, $3)`,
      [name, reason, stack]
    );
  } catch (error) {
    console.error(pc.red(`[DB ERROR] || Failed to log error: ${error}`));
  }
};

// **Преобразование времени в читаемую строку**
export const formatTimestamp = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

// **Проверка, является ли строка валидным JSON**
export const isJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};
