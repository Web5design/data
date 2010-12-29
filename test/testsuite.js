// Data.js — A utility belt for data manipulation
// -------------

var items;


// Data.Hash
// -------------

module("Data.Hash", {
  setup: function() {
    items = new Data.Hash();
    items.set("at", "Austria");
    items.set("de", "Germany");
  },
  teardown: function() {
    delete items;
  }
});

test("construction from Array", function() {
  var numbers = new Data.Hash([1, 2, 5, 10]);
  
  ok(numbers.at(0) === 1);
  ok(numbers.at(1) === 2);
  ok(numbers.at(2) === 5);
  ok(numbers.at(3) === 10);

  // key equals index
  ok(numbers.get(0) === 1);
  ok(numbers.get(1) === 2);
  ok(numbers.get(2) === 5);
  ok(numbers.get(3) === 10);
  
  ok(numbers.length === 4);
});

test("construction from Hash", function() {
  var countries = new Data.Hash({
    'at': 'Austria',
    'de': 'Germany',
    'ch': 'Switzerland'
  });
  
  // please note: order is undetermined since native javascript hashes
  // are not sorted. please perform a sort() operation after construction
  // if you want to rely on item ordering.
  ok(countries.get('at') === 'Austria');
  ok(countries.get('de') === 'Germany');
  ok(countries.get("ch") === "Switzerland");
  ok(countries.length === 3);
});


test("insertion", function() {
  items.set("ch", "Switzerland");
  ok(items.length === 3);
});


test("value overwrite", function() {
  items.get("at") === "Austria";
  items.set("at", "Österreich");
  ok(items.length === 2);
  ok(items.get("at") === "Österreich");
});

test("clone", function() {
  // TODO: add some assertions
  items.clone();
});

test("key", function() {
  ok(items.key(0) === "at");
  ok(items.key(1) === "de");
});


test("hash semantics", function() {
  var keys = [];
  var values = [];
  
  ok(items.get("at") === "Austria");
  ok(items.get("de") === "Germany");
  
  // order is also reflected in eachKey
  items.each(function(item, key) {
    keys.push(key);
    values.push(item);
  });
  
  ok(keys.length === 2 && values.length === 2);
  ok(keys[0] === 'at');
  ok(keys[1] === 'de');
  ok(values[0] === 'Austria');
  ok(values[1] === 'Germany');
});

test("array semantics", function() {
  var values = [];
  items.get(0) === "Austria";
  items.get(1) === "Germany";
  items.length === 1;
  
  items.each(function(item, key, index) {
    values.push(item);
  });
  
  ok(values.length === 2);
  ok(values[0] === 'Austria');
  ok(values[1] === 'Germany');
  
  ok(items.first() === "Austria");
  ok(items.last() === "Germany");
});

test("Data.Hash#del", function() {
  items.set("ch", "Switzerland");
  items.del('de');
  ok(items.length === 2);
  ok(items.keyOrder.length === 2);
  ok(items.get('de') === undefined);
});


test("Data.Hash#each", function() {
  var enumerated = [];
  items.each(function(item, key, index) {
    enumerated.push(item);
  });
  
  ok(enumerated[0]==="Austria");
  ok(enumerated[1]==="Germany");
});

test("Data.Hash#values", function() {
  items.set("ch", "Switzerland");
  var values = items.values();

  ok(values[0] === "Austria");
  ok(values[1] === "Germany");
  ok(values[2] === "Switzerland");
});


test("Data.Hash#sort", function() {
  items.set("ch", "Switzerland");

  ok(items.at(0)==="Austria");
  ok(items.at(1)==="Germany");
  ok(items.at(2)==="Switzerland");
  
  // sort descending
  var sortedItems = items.sort(Data.Comparators.DESC);
  
  ok(sortedItems.at(0)==="Switzerland");
  ok(sortedItems.at(1)==="Germany");
  ok(sortedItems.at(2)==="Austria");
});



test("Data.Hash#map", function() {
  var mappedItems = items.map(function (item) {
    return item.slice(0, 3);
  });
  
  // leave original Hash untouched
  ok(items.get('at') === 'Austria');
  ok(items.get('de') === 'Germany');
  ok(items.at(0) === 'Austria');
  ok(items.at(1) === 'Germany');

  ok(mappedItems.get('at') === 'Aus');
  ok(mappedItems.get('de') === 'Ger');  

  ok(mappedItems.at(0) === 'Aus');
  ok(mappedItems.at(1) === 'Ger');
});



