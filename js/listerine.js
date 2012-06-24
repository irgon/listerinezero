var SPEED = 500;
var PARALLAX_GRID = 128;
var RESX = $(document).width();
var PARALLAX_OPTIONS = {
    'elements': [
        {
            'selector': '#bg',
            'properties': {
                'x': {
                    'left': {
                        'initial': 289,
                        'multiplier': 0.05
                    }
                }
            }
        }
    ]
};

var mouseX = 0;
var parallax_initialized = false;

$(document).mousemove(function(e) {
    mouseX = e.pageX;
    if(!parallax_initialized) {
        parallax(true);
        parallax_initialized = true;
        $(document).unbind('mousemove');
    }
});

var parallax = function(on) {
    if($.fn.parallax && $('#parallax').is('div')) {
        on = (typeof(on) == 'undefined' ? false : on);
        if(on) {
            $('#bg').css('left', PARALLAX_OPTIONS.elements[0].properties.x.left.initial.toString() + 'px').animate({left: (PARALLAX_OPTIONS.elements[0].properties.x.left.initial + -PARALLAX_GRID / 2 + mouseX * PARALLAX_GRID / RESX).toString() + 'px'}, function() {
                $('#parallax').parallax(PARALLAX_OPTIONS);
            });
        } else {
            $('html').unbind('mousemove');
        }
    }
}

var error_message = function() {
    $('#message').text('Wystąpił błąd zapisania danych. Spróbuj ponownie.').removeClass('success').addClass('alert');
    $('#popup').fadeIn(1000);
    $('#mask').show();
}

var success_message = function() {
    $('#message').html('<b>Dziękujemy.</b> Twoje zgłoszenie zostało poprawnie zapisane.').removeClass('alert').addClass('success');
    $('#popup').fadeIn(1000);
    $('#mask').show();
}

var saved_message = function() {
    $('#message').text('Zgłoszenie istnieje już w systemie.').removeClass('success').addClass('alert');
    $('#popup').fadeIn(1000);
    $('#mask').show();
}

var show_part = function(index, max, slide) {
    if(index > max) return;
    slide.find('[data-show="' + index.toString() + '"]').css('visibility', 'visible').hide();
    slide.find('[data-show="' + index.toString() + '"]:first').fadeIn(SPEED, function() {
        show_part(index + 1, max, slide);
    });
    slide.find('[data-show="' + index.toString() + '"]:not(:first)').fadeIn(SPEED);
}

var mask_phones = function() {
    $(this).mask($(this).attr('mask'));
    $(this).val($(this).attr('mask').replace(/[9a*]/g, '_'));
}
    
$(document).ready(function() {
    $('[data-page]').click(function(e) {
        e.preventDefault();
        var page = $(this).data('page');
        var slide = $('#slide-' + page);
        var top_show = parseInt(Math.max.apply( Math, $.map(slide.find('[data-show]'), function(i) { return $(i).data('show'); }) ));
        var speed = (top_show + 1) * SPEED;
        
        switch(page) {
            case 1:
                $('#bg').animate({'left': '520px'}, speed, function() { parallax(false); });
                parallax(false);
                break;
            case 2:
                $('#bg').animate({'left': '304px'}, speed, function() {
                    parallax(true);
                });
                break;
            case 3:
                $('#bg').animate({'left': '0px'}, speed, function() { parallax(false); });
                parallax(false);
                break;
            case 4:
                $('#bg').animate({'left': '0px'}, speed, function() { parallax(false); });
                parallax(false);
                break;
        }
        
        $('.slide:not(:visible) [data-show]').css('visibility', 'hidden');
        $('.slide:visible').fadeOut(SPEED, function() {
            slide.show();
            show_part(1, top_show, slide);
        });
        $('#pager li').removeClass('selected');
        $('#pager li a[data-page="' + page + '"]').parent().addClass('selected');
    });
    
    $('form').submit(function(e) {
        e.preventDefault();
        $(this).find('.error').removeClass('error');
        $(this).find('input, textarea').each(function() {
            if( $(this).attr('type') != 'checkbox' && $(this).val() == '' ) {
                $(this).addClass('error');
            }
            if( $(this).attr('type') == 'checkbox' && !$(this).is(':checked') ) {
                $(this).parent().addClass('error');
            }
            if( $(this).attr('id') == 'email' && !$(this).val().match(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) ) {
                $(this).addClass('error');
            }
            if( $(this).attr('id') && $(this).attr('id').match(/^mobile/) && !$(this).val().match(/^[0-9]{3}-?[0-9]{3}-?[0-9]{3}$/) ) {
                $(this).addClass('error');
            }
        });
        if( $('#mobile').val() != $('#mobile_repeat').val() ) {
            $('#mobile, #mobile_repeat').addClass('error');
        }
        if(($(this).find('.error')).size()) {
            //error_message();
        } else {
            $.ajax({
                url: 'save.json',
                dataType: 'json',
                type: 'post',
                data: $(this).serialize(),
                success: function(response) {
                    if(response.result == 'error') {
                        for(var i in response.errors) {
                            $('#' + response.errors[i]).addClass('error');
                            //error_message();
                        }
                    } else {
                        if(response.result == 'saved') {
                            saved_message();
                        } else {
                            $('form').find('input:not([type="checkbox"]), textarea').val('');
                            $('form').find('input[type="checkbox"]').attr('checked', false);
                            mask_phones.call($('#mobile, #mobile_repeat'));
                            success_message();
                        }
                    }
                },
                error: function() {
                    error_message();
                }
            });
        }
    });

    $('[mask]').each(function() { mask_phones.call(this) });
    
    $('.slide [data-show]').css('visibility', 'hidden');
    $('[data-page="2"]:first').click();

    $('#mask, #popup a').click(function(e) {
        if($(this).parent().attr('id') == 'popup') {
            e.preventDefault();
        }
        
        
        $('#popup').fadeOut(1000);
        $('#mask').hide();
    });
    setInterval(function() {
        if(!$('#slide-2:visible').size()) {
            $('html').unbind('mousemove');
        }
    }, 500);
});
