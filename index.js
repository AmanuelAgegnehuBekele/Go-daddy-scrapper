import axios from "axios";
import { format } from "date-fns";
import fs from "fs";

(async () => {
  const param = {
    endTimeAfter: new Date().toISOString(),
    paginationSize: 50,
    paginationStart: 0,
    sortBy: "auctionBids%3Adesc",
    typeIncludeList: "14%2C16%2C38",
    useSemanticSearch: false,
  };
  const auctionIds = [];
  const auctionData = [];
  let totalBidPrice = 0;
  for (let i = 0; i <= 9950; i += 50) {
    console.log(i);
    const result = await axios
      .get(
        `https://auctions.godaddy.com/beta/findApiProxy/v3/aftermarket/find/auction/recommend?endTimeAfter=${param.endTimeAfter}&paginationSize=${param.paginationSize}&paginationStart=${i}&sortBy=${param.sortBy}&typeIncludeList=${param.typeIncludeList}&useSemanticSearch=${param.useSemanticSearch}`
      )
      .then((res) => res.data.results)
      .catch((err) => console.log("err", err));
    if (result) {
      auctionData.push(...result);
    }
  }
  auctionData.map((auction) => {
    auctionIds.push(auction.auction_id);
    totalBidPrice += auction.auction_price;
  });
  const todaysAuctions = [];
  const todaysDate = format(new Date(), "yyyy-MM-dd");
  auctionData.map((item) => {
    const date = item.auction_end_time.split(" ")[0];
    if (date === todaysDate) {
      todaysAuctions.push(item.auction_id);
    }
  });
  const noOfTodaysAuctions = todaysAuctions.length;
  const avgBidPrice = totalBidPrice / auctionData.length;
  const finalResult = {
    noOfTodaysAuctions,
    avgBidPrice,
    auctionIds,
  };
  console.log("avgBidPrice", avgBidPrice);
  console.log("length", auctionData.length);
  console.log("noOfTodaysAuctions", noOfTodaysAuctions);
  console.log("totalBidPrice", totalBidPrice);
  const data = JSON.stringify(finalResult);
  fs.writeFileSync("auctionData.json", data, (err) => {});
})();
