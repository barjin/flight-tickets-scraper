const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

let BASE_DAY_COUNT = 4;

async function getFlightPrices(destination, options = {}) {

  const { minDayCount = 0, maxDayCount = 14, page } = options;
  let prices = [];

  let ding = () => {};

  const urlPredicate = (x) => x.href.includes('GetCalendarGraph');
  await page.route(urlPredicate, async (r) => {
    try {
      const response = await r.fetch();
    
      let body = await response.text();

        const message = /(\[\["wrb.fr".*)/.exec(body)[1];
        const payload = JSON.parse(message)[0][2];
        const offers = JSON.parse(payload)[1].map((x) => {
          if(x && x[2]){
            return {
              dateFrom: new Date(x[0]),
              dateTo: new Date(x[1]),
              price: x[2][0][1],
            };
          }
          else {
            return null;
          }
        }).filter(x => x);

        if(offers.length > 0 && offers[0].dateTo - offers[0].dateFrom > minDayCount * 24 * 60 * 60 * 1000 && offers[0].dateTo - offers[0].dateFrom < maxDayCount * 24 * 60 * 60 * 1000) {
          prices = prices.concat(offers);
        }
        
        await r.fulfill({
          response,
        });
    }
    catch (e) {
      // console.error(e);
    }

    ding();
  });

  const flush = async () => {
    await page.unroute(urlPredicate);
    return [];
  };

  if (!destination) {
    return flush();
  }

  try {
    await page.getByPlaceholder('Where to?').click({timeout: 500});
  } catch (e) {
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('combobox', { name: 'Where else?' }).click();
  }

  const before = await page.getByRole('combobox', { name: 'Where else?' }).inputValue();
  await page.getByRole('combobox', { name: 'Where else?' }).fill(destination);
  const after = await page.getByRole('combobox', { name: 'Where else?' }).inputValue();

  if (before === after) {
    return flush();
  }
  await page.getByRole('combobox', { name: 'Where else?' }).press('Enter');

  try {
    await page.getByRole('button', { name: 'Search' }).click({timeout: 2000});
  } catch (e) {
    // await page.getByRole('combobox').nth(1).click();
    // await page.getByRole('combobox', { name: 'Where else?' }).click();
  }

  await page.waitForTimeout(1000);

  if(await page.getByRole('button', { name: 'Stops, Not selected' }).count() > 0) {
    await page.getByRole('button', { name: 'Stops, Not selected' }).click();

    if (await page.getByText('Nonstop only').isEnabled()) {
      await page.getByText('Nonstop only').click();
    } else {
      await page.getByRole('button', { name: 'Close dialog' }).click();
      return flush();
    }
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await page.waitForTimeout(1000);
  }

  // if(await page.getByRole('heading', { name: 'No nonstop flights found' }).count() > 0) {
  //   return flush();
  // }
  
  await page.getByRole('button', { name: 'Price graph' }).click();

  for (let i = BASE_DAY_COUNT; i > minDayCount ; i--) {
      await page.getByRole('button', { name: 'Reduce your stay by one day' }).click();
  }
  
  for (let i = minDayCount; i < maxDayCount ; i++) {
      await page.getByRole('button', { name: 'Extend your stay by one day' }).click();
      await Promise.race([new Promise(r => ding = r), page.waitForTimeout(5000)]);
  }

  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.unroute(urlPredicate);
  return prices;
};

async function spawnBrowser(num) {
  while(true) {
    const browser = await chromium.launch({
      headless: false,
    });
    
    try {
      const targetAirports = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'pragueReachable.json'), 'utf8')).filter((_, i) => i % 4 === num);

      const context = await browser.newContext({
        recordVideo: process.env['VIDEO']==='true' ? {
          dir: path.join(__dirname, 'videos'),
        } : undefined,
      });
      const page = await context.newPage();

      await page.goto('https://consent.google.com/m?continue=https://www.google.com/travel/flights&gl=CZ&m=0&pc=trv&cm=2&hl=en-US&src=1');

      try {
          await page.getByRole('button', { name: 'Accept all' }).click({timeout: 1000});
      } catch (e) {
          // console.error('No cookie banner');
      };

      await page.locator('.II2One').first().click();
      await page.getByRole('combobox', { name: 'Where else?' }).fill('Praha');
      await page.getByRole('combobox', { name: 'Where else?' }).press('Enter');

      for (const airport of targetAirports) {
        const flightprices = await getFlightPrices(airport.iata, { dayCount: 8, page });
        console.log(JSON.stringify({
          ...airport,
          flightprices,
        }, null, 2));
      }
    } catch (e) {
      await browser.close();
      continue;
    }

    await browser.close();
    return;
  }
};

(async () => {
  await Promise.race([
    Promise.all([
      spawnBrowser(0),
      spawnBrowser(1),
      spawnBrowser(2),
      spawnBrowser(3),
    ]),
    new Promise(r => setTimeout(r, 1000 * 60 * 30)),
  ]);

  process.exit(0);
})();