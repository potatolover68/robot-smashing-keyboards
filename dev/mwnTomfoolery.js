import { getFirstNLines, getRevisionContent } from '../bot/helpers.js';
import { HandleAFCTemplateDeletion } from '../bot/AFCTemplateDeletionHandler.js';
import { bot } from '../bot/index.js';

/*
let page = new bot.Page('User:Monkeysmashingkeyboards/FakeAFCDraft');
const history = await page.history();

console.log(history);

history.forEach(async revision => {
  console.log(revision.timestamp);
  const revisionContent = await getRevisionContent(bot, revision.revid);
  console.log(revisionContent);
  console.log(getFirstNLines(revisionContent.content, 25));
});
*/

const result = await HandleAFCTemplateDeletion(bot, 1327020615, true, true);
console.log(result);