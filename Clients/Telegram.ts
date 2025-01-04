import TelegramBot, { type  InlineKeyboardMarkup } from 'node-telegram-bot-api';
import pc from "picocolors";
import { Logger } from '../Modules/Logger';
import { Stats } from '../Database/Stats';
import { Scheduler } from '../Modules/Scheduler';
import { config } from '../Config/config';

const ADMIN_CHAT_ID = config.telegram.adminChatId;
const bot = new TelegramBot(config.telegram.token, { polling: true });


const isAdmin = (chatId: string): boolean => chatId === ADMIN_CHAT_ID;

/**
 * Главное меню.
 */
const mainMenu: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: "📊 Посмотреть статистику", callback_data: "view_stats" },
      { text: "🔄 Перезагрузить модуль", callback_data: "reload_module" },
    ],
    [
      { text: "📅 Статус планировщика", callback_data: "scheduler_status" },
      { text: "Помощь", callback_data: "help" },
    ],
  ],
};

/**
 * Функция для отображения главного меню.
 * @param chatId ID чата.
 */
const showMainMenu = async (chatId: string): Promise<void> => {
  try {
    await bot.sendMessage(chatId, "Выберите действие из меню:", {
      reply_markup: mainMenu,
    });
  } catch (error) {
    Logger.error(
      `${pc.red("[Telegram ERROR]")} || Ошибка отображения меню: ${(error as Error).message}`
    );
  }
};

/**
 * Обработчик нажатий на кнопки меню.
 */
bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat.id.toString() || "";
  const action = query.data;

  if (!isAdmin(chatId)) {
    await bot.answerCallbackQuery(query.id, {
      text: "❌ У вас нет доступа к управлению ботом.",
    });
    return;
  }

  switch (action) {
    case "view_stats":
      try {
        const statistics = await Stats.getStatistics(); // Получение статистики
        await bot.sendMessage(chatId, statistics, {parse_mode: "Markdown"});
      } catch (error) {
        await bot.sendMessage(chatId, `❌ Ошибка получения статистики: ${(error as Error).message}`);
      }
      break;

    case "reload_module":
      try {
        // Отправляем запрос на название модуля
        await bot.sendMessage(chatId, "Введите название модуля для перезагрузки:");
        bot.once("message", async (msg) => {
          const moduleName = msg.text;
          if (moduleName) {
            try {
              const reloaded = await reloadModule(moduleName);
              await bot.sendMessage(chatId, `✅ Модуль ${reloaded} успешно перезагружен.`);
            } catch (error) {
              await bot.sendMessage(chatId,`❌ Ошибка перезагрузки модуля: ${(error as Error).message}`);
            }
          } else {
            await bot.sendMessage(chatId, "❌ Вы не указали название модуля.");
          }
        });
      } catch (error) {
        await bot.sendMessage(chatId, `❌ Ошибка перезагрузки: ${(error as Error).message}`);
      }
      break;

    case "scheduler_status":
      try {
        const status = Scheduler.listTasks();
        await bot.sendMessage(chatId, `📅 Состояние планировщика:\n${status}`);
      } catch (error) {
        await bot.sendMessage(chatId, `❌ Ошибка получения состояния планировщика: ${(error as Error).message}`);
      }
      break;

    case "help":
      await bot.sendMessage(
        chatId,
        "ℹ️ Помощь:\n" +
          "- 📊 Посмотреть статистику: просмотр текущей статистики.\n" +
          "- 🔄 Перезагрузить модуль: укажите название модуля для перезагрузки.\n" +
          "- 📅 Статус планировщика: проверить состояние планировщика задач."
      );
      break;

    default:
      await bot.answerCallbackQuery(query.id, { text: "❌ Неизвестное действие." });
  }

  // Закрываем меню после нажатия
  await bot.answerCallbackQuery(query.id);
});

/**
 * Обработчик сообщений для вызова меню.
 */
bot.on("message", async (msg) => {
  const chatId = msg.chat.id.toString();

  if (!isAdmin(chatId)) {
    await bot.sendMessage(chatId, "❌ У вас нет доступа к управлению ботом.");
    return;
  }

  // Показываем главное меню при любом вводе текста
  await showMainMenu(chatId);
});

/**
 * Функция перезагрузки модуля.
 * @param moduleName Название модуля для перезагрузки.
 * @returns Название перезагруженного модуля.
 */
const reloadModule = async (moduleName: string): Promise<string> => {
  delete require.cache[require.resolve(`./${moduleName}`)];
  const module = await import(`./${moduleName}`);
  return module;
};

// Инициализация Telegram управления
export const initializeTelegramBot = (): void => {
  Logger.info(`${pc.green("[Telegram]")} || Telegram бот с меню запущен.`);
};