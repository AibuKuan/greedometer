// get the symbol param from the url
const urlParam = new URLSearchParams(window.location.search);
const symbol = urlParam.get('symbol');

let apiResponse; // contains the fetched data

if (symbol) fetchAndDisplay(symbol); // displays the data if there is a url param

// create the recommendation element and text
let recomArray = [];
for (let i = 0; i < 7; i++) {
    recomArray[i] = $('<div></div>')
        .addClass('search')
        .on('click', function() {
            $('#searchbar').val(this.getAttribute('data-symbol'));
        });
}
recomArray[0].text('AAPL (Apple Inc)').attr('data-symbol', 'aapl');
recomArray[1].text('AMZN (Amazon.com Inc)').attr('data-symbol', 'amzn');
recomArray[2].text('GOOGL (Alphabet Inc Class A)').attr('data-symbol', 'googl');
recomArray[3].text('META (Meta Platforms Inc)').attr('data-symbol', 'meta');
recomArray[4].text('MSFT (Microsoft Corp)').attr('data-symbol', 'msft');
recomArray[5].text('NFLX (Netflix Inc)').attr('data-symbol', 'nflx');
recomArray[6].text('TSLA (Tesla Inc)').attr('data-symbol', 'tsla');

$('#searchbar').on('focus', function() {
    $('form div').addClass('active');
    
    $('#searchbar').attr('placeholder', 'Search ticker symbol');

    for (recom of recomArray) $('.recom').append(recom);
});

$('#searchbar').on('blur', function() {
    // delay the dissapearance to buy time for the event listener of recom
    setTimeout(function() {
        $('#searchbar').attr('placeholder', 'Search');
        $('form div').removeClass('active');
        $('.recom').empty();
    }, 150);
});

$('#searchbar-form').on('submit', function(event) {
    event.preventDefault();
    $('#searchbar').blur(); // unfocus the searchbar

    // clears the url param
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('symbol');
    history.pushState({}, '', currentUrl.toString());

    fetchAndDisplay($('#searchbar').val());
    
});

function fetchAndDisplay(symbol) {
    fetchInfo(symbol)
        .done(function (response) {
            console.log(response);
            displayInfo(response);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            alert('Couldn\'t retrieve company data!');
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        });

    fetchChartData(symbol)
        .done(function (response) {
            console.log(response);
            apiResponse = response; // stores the result into a global variable
            generateTimeSeries();
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            alert('Couldn\'t retrieve chart data!');
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        });
}

// fetches the company info
function fetchInfo(symbol) {
    const url = 'https://yahoo-finance127.p.rapidapi.com/price/' + symbol;

    const settings = {
        async: true,
        crossDomain: true,
        url: url,
        method: 'GET',
        headers: {
            // this is just a free tier api, so it doesn't matter if you can see it
            'X-RapidAPI-Key': '14d0d6a18amsh097ab9d54baa168p1ecaa3jsn830233c5b28f',
            'X-RapidAPI-Host': 'yahoo-finance127.p.rapidapi.com'
        }
    };
    
    return $.ajax(settings);
}

// displays the company info
function displayInfo(compInfo) {
    $('#comp-name').text(compInfo['longName'] + ' (' + compInfo['symbol'] + ')'); // not fixed

    $('#market-cap').text('$' + compInfo['marketCap']['longFmt'] + ' (' + compInfo['marketCap']['fmt'] + ')');
    $('#price').text('$' + compInfo['regularMarketPrice']['fmt']);

    let change;
    if (compInfo['regularMarketChange']['raw'] === 0) change = '';
    else change = (compInfo['regularMarketChange']['raw'] > 0) ? '+' : '-';

    let marketChange, marketChangePercent;
    if (change === '-') {
        $('#price-change').addClass('neg-color');
        marketChange = compInfo['regularMarketChange']['fmt'].substring(1)
        marketChangePercent = compInfo['regularMarketChangePercent']['fmt'].substring(1)
    } else {
        $('#price-change').addClass('pos-color');
        marketChange = compInfo['regularMarketChange']['fmt'];
        marketChangePercent = compInfo['regularMarketChangePercent']['fmt'];
    }
    
    $('#price-change').text(`${change}$${marketChange} (${change + marketChangePercent})`);
}

function fetchChartData(symbol) {
    const settings = {
        async: true,
        crossDomain: true,
        url: `https://yahoo-finance127.p.rapidapi.com/historic/${symbol}/1d/3y`,
        method: 'GET',
        headers: {
            // this is just a free tier api, so it doesn't matter if you can see it
            'X-RapidAPI-Key': '14d0d6a18amsh097ab9d54baa168p1ecaa3jsn830233c5b28f',
            'X-RapidAPI-Host': 'yahoo-finance127.p.rapidapi.com'
        }
    };
    
    return $.ajax(settings);
}

