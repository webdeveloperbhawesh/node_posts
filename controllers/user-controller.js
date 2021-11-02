const { json } = require('body-parser');
const feedModel = require('../models/feed-model');
var userService = require('../services/user-service');

function addFeed(req,res,next)
{
    var result = {};
    if(req.session.user)
    {
        result.user = req.session.user;
    }
    res.render('add-feed',{'result':result});
}


async function storeFeed(req,res,next)
{
    let result = await userService.createFeed(req.body,req.session.user._id);
    console.log('stored feed',result);
    if(req.session.user)
    {
        result.user = req.session.user;
    }
    if(result.error)
    {
        res.render('add-feed',{result:result});
    }
    else{
        res.redirect('/');
    }
}

function settings(req,res,next)
{
    var result = {
        user:{}
    };
    if(req.session.user)
    {
        result.user = req.session.user;
    }
    res.render('settings',{result:result});
}

async function saveSettings(req,res,next)
{
    let result = await userService.updateSetting(req.body,req.session.user._id);
    if(req.session.user)
    {
        result.user = req.session.user;
    }
    
    if(req.session.user)
    {
        req.session.user = result.userData;
        req.session.save();
        result.user = req.session.user;
        
    }
    res.render('settings',{result:result});
    
}

async function profile(req,res,next)
{
    var result = {
        user: {},
        profile: await userService.getUser(req.params.username)
    };
    if(req.session.user)
    {
        result.user = req.session.user;
    }
    res.render('profile',{result:result});
}

async function myFeeds(req,res,next)
{
    let page = 1, offset = 0,limit = 10;
    if(req.query.page > 0)
    {
        page = req.query.page;
        offset = page * limit - limit;
    }
    var myFeeds = await userService.myFeeds(limit,offset,req.query.user);
    res.json(myFeeds);
}

async function likeFeed(req,res,next)
{
    var liked = await userService.likeFeed(req.body.id,req.session.user._id);
    res.json(liked);
}

async function favouritedFeeds(req,res,next)
{
    let page = 1, offset = 0,limit = 10;
    if(req.query.page > 0)
    {
        page = req.query.page;
        offset = page * limit - limit;
    }
    var favFeeds = await userService.favouritedFeeds(limit,offset,req.query.user);
    res.json(favFeeds);
}

async function logout(req,res,next)
{
    req.session.user = {};
    req.session.destroy(e=>{
        if(e)
        {
            return res.json({error:e.message});
        }
        else{
            return res.json({success:1});
        }
    });
}

async function postComment(req,res,next)
{
    var comment = await userService.postComment(req.body.comment,req.body.feed_id,req.session.user._id);
    res.json(comment);
}
async function deleteComment(req,res,next)
{
    var deleted = await userService.deleteComment(req.body.comment_id,req.body.feed_id,req.session.user._id);
    res.json(deleted);
}
async function followUser(req,res,next)
{
    var follow = await userService.followUser(req.body.username,req.session.user._id);
    if(!follow.error)
    {
        req.session.user = follow.updatedRes;
        req.session.save();
    }
    res.json({'msg':follow.following});
}

async function deleteFeed(req,res,next)
{
    var deleted = await userService.deleteFeed(req.body.feed_id,req.session.user._id);
    res.json(deleted);
}
async function editFeed(req,res,next)
{
    var feed = await userService.getFeed(req.params.id,req.session.user._id);
    var result = {feed:feed};
    if(req.session.user)
    {
        result.user = req.session.user;
    }
    res.render('edit-feed',{result:result});
}
async function updateFeed(req,res,next)
{
    let result = await userService.updateFeed(req.body,req.session.user._id);
    console.log('stored feed',result);
    if(req.session.user)
    {
        result.user = req.session.user;
    }
    if(result.error)
    {
        res.render('edit-feed',{result:result});
    }
    else{
        res.redirect('/');
    }
}

module.exports = {
    addNewFeed :addFeed,
    saveNewFeed: storeFeed,
    settings: settings,
    saveSettings: saveSettings,
    profile:profile,
    myFeeds:myFeeds,
    likeFeed:likeFeed,
    favouritedFeeds:favouritedFeeds,
    logout:logout,
    postComment:postComment,
    deleteComment:deleteComment,
    followUser:followUser,
    deleteFeed:deleteFeed,
    editFeed:editFeed,
    updateFeed:updateFeed
}