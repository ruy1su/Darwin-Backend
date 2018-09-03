// // // import DataFrame from '../node_modules/dataframe-js';
// // // import DataFrame, { Row } from 'dataframe-js';

// const http = require('http');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World!\n');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });


// let ug = require('ug');
// let graph = new ug.Graph();

// let users = {
// 	user_1: graph.createNode('user', {name: "Don Lee"}),
// 	user_2: graph.createNode('user', {name: "Zixia Wang"}),
// 	user_3: graph.createNode('user', {name: "Himank Sharma"}),
// 	user_4: graph.createNode('user', {name: "Xiao"})
// };

// let podcasts = { 
// 	podcast_1: graph.createNode('podcast', {name: 'A&E Radio!!!'}),
// 	podcast_2: graph.createNode('podcast', {name: "A&G's Picture This!"}),
// 	podcast_3: graph.createNode('podcast', {name: "A-Birding on a Bronco by MERRIAM, Florence A."})
// };

// graph.createEdge('likes').link(users.user_1, podcasts.podcast_1).setDistance(1);
// graph.createEdge('likes').link(users.user_2, podcasts.podcast_1).setDistance(1);
// graph.createEdge('likes').link(users.user_2, podcasts.podcast_2).setDistance(1);
// graph.createEdge('likes').link(users.user_2, podcasts.podcast_3).setDistance(1);
// graph.createEdge('likes').link(users.user_3, podcasts.podcast_3).setDistance(1);
// graph.createEdge('likes').link(users.user_4, podcasts.podcast_3).setDistance(1);

// graph.createEdge('listened').link(users.user_4, podcasts.podcast_3).setDistance(2);


// let results = graph.closest(
// 	graph.nodes('user').query().first(),
// 	{
// 		compare: function(node) {
// 			return node.entity == 'podcast';
// 		},
// 		count: 2
// 	}
// );

// results.forEach( function(result){
// 	console.log(result.end().properties)
// });


// let ug = require('ug');
// let graph = new ug.Graph();

// let classification = graph.createNode('classification', {name: 'Sharing Economy'});

// let corps = {
//   uber: graph.createNode('corporation', {name: 'Uber'}),
//   storefront: graph.createNode('corporation', {name: 'Storefront'}),
//   airbnb: graph.createNode('corporation', {name: 'AirBnB'})
// };

// let industries = {
//   vc: graph.createNode('industry', {name: 'Venture Capital'}),
//   hospitality: graph.createNode('industry', {name: 'Hospitality'}),
//   taxi: graph.createNode('industry', {name: 'Taxi'})
// };

// graph.createEdge('business_model').link(corps.uber, classification);
// graph.createEdge('business_model').link(corps.airbnb, classification);
// graph.createEdge('business_model').link(corps.storefront, classification);
// graph.createEdge('emotion', {type: 'happy'}).link(industries.vc, classification);
// graph.createEdge('emotion', {type: 'sad'}).link(industries.hospitality, classification);
// graph.createEdge('emotion', {type: 'sad'}).link(industries.taxi, classification);

// res = graph.closest(
//   graph.nodes('classification').query().first(), // grab Sharing Economy node
//   {
//     compare: function(node) {
//       // forget industries and uber!
//       return node.entity !== 'industry' && node.get('name') !== 'Uber';
//     },
//     direction: -1 // only track nodes that feed in to this one
//   }
// );
// console.log(res);
// var mysql = require('mysql');
var ug = require('ug');
var parse = require('csv-parse');
var stream = require('csv-stream')
var request = require('request')
var fs = require('fs')
var DataFrame = require('dataframe-js').DataFrame

// var connection = mysql.createConnection({
//     host     : 'aam2629vgw55ee.czd1gxziytnq.us-east-2.rds.amazonaws.com',
//     user     : 'eric',
//     password : 'Weng950702',
//     port     : '3306',
//     database : 'darwin',
//     multipleStatements: true
//     });
// connection.connect(function(err) {
//     if (err) {
//        console.error('Database connection failed: ' + err.stack);
//        return;
//     }
//     console.log('Connected to database.');
// });


class RecommendationEngine {
	constructor (name) {
		this.name = name;
		this.graph = new ug.Graph();
	}

	load_users (users, callback) {
		var that = this;
		for (var i = 0; i < users.length; i++) { 
		    that.graph.createNode('user', users[i]);
		}
		callback();
	}

