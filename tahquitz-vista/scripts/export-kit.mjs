// Copies the handset source into /public/handset/kit as .txt so it can be
// viewed/downloaded straight from Developer mode. Runs automatically before every build.
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = join(process.cwd(), 'public/handset/kit');
mkdirSync(out, { recursive: true });
const files = [
  'components/dashboard/HandsetCompact.tsx',
  'components/dashboard/HandsetDevPanel.tsx',
  'components/dashboard/meridianAdapters.ts',
];
for (const f of files) copyFileSync(join(process.cwd(), f), join(out, f.split('/').pop() + '.txt'));

writeFileSync(join(out, 'README.txt'), `MERIDIAN HANDSET KIT
====================
Generated ${new Date().toISOString()}

FILES
  HandsetCompact.tsx.txt   The handset UI: all three cabin tiers, keys, animations, backlight logic.
  HandsetDevPanel.tsx.txt  Developer mode (brand editor, media metadata reader, exporter).
  meridianAdapters.ts.txt  THE ONLY FILE TO EDIT TO GO LIVE: media, player, lights, call, cabin/PA, telemetry.
  volume-blade.html        Standalone Business volume blade. No framework. Open it in any browser.

GO LIVE IN 5 STEPS
  1. Brand:   Developer mode > Brand. Set colours, logo, airline name. Export > Download full config.
  2. Content: Point "Media catalog" (Go Live tab) at your IFE content API, or edit titles in Content.
  3. Wire:    Fill endpoints in Go Live (player, lights, call, cabin state). They're saved into the config.
              Developers: swap mockAdapters for httpAdapter(config.integrations) in meridianAdapters.ts.
  4. Load:    Open the kiosk URL for the cabin tier on the device (Hardware tab). Import the config once.
  5. Certify: Run on the target panel, check frame rate + contrast, then airline/aircraft-specific approval.

Rename .tsx.txt -> .tsx / .ts.txt -> .ts to drop into a Next.js/React project (deps: react, framer-motion, tailwindcss).
`);
console.log('[export-kit] wrote', files.length + 1, 'files to public/handset/kit');
