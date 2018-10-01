// const puppeteer = require('puppeteer');
//
// (async function () {
//
//   const b = await puppeteer.launch({
//     devtools: true
//   });
//
//   const page = await b.newPage();
//   await page.goto('https://example.com');
//
// })();


const util = require('util');

const puppeteer = require('puppeteer');

(async () => {


  const args = puppeteer.defaultArgs().filter(arg => String(arg).toLowerCase() !== '--disable-extensions');

  const b = await puppeteer.launch({
    headless: false,
    devtools: true,
    ignoreDefaultArgs: true,
    args: args.concat(['--remote-debugging-port=9223'])
  });

  const browser = await puppeteer.connect({
    browserWSEndpoint:  b.wsEndpoint() ,   //`ws://${host}:${port}/devtools/browser/<id>`,
    ignoreHTTPSErrors: false
  });

  const page = await browser.newPage();
  await page.goto('chrome-extension://hfnplgaapcnjblpebnhibfcdfllkpaaf/dist/index.html');


})();
