let state = {
  watchList: [],
  selectedStock: null,
  stockData:{},
  newsData:[]
};

// STATE FUNCTIONS
const setState = (stockToUpdate) => {
  state = { ...state, ...stockToUpdate };
  header.innerHTML = ""
  render();
    renderHeader();
    renderAllNewsCard()
    
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

// const addStock = document.querySelector('.add-stock');
// addStock.addEventListener('click', function () {
//   const stock = {
//     name: 'Twitter',
//     symbol: 'TWTR',
//     price: 57.26,
//   };
//   addStockToServer(stock).then(function (newStockFromServer) {
//     setState({ watchList: [...state.watchList, newStockFromServer] });
//   });
// });

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

    getStockSummary(searchInput.value).then(function (data) {

        let usefulData = {
            symbol: data.symbol,
            shortName: data.price.shortName,
            currentPrice: data.price.regularMarketPrice.raw,
            currentChange: data.price.regularMarketChange.raw
        }

        setState({stockData: usefulData})
      console.log("usefulData:", usefulData);
      console.log("state:", state);


    //   update to state
      renderSearch();
      // name of stock/ symbol / price(regularMarketPrice)
      // see related news

      // add watchlist button -> update state -> update listing
    });

    getSearchRelatedNews(searchInput.value).then(function (newsData) {
        console.log(newsData)
        let formattedArray = []
        for (let i = 0; i < 10; i++) {
        let usefulNewsData = {
            title: newsData.items.result[i].title,
            url: newsData.items.result[i].link,
            publisher: newsData.items.result[i].publisher,
            publishedAt: newsData.items.result[i].published_at,
            summary: newsData.items.result[i].summary
        }

        if (newsData.items.result[i].main_image !== null){
            usefulNewsData.img =  newsData.items.result[i].main_image.original_url
        }

        formattedArray.push(usefulNewsData)
        }

        setState({newsData:[...formattedArray]})
        console.log(state);
    //   update to state
      
    });
  });
}

function renderHeader(data) {
  let stockNameDiv = document.createElement('div');
  stockNameDiv.className = 'stock-name';
  let symbolH1 = document.createElement('h1');
  symbolH1.innerText = state.stockData.symbol;
  let nameH2 = document.createElement('h2');
  nameH2.innerText = state.stockData.shortName;
  stockNameDiv.append(symbolH1, nameH2);

  let priceContainer = document.createElement('div');
  priceContainer.className = 'price-container';
  let currentPrice = document.createElement('p');
  currentPrice.className = 'current-price';
  currentPrice.innerText = state.stockData.currentPrice;

  let priceDiff = document.createElement('p');
  priceDiff.className = 'price-difference';
  if (state.stockData.currentChange > 0)
    priceDiff.innerText = `+ ${state.stockData.currentChange.toFixed(2)}`;
  if (state.stockData.currentChange < 0)
    priceDiff.innerText = state.stockData.currentChange.toFixed(2);

  changeInnerTextColor(priceDiff, state.stockData.currentChange);

  priceContainer.append(currentPrice, priceDiff);
  header.append(stockNameDiv, priceContainer);
  renderWatchListBtn(data);
}

function changeInnerTextColor(element, changeNumber) {
  if (changeNumber > 0) element.style.color = 'green';
  if (changeNumber < 0) element.style.color = 'red';
  if (changeNumber === 0) element.style.color = 'gray';
}

function renderWatchListBtn(data) {
  let watchListBtn = document.createElement('button');
  watchListBtn.className = 'round-end watchlist-action';

  let watchListCheck = state.watchList.find(function (target) {
    //   console.log("target.symbol:", target.symbol)
    //   console.log("state.stockData.symbol", state.stockData.symbol)
    return target.symbol === state.stockData.symbol;
  });

  
  if (watchListCheck === undefined) {
    watchListBtn.innerText = 'Add to Watchlist';
    
  } else {
    watchListBtn.innerText = 'Remove from Watchlist';
    state.selectedStock = watchListCheck.id
  }

  watchListBtn.addEventListener('click', function () {
    const stock = {
      name: state.stockData.name,
      symbol: state.stockData.symbol,
      price: state.stockData.currentPrice,
      currentChange: state.stockData.currentChange
    };
    if (watchListCheck === undefined){
    addStockToServer(stock).then(function (newStockFromServer) {
      setState({ watchList: [...state.watchList, newStockFromServer] });
    //   render 
    });
    }else{

        deleteStockFromServer(state.selectedStock).then(function () {
            const filteredStocks = state.watchList.filter(function (targetedStock) {
              return targetedStock.id !== state.selectedStock.id;
            });
            setState({ watchList: filteredStocks });
          });
    }
  });

  header.append(watchListBtn);
}

function renderSearch(data) {
  header.innerHTML = '';
  renderHeader(data);
}

// current hardCode data

function renderNewsCard(newsData) {
    console.log(newsData)
  let newsCard = document.createElement('a');
  newsCard.className = 'news-card';
  newsCard.setAttribute('href', newsData.url);
  newsCard.setAttribute('target', '_blank');
  newsContainer.append(newsCard);

  let publisher = document.createElement('span');
  publisher.className = 'news-publisher';
  publisher.innerText = newsData.publisher;
  let publishDate = document.createElement('span');
  publishDate.className = 'publish-date';
  let dateFormatted = convertEpochTimeToBST(newsData.publishedAt);
  publishDate.innerText = dateFormatted;
  let newsTitle = document.createElement('h2');
  newsTitle.className = 'news-title';
  newsTitle.innerText = newsData.title;
  newsCard.append(publisher, publishDate, newsTitle);

  if (newsData.img !== undefined) {
    let newsImg = document.createElement('img');
    newsImg.className = 'news-image';
    newsImg.setAttribute('src', newsData.img);
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

function renderAllNewsCard() {
  newsContainer.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    renderNewsCard(state.newsData[i]);
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
  stockLiEl.addEventListener("click", function(){
      setState({selectedStock: stock.id})
      console.log(state)
  })

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

//   stockLiEl.addEventListener('click', function () {
//     deleteStockFromServer(stock.id).then(function () {
//       const filteredStocks = state.watchList.filter(function (targetedStock) {
//         return targetedStock.id !== stock.id;
//       });
//       setState({ watchList: filteredStocks });
//     });
//   });

  stockLiEl.append(stockPrice, stockName);

  return stockLiEl;
};

// MAIN RENDER
const render = () => {

  stockUlEl.innerHTML = '';
    searchStock();
    // renderHeader();
    // renderNewsCard();
//   renderStock();
  renderWatchList();
};

// render();

const startApp = () => {
    getStocksFromServer().then(function (stocksFromServer) {
    state.watchList = [...stocksFromServer];
    render();
  });
  
};

startApp();


