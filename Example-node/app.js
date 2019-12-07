var express = require('express'); //express-framework
var routes = require('./routes'); //'./' to search whole routes directory
var http = require('http'); //
var path = require('path'); // for working with absolute paths
var urlencoded = require('url'); //
var bodyParser = require('body-parser'); //reading JSON file
var json = require('json'); // to work with JSON files(couchdb send data in JSON format)
var logger = require('logger'); //
var methodOverride = require('method-override');
var nano = require('nano')('http://localhost:5984'); //get connected to couchdb
var fs = require('fs');

var db = nano.use('contact');
var app = express(); // create app using express framework

app.set('port',process.env.PORT || 3000);
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(express.static(path.join(__dirname,'public')));

app.get('/',routes.index);

app.get('/tasks', function(req, res) {
        fs.readFile('./jsonExample.json', function(err, data) {
            if(!err)
            {
                //res.send(data.toString());
                res.send(JSON.parse(data.toString()).value);
            } 
        });
});

app.post('/createdb',function(req,res) {
    nano.db.create(req.body.dbname, function(err) {
        if(err) {
            res.send("Error creating database", req.body.dbname);
        }
        res.send("Database : "+ req.body.dbname +" created successfully");
    });
});

app.post('/new_contact',function(req,res) {
    var name = req.body.name;
    var phone = req.body.phone;

    db.insert({name : name,phone : phone,crazy:true}, phone, function(err, body, header) {
            if(err) {
                console.log(err);
                res.send("Error creating contact");
                return;
            }
            res.send("Contact created successfully");
        });
});

app.post('/view_contact', function(req,res) {
    var alldoc = "Following are the contacts";
    db.get(req.body.phone, {revs_info: true}, function(err,body) {
        if(!err)
        {
            console.log(body);
        }
        if(body) {
            alldoc += "Name : "+body.name+"<br/>Phone no. : "+body.phone;
        }
        else {
            alldoc+= "No records found";
        }
        res.send(alldoc);
    });
});

app.post('/delete_contact', function(req,res) {
    db.get(req.body.phone, {revs_info : true}, function(err, body) {
        if(!err) {
            db.destroy(req.body.phone, body._rev,function(err,body) {
                if(err)
                {
                    res.send("error deleting contact");
                }
                res.send("Contact deleted successfully");
            });
        }
        
    });

});


http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port' + app.get('port'));
});

