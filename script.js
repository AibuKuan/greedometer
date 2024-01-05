const urlParam = new URLSearchParams(window.location.search);
const symbol = urlParam.get('symbol');

if (symbol) createChart(symbol);

$('#searchbar').on('focus', function() {
    $('form div').addClass('active');
    
    $('#searchbar').attr('placeholder', 'Search ticker symbol');
    const recom1 = $('<div></div>');
    const recom2 = $('<div></div>');

    recom1.text('AAPL (Apple Inc. Common Stock)');
    recom2.text('MSFT (Microsoft Corporation)');

    recom1.addClass('search');
    recom2.addClass('search');

    $('.recom').append(recom1);
    $('.recom').append(recom2);

    
});

$('#searchbar').on('blur', function() {
    $('#searchbar').attr('placeholder', 'Search');
    $('.recom').empty();
    $('form div').removeClass('active');
});

$('#searchbar-form').on('submit', function(event) {
    event.preventDefault();
    createChart($('#searchbar').val());
});

function createChart(symbol) {
    console.log('You entered ' + symbol);

    const url = 'https://yahoo-finance127.p.rapidapi.com/search/' + symbol;

    const settings = {
        async: true,
        crossDomain: true,
        url: url,
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'eae20b108bmsh050c0ab157af07dp151d0cjsnf5efc3f2615f',
            'X-RapidAPI-Host': 'yahoo-finance127.p.rapidapi.com'
        }
    };


    $.ajax(settings).done(function (response) {
        console.log(response);
        if (symbol.toLowerCase() === response['quotes'][0]['symbol'].toLowerCase()) {
            console.log('Company Found!')
            $('#comp-name').text(response['quotes'][0]['longname'] + ' (' + response['quotes'][0]['symbol'] + ')');

            const url = 'https://yahoo-finance127.p.rapidapi.com/price/' + symbol;

            const settings = {
                async: true,
                crossDomain: true,
                url: url,
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': 'eae20b108bmsh050c0ab157af07dp151d0cjsnf5efc3f2615f',
                    'X-RapidAPI-Host': 'yahoo-finance127.p.rapidapi.com'
                }
            };
            
            $.ajax(settings).done(function (response) {
                console.log(response);

                $('#market-cap').text('$' + response['marketCap']['longFmt'] + ' (' + response['marketCap']['fmt'] + ')');
                $('#price').text('$' + response['regularMarketPrice']['fmt']);

                let change;
                if (response['regularMarketChange']['raw'] === 0) change = '';
                else change = (response['regularMarketChange']['raw'] > 0) ? '+' : '-';

                let marketChange, marketChangePercent;
                if (change === '-') {
                    marketChange = response['regularMarketChange']['fmt'].substring(1)
                    marketChangePercent = response['regularMarketChangePercent']['fmt'].substring(1)
                } else {
                    marketChange = response['regularMarketChange']['fmt'];
                    marketChangePercent = response['regularMarketChangePercent']['fmt'];
                }
                
                $('#price-change').text(`${change}$${marketChange} (${change + marketChangePercent})`);

                loadChart(symbol);
            });
        } else {
            console.log('Company not found');
            alert('Company not found');
        }
    });
}

