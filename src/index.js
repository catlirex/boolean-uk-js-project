let state = {
    watchList:["AAPL"]
}
const header = document.querySelector(".main-header")


function getStockSummary(stockSymbo){
    return fetch(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${stockSymbo}&region=US`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": "2cf42d03cdmshea8aa5ef2111c14p16bab0jsnf5b3354df1b4",
            "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
        }
    })
    .then(response => response.json())
    .catch(err => {
        console.error(err);
    });
}

function searchStock(){
    let searchform = document.querySelector(".search-form")
    let searchInput = document.querySelector(".search-bar")
    // console.log(searchform)
    // console.log(searchInput)

    searchform.addEventListener("submit", function(event){
        event.preventDefault()

    console.log(searchInput.value)

        getStockSummary(searchInput.value)
        .then(function(data){
            console.log(data)
            render(data)
            // name of stock/ symbol / price(regularMarketPrice)
            // see related news

            // add watchlist button -> update state -> update listing

        })
    })
}

function renderHeader(data){
    let stockNameDiv = document.createElement("div")
    stockNameDiv.className = "stock-name"
    let symbolH1 = document.createElement("h1")
    symbolH1.innerText = data.symbol
    let nameH2 = document.createElement("h2")
    nameH2.innerText = data.price.shortName
    stockNameDiv.append(symbolH1, nameH2)

    let priceContainer = document.createElement("div")
    priceContainer.className = "price-container"
    let currentPrice = document.createElement("p")
    currentPrice.className = "current-price"
    currentPrice.innerText = data.price.regularMarketPrice.raw
    
    let priceDiff = document.createElement("p")
    priceDiff.className = "price-difference"
    if (data.price.regularMarketChange.raw > 0) priceDiff.innerText = `+ ${data.price.regularMarketChange.raw.toFixed(2)}`
    if (data.price.regularMarketChange.raw < 0) priceDiff.innerText = data.price.regularMarketChange.raw.toFixed(2)
    
    changeInnerTextColor(priceDiff, data.price.regularMarketChange.raw)

    priceContainer.append(currentPrice, priceDiff)
    header.append(stockNameDiv, priceContainer)
    renderWatchListBtn(data.symbol)
}

function changeInnerTextColor(element, changeNumber){
    if (changeNumber > 0)element.style.color = "green"
    if (changeNumber < 0)element.style.color = "red"
    if (changeNumber === 0) element.style.color = "gray"
}

function renderWatchListBtn(symbol){
    let watchListBtn = document.createElement("button")
    watchListBtn.className = "round-end watchlist-action"

    let watchListCheck = state.watchList.findIndex(function(target){
        return target === symbol
    })

    if(watchListCheck === -1){
        watchListBtn.innerText = "Add to Watchlist"
    }else{
        watchListBtn.innerText = "Remove from Watchlist"
    }
    header.append(watchListBtn)
}

function render(data){
    header.innerHTML = ""
    renderHeader(data)
}


searchStock()