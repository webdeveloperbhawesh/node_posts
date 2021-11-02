var mongoose = require('mongoose');
mongoose.connect(process.env.DB,{ useUnifiedTopology: true ,useNewUrlParser: true,useFindAndModify:false})
.then(()=> 
{
    console.log(`connected to mongodb`);
    // mongoose.connection.db.listCollections().toArray(function (err, names) {
    //     console.log(names); // [{ name: 'dbname.myCollection' }]
       
    // });
})
.catch(err=> console.log(`Mongo Error: ${err}`));



