$(function(){
    
    $(".deleteFeedBtn").on('click', function(e){
        deleteFeed($(this).data('feed'));
    });
    $('body').on('click','.popularTagsClass', function(e){
        getGlobalFeeds(1,$(this).data('tag'));
    });
    
    $("#addCommentBtn").on('click', function(e){
        postComment();
    });
    $(".followUserBtn").on('click', function(e){
        followUser($(this).data('user'));
    });
    
    $(".deleteCommentBtn").on('click', function(e){
        deleteComment(this.id);
    });
    
    $("a.getGlobalFeeds").on('click', function(e){
        getGlobalFeeds();
    });

    $("a.getMyFeeds").on('click', function(e){
        getMyFeeds();
    });
    $("a.getFavouritedFeeds").on('click', function(e){
        getFavouritedFeeds();
    });
    
    if($('#popularTags').length > 0)
    {
        getPopularTags();
    }
    if($('.getMyFeeds').length > 0)
    {
        $('.myFeedContentDiv').parent().addClass('active show');
        getMyFeeds();
    }
    else if($('.getGlobalFeeds').length > 0){

        $('.globalFeedContentDiv').parent().addClass('active show');
        getGlobalFeeds();
    }

    $('body').on('click','.paginationLink',function(e){
        //e.preventDefault();
        let pageNo = $(this).data('page');
        console.log($(this).hasClass('myLink'));
        if($(this).hasClass('myLink'))
        {
            getMyFeeds(pageNo);
        }
        else if($(this).hasClass('favoriteLink'))
        {
            getFavouritedFeeds(pageNo);
        }
        else if($(this).hasClass('globalLink'))
        {
            getGlobalFeeds(pageNo);
        }
       
    });
});

function getPopularTags()
{
    $.ajax({
        type: 'get',
        url: '/popular-tags'
    })
    .done(function(data){
        if(!data.error && data.popularTags.length > 0)
            {
                let html = '';
                data.popularTags.forEach(tag=>{
                    if(tag)
                    {
                        html += `<span class="popularTagsClass" data-tag=${tag}>${tag}</span> `;
                    }
                });
                $('#pupularTagsDiv').html(html);
            }
            else{
                $('#pupularTagsDiv').text('No tags found');
            }
    });
}

function deleteFeed(feedId)
{
    $.ajax({
        type: 'post',
        url: '/api/delete-feed',
        data:{'feed_id':feedId}
    })
    .done(function(data){
        if(data.status == 401)
        {
            window.location.href="/signin";
            return;
        }
        if(!data.error)
        {
           window.location.href = '/profile/'+loginUsername;
        }
        else{
            alert(data.error);
        }
    });
}

function followUser(username)
{
    $.ajax({
        type: 'post',
        url: '/api/follow-user',
        data:{'username':username}
    })
    .done(function(data){
        if(data.status == 401)
        {
            window.location.href="/signin";
            return;
        }
        if(!data.error)
        {
           $('.followUserBtn').text(data.msg);
        }
        else{
            alert(data.error);
        }
    });
}

function deleteComment(id)
{
    $.ajax({
        type: 'post',
        url: '/api/delete-comment',
        data:{'comment_id':id,'feed_id':$('#feed_id').val()}
    })
    .done(function(data){
        if(data.status == 401)
        {
            window.location.href="/signin";
            return;
        }
        if(!data.error)
        {
           window.location.reload(true);
        }
        else{
            $('.apiErrorMsg').text(data.error);
        }
    });
}

function postComment()
{
    $.ajax({
        type: 'post',
        url: '/api/post-comment',
        data:{'comment':$('#comment').val(),'feed_id':$('#feed_id').val()}
    })
    .done(function(data){
        if(data.status == 401)
        {
            window.location.href="/signin";
            return;
        }
        if(!data.error)
        {
           window.location.reload(true);
        }
        else{
            $('.apiErrorMsg').text(data.error);
        }
    });
}

function logout()
{
    $.ajax({
        type: 'get',
        url: '/api/logout'
    })
    .done(function(data){
        if(data.status == 401)
        {
            window.location.href="/signin";
            return;
        }
        if(!data.error)
        {
           window.location.href = '/';
        }
        else{
            alert(data.error);
        }
    });
}

function likeFeed(id)
{
    $.ajax({
        type: 'post',
        url: '/api/like-feed',
        data: {id:id}
    })
    .done(function(data){
        if(data.status == 401)
        {
            window.location.href="/signin";
            return;
        }
        if(!data.error)
        {
            $('#'+id).html('<i class="fas fa-heart"></i> '+data.count);
        }
        else{
            alert(data.error);
        }
    });
}