function loadChart(symbol) {
    const settings = {
        async: true,
        crossDomain: true,
        url: `https://yahoo-finance127.p.rapidapi.com/historic/${symbol}/1d/3y`,
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'eae20b108bmsh050c0ab157af07dp151d0cjsnf5efc3f2615f',
            'X-RapidAPI-Host': 'yahoo-finance127.p.rapidapi.com'
        }
    };
    
    $.ajax(settings)
        .done(function (response) {
            console.log(response);
            function convPrices(array) { 
                return array.map(function(price) { 
                    return price.toFixed(2);
                });
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
            function minMaxDate(array) {
                const minDate = new Date(Math.min(...array) * 1000);
                const maxDate = new Date(Math.max(...array) * 1000);

                const minDateString = `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`;
                const maxDateString = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

                return Array(minDateString, maxDateString);
            }

            console.log(response['meta']['symbol']);
            console.log(response['timestamp']);
            console.log(convPrices(response['indicators']['quote'][0]['high']));
            console.log(minMaxDate(response['timestamp']));


            let high = {
                type: 'scatter',
                mode: 'lines',
                name: `${response['meta']['symbol']} High`,
                x: convTime(response['timestamp']),
                y: convPrices(response['indicators']['quote'][0]['high']),
                line: {color: 'rgb(51, 166, 159)'}
            }

            let low = {
                type: 'scatter',
                mode: 'lines',
                name: `${response['meta']['symbol']} Low`,
                x: convTime(response['timestamp']),
                y: convPrices(response['indicators']['quote'][0]['low']),
                line: {color: 'rgb(234, 89, 81)'}
            }

            let layout = {
                title: `${response['meta']['symbol']} Price`,
                titlefont: {
                    color: 'hsl(0, 0%, 90%)'
                },
                xaxis: {
                    autorange: true,
                    range: minMaxDate(response['timestamp']),
                    rangeselector: { buttons: [
                        {
                            count: 7,
                            label: '1w',
                            step: 'day'
                        },
                        {
                            count: 1,
                            label: '1m',
                            step: 'month'
                        },
                        {
                            count: 6,
                            label: '6m',
                            step: 'month'
                        },
                        {step: 'all'}
                    ]},
                    rangeslider: {range: minMaxDate(response['timestamp'])},
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

            Plotly.purge('chart');
            Plotly.newPlot('chart', data, layout, config);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            alert('Couldn\'t retrieve chart data!');
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        });
   
}






// d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/finance-charts-apple.csv', function(err, rows) {
//             if (err) console.error('Error loading CSV:', err);
//             function unpack(rows, key) { return rows.map(function(row) { return row[key]; }); }
            
//             let trace1 = {
//                 type: 'scatter',
//                 mode: 'lines',
//                 name: 'AAPL High',
//                 x: unpack(rows, 'Date'),
//                 y: unpack(rows, 'AAPL.High'),
//                 line: {color: 'green'}
//             }

//             let trace2 = {
//                 type: 'scatter',
//                 mode: 'lines',
//                 name: 'AAPL Low',
//                 x: unpack(rows, 'Date'),
//                 y: unpack(rows, 'AAPL.Low'),
//                 line: {color: 'red'}
//             }

//             let data = [trace1, trace2];

//             let layout = {
//                 title: 'Time Series with Rangeslider',
//                 titlefont: {
//                     color: 'hsl(0, 0%, 90%)'
//                 },
//                 xaxis: {
//                     autorange: true,
//                     range: ['2015-07-01', '2017-12-31'],
//                     rangeselector: { buttons: [
//                         {
//                             count: 7,
//                             label: '1w',
//                             step: 'day'
//                         },
//                         {
//                             count: 1,
//                             label: '1m',
//                             step: 'month'
//                         },
//                         {
//                             count: 6,
//                             label: '6m',
//                             step: 'month'
//                         },
//                         {step: 'all'}
//                     ]},
//                     rangeslider: {range: ['2015-02-17', '2017-02-16']},
//                     type: 'date',
//                     gridcolor: 'hsl(0, 0%, 50%)',
//                     minorgridcolor: 'hsl(0, 0%, 50%)',
//                     tickfont: {
//                         color: 'hsl(0, 0%, 90%)'
//                     }
//                 },
//                 yaxis: {
//                     autorange: true,
//                     range: [86.8700008333, 138.870004167],
//                     type: 'linear',
//                     gridcolor: 'hsl(0, 0%, 50%)',
//                     minorgridcolor: 'hsl(0, 0%, 50%)',
//                     tickfont: {
//                         color: 'hsl(0, 0%, 90%)'
//                     }
//                 },
//                 legend: {
//                     font: {
//                         color: 'hsl(0, 0%, 90%)'
//                     }
//                 },
//                 autosize: true,
//                 plot_bgcolor: 'hsl(0, 0%, 10%)',
//                 paper_bgcolor: 'hsl(0, 0%, 10%)',
//                 dragmode: 'pan'
//                 // plot_bgcolor: '#1b263b'
//             };

//             let config = {
//                 responsive: true,
//                 displaylogo: false,
//                 modeBarButtonsToRemove: ['zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'toImage']
//             }

//             Plotly.newPlot('chart', data, layout, config);
//         });