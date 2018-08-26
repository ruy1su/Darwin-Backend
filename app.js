// Created By Zixia Weng on May 21. 2018 

// Copyright © 2018 Darwin. All rights reserved.


var mysql = require('mysql');
var express = require('express');
var escapeJSON = require('escape-json-node');
var bodyParser = require('body-parser')
var app = express();
const RecommendationEngine = require('./graph.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var connection = mysql.createConnection({
    host     : 'aam2629vgw55ee.czd1gxziytnq.us-east-2.rds.amazonaws.com',
    user     : 'eric',
    password : '1q2w3eDarwin',
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

// Load User into Graph

var users = []
var links = []
var receng = new RecommendationEngine('darwin');
// receng.load_graph('/home/ec2-user/Darwin-Backend/graph.ugd');

// console.log("here")
connection.query(`Select uid, fname, lname FROM user;`, function(error, rows, fields){
        if(error){
            console.log('Error in the query');
        }
        else{
            console.log('Successfull query');
            users = rows
        }
    });
// receng.load_users(users)
connection.query(`Select uid, pid FROM user_collection;`, function(error, rows, fields){
        if(error){
            console.log('Error in the query');
        }
        else{
            console.log('Successfull query');
            links = rows
        }
    });
// receng.load_links(links)

/**
 * Task 1
 */
function task1 () {
  return new Promise(resolve => {
    setTimeout(() => {
      receng.load_graph('/home/ec2-user/Darwin-Backend/graph.ugd');
      resolve('done');
    }, 5000);
  });
}

/**
 * Task 2
 */
function task2 () {

  return new Promise(resolve => {
    setTimeout(() => {
      receng.load_users(users)
      resolve('done');
    }, 5000)
  });
}

/**
 * Task 3
 */
function task3 () {
  return new Promise((resolve) => {
    setTimeout(() => {
      receng.load_links(links)
      resolve('done');
    }, 5000);
  });
}

function task4 () {
  return new Promise((resolve) => {
    setTimeout(() => {
      receng.recommendPodcasts()
      resolve('done');
    }, 5000);
  });
}

async function allTasks () {
  await task1();
  await task2();
  await task3();
  await task4();
}

allTasks();
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

app.post("/create_collection", (req, res) => {
    var uid=req.body.uid;
    var pid=req.body.pid;
    console.log(req.body)
    connection.query(`INSERT INTO user_collection (uid, pid) VALUES ("${uid}", "${pid}")`, function(err, result){
        if(err) {return res.send(err);}
        else{
            console.log("1 collection inserted");
            res.send("Success");
        }
    });
});

// DELETE API ---------------------------------------------------------------------------------------------------------------------------------------
app.delete('/delete_usr_collection/:uid/:pid',function(req,res){
     var uid = (req.params.uid)
     var pid = (req.params.pid)
     console.log(uid, pid)
     connection.query(`DELETE FROM user_collection WHERE uid = ${uid} and pid = ${pid} ;`, function(err, result){
        if(err) {console.log('Error in the query');}
        else{
            console.log("1 collection deleted");
            res.send("Success");
        }
    });
});

// GET API ---------------------------------------------------------------------------------------------------------------------------------------

// Login With Username and Password
app.get("/login_request/:username/:password", function (req, res){
    username = req.params.username;
    password = req.params.password;
    console.log(req.body)
    connection.query(`Select uid FROM user where username = "${username}" and password = "${password}";`, function(error, rows, fields){
        if(error){
            console.log('Error in the query');
        }
        else{
            console.log('Successfull query');
            res.send(rows[0]);
        }
    });
});

// Login Success With Facebook Account
app.get("/login/:email", function (req, res){
    search_key = req.params.email;
    console.log(req.body)
    connection.query(`Select uid FROM user where email = "${search_key}";`, function(error, rows, fields){
        if(error){
            console.log('Error in the query');
        }
        else{
            console.log('Successfull query');
            res.send(rows[0]);
        }
    });
});

app.get("/load_user_coll/:uid", function (req, res){
    search_key = req.params.uid;
    console.log(search_key)
    connection.query(`Select id, api_data FROM podcast_list where id in (select pid from user_collection where uid = "${search_key}");`, function(error, rows, fields){
        if(error){
            console.log('Error in the query');
        }
        else{
            console.log('Successfull query');
            var resultJsonList = [];
            for (i = 0; i < rows.length; i++) { 
                resultJson = new Object()  
                var id = rows[i]['id']
                var raw = rows[i]['api_data']
                raw = raw.split("=>").join(":");
                var jsData = JSON.parse(raw)
                var parsedData = jsData['results']

                resultJson['coverArtURL'] = parsedData[0]['artworkUrl600']
                resultJson['artist'] = parsedData[0]['artistName']
                resultJson['title'] = parsedData[0]['collectionName']
                resultJson['pid'] = id
                if(!parsedData[0]['feedUrl']){
                    resultJson['mediaURL'] = parsedData[0]['artworkUrl600']
                }
                else{
                    resultJson['mediaURL'] = parsedData[0]['feedUrl']
                }

                console.log(resultJson)

                resultJsonList.push(resultJson)
            }
            res.send(resultJsonList);
        }
    });
});

// GET API ---------------------------------------------------------------------------------------------------------------------------------------
// Home Page Api
app.get('/api_home/', function (req,res) {
    connection.query("SELECT id, api_data FROM podcast_list where id in (3, 30, 31, 34,12,14,17,18,19,20,25,26,29)", function(error, rows, fields){
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

                resultJson['coverArtURL'] = parsedData[0]['artworkUrl600']
                resultJson['artist'] = parsedData[0]['artistName']
                resultJson['title'] = parsedData[0]['collectionName']
                resultJson['pid'] = id
                if(!parsedData[0]['feedUrl']){
                    resultJson['mediaURL'] = parsedDatash[0]['artworkUrl600']
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
                rows[i]['mediaURL'] = "http://"
                // http://feeds.soundcloud.com/stream/262465031-a-bomb-audio-episode-1-fight-with-monsters.mp3
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

    var sql = `SELECT id, api_data FROM podcast_list where podcast LIKE '%${search_key}%' `
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
                var id = rows[i]['id']
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
                resultJson['pid'] = id
                resultJson['coverArtURL'] = parsedData[0]['artworkUrl600']
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


// Search Episode with Podcast Id
app.get('/api_episode_trending/', function (req,res) {
    search_key = req.params.pid;
    connection.query(`SELECT podcast_id as pid, podcast, episode as title, release_date, info FROM episode where id = 1600 or id = 1700 or id = 590;`, function(error, rows, fields){
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

//home page: TRENDING
app.get('/api_trending/', function (req,res) {
    connection.query("SELECT podcast_list.api_data, episode.podcast_id as pid, episode.podcast, episode.episode as title, episode.release_date, episode.info, episode.id as eid FROM episode join podcast_list ON episode.podcast_id = 131 and episode.podcast_id = podcast_list.id limit 4;", function(error, rows, fields){
       if(error){
           console.log('Error in the query');
       }
       else{
            console.log('Successfull query');
            // res.send(rows);
            var resultJsonList = [];
            for (i = 0; i < rows.length; i++) { 
                // resultJson = new Object()  // init the new json object for return 
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
                rows[i]['artist'] = parsedData[0]['artistName']
                rows[i]['coverArtURL'] = parsedData[0]['artworkUrl600']
                rows[i]['mediaURL'] = parsedData[0]['feedUrl']

                delete rows[i]['api_data']
                // resultJsonList.push(resultJson)
            }
            res.send(rows);
            // showRes(res, rows);
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
