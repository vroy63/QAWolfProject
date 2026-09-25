// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

// Validate that EXACTLY the first 100 articles are sorted from newest to oldest

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News (newest page)
  await page.goto("https://news.ycombinator.com/newest");

  let allArticles = new Map();

  // Specifying that 100 articles are collected
  while (allArticles.size < 100){
    // pause execution of script until an element appears
    await page.waitForSelector(".athing") 

    // Extracting the element IDs and the timestamps ( to then sort from Newest to Oldest)
    const pageData = await page.evaluate(() => {
      // grabs data from hackernews and turns it into an Array - item_list
      const rows = Array.from(document.querySelectorAll(".athing"));
      // make item_list into an object map with subline and element age
      return rows.map((item) => {
        // instatiate element's subline property
        const subline = item.nextElementSibling;
        // instantiate element's age property
        const ageElement = subline ? subline.querySelector(".age") : null;
        // returning map
        return {
          id: item.id,
          // to reach the HTML elements and pull out the specific data
          title: item.querySelector(".titleline > a")?.innerText,
          // get title attribute which has the timestamp
          timestamp: ageElement ? ageElement.getAttribute("title") : null,
        };
      });
    });

   // Add new articles to Map if Map < 100
    pageData.forEach(art => {
      if (allArticles.size < 100) {
        allArticles.set(art.id, art);
      }
    });
  
    console.log(`Currently have ${allArticles.size} unique articles`);

    // If less than 100 elements given, click on "More"
    if (allArticles.size < 100){
     const moreButton = page.locator(".morelink");
     // check to make sure if there are less than a 100 articles
     // prevent infinite loop of trying to load more when there are no more
     const exist = await moreButton.count() > 0;
     // check to see if the more button is there
     const visible = await moreButton.isVisible()
     if (exist && visible) {
       await moreButton.click();
       // waiting for new content to load
       await page.waitForSelector(".athing")
      }
      else {
        break;
      }
    }
  }

  // convert map into Array for comparision
  const finalList = Array.from(allArticles.values());

  // finally check whether the articles are sorted  from Newest to Oldest
  let isSorted = true;
  for (let i = 0; i < finalList.length - 1; i++) {
    const current = new Date(finalList[i].timestamp);
    const next = new Date(finalList[i + 1].timestamp);

    // Newer times are greater than older times ( milliseconds from 1970 )
    // Errors in Validation handling {Current should by >= Next}
    if (current < next) {
      console.error(`Article [${finalList[i].title}] is older than [${finalList[i+1].title}]`);
      isSorted = false;
      break;
    }
  }
  // Outputed statement
  if (isSorted) {
    console.log("Success: First 100 articles are sorted correctly")
   } 
  else {
    console.log("Error: Articles are incorrectly sorted")
  }
  // close
  await browser.close();
}


(async () => {
  await sortHackerNewsArticles();
})();
