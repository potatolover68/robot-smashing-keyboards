import { Mwn } from 'mwn';
import dotenv from 'dotenv';

dotenv.config();

const bot = await Mwn.init({
    apiUrl: 'https://en.wikipedia.org/w/api.php',

    username: process.env.BOT_USER,
    password: process.env.BOT_PASSWORD,

    userAgent: 'if i do something wrong tell me at https://en.wikipedia.org/wiki/User_talk:Monkeysmashingkeyboards 1.0',

    defaultParams: {
        assert: 'user'
    }
});
bot.setOptions({
    editConfig: {
        exclusionRegex: /\{\{nobots\}\}/i
    }
});


export { bot };