test("Data.Hash#select", function() {
  var selectedItems = items.select(function (item, key) {
        return item === 'Austria';
      });

  // leave original Set untouched
  ok(items.get('at') === 'Austria');
  ok(items.get('de') === 'Germany');
  ok(items.at(0) === 'Austria');
  ok(items.at(1) === 'Germany');
  
  ok(selectedItems.at(0) === 'Austria');
  ok(selectedItems.get("at") === 'Austria');
  ok(selectedItems.length === 1);
});


test("Data.Hash#intersect", function() {
  var items2 = new Data.Hash(),
      intersected;
  
  items2.set('fr', 'France');
  items2.set('at', 'Austria');
  
  // leave original Setes untouched
  ok(items.get('at') === 'Austria');
  ok(items.get('de') === 'Germany');
  ok(items.at(0) === 'Austria');
  ok(items.at(1) === 'Germany');
  
  ok(items2.get('fr') === 'France');
  ok(items2.get('at') === 'Austria');
  ok(items2.at(0) === 'France');
  ok(items2.at(1) === 'Austria');
  
  intersected = items.intersect(items2);
  ok(intersected.length === 1);
  ok(intersected.get('at') === 'Austria');
});


test("Data.Hash#union", function() {
  var items2 = new Data.Hash(),
      unitedItems;
  
  items2.set('fr', 'France');
  items2.set('at', 'Austria');
  
  // leave original Setes untouched
  ok(items.get('at') === 'Austria');
  ok(items.get('de') === 'Germany');
  ok(items.at(0) === 'Austria');
  ok(items.at(1) === 'Germany');
  
  ok(items2.get('fr') === 'France');
  ok(items2.get('at') === 'Austria');
  ok(items2.at(0) === 'France');
  ok(items2.at(1) === 'Austria');
  
  unitedItems = items.union(items2);
  ok(unitedItems.length === 3);
  ok(unitedItems.get('at') === 'Austria');
  ok(unitedItems.get('de') === 'Germany');
  ok(unitedItems.get('fr') === 'France');
});


test("fail prevention", function() {
  // null is a valid key
  items.set(null, 'Netherlands');
  // undefined is not
  items.set(undefined, 'Netherlands');
  items.set('null_value', null);
  items.set('undefined_value', undefined);
  ok(items.length === 5);
});


// Data.Node
// -------------

var austrian, english, german, eu, austria, germany, uk;

module("Data.Node", {
  setup: function() {
    austrian = new Data.Node({value: 'Austrian'});
    english = new Data.Node({value: 'English'});
    german = new Data.Node({value: 'German'});
    
    // confederations
    eu = new Data.Node();
    
    // countries
    austria = new Data.Node();
    germany = new Data.Node();
    uk = new Data.Node();
    
    // people
    barroso = new Data.Node({value: 'Barroso'});
    
    // connect some nodes
    austria.set('languages', 'at', austrian);
    austria.set('languages', 'ger', german);
    
    eu.set('president', 'barroso', barroso);
  }
});

test("get connected nodes", function() {
  // order should be preserved
  ok(austria.all('languages') instanceof Data.Hash);
  ok(austria.all('languages').at(0) === austrian);
  ok(austria.all('languages').at(1) === german);
  
  ok(austria.get('languages', 'at') === austrian);
  ok(austria.get('languages', 'ger') === german);
});

test("get first connected node", function() {  
  ok(eu.first('president') instanceof Data.Node);
  ok(eu.first('president').val === 'Barroso');
});

test("iteration of connected nodes", function() {
  var nodes = [];
  austria.all('languages').each(function(node) {
    nodes.push(node);
  });
  ok(nodes.length === 2);
});

test("Node#list", function() {
  // non-unqiue property
  ok(austria.all('languages').length === 2);
  ok(austria.all('languages').get('at') === austrian);
  ok(austria.all('languages').get('ger') === german);
  
  // unique property
  ok(eu.all('president').length === 1);
  ok(eu.values('president').first() === 'Barroso');
});

test("Node#values", function() {
  var values = austria.values('languages');
  
  // for non-unique properties
  ok(values.at(0) === 'Austrian');
  ok(values.at(1) === 'German');
  ok(values.get('at') === 'Austrian');
  ok(values.get('ger') === 'German');
  
  // for unique properties
  ok(eu.values('president').at(0) === 'Barroso');
});

