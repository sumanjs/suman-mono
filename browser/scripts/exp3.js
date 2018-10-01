const puppeteer = require('puppeteer');

(async () => {

  const args = puppeteer.defaultArgs().filter(arg => String(arg).toLowerCase() !== '--disable-extensions');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    ignoreDefaultArgs: true,
    args: args.concat([
        '--remote-debugging-port=9223',
        '--load-extension=/Users/alexamil/WebstormProjects/oresoftware/sumanjs/suman-chrome-extension'
      ]
    )
  });

  const c = await puppeteer.connect({
    browserWSEndpoint:  browser.wsEndpoint() ,   //`ws://${host}:${port}/devtools/browser/<id>`,
    ignoreHTTPSErrors: false
  });

  const page = await c.newPage();
  await page.goto('chrome-extension://hfnplgaapcnjblpebnhibfcdfllkpaaf/dist/index.html');

  setTimeout(async function(){
    const page = await c.newPage();
    await page.goto('chrome-extension://hfnplgaapcnjblpebnhibfcdfllkpaaf/dist/index.html');
  }, 3000);

})();