// $('#searchbar').on('input', function() {
//     console.log('change');
// });

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
    const symbol = $('#searchbar').val();
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
            alert('Company not foudn');
        }

        
    });
});

function loadChart(symbol) {
    const settings = {
        async: true,
        crossDomain: true,
        url: `https://yahoo-finance127.p.rapidapi.com/historic/${symbol}/1d/3mo`,
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
                line: {color: '#17BECF'}
            }

            let low = {
                type: 'scatter',
                mode: 'lines',
                name: `${response['meta']['symbol']} Low`,
                x: convTime(response['timestamp']),
                y: convPrices(response['indicators']['quote'][0]['low']),
                line: {color: '#7F7F7F'}
            }

            let layout = {
                title: `${response['meta']['symbol']} Price`,
                xaxis: {
                    autorange: true,
                    range: minMaxDate(response['timestamp']),
                    rangeslider: {range: minMaxDate(response['timestamp'])},
                    type: 'date'
                },
                height: 500
            }

            let config = {
                responsive: true,
                displaylogo: false
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





