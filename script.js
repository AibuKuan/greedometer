// $('#searchbar').on('input', function() {
//     console.log('change');
// });

$('#searchbar').on('focus', function() {
    const recom1 = $('<div></div>');
    const recom2 = $('<div></div>');

    recom1.text('AAPL (Apple Inc. Common Stock)');
    recom2.text('MSFT (Microsoft Corporation)');

    recom1.addClass('search');
    recom2.addClass('search');

    $('.recom').append(recom1);
    $('.recom').append(recom2);

    $('.search-container').addClass('wide-searchbar');
    $('.recom').addClass('wide-searchbar');
});

$('#searchbar').on('blur', function() {
    $('.recom').empty();
    $('.search-container').removeClass('wide-searchbar');
    $('.recom').removeClass('wide-searchbar');
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
            });
        } else {
            console.log('Company not found');
        }

        
    });
});