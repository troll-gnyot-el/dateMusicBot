import { setFavoriteArtistsList } from "./setFavoriteArtistsList.js";

process.env.NTBA_FIX_319 = "1";
process.env.PORT = "5000";

import TelegramApi from "node-telegram-bot-api";
import {
  postUserFavoriteArtists,
  postUserSearchResolving,
  getUserSearchResolving,
  postDeleteAllArtists,
} from "./connectDB.js";
import Discogs from "disconnect";

const token =
  process.env.TOKEN || "5026626038:AAGJd4-vsk77xH_nB1bjGK09Kw4qu6BtLGM";
const discogsToken = "exJyALfyinrNEhljGZgujJDMigiHzUnjaCAfhFLD";

// добавить, удалить, удалить все, разрешить/запретить меня искать, пол
// увидеть список моих исполнителей

// ответы на ругательства

const bot = new TelegramApi(token, { polling: true });
// const dis = new Discogs.Client({ userToken: discogsToken }).database();

bot.on("polling_error", (msg) => console.log(msg));

bot
  .setMyCommands([
    { command: "/start", description: "Запуск описания бота" },
    { command: "/settings", description: "Настройки твоего профиля" },
    { command: "/find", description: "Найти совпадающих няш" },
    // { command: "/add_artist", description: "Добавить любимого исполнителя" },
  ])
  .catch((e) => console.log("setMyCommands err", e));

let userArtists = [];

bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  // const userName = msg.from.username;
  let buttons = {};
  userArtists = setFavoriteArtistsList(userId);

  if (text === "/start") {
    await bot.sendSticker(
      chatId,
      "https://tlgrm.ru/_/stickers/1ab/07f/1ab07fbe-1f8a-3d63-a897-75c73f22c536/6.webp"
    );
    return bot.sendMessage(
      chatId,
      `Привет, ${msg.from.first_name}. Я бот для музыкальных знакомств.
Ищешь, с кем пойти на концерт любимой группы?
А может у тебя очень редкие вкусы в музыке и ты ищешь такого же единорога?
Я предложу тебе соискателей, а дальше сами разбирайтесь в своих человеческих взаимодействиях.

Чтобы поиск был наиболее точным, настрой свои данные, вызвав команду /settings.
Если не станешь добавлять информацию, я смогу порекомендовать только таких же людей-загадок, как ты.
Чтобы получить новый контакт, вызови команду /find.`
    );
  }

  if (text === "/settings") {
    return bot.sendMessage(
      chatId,
      `Ты можешь воспользоваться следующими настройками:
/add_artist - добавить исполнителя в список любимых
/delete_artist - удалить исполнителя из списка любимых
/delete_all - полностью очистить список любимых исполнителей
/search_resolving - активировать/деактивировать аккаунт`
    );
  }

  if (text === "/delete_artist") {
    // Удалять кнопками (чекбоксы)
    // userArtists.map => return [buttons]

    return bot.sendMessage(chatId, `Ты написал мне ${text}`);
  }

  // if (text === "/myProfile") {
  //   return bot.sendMessage(chatId, `Ты написал мне ${text}`);
  // }

  if (text === "/delete_all") {
    return bot.sendMessage(
      chatId,
      "Ты уверен, что хочешь полностью очистить список своих любимых групп?\n" +
        "Ты сможешь добавить новых фаворитов, если введёшь /add_artist",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Да", callback_data: "confirm_delete_all_yes" }],
            [{ text: "Нет", callback_data: "confirm_delete_all_no" }],
          ],
        },
      }
    );
  }

  if (text === "/search_resolving") {
    buttons = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Включить поиск",
              callback_data: "on_searching",
            },
            {
              text: "Отключить поиск",
              callback_data: "off_searching",
            },
          ],
        ],
      },
    };

    return bot.sendMessage(chatId, `Хочешь продолжать поиск?`, buttons);
  }

  if (text === "/find") {
    if (userArtists.length > 0) {
      // Получение списка похожих пользователей с использованием Discogs API
      // const currentUserArtists = users[userId].favoriteArtists;
      const similarUsers = await findSimilarUsers(userArtists);

      if (similarUsers.length > 0) {
        await bot.sendMessage(
          chatId,
          `Пользователи с похожими списками исполнителей: ${similarUsers.join(
            ", "
          )}`
        );
      } else {
        await bot.sendMessage(
          chatId,
          "Не удалось найти пользователей с похожими списками исполнителей."
        );
      }
    } else {
      await bot.sendMessage(
        chatId,
        "Добавь хотя бы одного исполнителя с помощью /add_artist, прежде чем использовать /find."
      );
    }

    return bot.sendMessage(chatId, "Тебе подходит только твоя правая рука");
  }

  return (
    !text.includes("/add_artist") &&
    bot.sendMessage(
      chatId,
      "Меня интересуют только сообщения по делу, не отвлекай меня попусту."
    )
  );
});

