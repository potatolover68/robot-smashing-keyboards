import { makeTimestampLookNiceAndReadableAndNotJustAGiantStringOfNumbers } from './helpers.js';

function extractAFCSubmissionTemplates(body) {
  const results = [];
  const startRegex = /\{\{[Aa][Ff][Cc] submission\|/g;
  const customReasonRegex = /^\{\{[Aa][Ff][Cc] submission\|[Dd]\|reason\|/;
  let match;

  while ((match = startRegex.exec(body)) !== null) {
    const startIndex = match.index;
    let template;

    // Check if it's a custom reason template (can have nested templates)
    if (customReasonRegex.test(body.slice(startIndex))) {
      // Use brace counting for nested templates
      let braceCount = 2;
      let i = startIndex + match[0].length;

      while (i < body.length && braceCount > 0) {
        if (body[i] === '{' && body[i + 1] === '{') {
          braceCount++;
          i += 2;
        } else if (body[i] === '}' && body[i + 1] === '}') {
          braceCount--;
          i += 2;
        } else {
          i++;
        }
      }

      if (braceCount === 0) {
        template = body.slice(startIndex, i);
      }
    } else {
      // Simple case: no nested templates, find first }}
      const simpleMatch = body.slice(startIndex).match(/^\{\{[Aa][Ff][Cc] submission\|[^}]+\}\}/);
      if (simpleMatch) {
        template = simpleMatch[0];
      }
    }

    if (template) {
      results.push(template);
    }
  }

  // Sort by timestamp (highest/newest first), then append comment
  return results
    .map(template => {
      const tsMatch = template.match(/\|ts=(\d{14})\|?/);
      const timestamp = tsMatch ? parseInt(tsMatch[1], 10) : 0;
      const readableTimestamp = tsMatch ? makeTimestampLookNiceAndReadableAndNotJustAGiantStringOfNumbers(tsMatch[1]) : 'unknown time';
      return { template, timestamp, readableTimestamp };
    })
    .sort((a, b) => b.timestamp - a.timestamp);
    // .map(({ template }) => template + '<!-- Do not remove this line! -->'); will add in do not delete comment later
}

function extractAFCCommentTemplates(body) {
  const results = [];
  const startRegex = /\{\{[Aa][Ff][Cc] comment\|/g;
  let match;

  while ((match = startRegex.exec(body)) !== null) {
    const startIndex = match.index;
    let braceCount = 1; // We've matched one pair {{
    let i = startIndex + match[0].length;

    // Walk through the string, counting braces
    while (i < body.length && braceCount > 0) {
      if (body[i] === '{' && body[i + 1] === '{') {
        braceCount++;
        i += 2;
      } else if (body[i] === '}' && body[i + 1] === '}') {
        braceCount--;
        i += 2;
      } else {
        i++;
      }
    }

    if (braceCount === 0) {
      results.push(body.slice(startIndex, i));
    }
  }

  return results.map(template => ({ template }));
}

function RemoveAllAFCTemplates(body) {
  let newBody = body;
  const submissionTemplates = extractAFCSubmissionTemplates(body);
  const commentTemplates = extractAFCCommentTemplates(body);
  
  submissionTemplates.forEach(item => {
    newBody = newBody.replace(item.template, '');
  });
  commentTemplates.forEach(item=> {
    newBody = newBody.replace(item.template, '');
  });


  // remove the do not remove comments
  newBody = newBody.replace(/<!-- Do not remove this line! -->/gi, '');

  // remove the weird section divider thingy
  newBody = newBody.replace(/----/, '');

  // Trim excess whitespace
  newBody = newBody.replace(/\n{3,}/, '\n\n'); // excess whitespace is usually only produced by AFC comments, so no G flag should work

  return newBody;
}

function prepareAFCTemplates(comments, submissions) {
  let result = '';

  submissions.forEach(item => {
    result += item.template + '\n<!-- Do not remove this line! -->\n';
  });

  comments.forEach(item => {
    result += item.template + '\n';
  });

  if (result.trim().length > 0) {
    result = result.trim() + '\n----\n';
  }

  return result;
}

function appendAFCTemplatesToBody(body, comments, submissions) {
  const preparedTemplates = prepareAFCTemplates(comments, submissions);
  const cleanedBody = RemoveAllAFCTemplates(body);
  return preparedTemplates + cleanedBody; 
}


function HandleAFCTemplateDeletion(bot, page) {
  
}

export { HandleAFCTemplateDeletion, extractAFCSubmissionTemplates, extractAFCCommentTemplates, RemoveAllAFCTemplates, appendAFCTemplatesToBody };