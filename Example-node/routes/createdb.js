const nano = require('nano')

exports.create = function(req,res) {
    nano.bind.create(req.body.dbname, function(err, body) {
        if(err) {
            res.send("Error creating database");
        }
        res.send("Db created successfully")
    });
};