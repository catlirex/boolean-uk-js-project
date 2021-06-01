let state = {
    watchList:[]
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
            // name of stock/ symbol / price(regularMarketPrice)
            // see related news

            // add watchlist button -> update state -> update listing

        })
    })
}



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

searchStock()