import fs from "fs";

process.env.NTBA_FIX_319 = "1";
process.env.PORT = "5000";

import TelegramApi from "node-telegram-bot-api";
import {
  postUserFavoriteArtists,
  getUserFavoriteArtists,
  getCheckUser,
  postAddUser,
} from "./connectDB.js";
import Discogs from "disconnect";

const token =
  process.env.TOKEN || "5026626038:AAGJd4-vsk77xH_nB1bjGK09Kw4qu6BtLGM";
const discogsToken = "exJyALfyinrNEhljGZgujJDMigiHzUnjaCAfhFLD";

// добавить, удалить, удалить все, разрешить/запретить меня искать, пол
// увидеть список моих исполнителей

// ответы на ругательства

const bot = new TelegramApi(token, { polling: true });
const dis = new Discogs.Client({ userToken: discogsToken }).database();

bot.on("polling_error", (msg) => console.log(msg));

bot
  .setMyCommands([
    { command: "/start", description: "Запуск описания бота" },
    { command: "/settings", description: "Изменить музыкальные предпочтения" },
    { command: "/find", description: "Найти совпадающих няш" },
    { command: "/addartist", description: "Добавить любимого исполнителя" },
  ])
  .catch((e) => console.log("setMyCommands err", e));

let userArtists = [];

bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (text === "/start") {
    const isUsrExist = await getCheckUser(userId);
    if (!isUsrExist.userExists) {
      await postAddUser(userId, 1, msg.from.first_name, "all");
    } else {
      userArtists = await getUserFavoriteArtists(userId);
      userArtists =
        userArtists?.userData?.map((el) => {
          return el.artistName;
        }) ?? [];
      console.log("userArtists", userArtists);
    }

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
    /* Выдаём сообщение со списком возможных настроек профиля
                /addArtist

                /deletArtist

                /deletAll

                /myAtists

                /searchBan

                /searchResolve
            */

    return bot.sendMessage(chatId, `Ты написал мне ${text}`);
  }

  if (text === "/deletArtist") {
    // Удалять кнопками (чекбоксы)
    // userArtists.map => return [buttons]

    return bot.sendMessage(chatId, `Ты написал мне ${text}`);
  }

  if (text === "/myProfile") {
    return bot.sendMessage(chatId, `Ты написал мне ${text}`);
  }

  if (text === "/deletAll") {
    userArtists = [];
    return bot.sendMessage(chatId, `Твой список исполнителей пуст`);
  }

  if (text === "/searchResolving") {
    /*
                // сделать кнопку смены разрешения поиска

                /searchBan

                /searchResolve
            */
    return bot.sendMessage(chatId, `Ты написал мне ${text}`);
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
        "Добавь хотя бы одного исполнителя с помощью /addArtist, прежде чем использовать /find."
      );
    }

    return bot.sendMessage(chatId, "Тебе подходит только твоя правая рука");
  }

  return (
    !text.includes("/addartist") &&
    bot.sendMessage(
      chatId,
      "Меня интересуют только сообщения по делу, не отвлекай меня попусту."
    )
  );
});

bot.onText(/\/addartist (.+)/, async (msg, match) => {
  //  Ты можешь добавить артистов по одному.\n
  //  Обязательно проверь правильность написания сценического имени
  //  каждого музыканта/коллектива. Если допустишь ошибку, я не смогу
  //  предоставить тебе соискателей \n Я приведу все имена к нижнему (верхнему?) регистру,
  //  чтобы сократить вероятность дублирования имён.

  // обработка исполнителей - удаление лишних пробелов и знаков препинания,
  // всё в верхний регистр
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const artistName = match[1]?.trim()?.toUpperCase();
  console.log("artistName", artistName);
  console.log("chatId", chatId);
  console.log("userId", userId);
  // Добавление исполнителя в список пользователя
  // if (userArtists) {
  userArtists = await getUserFavoriteArtists(userId);
  userArtists =
    userArtists?.userData?.map((el) => {
      return el.artistName;
    }) ?? [];

  if (
    userArtists?.length < 10
    // && "проверка существования такого артиста?"
  ) {
    // users[userId].favoriteArtists.push(artistName);
    console.log(
      "!userArtists?.includes(artistName)",
      userArtists,
      artistName,
      !userArtists?.includes(artistName)
    );
    if (!userArtists?.includes(artistName)) {
      const res = await postUserFavoriteArtists(userId, artistName);
      res !== 0 &&
        (await bot.sendMessage(
          chatId,
          `Исполнитель ${artistName} добавлен в твой список.`
        ));
      userArtists = await getUserFavoriteArtists(userId)?.userData;
      userArtists =
        userArtists?.map((el) => {
          return el.artistName;
        }) ?? [];
    } else {
      await bot.sendMessage(
        chatId,
        "Данный исполнитель уже есть в твоём списке."
      );
    }
  } else {
    await bot.sendMessage(
      chatId,
      "Ты уже добавил максимальное количество исполнителей (10)."
    );
  }
  // } else {
  //   await bot.sendMessage(chatId, "Для начала используй команду /start.");
  // }

  // return bot.sendMessage(chatId, `Ты написал мне ${msg}`);
});

// Функция для поиска пользователей с похожими списками исполнителей
async function findSimilarUsers(currentUserArtists) {
  const similarUsers = [];

  // Здесь реализуй логику поиска пользователей с похожими списками исполнителей
  // Используй Discogs API для получения данных об исполнителях

  return similarUsers;
}
