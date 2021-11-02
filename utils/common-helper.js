function schemaErrors(error)
{
    var errMessage = [];
    // go through all the errors...
    for (var errName in error.errors) {
        errMessage.push(error.errors[errName].properties.message);
    }
    //console.log(errMessage);
    return errMessage;
}

module.exports = {getErrors: schemaErrors};