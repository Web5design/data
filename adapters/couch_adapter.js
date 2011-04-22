var CouchClient = require('../lib/couch-client');
var Data = require('../data');
var _ = require('underscore');
var async = require('async');

var CouchAdapter = function(graph, config, callback) {
  var db = CouchClient(config.url);
  var self = {};
  
  // Setup index views for type nodes
  // --------
  
  function setupIndexes(node, callback) {
    // Extract local typename
    var typename = node._id.split('/')[2];
    views = {
      "all": {
        "properties": ["_id"],
        "map": "function(doc) { if (doc.type.indexOf('"+node._id+"')>=0) { emit([doc._id], doc); } }"
      }
    };
    if (node.indexes) {
      _.each(node.indexes, function(properties, indexName) {
        var keyExpr = "["+ _.map(properties, function(p) { return "doc."+p;}).join(',')+ "]";
        views[indexName] = {
          "properties": properties,
          "map": "function(doc) { if (doc.type.indexOf('"+node._id+"')>=0) { emit("+keyExpr+", doc); } }"
        };
      });
    }
    db.save({
      _id: '_design/'+typename,
      views: views
    }, function (err, doc) {
      err ? callback(err) : callback();
    });
  };
  
  // flush
  // --------------

  // Flush the database
  self.flush = function(callback) {
    // Delete DB if exists
    db.request("DELETE", db.uri.pathname, function (err) {
      db.request("PUT", db.uri.pathname, function(err) {
        err ? callback(err) 
            : db.save({
                _id: '_design/type',
                views: {
                  "all": {
                    "map": "function(doc) { if (doc.type === \"/type/type\") emit(doc._id, doc); }"
                  }
                }
              }, function (err, doc) {
                err ? callback(err) : callback();
              });
      });
    });
  };
  
  
  // write
  // --------------

  // Takes a Data.Graph and persists it to CouchDB
  
  self.write = function(graph, callback, ctx) {
    var result = {}; // updated graph with new revisions and merged changes
    function writeNode(nodeId, callback) {
      var target = _.extend(graph[nodeId], {
        _id: nodeId
      });
      
      db.save(target, function (err, newDoc) {
        if (err) {
          // Return the latest valid db version instead of the conflicted one
          // TODO: we assume conflict errors are the only errors here
          db.get(nodeId, function(err, node) {
            result[nodeId] = node;
            result[nodeId]._conflicted = true;
            callback();
          });
        } else {
          // If we've got a type node, setup index views
          if (newDoc.type == "/type/type") {
            setupIndexes(newDoc, function(err) {
              if (err) { console.log('error during index creation'); };
              result[nodeId] = newDoc;
              callback();            
            });
          } else {
            result[nodeId] = newDoc;
            callback();
          }
        }
      });
    }
    
    async.forEach(_.keys(graph), writeNode, function(err) {
      err ? callback(err) : callback(null, result);
    });
  };

  
  // read
  // --------------

  // Takes a query object and reads all matching nodes
  
  self.read = function(queries, options, callback, ctx) {
    
    // Collects the subgraph that will be returned as a result
    var result = {};
    queries = _.isArray(queries) ? queries : [queries];
    
    // Performs a query and returns a list of matched nodes
    // --------
    
    function performQuery(qry, callback) {
      console.log('Performing query:');
      console.log(qry);
      
      var typeName = qry.type.split('/')[2];
      delete qry.type;
      var properties = _.keys(qry);
      
      // Lookup view
      db.get('_design/'+typeName, function(err, node) {
        // Pick the right index based on query parameters
        var viewName = null;
        _.each(node.views, function(view, key) {
          if (view.properties.length == properties.length && _.intersect(view.properties, properties).length == view.properties.length) viewName = key;
        });
        
        if (viewName) {
          // Use view to lookup for matching objects efficiently
          var key = [];
          _.each(node.views[viewName].properties, function(p) {
            key.push(qry[p]);
          });
          
          db.view(typeName+'/'+viewName, {key: key}, function(err, res) {
            if (err) callback(err);
            _.each(res.rows, function(row) {
              result[row.value._id] = row.value;
            });
            callback();
          });
        } else { // Fetch all objects of this type and check manually
          console.log('WARNING: No index could be found for this query:');
          console.log(qry);
          qry["type|="] = "/type/"+typeName;
          db.view(typeName+'/all', function(err, res) {
            if (err) return callback(err);
            _.each(res.rows, function(row) {
              if (Data.matches(row.value, qry)) result[row.value._id] = row.value;
            });
            callback();
          });
        }
      });
    }
    
    // Perform queries
    async.forEach(queries, performQuery, function(err) {
      err ? callback(err) : callback(null, result);
    });
  };
  
  self.db = db;
  
  // Expose Public API
  return self;
};

module.exports = CouchAdapter;