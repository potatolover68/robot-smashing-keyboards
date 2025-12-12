async function compareEdits(bot, fromrev, torev) {
  // im stupid, my algorithm doesn't even need diffs, this function is completely useless
  return await bot.request({
    action: 'compare',
    fromrev: fromrev,
    torev: torev,
  }).then(result => {
    return result.compare.body;
  }).catch(error => {
    console.error(error);
    return null;
  });
}

async function getRevisionContent(bot, revid) {
  return await bot.request({
    action: 'query',
    revids: revid,
    prop: 'revisions',
    rvprop: 'content|timestamp',
    rvslots: 'main'
  }).then(result => {
    const pages = result.query.pages;
    if (pages && pages.length > 0) {
      const page = pages[0];
      if (page.revisions && page.revisions.length > 0) {
        const revision = page.revisions[0];
        // Handle both new format (slots.main.content) and legacy format (*)
        const content = revision.slots?.main?.content || revision['*'];
        return {
          content: content,
          timestamp: revision.timestamp,
          title: page.title,
          pageid: page.pageid,
          revid: revision.revid
        };
      }
    }
    return null;
  }).catch(error => {
    console.error(error);
    return null;
  });
}

async function getPreviousRevisionId(bot, pageid, currentRevid) {
  return await bot.request({
    action: 'query',
    pageids: pageid,
    prop: 'revisions',
    rvprop: 'ids',
    rvlimit: 2,
    rvstartid: currentRevid,
    rvdir: 'older'
  }).then(result => {
    const pages = result.query.pages;
    if (pages && pages.length > 0) {
      const page = pages[0];
      if (page.revisions && page.revisions.length >= 2) {
        // First revision is the current one, second is the previous
        return page.revisions[1].revid;
      }
    }
    return null;
  }).catch(error => {
    console.error(error);
    return null;
  });
}

// now this function... this function is actually useful
function getFirstNLines(text, n) {
  return text.split('\n').slice(0, n).join('\n');
}

function makeTimestampLookNiceAndReadableAndNotJustAGiantStringOfNumbers(timestamp) {
  // Parse YYYYMMDDHHMMSS format
  const str = timestamp.toString();
  const year = str.substring(0, 4);
  const month = str.substring(4, 6);
  const day = str.substring(6, 8);
  const hour = str.substring(8, 10);
  const minute = str.substring(10, 12);
  const second = str.substring(12, 14);

  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  });
}


export {compareEdits, getRevisionContent, getPreviousRevisionId, getFirstNLines, makeTimestampLookNiceAndReadableAndNotJustAGiantStringOfNumbers};