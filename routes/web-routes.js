var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
var router = express.Router();
var homeController = require('../controllers/home-controller');
var userController = require('../controllers/user-controller');
var authValidations = require('../input-validations/auth');
var userValidations = require('../input-validations/user');
const { application } = require('express');

router.use(express.json());
router.use(express.urlencoded({urlencoded:true,extended: true}));

router.use(cookieParser());
router.use(session({secret:'bhaweshkey',
                    resave: false,
                    saveUninitialized: true,
                    store:MongoStore.create({
                        mongoUrl: process.env.DB,
                        autoRemove: 'native'
                    })
                }));

//middleware test

// router.use(function(req,res,next){
//     console.log('called everytime');
//     next()
// });
router.get('/middleware',function(req,res,next){
    console.log('called on middleware only');
    next()
},function(req,res,next){
    console.log('second middleware called');
    next()
},function(req,res,next){
    console.log('third middleware');
    //res.send('reached end')
    next('route')
},function(req,res,next){
    console.log("in case of next('route') it will not be called... called another same route if any ");
    //res.send('reached end')
    next()
});

router.get('/middleware',function(req,res,next){
    console.log('called from previous automaticaly');
    res.send('another route called');
})

//routes----------
router.get('/',homeController.home);
router.get('/signup',homeController.signup);
router.post('/signup',authValidations.registerValidation,homeController.register);
router.get('/signin',homeController.signin);
router.post('/signin',authValidations.loginValidation,homeController.login);
router.get('/global-feeds',homeController.globalFeeds);
router.get('/my-feeds',userController.myFeeds);
router.get('/favourited-feeds',userController.favouritedFeeds);
router.get('/view-feed/:feed_id',homeController.viewFeed);
router.get('/popular-tags/',homeController.popularTags);

router.use('/api',authValidations.authValidationApi);
router.post('/api/like-feed',userValidations.likeValidation,userController.likeFeed);
router.get('/api/logout',userController.logout);
router.post('/api/post-comment',userValidations.commentValidation,userController.postComment);
router.post('/api/delete-comment',userValidations.deleteCommentValidation,userController.deleteComment);
router.post('/api/follow-user',userValidations.followUserValidation,userController.followUser);
router.post('/api/delete-feed',userValidations.deleteFeedValidation,userController.deleteFeed);


router.use(authValidations.authValidationPage);
router.get('/add-feed',userController.addNewFeed);
router.post('/add-feed',userValidations.feedValidation,userController.saveNewFeed);
router.get('/edit-feed/:id',userController.editFeed);
router.post('/edit-feed/',userValidations.feedValidation,userController.updateFeed);
router.get('/settings',userController.settings);
router.post('/settings',userValidations.settingValidation,userController.saveSettings);
router.get('/profile/:username',userController.profile);


module.exports = router;