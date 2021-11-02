const joi = require('joi');

async function loginValidation(req,res,next)
{
    const querySchema = joi.object({
        email: joi.string().required().email()
                .messages(
                        {
                            'string.empty':'Please enter email',
                            'string.email':'Please enter a valid email'
                        }),
        password: joi.string().required()
                    .messages({'string.empty':'Please enter password'})
      });
      var result = await querySchema.validate(req.body);
      
      if(result.error)
      {
          var errorObj = {error:[result.error.details[0].message],user:{}};
          res.render('signin',{result:errorObj});
      }
      else{
        next();
      }   
}

function registerValidation(req,res,next)
{
    var schema = joi.object({
        username: joi.string().required()
                .messages({'string.empty':"Please enter username"}),
        email: joi.string().required().email()
                .messages(
                        {
                            'string.empty':'Please enter email',
                            'string.email':'Please enter a valid email'
                        }),
        password: joi.string().required()
                    .messages({'string.empty':'Please enter password'})
    });
    var result = schema.validate(req.body);
    if(result.error)
    {
        var errorObj = {error:[result.error.details[0].message],user:{}};
        res.render('signup',{result:errorObj});
    }
    else{
        next();
    }
}

function authValidationPage(req,res,next)
{
    // console.log('auth validation page called');
    if(!req.session.user)
    {
        var errorObj = {error:['Please login to continue'],user:{}};
        res.render('signin',{result:errorObj});
    }
    else{
        next();
    }
}

function authValidationApi(req,res,next)
{
    // console.log('auth validation api called');
    if(!req.session.user)
    {
        res.json({'status':401});
    }
    else{
        next();
    }
}

module.exports = {
    loginValidation:loginValidation,
    registerValidation:registerValidation,
    authValidationPage:authValidationPage,
    authValidationApi:authValidationApi
    
}