function generateTimeSeries() {
    let high = {
        type: 'scatter',
        mode: 'lines',
        name: `${apiResponse['meta']['symbol']} High`,
        x: convTime(apiResponse['timestamp']),
        y: convPrices(apiResponse['indicators']['quote'][0]['high']),
        line: {color: 'rgb(51, 166, 159)'}
    }

    let low = {
        type: 'scatter',
        mode: 'lines',
        name: `${apiResponse['meta']['symbol']} Low`,
        x: convTime(apiResponse['timestamp']),
        y: convPrices(apiResponse['indicators']['quote'][0]['low']),
        line: {color: 'rgb(234, 89, 81)'}
    }

    let layout = {
        title: `${apiResponse['meta']['symbol']} Price`,
        titlefont: {
            color: 'hsl(0, 0%, 90%)'
        },
        xaxis: {
            autorange: true,
            range: minMaxDate(apiResponse['timestamp']),
            rangeselector: { buttons: [
                {
                    count: 7,
                    label: '1 week',
                    step: 'day'
                },
                {
                    count: 1,
                    label: '1 month',
                    step: 'month'
                },
                {
                    count: 3,
                    label: '3 months',
                    step: 'month'
                },
                {
                    count: 6,
                    label: '6 months',
                    step: 'month'
                },
                {
                    count: 1,
                    label: '1 year',
                    step: 'year'
                },
                {
                    count: 3,
                    label: '3 years',
                    step: 'year'
                }
            ]},
            rangeslider: {range: minMaxDate(apiResponse['timestamp'])},
            type: 'date',
            gridcolor: 'hsl(0, 0%, 50%)',
            minorgridcolor: 'hsl(0, 0%, 50%)',
            tickfont: {
                color: 'hsl(0, 0%, 90%)'
            }
        },
        yaxis: {
            gridcolor: 'hsl(0, 0%, 50%)',
            minorgridcolor: 'hsl(0, 0%, 50%)',
            tickfont: {
                color: 'hsl(0, 0%, 90%)'
            }
        },
        legend: {
            font: {
                color: 'hsl(0, 0%, 90%)'
            }
        },
        autosize: true,
        plot_bgcolor: 'hsl(0, 0%, 10%)',
        paper_bgcolor: 'hsl(0, 0%, 10%)',
        dragmode: 'pan'
    }

    let config = {
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'toImage']
    }

    let data = [high, low];

    Plotly.newPlot('chart', data, layout, config);
    $('.timeseries').prop('disabled', true);
    $('.candlestick').prop('disabled', false);
}

function generateCandlestick() {
    const trace = {
        x: convTime(apiResponse['timestamp']),

        close: convPrices(apiResponse['indicators']['quote'][0]['close']),
        high: convPrices(apiResponse['indicators']['quote'][0]['high']),
        low: convPrices(apiResponse['indicators']['quote'][0]['low']),
        open: convPrices(apiResponse['indicators']['quote'][0]['open']),

        decreasing: {line: {color: '#DF4444'}},
        increasing: {line: {color: '#6CDF44'}},
        line: {color: 'gray'},

        type: 'candlestick',
        xaxis: 'x',
        yaxis: 'y'
    }

    const data = [trace];

    const layout = {
        title: `${apiResponse['meta']['symbol']} Price`,
        titlefont: {
            color: 'hsl(0, 0%, 90%)'
        },
        dragmode: 'zoom',
        xaxis: {
            autorange: false,
            domain: [0, 1],
            range: minMaxDate(apiResponse['timestamp']),
            rangeslider: {
                visible: false
            },
            rangeselector: { buttons: [
                {
                    count: 7,
                    label: '1 week',
                    step: 'day'
                },
                {
                    count: 1,
                    label: '1 month',
                    step: 'month'
                },
                {
                    count: 3,
                    label: '3 months',
                    step: 'month'
                },
                {
                    count: 6,
                    label: '6 months',
                    step: 'month'
                },
                {
                    count: 1,
                    label: '1 year',
                    step: 'year'
                },
                {
                    count: 3,
                    label: '3 years',
                    step: 'year'
                }
            ]},
            type: 'date',
            gridcolor: 'hsl(0, 0%, 50%)',
            minorgridcolor: 'hsl(0, 0%, 50%)',
            tickfont: {
                color: 'hsl(0, 0%, 90%)'
            }
        },
        yaxis: {
            autorange: true,
            domain: [0, 1],
            type: 'linear',
            gridcolor: 'hsl(0, 0%, 50%)',
            minorgridcolor: 'hsl(0, 0%, 50%)',
            tickfont: {
                color: 'hsl(0, 0%, 90%)'
            }
        },
        autosize: true,
        plot_bgcolor: 'hsl(0, 0%, 10%)',
        paper_bgcolor: 'hsl(0, 0%, 10%)',
        dragmode: 'pan'
    };
    
    const config = {
        scrollZoom: true,
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'toImage']
    }

    Plotly.newPlot('chart', data, layout, config);
    $('.timeseries').prop('disabled', false);
    $('.candlestick').prop('disabled', true);
}

function convTime(array) {
    return array.map(function(timestamp) {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
}

function convPrices(array) { 
    return array.map(function(price) { 
        return price.toFixed(2);
    });
}

function minMaxDate(array) {
    const minDate = new Date(Math.min(...array) * 1000);
    const maxDate = new Date(Math.max(...array) * 1000);

    const minDateString = `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`;
    const maxDateString = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

    return Array(minDateString, maxDateString);
}

$('.candlestick').on('click', function() {
    generateCandlestick();
});

$('.timeseries').on('click', function() {
    generateTimeSeries();
});