test("Node#value", function() {
  var values = austria.values('languages');
  
  // for non-unique properties
  ok(austria.value('languages') === 'Austrian');
  
  // for unique properties
  ok(eu.value('president') === 'Barroso');
});

test("Allows null as a key for property values", function() {
  var root = new Data.Node({value: 'RootNode'});
  var nullNode = new Data.Node({value: null});
  root.set('values', null, nullNode);
  ok(root.value('values', null) === null);
});


// Data.Graph
// -------------

var graph,
    documentType,
    entitiesProperty,
    protovis,
    unveil,
    processingjs,
    mention,
    anotherMention;
    
module("Data.Graph", {
  setup: function() {
    graph = new Data.Graph(documents_fixture);
  },
  teardown: function() {
    delete graph;
  }
});

test("valid construction", function() {
  ok(graph != undefined);
  
  ok(graph.types().length == 3);
  
  ok(graph.get('objects', '/type/document') instanceof Data.Type);
  ok(graph.get('objects', '/type/entity') instanceof Data.Type);
  ok(graph.get('objects', '/type/mention') instanceof Data.Type);
});


test("Type inspection", function() {
  documentType = graph.get('objects', '/type/document');
  ok(documentType.all('properties').length === 4);
  ok(documentType.key === '/type/document');
  ok(documentType.name === 'Document');
});

test("Property inspection", function() {
  entitiesProperty = documentType.get('properties', 'entities');
  ok(entitiesProperty.name === 'Associated Entities');
  ok(entitiesProperty.expectedType === '/type/entity');
});


test("Object inspection", function() {
  protovis = graph.get('objects', '/doc/protovis_introduction');
  unveil = graph.get('objects', '/doc/unveil_introduction');
  processingjs = graph.get('objects', '/doc/processing_js_introduction');
  mention = graph.get('objects', 'M0000003');
  anotherMention = graph.get('objects', 'M0000003');
  
  ok(protovis instanceof Data.Object);
  ok(mention instanceof Data.Object);
  ok(anotherMention instanceof Data.Object);
});


// There are four different access scenarios:
// For convenience there's a get method, which always returns the right result depending on the
// schema information. However, internally, every property of a resource is represented as a
// non-unique Set of Node objects, even if it's a unique property. So if
// you want to be explicit you should use the native methods of the Node API.

test("1. Unique value types", function() {
  ok(protovis.get('page_count') === 8);
  ok(protovis.get('title') === 'Protovis');
  
  // internally delegates to
  ok(protovis.get('page_count') === 8);
});

test("2. Non-Unique value types", function() {
  ok(protovis.get('authors').length === 2);
  ok(protovis.get('authors').at(0) === 'Michael Bostock');
  ok(protovis.get('authors').at(1) === 'Jeffrey Heer');
  
  // internally delegates to
  ok(protovis.values('authors').length === 2);
});

test("3. Unique object types (one resource)", function() {
  ok(mention.get('entity').key === '/location/new_york');

  // internally delegates to
  ok(mention.first('entity').key === '/location/new_york');
});

test("4. Non-unique object types (many resources)", function() {
  ok(protovis.get('entities').length === 2);
  ok(protovis.get('entities').at(0).key === '/location/stanford');
  ok(protovis.get('entities').at(1).key === '/location/new_york');

  // internally delegates to
  ok(protovis.all('entities').length === 2);
});

test("References to the same resource should result in object equality", function() {
  ok(mention.first('entity') === anotherMention.first('entity'));
});


test("Graph traversal (navigation)", function() {
  // Hop from a document to the second entity, picking the 2nd mention and go
  // to the associated document of this mention.
  ok(protovis.get('entities').at(1) // => Entity#/location/new_york
          .get('mentions').at(1)    // => Mention#M0000003
          .get('document')          // => /doc/processing_js_introduction
          .key === '/doc/processing_js_introduction');
});


test("Querying information", function() {
  var cities = graph.all('objects').select(function(res, key) {
    return /or/.test(res.get('name'))
  });
    
  ok(cities.length === 3);
  ok(cities.get('/location/new_york'));
  ok(cities.get('/location/toronto'));
  ok(cities.get('/location/stanford'));
});


test("Value identity", function() {
  // If the values of a property are shared among resources they should have
  // the same identity as well.
  ok(unveil.all('authors').at(0) === processingjs.all('authors').at(2));
  ok(unveil.get('authors').at(0) === 'Michael Aufreiter');
  ok(processingjs.get('authors').at(2) === 'Michael Aufreiter');
  
  // This allows questions like:
  // Show all unique values of a certain property e.g. /type/document.authors
  ok(protovis.type.get('properties', 'authors').all('values').length === 6);
});


