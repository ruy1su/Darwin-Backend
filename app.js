var mysql = require('mysql');
var express = require('express');
var app = express();


var connection = mysql.createConnection({
    host     : 'aam2629vgw55ee.czd1gxziytnq.us-east-2.rds.amazonaws.com',
    user     : 'eric',
    password : '********',
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

//For test only
var data = {"id":1,"itunes_link":"https://itunes.apple.com/us/podcast/a-e-radio/id867773712","podcast":"A&E Radio!!!","image":"https://s.mzstatic.com/htmlResources/8fc4/frameworks/images/p.png","category":"Arts","language":"Language: English","rating":"","reviews":"","url":"https://podcastmachine.com/pod","api_data":"{\"resultCount\"=>1, \"results\"=>[{\"wrapperType\"=>\"track\", \"kind\"=>\"podcast\", \"collectionId\"=>867773712, \"trackId\"=>867773712, \"artistName\"=>\"A&E Radio\", \"collectionName\"=>\"A&E Radio!!!\", \"trackName\"=>\"A&E Radio!!!\", \"collectionCensoredName\"=>\"A&E Radio!!!\", \"trackCensoredName\"=>\"A&E Radio!!!\", \"collectionViewUrl\"=>\"https://itunes.apple.com/us/podcast/a-e-radio/id867773712?mt=2&uo=4\", \"feedUrl\"=>\"https://feed.podcastmachine.com/podcasts/16672/mp3.rss\", \"trackViewUrl\"=>\"https://itunes.apple.com/us/podcast/a-e-r"};

app.get('/', (req, res) => res.send('Hello this is the backend for Darwin! For more info, you can contact https://www.darwin.com'));
app.get('/test', function(req, res) {
  res.end(JSON.stringify(data))
})

app.get('/api_home/', function (req,res) {
    connection.query("SELECT api_data FROM podcast limit 10", function(error, rows, fields){
	   if(error){
	       console.log('Error in the query');
	   }
	   else{
            console.log('Successfull query');
            var resultJsonList = [];
            for (i = 1; i < rows.length; i++) { 
                resultJson = new Object()  // init the new json object for return 
                var raw = rows[i]['api_data']
                raw = raw.split("=>").join(":");
                var jsData = JSON.parse(raw)
                var parsedData = jsData['results']

                resultJson['image'] = parsedData[0]['artworkUrl100']
                resultJson['author'] = parsedData[0]['artistName']
                resultJson['title'] = parsedData[0]['collectionName']
                resultJsonList.push(resultJson)
            }
            
	        res.send(resultJsonList);
	   }
    });
});

app.get('/api_home_raw/', function (req,res) {
    connection.query("SELECT api_data FROM podcast limit 10", function(error, rows, fields){
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
                //console.log(raw)
                //console.log(jsData['results'])
                resultJsonList.push(parsedData)
            }
            
            res.send(resultJsonList);
       }
    });
});

app.get('/api_pc_epsd/:podcast_name/', function (req,res) {
    search_key = req.params.podcast_name;
    connection.query(`SELECT episode FROM episode where podcast = "${search_key}"`, function(error, rows, fields){
       if(error){
           console.log('Error in the query');
       }
       else{
           console.log('Successfull query');
           res.send(rows[0]);
       }
    });
});

app.get('/api_search/:a?/', function (req,res) {
    ///:a?/:b?
    //key_a = req.params.a;
    //res.send(req.params.a + ' ' + req.params.b + ' ' + req.params.c);
    search_key = req.params.a;

    var sql = `SELECT api_data FROM podcast where api_data LIKE '%${search_key}%' `
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
                raw = raw.split("=>").join(":");
                var jsData = JSON.parse(raw)
                var parsedData = jsData['results']

                resultJson['image'] = parsedData[0]['artworkUrl100']
                resultJson['author'] = parsedData[0]['artistName']
                resultJson['title'] = parsedData[0]['collectionName']
                resultJsonList.push(resultJson)
            }
            res.send(resultJsonList);
       }
    });
});

//home page: TRENDING
app.get('/api_trending/', function (req,res) {
    connection.query("SELECT api_data FROM podcast where id = 120033 or id = 116886 or id = 46300 or id = 59181;", function(error, rows, fields){
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
    connection.query("SELECT api_data FROM podcast where id = 42576 or id = 128946 or id = 128970 or id = 129557;", function(error, rows, fields){
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
    connection.query("SELECT api_data FROM podcast where id = 123761 or id = 115049 or id = 113522;", function(error, rows, fields){
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
    connection.query("SELECT api_data FROM podcast where id = 140170 or id = 44218 or id = 58604 or id = 129923 or id = 130183 or id = 130239;", function(error, rows, fields){ // or id = 138979
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
        var jsData = JSON.parse(raw);
        var parsedData = jsData['results'];
        console.log(parsedData.length);

        resultJson['image'] = parsedData[0]['artworkUrl100']
        resultJson['author'] = parsedData[0]['artistName']
        resultJson['title'] = parsedData[0]['collectionName']
        resultJsonList.push(resultJson)
    }
    res.send(resultJsonList);
}

app.listen(5000, () => console.log('Example app listening on port 5000!'));
app.on('close', function() {
    connection.end();
});

