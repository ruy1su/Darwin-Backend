// Created By Zixia Weng on May 21. 2018
//
// Copyright © 2018 Darwin. All rights reserved.
//

var mysql = require('mysql');
var express = require('express');
var escapeJSON = require('escape-json-node');
var bodyParser = require('body-parser')
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var connection = mysql.createConnection({
    host     : 'aam2629vgw55ee.czd1gxziytnq.us-east-2.rds.amazonaws.com',
    user     : 'eric',
    password : 'Weng950702',
    port     : '3306',
    database : 'darwin',
    multipleStatements: true
    });

connection.connect(function(err) {
    if (err) {
       console.error('Database connection failed: ' + err.stack);
       return;
    }
    console.log('Connected to database.');
});

// POST API ---------------------------------------------------------------------------------------------------------------------------------------

app.post("/create_user", (req, res) => {
    var fname=req.body.fname;
    var lname=req.body.lname;
    var email=req.body.email;
    console.log(req.body)
    connection.query(`INSERT INTO user (fname, lname, email) VALUES ("${fname}", "${lname}", "${email}")`, function(err, result){
        if(err) {return res.send(err);}
        else{
            console.log("1 user inserted");
            res.send("Success");
        }
    });
});

// GET API ---------------------------------------------------------------------------------------------------------------------------------------
// Home Page Api
app.get('/api_home/', function (req,res) {
    connection.query("SELECT id, api_data FROM podcast_list limit 15", function(error, rows, fields){
       if(error){
           console.log('Error in the query');
       }
       else{
            console.log('Successfull query');
            var resultJsonList = [];
            for (i = 1; i < rows.length; i++) { 
                resultJson = new Object()  
                var id = rows[i]['id']
                var raw = rows[i]['api_data']
                raw = raw.split("=>").join(":");
                var jsData = JSON.parse(raw)
                var parsedData = jsData['results']

                resultJson['coverArtURL'] = parsedData[0]['artworkUrl100']
                resultJson['artist'] = parsedData[0]['artistName']
                resultJson['title'] = parsedData[0]['collectionName']
                resultJson['pid'] = id
                if(!parsedData[0]['feedUrl']){
                    resultJson['mediaURL'] = parsedData[0]['artworkUrl100']
                }
                else{
                    resultJson['mediaURL'] = parsedData[0]['feedUrl']
                }


                resultJsonList.push(resultJson)
            }
            
            res.send(resultJsonList);
       }
    });
});

// Home Page Api Raw Data
app.get('/api_home_raw/', function (req,res) {
    connection.query("SELECT api_data FROM podcast_list limit 10", function(error, rows, fields){
       if(error){
           console.log('Error in the query');
       }
       else{
            console.log('Successfull query');
            var resultJsonList = [];
            for (i = 1; i < rows.length; i++) { 
                var raw = rows[i]['api_data']
                raw = raw.split("=>").join(":");
                var jsData = JSON.parse(raw)
                var parsedData = jsData['results']
                resultJsonList.push(parsedData)
            }
            
            res.send(resultJsonList);
       }
    });
});

// Search Episode with Podcast Id
app.get('/api_episode/:pid/', function (req,res) {
    search_key = req.params.pid;
    connection.query(`SELECT podcast_id as pid, podcast, episode as title, release_date, info FROM episode where podcast_id = "${search_key}";`, function(error, rows, fields){
        if(error){
            console.log('Error in the query');
        }
        else{
            console.log('Successfull query');
            var resultJsonList = [];
            for (i = 0; i < rows.length; i++) { 
                rows[i]['eid'] = 0
                rows[i]['artist'] = " "
                rows[i]['mediaURL'] = "http://is5.mzstatic.com/image/thumb/Music6/v4/ca/82/2f/ca822f13-f1f7-dd8c-957d-a95a7b43501c/source/100x100bb.jpg"
            }
            
            res.send(rows);
        }
    });
});

// Get Episode Data With Podcast Name
app.get('/api_pc_epsd/:podcast_name/', function (req,res) {
    search_key = req.params.podcast_name;
    connection.query(`SELECT episode FROM episode where podcast = "${search_key}" limit 5;`, function(error, rows, fields){
       if(error){
           console.log('Error in the query');
       }
       else{
           console.log('Successfull query');
       console.log(rows);
           res.send(rows);
       }
    });
});

