import puppeteer from 'puppeteer';

//function that gets the amount of cars in the page
function getCarLinksAmount() {
  console.log('Extracting the amount of car links we should get');

  const amountOfCarsElement = document.querySelector('div.navigation.relative.z1 > ul > li');
  const amountOfCarsElementInnerText = amountOfCarsElement.innerText;
  let amountOfCars = amountOfCarsElementInnerText.replace(/[^0-9]/g, '');
  
  return amountOfCars;
};

//function that extracts the links in the page
async function extractLinks() {
  console.log("Extracting links");

  const listOfLinkElements = document.querySelectorAll('a.tricky_link');
  const listOfLinks = [];

  let i = 0;
  while (i < listOfLinkElements.length) {
    listOfLinks.push(listOfLinkElements[i].href);
    i ++;
  };

  return listOfLinks;
};

//main function of the app, evaluate basicly runs the provided script inside the broswer
async function scrapeItems (
  pageObject,
  amountOfLinks,
  scrollDelay
  ) { 
    let arrayOfCarLinks = [];
    try {
      let previousWindowScrollHeight;
      while (arrayOfCarLinks.length < amountOfLinks) {
        //calling a function to get the links currently available
        arrayOfCarLinks = await pageObject.evaluate(extractLinks);
        //scrollHeight gives the 'maximum scrollable amount'
        previousWindowScrollHeight = await pageObject.evaluate('document.body.scrollHeight');
        await pageObject.evaluate('window.scrollTo(0, document.body.scrollHeight');
        await pageObject.waitForFunction(`document.body.scrollHeight > ${previousWindowScrollHeight}`);
        await pageObject.waitForTimeout(scrollDelay);
      }
    } catch(err) {
      return arrayOfCarLinks;
    };
};


//this syntax immiedatly invokes the function
(async function getArrayOfCarLinks() {
    //launching the 'browser'
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 720 });

    //going to the vaihtoautot page
    await page.goto('https://www.nettiauto.com/yritys/2267640/vaihtoautot');

    //calling the functions/'doing the heavy lifting'
    const amountOfCarLinks = await page.evaluate(getCarLinksAmount);

    const linksOfCars = await scrapeItems(page, amountOfCarLinks, 500);

    console.log(linksOfCars);
})();