bot.onText(/\/add_artist$/, async (msg) => {
  return await bot.sendMessage(
    msg.chat.id,
    `Чтобы добавить исполнителя введи: /add_artist Имя любимого исполнителя
    
Пример: /add_artist Bring Me the Horizon
    
Рекомендуется проверить, что ты вводишь имя без ошибок.
    `
  );
});

bot.onText(/\/add_artist (.+)/, async (msg, match) => {
  //  Ты можешь добавить артистов по одному.\n
  //  Обязательно проверь правильность написания сценического имени
  //  каждого музыканта/коллектива. Если допустишь ошибку, я не смогу
  //  предоставить тебе соискателей \n Я приведу все имена к нижнему (верхнему?) регистру,
  //  чтобы сократить вероятность дублирования имён.

  // обработка исполнителей - удаление лишних пробелов и знаков препинания,
  // всё в верхний регистр
  const chatId = msg.chat.id;
  const artistName = match[1]
    ?.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    ?.replace(/\s+/g, " ")
    ?.trim()
    ?.toUpperCase();

  userArtists = await setFavoriteArtistsList(chatId);

  if (
    userArtists?.length < 10
    // && "проверка существования такого артиста?"
  ) {
    console.log(
      "!userArtists?.includes(artistName)",
      userArtists,
      artistName,
      !userArtists?.includes(artistName)
    );
    if (!userArtists?.includes(artistName)) {
      const res = await postUserFavoriteArtists(chatId, artistName);
      userArtists = await setFavoriteArtistsList(chatId);
      return (
        res !== 0 &&
        (await bot.sendMessage(
          chatId,
          `Исполнитель ${artistName} добавлен в твой список.`
        ))
      );
    } else {
      return await bot.sendMessage(
        chatId,
        "Данный исполнитель уже есть в твоём списке."
      );
    }
  } else {
    return await bot.sendMessage(
      chatId,
      "Ты уже добавил максимальное количество исполнителей (10). Ты всегда можешь изменить список любимых исполнителей в зависимости от потребностей на данный момент."
    );
  }
});

bot.on("callback_query", async (callbackQuery) => {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;
  userArtists = await setFavoriteArtistsList(chatId);

  if (data === "on_searching") {
    let searchResolving = await getUserSearchResolving(chatId);
    searchResolving = searchResolving?.userData?.[0]?.searchResolving;
    const searchTrue = searchResolving === 1;

    if (!searchTrue) {
      await postUserSearchResolving(chatId, 1);
    }
    return searchTrue
      ? await bot.sendMessage(
          chatId,
          "Ваш профиль уже открыт для поиска другими пользователями бота."
        )
      : await bot.sendMessage(
          chatId,
          "Теперь ваш профиль открыт для поиска другими пользователями бота. Чтобы найти людей введите /find."
        );
  }

  if (data === "off_searching") {
    let searchResolving = await getUserSearchResolving(chatId);
    searchResolving = searchResolving?.userData?.[0]?.searchResolving;
    const searchTrue = searchResolving === 1;

    if (!!searchTrue) {
      await postUserSearchResolving(chatId, 0);
    }
    return !searchTrue
      ? await bot.sendMessage(
          chatId,
          "Ваш профиль уже закрыт для поиска другими пользователями бота."
        )
      : await bot.sendMessage(
          chatId,
          "Теперь ваш профиль не будет показан другим людям. Чтобы снова начать поиск введите /searchResolving."
        );
  }

  if (data === "confirm_delete_all_yes") {
    if (userArtists.length === 0) {
      return await bot.sendMessage(chatId, "Список любимых исполнителей пуст.");
    } else {
      userArtists = [];
      const success = await postDeleteAllArtists(chatId);
      return success !== 0
        ? await bot.sendMessage(
            chatId,
            "Список любимых исполнителей успешно очищен."
          )
        : await bot.sendMessage(
            chatId,
            "Произошла ошибка при очистке списка любимых исполнителей. Попробуйте повторить действие позже."
          );
    }
  }

  if (data === "confirm_delete_all_no") {
    return bot.sendMessage(
      chatId,
      `Ты можешь воспользоваться следующими настройками:
/add_artist - добавить исполнителя в список любимых
/delete_artist - удалить исполнителя из списка любимых
/delete_all - полностью очистить список любимых исполнителей
/search_resolving - активировать/деактивировать аккаунт`
    );
  }
});

// Функция для поиска пользователей с похожими списками исполнителей
async function findSimilarUsers(currentUserArtists) {
  const similarUsers = [];

  // Здесь реализуй логику поиска пользователей с похожими списками исполнителей
  // Используй Discogs API для получения данных об исполнителях

  return similarUsers;
}
