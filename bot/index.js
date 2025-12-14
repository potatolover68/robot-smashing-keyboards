import { Mwn } from 'mwn';
import dotenv from 'dotenv';
import fs from 'fs';
import { HandleAFCTemplateDeletion } from './AFCTemplateDeletionHandler.js';
import { getNewFilterTrigger } from './helpers.js';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

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

let lastFilterTrigger = null;


setInterval(async () => {
    const newFilterTrigger = await getNewFilterTrigger(bot, 1370, config.pollInterval +  config.pollIntervalSlack);
    if (newFilterTrigger !== lastFilterTrigger) {
        lastFilterTrigger = newFilterTrigger;
        console.log(`New filter trigger found: ${newFilterTrigger}`);
        setTimeout(async () => {
            try {
                await HandleAFCTemplateDeletion(bot, newFilterTrigger, config.verbose, config.dryRun);
                if (config.verbose) {
                    console.log(`Successfully restored AFC templates to ${newFilterTrigger}`);
                }
            } catch (error) {
                console.error(`Error restoring AFC templates: ${error}`);
            }
        }, config.delayAfterFilterTrigger * 1000);
    }
}, config.pollInterval * 1000);

export { bot };