	load_collection_links (links, callback){
		var that = this;
		var uid = 0
		var pid = 0
		for (var i = 0; i < links.length; i++) {
			uid = links[i]["uid"]
			pid = links[i]["pid"]
			var unode = that.graph.nodes('user').query().filter({uid__is: uid}).units()[0];
			// console.log(unode)
			var pnode = that.graph.nodes('podcast').query().filter({id__is: pid.toString()}).units()[0];
			// console.log(pnode)
			that.graph.createEdge('collection').link(unode, pnode).setDistance(1);
		}
		callback();
	}

	load_friend_links (links, callback){
		var that = this;
		var uid = 0
		var pid = 0
		for (var i = 0; i < links.length; i++) {
			uid = links[i]["uid"]
			fid = links[i]["fid"]
			var unode = that.graph.nodes('user').query().filter({uid__is: uid}).units()[0];
			// console.log(unode)
			var fnode = that.graph.nodes('user').query().filter({uid__is: fid}).units()[0];
			// console.log(pnode)
			that.graph.createEdge('friend').link(unode, fnode).setDistance(1);
		}
	}
	
	load_one_collection_link(uid, pid, callback){
		var that = this
		var unode = that.graph.nodes('user').query().filter({uid__is: uid.toString()}).units()[0];
			// console.log(unode)
		var pnode = that.graph.nodes('podcast').query().filter({id__is: pid.toString()}).units()[0];
			// console.log(pnode)
		that.graph.createEdge('collection').link(unode, pnode).setDistance(1);
		callback();
	}

	load_one_friend_link(uid, fid, callback){
		var that = this
		var unode = that.graph.nodes('user').query().filter({uid__is: uid.toString()}).units()[0];
			// console.log(unode)
		var fnode = that.graph.nodes('user').query().filter({uid__is: fid}).units()[0];
			// console.log(pnode)
		that.graph.createEdge('collection').link(unode, fnode).setDistance(1);
		callback();
	}

	recommendPodcasts(){
		var that = this;
		console.log("...............")
		console.log(that.graph.nodes('user').query().first())
		console.log((that.graph.closest(
		  that.graph.nodes('user').query().first(), // grab Sharing Economy node
		  	{
			  count: 0
			}
		)).toString())
	}

	load_podcasts (podcasts_file_path){
		var that = this;
		var csvStream = stream.createStream();
		var attributes;
		fs.createReadStream(podcasts_file_path).pipe(csvStream).on('error', function(err){
			console.error(err);
		}).on('header', function(columns) {
			console.log(columns);
			attributes = columns;
		}).on('data', function(data) {
			console.log(data);
			that.graph.createNode('podcast', data);
		}).on('end', function(end) {
			that.graph.save('/Users/don/Documents/Darwin/graph/graph.ugd', function(){
				console.log('done');
			})
			// do nothing
		})
	}

	load_graph (graph_path, callback) {
		var that = this;
		// console.log("In function")
		this.graph.load(graph_path, function(err){
		// do nothing
			if (err) {
				callback(err);
			} else {
				callback();
			}
		})

		
	}

	save_graph (graph_path, callback) {
		var that = this;
		this.graph.save(graph_path, function(err){
			// do nothing
			if (err) {
				callback(err);
			} else {
				callback();
			}
		})
	}

	link_podcasts_by_cat (callback) {
		var that = this;
		var nodes = this.graph.nodes('podcast').query().units();
		console.log(nodes.length)
		for (var i in nodes) {
			for (var j in nodes){
				if ( i >= j){
					continue;
				} else {
					var inner_node = nodes[i];
					var outter_node = nodes[j];
					if (inner_node.properties.category == outter_node.properties.category) {
						that.graph.createEdge('share_category').link(inner_node, outter_node).setDistance(1);
					}
				}
			}
		}
		// console.log(nodes);
		callback(0);
	}

	// link_podcasts_by_auth (callback) {
	// 	var nodes = this.graph.nodes('podcast').query().units();
	// 	for (var node in nodes) {

	// 	}
	// }
}

var receng = new RecommendationEngine('test');
// console.log(receng.graph)
module.exports = RecommendationEngine;
// receng.load_podcasts('/Users/don/Documents/Darwin/data/itunes-podcast-details.csv');
// receng.load_podcasts('/Users/don/Documents/Darwin/data/test.csv')
// receng.save_graph('/Users/don/Documents/Darwin/graph/graph.ugd');
// receng.load_graph('/Users/don/Documents/Darwin/graph/graph.ugd', function(err){
// 	if (err) {
// 		console.log('Error message:' + err);
// 	} else {
// 		receng.link_podcasts_by_cat( function(err) {
// 			if (err){
// 				console.log('Error message:' + err);
// 			} else {
// 				console.log("done");
// 			}
// 		});
// 	}
// })

