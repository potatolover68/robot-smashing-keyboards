import { extractAFCSubmissionTemplates, extractAFCCommentTemplates, RemoveAllAFCTemplates, appendAFCTemplatesToBody } from './AFCTemplateDeletionHandler.js';
import { getFirstNLines } from './helpers.js';

import fs from 'fs';
import path from 'path';

const devDir = 'dev/drafts';
const drafts = fs.readdirSync(devDir)
  .filter(file => file !== 'credits.txt')
  .map(file => path.join(devDir, file));

for (const draft of drafts) {
  console.log(`\n=== ${draft} ===`);
  const body = fs.readFileSync(draft, 'utf8');

  console.log('Submission templates:');
  const submissions = extractAFCSubmissionTemplates(body);
  console.log(submissions);

  console.log('\nComment templates:');
  const comments = extractAFCCommentTemplates(body);
  console.log(comments);

  console.log('\nAfter RemoveAllAFCTemplates: (first 20 lines)');
  const cleaned = RemoveAllAFCTemplates(body);
  console.log(getFirstNLines(cleaned, 20));
  console.log(`\nOriginal length: ${body.length}, Cleaned length: ${cleaned ? cleaned.length : 'undefined (no return value)'}`);

  console.log('\n--- Testing appendAFCTemplatesToBody ---');
  console.log('Re-adding templates to cleaned body...');
  const reconstructed = appendAFCTemplatesToBody(body, comments, submissions);
  console.log('\nReconstructed (first 20 lines):');
  console.log(getFirstNLines(reconstructed, 20));
  console.log(`\nReconstructed length: ${reconstructed.length}`);
}