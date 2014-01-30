var ready;
ready = function() {
    
    var fields = $('.form-group input, .form-group textarea'),
        button = $('#contact-submit');

    $(fields).keyup(function() {

        var empty = false;

        $(fields).each(function() {
            if ($(this).val().length == 0) {
                empty = true;
            }
        });

        if (!empty) {
            $(button).removeProp('disabled');
        }
    });
};

$(window).load(function() {
    ready();
});