function getFavouritedFeeds(page=1)
{
    let viewUsername = window.location.pathname.split('/')[2];
    if(!viewUsername)
    {
        viewUsername = loginUsername;
    }
    $.ajax({
        type: 'get',
        url: '/favourited-feeds?user='+viewUsername+'&page='+page,
    })
    .done(function(data){
        if(!data.error)
        {
            if(data[0].data.length > 0)
            {
                let html = constructFeedHtml(data,'favoriteLink');
                $('.favoritedFeedContentDiv').html(html);
            }
            else{
                $('.favoritedFeedContentDiv').text('No articles found');
            }
        }
        else{
            $('.favoritedFeedContentDiv').text('No articles found');
        }
    });
}

function getMyFeeds(page=1)
{
    let viewUsername = window.location.pathname.split('/')[2];
    if(!viewUsername)
    {
        viewUsername = loginUsername;
    }
    $.ajax({
        type: 'get',
        url: '/my-feeds?user='+viewUsername+'&page='+page,
    })
    .done(function(data){
        if(!data.error)
        {
            if(data[0].data.length > 0)
            {
                let html = constructFeedHtml(data,'myLink');
                $('.myFeedContentDiv').html(html);
            }
            else{
                $('.myFeedContentDiv').text('No articles found');
            }
        }
        else{
            $('.myFeedContentDiv').text('No articles found');
        }
    });
}

function getGlobalFeeds(page=1,tag='')
{
    $.ajax({
        type: 'get',
        url: '/global-feeds?page='+page+'&tag='+tag,
    })
    .done(function(data){
        if(!data.error)
        {
            if(data[0].data.length > 0)
            {
                let html = constructFeedHtml(data,'globalLink');
                $('.globalFeedContentDiv').html(html);
            }
            else{
                $('.globalFeedContentDiv').text('No articles found');
            }
        }
        else{
            $('.globalFeedContentDiv').text('No articles found');
        }
    });
}

function constructFeedHtml(data,className)
{
    let total = data[0].feedCount[0].count;
    total = parseInt(Math.ceil(total/10)) || 1;
    console.log(total);
    let pageLink = '';
    if(total > 1)
    {
        console.log('inside');
        for(let i = 1; i <= total; i++)
        {
            pageLink += `<a href="javascript:void(0);" data-page="${i}" class="paginationLink ${className}">${i}</button>`;
        }
    }
    $('.paginationDiv').html(pageLink);
    
    
    let html = '';
    data[0].data.forEach(element => {
        let allTags = '';
        
        element.tags.forEach(tag => {
            if(tag)
            {
                allTags += `<span class="tagClass floatRight">${tag}</span>`;
            }
           
        });
        formattedDate = formatIsoDate(element.createdAt);
        console.log(formattedDate);
        html += `
            <div class="singleArticleDiv">
                <div class="singleArticleTop row">
                    <div class="col-sm-1 col-md-1">
                        <img src="/static/images/smiley.jpeg">  
                    </div>
                    <div class="col-sm-9 col-md-9">
                        <div class="articleInfoDiv">
                            <div class="greenColor"><a class="greenColor" href="/profile/${element.userData[0].username}">${element.userData[0].username}</a></div>
                            <div class="feedTime greyColor">${formattedDate}</div>
                        </div>
                    </div>
                    <div class="col-sm-2 col-md-2">
                    <a href="javascript:void(0)" class="likeDiv" id="${element._id}" onclick="likeFeed('${element._id}')" ><i class="fas fa-heart"></i> ${element.likes.length}</a>
                    </div>
                </div>
                <div class="feedTitle "><h5><a href="/view-feed/${element._id}">${element.title}</a></h5></div>
                <div><p class="greyColor">${element.description}</p></div>
                <div class="row">
                    <div class="col-sm-2 col-md-2">
                        <p class="greyColor fontSize12">Read more...</p>
                    </div>
                    <div class="col-sm-10 col-md-10 greyColor fontSize12">
                        ${ allTags }
                    </div>
                </div>
            </div>
        `;
    });
    return html;
}



function formatIsoDate(date)
{
    let formattedDate = new Date(date);
    formattedDate = formattedDate.getDate() + " " + formattedDate.toLocaleString('default', { month: 'long' }) + ' ' + formattedDate.getFullYear();
    return formattedDate;
}

