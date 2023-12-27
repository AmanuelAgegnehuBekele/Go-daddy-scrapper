import puppeteer from "puppeteer";
const auctionPriceSelector =
  "#main > div > div > div > div > div > table > tbody > tr > td.price-scheme";
const nextPageSelector =
  "#main > div > div > div > div > div > div > ul > li.page-item.next > button";
const browser = await puppeteer.launch({
  headless: false,
});
const page = await browser.newPage();

await page.goto("https://auctions.godaddy.com/beta");
const auctions = [];
for (let i = 0; i < 200; i++) {
  console.log(i);
  await page.waitForFunction(
    'document.querySelector("#main > div > div > div.card.mb-0.border-0.row.px > div.row.mt")'
  );
  await page.waitForSelector(auctionPriceSelector);
  const auctionResult = await page.evaluate((priceSelector) => {
    const result = [...document.querySelectorAll(priceSelector)].map(
      (item) => item.textContent
    );
    return result;
  }, auctionPriceSelector);
  console.log("auctionResult", auctionResult);
  auctions.push(...auctionResult);
  await page.waitForSelector(nextPageSelector);
  await page.click(nextPageSelector);
  new Promise((resolve) => setTimeout(resolve, 2000));
}
let totalBidPrice = 0;
const regex = /\$[\d,.]+/g;
auctions.map((auction) => {
  const result = auction.match(regex)[0].replace("$", "");
  const price = parseFloat(result.replace(/,/g, ""));
  totalBidPrice += price;
});
const avgBidPrice = totalBidPrice / auctions.length;
// console.log("auctions", auctions);
console.log("auction", auctions);
console.log("auctionsLength", auctions.length);
console.log("totalBidPrice", totalBidPrice);
console.log("avgBidPrice", avgBidPrice);
const data = JSON.stringify(auctions);
fs.writeFileSync("auctionData.json", data, (err) => {});
await browser.close();
