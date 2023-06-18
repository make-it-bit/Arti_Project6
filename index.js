import puppeteer from 'puppeteer';

//function that gets the amount of cars in the page
const getCarLinksAmount = () => {
  console.log('Extracting the amount of car links we should get');

  const amountOfCarsElement = document.querySelector(
    'div.navigation.relative.z1 > ul > li'
  );
  const amountOfCarsElementInnerText = amountOfCarsElement.innerText;
  let amountOfCars = amountOfCarsElementInnerText.replace(/[^0-9]/g, '');

  return amountOfCars;
};

//function that extracts the links in the page
const extractLinks = () => {
  console.log('Extracting links');

  const listOfLinkElements = document.querySelectorAll('a.tricky_link');
  const listOfLinks = [];

  let i = 0;
  while (i < listOfLinkElements.length) {
    listOfLinks.push(listOfLinkElements[i].href);
    i++;
  }

  return listOfLinks;
};

//main function of the app, evaluate basicly runs the provided script inside the broswer
const scrapeItems = async ({
  page: pageObject,
  amountOfCarLinks: amountOfLinks,
  scrollDelay,
}) => {
  let arrayOfCarLinks = [];
  try {
    let previousWindowScrollHeight;
    while (arrayOfCarLinks.length < amountOfLinks) {
      //calling a function to get the links currently available
      arrayOfCarLinks = await pageObject.evaluate(extractLinks);

      previousWindowScrollHeight = await pageObject.evaluate(
        'document.body.scrollHeight'
      );
      await pageObject.evaluate(
        'window.scrollTo(0, document.body.scrollHeight)'
      );
      await pageObject.waitForFunction(
        `document.body.scrollHeight > ${previousWindowScrollHeight}`
      );
      await pageObject.waitForTimeout(scrollDelay);
      console.log(
        `Progress update: ${arrayOfCarLinks.length}/${amountOfLinks} collected.`
      );
    }
    console.log('Done');
  } catch (err) {
    console.log(
      'Got an timeout error. Failed to fetch all of the data from the page.'
    );
  } finally {
    return arrayOfCarLinks;
  }
};

const getArrayOfCarLinks = async () => {
  console.log('---------------Starting the process---------------');
  //calling the functions, starting the browser and 'doing the heavy lifting'
  let browser;
  let page;
  let amountOfCarLinks;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    page = await browser.newPage();

    //bigger timeouts for a higher success rate
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    page.setViewport({ width: 1280, height: 720 });

    //going to the vaihtoautot page
    await page.goto('https://www.nettiauto.com/yritys/2267640/vaihtoautot', {
      waitUntil: 'load',
    });

    amountOfCarLinks = await page.evaluate(getCarLinksAmount);
    console.log(`Trying to get the links of ${amountOfCarLinks} cars.`);
  } catch (e) {
    console.log('Failed to start the process.');
    console.log('Exiting process.');
    process.exit(0);
  }

  const linksOfCars = await scrapeItems({
    page,
    amountOfCarLinks,
    scrollDelay: 800,
  });

  //Ending the process
  console.log(`${linksOfCars.length} links:`);
  console.log(linksOfCars);
  console.log('Exiting the process.');
  process.exit(0);
};

getArrayOfCarLinks();
