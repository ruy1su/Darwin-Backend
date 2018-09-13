// Created By Don Lee, Zixia Weng on Auguest 21. 2018 

// Copyright © 2018 Darwin. All rights reserved.

var ug = require('ug');
var parse = require('csv-parse');
var stream = require('csv-stream')
var request = require('request')
var fs = require('fs')
// var DataFrame = require('dataframe-js').DataFrame

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
		var fid = 0
		for (var i = 0; i < links.length; i++) {
			uid = links[i]["uid"]
			fid = links[i]["fid"]
			var unode = that.graph.nodes('user').query().filter({uid__is: uid}).units()[0];
			console.log(unode)
			var fnode = that.graph.nodes('user').query().filter({uid__is: fid}).units()[0];
			console.log(fnode)
			// console.log(pnode)
			that.graph.createEdge('friend').link(unode, fnode).setDistance(1);
		}
		callback();
	}
	
	load_one_collection_link(uid, pid, callback){
		var that = this
		// that.graph.createEdge('collection').link(unode, pnode).setDistance(1);
		var unode = that.graph.nodes('user').query().filter({uid__is: Number(uid)}).units()[0];
			console.log(unode,'unodeeeeeeeeee')
		var pnode = that.graph.nodes('podcast').query().filter({id__is: pid.toString()}).units()[0];
			console.log(pnode, 'pnodeeeeeeeee')
		that.graph.createEdge('collection').link(unode, pnode).setDistance(1);
		callback();
	}

	load_one_friend_link(uid, fid, callback){
		var that = this
		var unode = that.graph.nodes('user').query().filter({uid__is: Number(uid)}).units()[0];
			// console.log(unode)
		var fnode = that.graph.nodes('user').query().filter({uid__is: Number(fid)}).units()[0];
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
			  compare: function(node) {
			    return node.entity === 'user';
			  }
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

	find_all(callback){
		var that = this;
		var nodes = this.graph.nodes('podcast').query().filter({feedUrl__is: ''}).units();
		console.log(nodes[0])
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
receng.load_graph('/Users/wengzixia/Desktop/Darwin-Backend/graph_withall.ugd', function(err){
	if (err) {
		console.log('Error message:' + err);
	} else {
		receng.link_podcasts_by_cat( function(err) {
			if (err){
				console.log('Error message:' + err);
			} else {
				console.log("done");
				receng.find_all( function(err) {
					if (err){
						console.log('Error message:' + err);
					} else {
						console.log("done");
						receng.find_all()
					}
				});
			}
		});
	}
});

