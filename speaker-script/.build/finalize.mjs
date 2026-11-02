import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';

process.env.RUNTIME_NODE_MODULES = '/Users/gaozhenchao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';

const workspaceDir = '/Users/gaozhenchao/Code/AS_CSC++/speaker-script';
const skillDir = '/Users/gaozhenchao/.codex/plugins/cache/openai-primary-runtime/presentations/26.1025.11240/skills/presentations';
const runtimePython = '/Users/gaozhenchao/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const referencePath = '/Users/gaozhenchao/Code/AS_CSC++/Final_Presentation_source.pptx';
const draftPath = path.join(workspaceDir, 'output', 'Final_Presentation_with_Speaker_Notes.pptx');
const finalPath = path.join(workspaceDir, 'output', 'Final_Presentation.pptx');
const stagingDir = path.join(workspaceDir, '.codex-finalizer');
const candidatePath = path.join(stagingDir, 'candidate.pptx');

const presentation = await PresentationFile.importPptx(await FileBlob.load(draftPath));
await fs.mkdir(stagingDir, { recursive: true });
await fs.mkdir(path.dirname(finalPath), { recursive: true });
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const { finalizePresentation } = await import(pathToFileURL(
  path.join(skillDir, 'container_tools', 'artifact_tool_utils.mjs'),
).href);

const requirements = {
  explicitTotalSlideCount: 10,
  requiredNativeTableOwnerSlides: [5],
  requiredNativeChartOwnerSlides: [],
};

const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(skillDir, 'container_tools', 'inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skillDir, 'container_tools', 'inspect_presentation_layout_geometry.py'),
  layoutArgs: [
    '--expected-slide-size-emu', '12192000,6858000',
    '--validate-bullet-geometry',
    '--validate-heading-fit',
    '--require-native-table-slide', '5',
  ],
  requiredNativeTableOwnerSlides: requirements.requiredNativeTableOwnerSlides,
  fontPolicy: {
    basis: 'reference',
    families: ['Arial', 'Georgia'],
    referencePath,
    referenceSha256: '0008b3920c344c0072f0292a726d58e8b0c60953102c3688355d1968082bae9f',
  },
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, `${path.basename(finalPath)}.validation.json`),
});

console.log(JSON.stringify(result, null, 2));
