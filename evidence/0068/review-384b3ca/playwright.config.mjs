export default {
 testDir: '/workspace/cats-0068/e2e',
 outputDir: '/workspace/scratch/cats-alias-review/playwright',
 fullyParallel: false, workers: 1, timeout: 90000, expect: { timeout: 10000 },
 use: { baseURL: 'http://127.0.0.1:5468', launchOptions: { executablePath: '/usr/bin/chromium', args: ['--mute-audio'] }, trace: 'retain-on-failure' },
 projects: [ {name:'desktop',use:{browserName:'chromium',viewport:{width:1440,height:1000}}}, {name:'phone',use:{browserName:'chromium',viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true}} ],
 webServer: [
 {command:'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5468 --strictPort',cwd:'/workspace/cats-0068',url:'http://127.0.0.1:5468',reuseExistingServer:false,timeout:30000},
 {command:'node node_modules/typescript/bin/tsc -b && node node_modules/vite/bin/vite.js build && node node_modules/vite/bin/vite.js preview --base /junyan/ --host 127.0.0.1 --port 5568 --strictPort',cwd:'/workspace/cats-0068',url:'http://127.0.0.1:5568/junyan/',reuseExistingServer:false,timeout:30000}
 ]
};
