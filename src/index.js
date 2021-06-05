const plugin = {
  id: 'custom_canvas_background_color',
  beforeDraw: (chart) => {
    const ctx = chart.canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'whitesmoke';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

let state = {
  watchList: [],
  selectedStock: null,
  stockData: null,
  previousStockData: null,
  newsData: [],
  chartsData: {
    dateConverted: [],
    lineChartDisplayData: {},
    lineChartConfig: {
      type: 'line',
      data: null,
      options: {
        title: {
          display: true,
          text: '1M',
          color: 'white',
        },
        responsive: false,
      },
      plugins: [plugin],
    },
    barConvertedData: [],
    barChartDisplayData: {},
    barChartConfig: {
      type: 'bar',
      data: null,
      options: {
        responsive: false,
      },
      plugins: [plugin],
    },
  },
};



const header = document.querySelector('.main-header');
const newsContainer = document.querySelector('.related-news-container');

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

function updateWatchListPriceFromAPI() {
  let watchListSymbol = [];
  for (stock of state.watchList) {
    watchListSymbol.push(stock.symbol);
  }
  console.log(watchListSymbol);

  getUpdatedPrice(watchListSymbol).then(function (data) {
    console.log(data);
    let updatedWatchList = [];
    for (let i = 0; i < data.quoteResponse.result.length; i++) {
      updatedStock = { ...state.watchList[i] };
      updatedStock.price = data.quoteResponse.result[i].regularMarketPrice;
      updatedStock.currentChange =
        data.quoteResponse.result[i].regularMarketChange;

      updatedWatchList.push(updatedStock);
    }

    state.watchList = [...updatedWatchList];
    for (stock of state.watchList) {
      patchStockPriceToServer(stock);
    }
  });
}

function patchStockPriceToServer(stock) {
  return fetch(`http://localhost:3000/watchList/${stock.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stock),
  }).then(function (response) {
    return response.json();
  });
}

function getUpdatedPrice(watchListSymbol) {
  return fetch(
    `https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes?region=US&symbols=${watchListSymbol.join(
      '%2C'
    )}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '216b955a3emsh1c9e90acee647bfp11ec98jsn4d8af370f408',
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
      },
    }
  )
    .then((response) => response.json())
    .catch((err) => {
      console.error(err);
    });
}

function getStockSummary(stockSymbol) {
  return fetch(
    `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${stockSymbol}&region=US`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '216b955a3emsh1c9e90acee647bfp11ec98jsn4d8af370f408',

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
        'x-rapidapi-key': '216b955a3emsh1c9e90acee647bfp11ec98jsn4d8af370f408',

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
  let searchInput = document.querySelector('.search-input');

  searchform.addEventListener('submit', function (event) {
    event.preventDefault();

    getStockSummary(searchInput.value).then(function (data) {
      let usefulData = {
        symbol: data.symbol,
        shortName: data.price.shortName,
        currentPrice: data.price.regularMarketPrice.raw,
        currentChange: data.price.regularMarketChange.raw,
      };

      setState({ stockData: usefulData });
      
    });

    getSearchRelatedNews(searchInput.value).then(function (newsData) {
      let formattedArray = [];
      for (let i = 0; i < 10; i++) {
        let usefulNewsData = {
          title: newsData.items.result[i].title,
          url: newsData.items.result[i].link,
          publisher: newsData.items.result[i].publisher,
          publishedAt: newsData.items.result[i].published_at,
          summary: newsData.items.result[i].summary,
        };

        if (newsData.items.result[i].main_image !== null) {
          usefulNewsData.img = newsData.items.result[i].main_image.original_url;
        }

        formattedArray.push(usefulNewsData);
      }

      setState({ newsData: [...formattedArray] });
    });

    
  });
}

function renderHeader() {
  if (state.stockData === null) return
  header.innerHTML = '';
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
  renderWatchListBtn();
}

function changeInnerTextColor(element, changeNumber) {
  if (changeNumber >= 0) element.style.color = 'rgb(235, 15, 42)';
  if (changeNumber < 0) element.style.color = 'rgb(235, 15, 42)';
}

function renderWatchListBtn() {
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
    watchListBtn.style.backgroundColor = 'rgb(120, 163, 186)';
    state.selectedStock = watchListCheck.id;
  }

  watchListBtn.addEventListener('click', function () {
    const stock = {
      name: state.stockData.shortName,
      symbol: state.stockData.symbol,
      price: state.stockData.currentPrice,
      currentChange: state.stockData.currentChange,
    };
    if (watchListCheck === undefined) {
      addStockToServer(stock).then(function (newStockFromServer) {
        setState({ watchList: [...state.watchList, newStockFromServer] });
        //   render
      });
    } else {
      deleteStockFromServer(state.selectedStock).then(function () {
        const filteredStocks = state.watchList.filter(function (targetedStock) {
          return targetedStock.id !== state.selectedStock;
        });
        console.log(filteredStocks);
        setState({ watchList: filteredStocks });
      });
    }
  });

  header.append(watchListBtn);
}

