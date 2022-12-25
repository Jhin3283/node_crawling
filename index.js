const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const https = require("https");
const { Builder, By, Key, until } = require("selenium-webdriver");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const run = async (searchWord, scroll, fileName) => {
  // const service = new chrome.ServiceBuilder().build();
  // "/opt/homebrew/bin/chromedriver"
  // chrome.setDefaultService(service);
  const driver = await new Builder().forBrowser("chrome").build();

  // Direct move to image search page (save google main page to input search time)
  const url = "https://www.google.com/search?q=";
  const keyword = searchWord;
  const imageTab = "&source=lnms&tbm=isch";
  const name = fileName;
  await driver.get(url + keyword + imageTab);

  // Scroll page
  const elem = driver.findElement(By.tagName("body"));
  for (let i = scroll; i > 0; i--) {
    await elem.sendKeys(Key.PAGE_DOWN);
    try {
      await driver.findElement(By.className("mye4qd")).click();
      // await driver.findElement(By.className("scSharedMaterialbuttonroot scSharedMaterialbuttontext scSharedMaterialbuttoncolor-label scSharedMaterialbuttonicon-only")).click
    } catch (err) {}
    console.log(`Scrolling...${i}`);
  }

  // Get image url and download
  const imgs = await driver.findElements(By.className("rg_i Q4LuWd"));
  console.log("total image : " + imgs.length);
  const links = [];
  let pos = 1;
  function sleep(sec) {
    return new Promise((resolve) => setTimeout(resolve, sec * 500));
  } // 함수정의
  // Create folder
  !fs.existsSync(keyword) && fs.mkdirSync(keyword);
  for (let img of imgs) {
    try {
      await img.click();
      await sleep(3);
      let imgurl = await driver
        .findElement(
          By.xpath(
            `//*[@id="Sva75c"]/div[2]/div/div[2]/div[2]/div[2]/c-wiz/div[2]/div[1]/div[1]/div[2]/div/a/img`
          )
        )
        .getAttribute("src");
      if (imgurl != null) {
        links.push(imgurl);
        // Folder Path
        let dir = `./${keyword}/${name}_${pos}.png`;
        // Image Download
        if (imgurl != null && imgurl.includes("data:image", 0)) {
          // Base64 image
          let base64 = imgurl.split(",");
          let decode = Buffer.from(base64[1], "base64");
          fs.writeFileSync(dir, decode);
          console.log(`${name}_${pos} Download Completed`);
        } else if (imgurl != null) {
          // Https URL image
          https.get(imgurl, (res) => {
            const filePath = fs.createWriteStream(dir);
            res.pipe(filePath);
            filePath.on("finish", () => {
              filePath.close();
              console.log(`${name}_${pos} Download Completed`);
            });
          });
        } else {
          console.log(`Can't find url`);
        }
        pos++;
      }
    } catch {
      console.log("error pass");
    }
  }
  driver.quit();
};

// First variable : search word
// Second variable : num of scroll (I think 250 is enough.)
run("뉴진스", 10, "New_Jeans");
