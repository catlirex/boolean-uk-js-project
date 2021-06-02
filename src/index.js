let state = {
  watchList: [
    {
      name: 'Apple',
      symbol: 'AAPL',
      price: 125.76,
    },
    {
      name: 'Tesla',
      symbol: 'TSLA',
      price: 125.76,
    },
    {
      name: 'Amazon',
      symbol: 'AMZN',
      price: 125.76,
    },
  ],
};
const header = document.querySelector('.main-header');
const newsContainer = document.querySelector('.related-news-container');

function getStockSummary(stockSymbo) {
  return fetch(
    `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${stockSymbo}&region=US`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '2cf42d03cdmshea8aa5ef2111c14p16bab0jsnf5b3354df1b4',
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
      },
    }
  )
    .then((response) => response.json())
    .catch((err) => {
      console.error(err);
    });
}

function getSearchRelatedNews(stockSymbol) {
  return fetch(
    `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/get-news?category=${stockSymbol}&region=US`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '2cf42d03cdmshea8aa5ef2111c14p16bab0jsnf5b3354df1b4',
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
      },
    }
  )
    .then((response) => response.json())
    .catch((err) => {
      console.error(err);
    });
}

function searchStock() {
  let searchform = document.querySelector('.search-form');
  let searchInput = document.querySelector('.search-bar');
  // console.log(searchform)
  // console.log(searchInput)

  searchform.addEventListener('submit', function (event) {
    event.preventDefault();

    console.log(searchInput.value);

    getStockSummary(searchInput.value).then(function (data) {
      console.log(data);
      render(data);
      // name of stock/ symbol / price(regularMarketPrice)
      // see related news

      // add watchlist button -> update state -> update listing
    });

    getSearchRelatedNews(searchInput.value).then(function (data) {
      console.log(data);
    });
  });
}

function renderHeader(data) {
  let stockNameDiv = document.createElement('div');
  stockNameDiv.className = 'stock-name';
  let symbolH1 = document.createElement('h1');
  symbolH1.innerText = data.symbol;
  let nameH2 = document.createElement('h2');
  nameH2.innerText = data.price.shortName;
  stockNameDiv.append(symbolH1, nameH2);

  let priceContainer = document.createElement('div');
  priceContainer.className = 'price-container';
  let currentPrice = document.createElement('p');
  currentPrice.className = 'current-price';
  currentPrice.innerText = data.price.regularMarketPrice.raw;

  let priceDiff = document.createElement('p');
  priceDiff.className = 'price-difference';
  if (data.price.regularMarketChange.raw > 0)
    priceDiff.innerText = `+ ${data.price.regularMarketChange.raw.toFixed(2)}`;
  if (data.price.regularMarketChange.raw < 0)
    priceDiff.innerText = data.price.regularMarketChange.raw.toFixed(2);

  changeInnerTextColor(priceDiff, data.price.regularMarketChange.raw);

  priceContainer.append(currentPrice, priceDiff);
  header.append(stockNameDiv, priceContainer);
  renderWatchListBtn(data.symbol);
}

function changeInnerTextColor(element, changeNumber) {
  if (changeNumber > 0) element.style.color = 'green';
  if (changeNumber < 0) element.style.color = 'red';
  if (changeNumber === 0) element.style.color = 'gray';
}

function renderWatchListBtn(symbol) {
  let watchListBtn = document.createElement('button');
  watchListBtn.className = 'round-end watchlist-action';

  let watchListCheck = state.watchList.findIndex(function (target) {
    return target === symbol;
  });

  if (watchListCheck === -1) {
    watchListBtn.innerText = 'Add to Watchlist';
  } else {
    watchListBtn.innerText = 'Remove from Watchlist';
  }
  header.append(watchListBtn);
}

function render(data) {
  header.innerHTML = '';
  renderHeader(data);
}

// current hardCode data
function renderNewsCard() {
  let newsCard = document.createElement('a');
  newsCard.className = 'news-card';
  newsCard.setAttribute(
    'href',
    'https://www.investors.com/research/dow-jones-stocks/?src=A00220&yptr=yahoo'
  );
  newsCard.setAttribute('target', '_blank');
  newsContainer.append(newsCard);

  let publisher = document.createElement('span');
  publisher.className = 'news-publisher';
  publisher.innerText = "Investor's Business Daily";
  let publishDate = document.createElement('span');
  publishDate.className = 'publish-date';
  publishDate.innerText = `- DATE`;
  let newsTitle = document.createElement('h2');
  newsTitle.className = 'news-title';
  newsTitle.innerText = ` 5 Dow Jones Stocks To Buy And Watch In June 2021: Apple Rallies,
Microsoft Slides`;
  let newsImg = document.createElement('img');
  newsImg.className = 'news-image';
  newsImg.setAttribute(
    'src',
    'https://s.yimg.com/uu/api/res/1.2/YPgi6CH.KCQSBzwAKkiwYQ--~B/aD01NzI7dz0xMDEyO2FwcGlkPXl0YWNoeW9u/https://s.yimg.com/uu/api/res/1.2/gQ_HwzhORxRfxro9gtZnTw--~B/aD01NzI7dz0xMDEyO2FwcGlkPXl0YWNoeW9u/https://media.zenfs.com/en/ibd.com/56901482f55f234b59b6643da5f2851a'
  );
  newsImg.setAttribute(
    'alt',
    `5 Dow Jones Stocks To Buy And Watch In June 2021: Apple Rallies, Microsoft Slides`
  );
  let newsSummary = document.createElement('p');
  newsSummary.className = 'summary';
  newsSummary.innerText = `The Dow Jones Industrial Average remain near record highs at the end
of April, as the current stock market rally continues. The best Dow
Jones stocks to buy and watch in June 2021 are Apple, Boeing,
Disney, Goldman Sachs and Microsoft.`;

  newsCard.append(publisher, publishDate, newsTitle, newsImg, newsSummary);
}

function renderAllNewsCard() {}

function addStockToWatchList() {}

function delStockFromWatchList() {}

function renderWatchList() {
  // I want to

  const stockUlEl = document.querySelector('.stock-list');

  for (const stock of state.watchList) {
    // console.log(stock);
    stockLiEl = renderStock(stock);

    stockUlEl.append(stockLiEl);
  }
}

const renderStock = (stock) => {
  let stockLiEl = document.createElement('li');
  stockLiEl.className = 'stock-list-item';

  const stockPrice = document.createElement('span');
  const stockName = document.createElement('span');

  for (const key in stock) {
    // value = stock[key];
    // console.log(value);
    if (key === 'symbol') {
      stockLiEl.innerText = stock[key];
    }
    if (key === 'price') {
      stockPrice.innerText = stock[key];
    }
    if (key === 'name') {
      stockName.innerText = stock[key];
    }
  }

  stockLiEl.append(stockPrice, stockName);

  return stockLiEl;
};
searchStock();
renderNewsCard();
renderStock();
renderWatchList();
