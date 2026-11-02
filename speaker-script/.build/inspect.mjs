import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';

const input = '/Users/gaozhenchao/Code/AS_CSC++/Final_Presentation_source.pptx';
const out = '/Users/gaozhenchao/Code/AS_CSC++/speaker-script/.build';
try {
  const deck = await PresentationFile.importPptx(await FileBlob.load(input));
  const snapshot = await deck.inspect({
    kind: 'slide,textbox,shape,table,notes,layout',
    maxChars: 30000,
  });
  await fs.writeFile(`${out}/inspect.ndjson`, snapshot.ndjson);
  console.log(`slides=${deck.slides.items.length}`);
  console.log(snapshot.ndjson);
} catch (error) {
  console.error(error?.message ?? String(error));
  process.exitCode = 1;
}