// Search Podcast
app.get('/api_search/:a?/', function (req,res) {
    search_key = req.params.a;

    var sql = `SELECT api_data FROM podcast_list where podcast LIKE '%${search_key}%' `
    console.log(sql)
    connection.query(sql, search_key, function(error, rows, fields){
       if(error){
           console.log('Error in the query');
       }
       else{
           console.log('Successfull query with search_key:', search_key);
           var resultJsonList = [];
            for (i = 1; i < rows.length; i++) { 
                resultJson = new Object()  // init the new json object for return 
                var raw = rows[i]['api_data']
                // console.log(raw+"-------------\r\n");
                raw = raw.split("=>").join(":");
                raw = raw.replace(/(\r\n\t|\n|\r\t)/gm,"");
                // console.log(raw+"-------------\r\n");

                try {
                    var jsData = JSON.parse(raw);
                } catch(e) {
                    console.log('malformed request', raw);
                    console.log(e);
                    // return res.status(400).send('malformed request: ' + raw);
                }
                var parsedData = jsData['results']

                resultJson['coverArtURL'] = parsedData[0]['artworkUrl100']
                resultJson['artist'] = parsedData[0]['artistName']
                resultJson['title'] = parsedData[0]['collectionName']
                resultJson['duration'] = 0
                resultJson['mediaURL'] = parsedData[0]['feedUrl']
                resultJsonList.push(resultJson)
            }
            res.send(resultJsonList);
       }
    });
});

//home page: TRENDING
app.get('/api_trending/', function (req,res) {
    connection.query("SELECT api_data FROM podcast_list where id = 120033 or id = 116886 or id = 46300 or id = 59181;", function(error, rows, fields){
       if(error){
           console.log('Error in the query');
       }
       else{
            console.log('Successfull query');
            showRes(res, rows);
       }
    });
});

//home page: Your Friends are listen to
app.get('/api_friends/', function (req,res) {
    connection.query("SELECT api_data FROM podcast_list where id = 42576 or id = 128946 or id = 128970 or id = 129557;", function(error, rows, fields){
       if(error){
           console.log('Error in the query');
       }
       else{
            console.log('Successfull query');
            showRes(res, rows);
       }
    });
});

app.get('/api_up_next/', function (req,res) {
    connection.query("SELECT api_data FROM podcast_list where id = 123761 or id = 115049 or id = 113522;", function(error, rows, fields){
       if(error){
           console.log('Error in the query');
       }
       else{
            console.log('Successfull query');
            showRes(res, rows);
       }
    });
});

app.get('/api_play_list/', function (req,res) {
    connection.query("SELECT api_data FROM podcast_list where id = 140170 or id = 44218 or id = 58604 or id = 129923 or id = 130183 or id = 130239;", function(error, rows, fields){ // or id = 138979
       if(error){
           console.log('Error in the query');
       }
       else{
            console.log('Successfull query');
            showRes(res, rows);
       }
    });
});

function showRes(res, rows) { 
    var resultJsonList = [];
    for (i = 0; i < rows.length; i++) { 
        resultJson = new Object()  // init the new json object for return 
        var raw = rows[i]['api_data'];
        // console.log(raw);
        raw = raw.split("=>").join(":");
        // console.log(raw);
        try {
            var jsData = JSON.parse(raw);
        } catch(e) {
            console.log('malformed request', raw);
            console.log(e);
            // return res.status(400).send('malformed request: ' + raw);
        }        
        var parsedData = jsData['results'];
        // console.log(parsedData.length);

        resultJson['coverArtURL'] = parsedData[0]['artworkUrl100']
        resultJson['artist'] = parsedData[0]['artistName']
        resultJson['title'] = parsedData[0]['collectionName']
        resultJson['duration'] = 0
        resultJson['mediaURL'] = " "
        resultJsonList.push(resultJson)
    }
    res.send(resultJsonList);
}


// Handle 404 - Keep this as a last route
app.use(function(req, res, next) {
    res.status(404);
    res.send('404: File Not Found');
});


// Listen to port other than 80
app.listen(5000, () => console.log('Example app listening on port 3000!'));

// End Connection
app.on('close', function() {
    connection.end();
});
