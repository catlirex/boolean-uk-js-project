let state = {
  watchList: [],
};

// STATE FUNCTIONS
const setState = (stockToUpdate) => {
  state = { ...state, ...stockToUpdate };

  render();
};

// SERVER FUNCTIONS
const getStocksFromServer = () => {
  return fetch('http://localhost:3000/watchList').then(function (response) {
    return response.json();
  });
};
const deleteStockFromServer = (stockId) => {
  return fetch(`http://localhost:3000/watchList/${stockId}`, {
    method: 'DELETE',
  }).then(function (response) {
    return response.json();
  });
};

const addStockToServer = (stock) => {
  return fetch(`http://localhost:3000/watchList`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stock),
  }).then(function (response) {
    return response.json();
  });
};

const addStock = document.querySelector('.add-stock');
addStock.addEventListener('click', function () {
  const stock = {
    name: 'Twitter',
    symbol: 'TWTR',
    price: 57.26,
  };
  addStockToServer(stock).then(function (newStockFromServer) {
    setState({ watchList: [...state.watchList, newStockFromServer] });
  });
});

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

    getSearchRelatedNews(searchInput.value).then(function (newsData) {
      console.log(newsData);
      renderAllNewsCard(newsData);
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

// function render(data) {
//   header.innerHTML = '';
//   renderHeader(data);
// }

// current hardCode data

function renderNewsCard(newsData) {
  let newsCard = document.createElement('a');
  newsCard.className = 'news-card';
  newsCard.setAttribute('href', newsData.link);
  newsCard.setAttribute('target', '_blank');
  newsContainer.append(newsCard);

  let publisher = document.createElement('span');
  publisher.className = 'news-publisher';
  publisher.innerText = newsData.publisher;
  let publishDate = document.createElement('span');
  publishDate.className = 'publish-date';
  let dateFormatted = convertEpochTimeToBST(newsData.published_at);
  publishDate.innerText = dateFormatted;
  let newsTitle = document.createElement('h2');
  newsTitle.className = 'news-title';
  newsTitle.innerText = newsData.title;
  newsCard.append(publisher, publishDate, newsTitle);

  if (newsData.main_image !== null) {
    let newsImg = document.createElement('img');
    newsImg.className = 'news-image';
    newsImg.setAttribute('src', newsData.main_image.original_url);
    newsImg.setAttribute('alt', newsData.title);
    newsCard.append(newsImg);
  } else {
    newsCard.style.height = 'fit-content';
  }

  let newsSummary = document.createElement('p');
  newsSummary.className = 'summary';
  newsSummary.innerText = `${newsData.summary.substr(0, 230)} ...`;
  newsCard.append(newsSummary);
}

function convertEpochTimeToBST(epochValue) {
  const milliseconds = epochValue * 1000;
  const dateObject = new Date(milliseconds);
  const options = {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  const formatDate = dateObject.toLocaleString('en-GB', options);
  return formatDate;
}

function renderAllNewsCard(data) {
  newsContainer.innerHTML = '';
  for (i = 0; i < 10; i++) {
    renderNewsCard(data.items.result[i]);
  }
}

/* LEFT SIDE STOCK WATCH LIST RENDER FUNCTIONS */
const stockUlEl = document.querySelector('.stock-list');
const renderWatchList = () => {
  for (const stock of state.watchList) {
    stockLiEl = renderStock(stock);

    stockUlEl.append(stockLiEl);
  }
};

const renderStock = (stock) => {
  let stockLiEl = document.createElement('li');
  stockLiEl.className = 'stock-list-item';

  const stockPrice = document.createElement('span');
  const stockName = document.createElement('span');

  for (const key in stock) {
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

  stockLiEl.addEventListener('click', function () {
    deleteStockFromServer(stock.id).then(function () {
      const filteredStocks = state.watchList.filter(function (targetedStock) {
        return targetedStock.id !== stock.id;
      });
      setState({ watchList: filteredStocks });
    });
  });

  stockLiEl.append(stockPrice, stockName);

  return stockLiEl;
};

// MAIN RENDER
const render = () => {
  stockUlEl.innerHTML = '';
  searchStock();
  //   renderNewsCard();
  renderStock();
  renderWatchList();
};

// render();

const startApp = () => {
  render();
  getStocksFromServer().then(function (stocksFromServer) {
    setState({ watchList: stocksFromServer });
  });
};

startApp();
