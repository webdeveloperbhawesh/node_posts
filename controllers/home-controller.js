var homeService = require('../services/home-service');
const userService = require('../services/user-service');

async function home(req,res,next){
    
    var result = { 
        globalFeeds:{},
        user:{},
        myFeeds:{}
    };
    if(req.session.user)
    {
        result.user = req.session.user;
    }
    res.render('index',{'result':result});
}

function signup(req,res){
    res.render('signup',{result:{user:{}}});
}
function signin(req,res){
    res.render('signin',{result:{user:{}}});
}

async function register(req,res,next)
{
    let result = await homeService.register(req.body);
    if(result.error)
    {
        result.user = {};
        console.log(result);
        res.render('signup',{result:result});
    }
    else{
        result.user.password = undefined;
        req.session.user = result.user;
        req.session.save();
        res.redirect('/');
    }
}

async function login(req,res)
{
    var result = await homeService.login(req.body);
    if(result.error)
    {
        result.user = {};
        res.render('signin',{result:result});
    }
    else{
        result.user.password = undefined;
        req.session.user = result.user;
        req.session.save(err=>{
            if(err)
            {
                console.log('session store error',err);
            }
            else{
                console.log('session stored in db',req.session.user);
            }
        });
        res.redirect('/');
    }
}

async function globalFeeds(req,res,next)
{
    let page = 1, offset = 0,limit = 10;
    if(req.query.page > 0)
    {
        page = req.query.page;
        offset = page * limit - limit;
    }
    var globalFeeds = await homeService.globalFeeds(limit,offset,req.query.tag);
    res.json(globalFeeds);
}

async function viewFeed(req,res,next)
{
    var feed = await homeService.viewFeed(req.params.feed_id);
    var result = {
        feed: feed,
        user:{}
    }
    if(req.session.user)
    {
        result.user = req.session.user;
    }
    res.render('view-feed',{result:result});
}

async function popularTags(req,res)
{
    var popularTags = await homeService.popularTags();
    res.json(popularTags); 
}

module.exports = {
    'register': register,
    'login' : login,
    'home' : home,
    'signup' : signup,
    'signin' : signin,
    'globalFeeds':globalFeeds,
    'viewFeed':viewFeed,
    'popularTags':popularTags
}