// function renderSearch(data) {
//   header.innerHTML = '';
//   renderHeader(data);
// }

function renderNewsCard(newsData) {
  
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
  let tenNews = state.newsData.slice(0, 10)
  for (const news of tenNews) {
    renderNewsCard(news);
  }
}

/* LEFT SIDE STOCK WATCH LIST RENDER FUNCTIONS */
const stockUlEl = document.querySelector('.stock-list');
const renderWatchList = () => {
  stockUlEl.innerHTML = '';
  for (const stock of state.watchList) {
    stockLiEl = renderStock(stock);

    stockUlEl.append(stockLiEl);
  }
};

const renderStock = (stock) => {
  let stockLiEl = document.createElement('li');
  stockLiEl.className = 'stock-list-item';
  stockLiEl.addEventListener('click', function () {
    // setState({ selectedStock: stock.id });
    state.selectedStock = stock.id;
    getStockSummary(stock.symbol).then(function (data) {
      let usefulData = {
        symbol: data.symbol,
        shortName: data.price.shortName,
        currentPrice: data.price.regularMarketPrice.raw,
        currentChange: data.price.regularMarketChange.raw,
      };

      setState({ stockData: usefulData });
      // renderSearch();
    });

    getSearchRelatedNews(stock.symbol).then(function (newsData) {
      console.log(newsData);
      let formattedArray = [];
      for (let i = 0; i < 10; i++) {
        let usefulNewsData = {
          title: newsData.items.result[i].title,
          url: newsData.items.result[i].link,
          publisher: newsData.items.result[i].publisher,
          publishedAt: newsData.items.result[i].published_at,
          summary: newsData.items.result[i].summary,
        };

        if (newsData.items.result[i].main_image !== null) {
          usefulNewsData.img = newsData.items.result[i].main_image.original_url;
        }

        formattedArray.push(usefulNewsData);
      }

      setState({ newsData: [...formattedArray] });
      console.log(state);
    });
    displayChart();
  });

  const stockPrice = document.createElement('span');
  stockPrice.className = 'stock-price';
  const stockName = document.createElement('span');
  stockName.className = 'stock-name';
  const stockChange = document.createElement('span');
  stockChange.className = 'price-change';

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
    if (key === 'currentChange') {
      stockChange.innerText = stock[key].toFixed(2);
      if (Number(stock[key]) >= 0)
        stockChange.style.backgroundColor = 'rgb(4, 176, 81)';
      if (Number(stock[key]) < 0)
        stockChange.style.backgroundColor = 'rgb(235, 15, 42)';
    }
  }

  stockLiEl.append(stockPrice, stockName, stockChange);

  return stockLiEl;
};

// MAIN RENDER
const render = () => {
  displayChart();
  renderHeader();
  renderAllNewsCard();
  renderWatchList();
};



function getChatData(symbol, interval, range) {
  return fetch(
    `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart?interval=${interval}&symbol=${symbol}&range=${range}&region=US`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '216b955a3emsh1c9e90acee647bfp11ec98jsn4d8af370f408',
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
      },
    }
  )
    .then((response) => response.json())
    .catch((err) => {
      console.error(err);
    });
}

function convertEpochTimeToEST(epochValue) {
  const milliseconds = epochValue * 1000;
  const dateObject = new Date(milliseconds);
  const options = {
    month: 'numeric',
    day: 'numeric',
  };
  const formatDate = dateObject.toLocaleString('en-US', options);
  state.chartsData.dateConverted.push(formatDate);
}

