var storyWidth;
var storyHeight;
var storyIdent ;
var storyEdition;

var tapEngine = (function(){
    var currentPageNumber = 0;
    var currentPauseNumber = 0;
    var autoplayTimer;

    var pageCount = -1;
    var pauseCount = -1;

    function configurePauses(){
        $('#story').children('.page').each(function(i, pageElement){
            pageCount++;
            $(pageElement).attr('data-page', pageCount);
            pauseCount++;
            $(pageElement).attr('data-pause', pauseCount);

            $(pageElement).find('.pause').each(function(j, blockElement){
                pauseCount++;
                $(blockElement).attr('data-page', pageCount);
                $(blockElement).attr('data-pause', pauseCount);
            });
        });
    }

    function walkBlocks(ele){
        $(ele).contents().each(function(i,ele){
            if ($(ele).hasClass('page')){
                pageCount++
                pauseCount++
                $(ele).attr('data-page', pageCount);
                $(ele).attr('data-pause', pauseCount);
            } else if ($(ele).hasClass('pauseblock')){
                pauseCount++
                $(ele).attr('data-page', pageCount);
                $(ele).attr('data-pause', pauseCount);
            } else if (ele.nodeType === 3){
                if ($(ele).text().trim().length > 0){
                    $(ele).wrap('<span class="pause" data-page="' + pageCount + '" data-pause="'+ pauseCount +'"></span>');
                }
            }
            walkBlocks(ele);
        });
    }

    function configureBlocks(){
        walkBlocks($('#story'));
    }

    function next(){
        if (currentPauseNumber <= pauseCount){
            $('[data-pause='+ currentPauseNumber +']').addClass('visible');
            currentPauseNumber += 1;
            return true;
        }
        return false;
    }

    function goToPage(pageNumber){
        for (var i=0; i <= pageNumber; i++){
            currentPageNumber = i;
            console.log("$('[data-page='"+ currentPageNumber +"']').addClass('visible');");
            $('[data-page='+ currentPageNumber +']').addClass('visible');
        }
    }

    function autoPlay(interval){
        next();
        autoplayTimer = setInterval(function(){
            if (!next()){
                clearInterval(autoplayTimer);
            }
        }, interval);
    }

    function init(){
        var pauses = $('#story').find('.pause').length;
        var blocks = $('#story').find('.pauseblock').length;
        if ( pauses >= blocks){
            configurePauses();
        } else if ( blocks > pauses ){
            configureBlocks();
        }
    }

    init();

    return {
        autoPlay: autoPlay,
        next: next,
        goToPage: goToPage
    }
})()

function resizeStory(){

    var stageWidth = $('#stage').width()
    var stageHeight = $('#stage').height()

    var widthFactor = stageWidth / storyWidth;
    var heightFactor = stageHeight / storyHeight;

    var scaleFactor = widthFactor;

    if ( widthFactor > heightFactor ){
        scaleFactor = heightFactor;
    } 

    $('#story').css('-webkit-transform', 'scale(' + scaleFactor + ')');
    $('#story').css('transform', 'scale(' + scaleFactor + ')');
    var scaledStoryWidth = storyWidth * scaleFactor;
    var scaledStoryHeight = storyHeight * scaleFactor;

    $('#story').css('left', parseInt((stageWidth-scaledStoryWidth) / 2))
    $('#story').css('top', parseInt((stageHeight-scaledStoryHeight) / 2))
}

function configureDimensions(){
    var prescribedWidth = $('#story').attr('width') || 1136;
    $('#story').width(prescribedWidth);
    storyWidth = $('#story').width()

    var prescribedHeight = $('#story').attr('height') || 640;
    $('#story').height(prescribedHeight);
    storyHeight = $('#story').height()
}

function handleTwitterClick(e){
    e.preventDefault();
    e.stopPropagation();
    var tweet_text = encodeURIComponent('http://tapestri.es/story/' + storyIdent + '/' + storyEdition + '/?p=' + tapEngine.getCurrentPageNumber())

    window.open(
        "https://twitter.com/intent/tweet?text=" + tweet_text,
        "ShareWindow",
        "menubar=no,location=no,resizable=no,scrollbars=no,status=no,width=550px,height=310px"
    );
}

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function onLoad(){
    storyIdent = $("meta[property='tapestry:story_id']").attr('content');
    storyEdition = $("meta[property='tapestry:edition']").attr('content');

    configureDimensions();
    resizeStory();
    $(window).on('resize', resizeStory);

    $(window).on('click', tapEngine.next);
    $('#story').on('click', '.twittershare', handleTwitterClick);

    var pageNumber = getParameterByName('p');
    var autoPlay = getParameterByName('a');

    if (pageNumber){
        pageNumber = parseInt(pageNumber);
        tapEngine.goToPage(pageNumber);
    } else if (autoPlay){
        autoPlay = parseInt(autoPlay);
        tapEngine.autoPlay(autoPlay);
    } else {
        tapEngine.next();
    }
}

$(onLoad);
