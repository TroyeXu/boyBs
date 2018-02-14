new WOW().init();
$(document).ready(function () {
    $('.scrollTop').click(function (e) {
        e.preventDefault();
        var target = $(this).attr('href');
        //讀取href
        var targetPos = $(target).offset().top;
        //取處這些id的位置， offset有TOP與left
        $('html, body').animate({ scrollTop: targetPos - 70 }, 1000);
    });
});