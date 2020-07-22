import $ from 'jquery';

$(document).on('scroll', function(){
    if ($(document).scrollTop() > 100) {
        $('.header--homepage').addClass('shrink');
    }
    else
    {
        $('.header--homepage').removeClass('shrink');
    }
});