function processChartData(symbol, interval = '1d', range = '1mo') {
  getChatData((symbol = 'AAPL'), interval, range)
    .then(function (chartData) {
      // console.log(chartData);
      state.chartsData.dateConverted = [];

      let timeLabel = chartData.chart.result[0].timestamp;
      timeLabel.map(convertEpochTimeToEST);
      state.chartsData.lineChartDisplayData = {
        labels: state.chartsData.dateConverted,
        datasets: [
          {
            label: 'Daily Low',
            data: chartData.chart.result[0].indicators.quote[0].low,
            borderColor: 'darkred',
          },
          {
            label: 'Close Price',
            data: chartData.chart.result[0].indicators.quote[0].close,
            borderColor: 'rgb(21, 220, 220)',
            backgroundColor: 'rgba(21, 220, 220, 0.3)',
          },
          {
            label: 'Daily High',
            data: chartData.chart.result[0].indicators.quote[0].high,
            borderColor: 'green',
          },
        ],
      };
      state.chartsData.lineChartConfig.data =
        state.chartsData.lineChartDisplayData;
      let barRawData = chartData.chart.result[0].indicators.quote[0].volume;
      let minBarData = Math.min(...barRawData);
      console.log(barRawData);
      let barLabel = convertBarDataReturnLabel(minBarData, barRawData);

      state.chartsData.barChartDisplayData = {
        labels: state.chartsData.dateConverted,
        datasets: [
          {
            label: barLabel,
            data: state.chartsData.barConvertedData,
            backgroundColor: 'grey',
          },
        ],
      };
      state.chartsData.barChartConfig.data =
        state.chartsData.barChartDisplayData;
    })
    .then(function () {
      renderChart();
    });
}

function renderChart() {
  let oneMonthChart = new Chart(
    document.getElementById('line-chart'),
    state.chartsData.lineChartConfig
  );
  let volumeChart = new Chart(
    document.getElementById('bar-chart'),
    state.chartsData.barChartConfig
  );
}

function convertBarDataReturnLabel(minBarData, barRawData) {
  if (minBarData >= 1.0e9) {
    state.chartsData.barConvertedData = barRawData.map((num) =>
      (Math.abs(Number(num)) / 1.0e9).toFixed(2)
    );
    return 'Volume(billions)';
  } else if (minBarData >= 1.0e6) {
    state.chartsData.barConvertedData = barRawData.map((num) =>
      (Math.abs(Number(num)) / 1.0e6).toFixed(2)
    );
    return 'Volume(millions)';
  } else if (minBarData >= 1.0e3) {
    state.chartsData.barConvertedData = barRawData.map((num) =>
      (Math.abs(Number(num)) / 1.0e3).toFixed(2)
    );
    return 'Volume(thousands)';
  } else {
    state.chartsData.barConvertedData = barRawData.toFixed(2);
  }
}

function displayChart() {
  if (state.stockData === null) return
  if (state.previousStockData && state.previousStockData.symbol === state.stockData.symbol) return
  state.previousStockData = state.stockData

  let chartBtnBar = document.querySelector(".chart-button-bar")
  chartBtnBar.style.display = 'block';
  processChartData(state.stockData.symbol);
}

function displayChartEvents() {
  let fiveDayChart = document.getElementById('5D');
  fiveDayChart.addEventListener('click', function () {
    processChartData(state.stockData.symbol, '1d', '5d');
  });

  let oneMonthChart = document.getElementById('1M');
  oneMonthChart.addEventListener('click', function () {
    processChartData(state.stockData.symbol, '1d', '1mo');
  });

  let threeMonthChart = document.getElementById('3M');
  threeMonthChart.addEventListener('click', function () {
    processChartData(state.stockData.symbol, '1d', '3mo');
  });

  let sixMonthChart = document.getElementById('6M');
  sixMonthChart.addEventListener('click', function () {
    processChartData(state.stockData.symbol, '1d', '6mo');
  });

  let oneYearChart = document.getElementById('1Y');
  oneYearChart.addEventListener('click', function () {
    processChartData(state.stockData.symbol, '1d', '1y');
  });
}

const startApp = () => {
  getStocksFromServer().then(function (stocksFromServer) {
    state.watchList = [...stocksFromServer];
    render();
    displayChartEvents();
    searchStock();
    updateWatchListPriceFromAPI();
  });
};

startApp();
