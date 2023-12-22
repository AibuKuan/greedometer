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