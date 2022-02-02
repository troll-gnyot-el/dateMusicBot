const TelegramApi = require('node-telegram-bot-api'); // импортируем установленный пакет
const token = "5026626038:AAGlVDusn4QPe6jGW4R41DQaz4J0qUDq1cs"

/* Текст приветствия:
Привет, first_name. Я бот для музыкальных знакомств.
Ищешь, с кем пойти на концерт любимой группы?
А может у тебя очень редкие вкусы в музыке и ты ищешь такого же единорога?
Я предложу тебе соискателей, а дальше сами разбирайтесь в своих человеческих заморочках :)

Чтобы поиск был наиболее точным, настрой свои данные, вызвав команду /put
Если информации о тебе не будет, я смогу выдать себе только таких же загадочных ребят */

// добавить, удалить, удалить все, разрешить/запретить меня искать, пол(?)
// увидеть список моих исполнителей

// обработка исполнителей - удаление лишних пробелов и знаков препинания, всё в нижний (или верхний) регистр

// ответы на ругательства

const bot = new TelegramApi(token, {polling: true}) // выяснить, что значит эта опция и какие ещё есть

bot.setMyCommands([
    {command: '/start', description: 'Зауск описания бота'},
    {command: '/put', description: 'Изменить музыкальные предпочтения'},
    {command: '/find', description: 'Найти совпадающих няш'},
])

// const start = async () => {
    // прослушка событий в боте
    bot.on('message', msg => { // event and listener - is a function callback
        const text = msg.text;
        const chatId = msg.chat.id;

        if (text === '/start') {
            console.log(msg)
            // асинхронные функции
            /* await */ bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/1ab/07f/1ab07fbe-1f8a-3d63-a897-75c73f22c536/6.webp');
            return bot.sendMessage(chatId, `Hello ${msg.from.first_name}`);
        }

        if (text === '/put') {
            /* Сначала выдаём сообщение со списком возможных настроек профиля
                /newArtist
                /deletArtist
                /deletAll
                /myAtists
                /searchBan
                /searchResolve
            */

            return bot.sendMessage(chatId, `Ты написал мне ${text}`);
        }

        if (text === '/find') {

        }
        return bot.sendMessage(chatId, 'Меня интересуют только сообщения по делу, не отвлекай меня попусту.')
    })
//}
// start()