// Data.Object Manipulation

test("Set properties of existing nodes", function() {
  // Value properties
  protovis.set({
    'title': 'Protovis Introduction',
    'page_count': 20
  });
  
  ok(protovis.get('title') === 'Protovis Introduction');
  ok(protovis.get('page_count') === 20);
  
  // TODO: check for registration and unregistration of values
});


// Data.Collection
// -------------

module("Data.Collection");

var c = new Data.Collection(countries_fixture);

test("has some properties", function() {
  ok(c.get('properties', 'area') instanceof Data.Node);
  ok(c.get('properties', 'currency_used') instanceof Data.Node);
  ok(c.get('properties', 'doesnotexit') === undefined);
});

test("property is connected to values", function() {
  var governmentForms = c.get('properties', 'form_of_government');
  ok(governmentForms.all('values').length === 10);
});

test("read item property values", function() {
  var item = c.get('items', 'austria');
  // Unique properties
  ok(item.get('name') === 'Austria');
  ok(item.get('area') === 83872);
  // Non-unique properties
  ok(item.get('form_of_government').length === 2);
});


test("get values of a property", function() {
  var population = c.get('properties', 'population');
  ok(population.all('values').length === 6);
});

// useful for non-unique properties
test("get value of a property", function() {
  var population = c.get('properties', 'population');
  ok(population.value('values') === 8356700);
});


module("Data.Aggregators");

// Data.Aggregators
// -------------

test("Aggregators", function() {
  var values = new Data.Hash();
  values.set('0', 4);
  values.set('1', 5);
  values.set('2', -3);
  values.set('3', 1);
  
  ok(Data.Aggregators.SUM(values) === 7);
  ok(Data.Aggregators.MIN(values) === -3);
  ok(Data.Aggregators.MAX(values) === 5);
  ok(Data.Aggregators.COUNT(values) === 4);
});


test("allow aggregation of property values", function() {
  var population = c.get("properties", "population");
  ok(population.aggregate(Data.Aggregators.MIN) === 8356700);
  ok(population.aggregate(Data.Aggregators.MAX) === 306108000);
});


// Data.Criterion
//-------------

module('Criterion');

var graph;    
module("Data.Graph", {
  setup: function() {
    graph = new Data.Graph(documents_fixture);
  },
  teardown: function() {
    delete graph;
  }
});


test('Data.Criterion.operators.CONTAINS', function() {
  // For value type properties
  var matchedItems = Data.Criterion.operators.CONTAINS(graph, '/type/document', 'page_count', 8);
  
  ok(matchedItems.length === 2);
  ok(matchedItems.at(0).value('page_count') === 8);
  ok(matchedItems.at(1).value('page_count') === 8);
  
  var matchedItems = Data.Criterion.operators.CONTAINS(graph, '/type/document', 'title', 'Unveil.js');
  ok(matchedItems.length === 1);
  ok(matchedItems.at(0).value('title') === 'Unveil.js');
  
  // For object type properties
  var matchedItems = Data.Criterion.operators.CONTAINS(graph, '/type/document', 'entities', '/location/new_york');
  ok(matchedItems.length === 1);
  ok(matchedItems.at(0).get('entities', '/location/new_york') instanceof Data.Object);
});

test('Data.Criterion.operators.GT', function() {
  // For value type properties
  var matchedItems = Data.Criterion.operators.GT(graph, '/type/document', 'page_count', 10);  
  ok(matchedItems.length === 1);
  ok(matchedItems.at(0).value('page_count') > 10);  
});

test("nested criteria", function() {
  // the root criterion takes it all
  var criteria = new Data.Criterion('AND'),
      filteredGraph;
  
  var titleprop = graph.get('objects', '/type/document').get('properties', 'title');
  
  criteria.add(new Data.Criterion('GT', '/type/document', 'page_count', 5));
  criteria.add(new Data.Criterion('OR')
    .add(new Data.Criterion('CONTAINS', '/type/document', 'title', 'Unveil.js'))
    .add(new Data.Criterion('CONTAINS', '/type/document', 'title', 'Processing.js')));
    
  filteredGraph = graph.filter(criteria);
  ok(filteredGraph.objects().length === 2);
});
