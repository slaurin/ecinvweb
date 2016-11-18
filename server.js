var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var mysql = require('promise-mysql');
var MultiMap = require('./multimap');
var dbConnection;

mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'C9b0r0',
	database: 'ecinv'
}).then(function(conn){
	dbConnection = conn;
});


function Category(id, name, description) {
	this.id = id;
	this.name = name;
	this.description = description;
}

var PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(bodyParser.json());


app.get('/components', function(req, res){
	dbConnection.query("SELECT component.id as myid, component.name as component_name, categories.name as category_name, storage_location, quantity, component.description as component_description FROM component, categories where  component.category_id = categories.id", function(err, result) {
	if (err) throw err;
	res.send(result);
	// "SELECT link, file from datasheet where component_id = ";
	});
});

app.post('/add-component', function(req, res) {
	console.log(req.body);
	var componentId;
	var data = {
		name: req.body.generalInformation.componentName,
		category_id: req.body.generalInformation.category,
		description: req.body.generalInformation.description,
		weight: req.body.technicalInformation.weight.length === 0 ? null : req.body.technicalInformation.weight,
		width: req.body.technicalInformation.width.length === 0 ? null : req.body.technicalInformation.width,
		depth: req.body.technicalInformation.depth.length === 0 ? null : req.body.technicalInformation.depth,
		height: req.body.technicalInformation.height.length === 0 ? null : req.body.technicalInformation.height,
		quantity: req.body.generalInformation.quantity,
		pins: req.body.technicalInformation.pin.length === 0 ? null : req.body.technicalInformation.height,
		image: null,
		scrap: null,
		project_id: null,
		storage_location: req.body.generalInformation.storageLocation,
		comment: req.body.generalInformation.comment
	};
	
	dbConnection.query('INSERT INTO component SET ?', data).then(function(result) {
		componentId = result.insertId;
		console.log('new id of component added: ' + result.insertId);

		var queries = [];
		for (var i = 0 ; i < req.body.distributor.length; i++)
		{
        	var data = {
        		distributor_id: req.body.distributor[i].id,
        		order_no: req.body.distributor[i].orderNo,
        		package_unit: req.body.distributor[i].packageUnit,
        		package_price: req.body.distributor[i].packagePrice,
        		price_per_unit: req.body.distributor[i].pricePerUnit,
        		sku: req.body.distributor[i].sku,
        		component_id: componentId
        	};
        	queries.push(dbConnection.query('INSERT INTO distributor_info SET ?', data));
    	};

       	return Promise.all(queries);
	}).then(function(result) {
		console.log("All distributor where added to the db");
		var queries = [];
		for (var i = 0 ; i < req.body.manufacturer.length; i++)
		{
			//console.log('Add manufacturer: ' + req.body.manufacturer[i].id + '  partNumber: ' + req.body.manufacturer[i].partNumber);
        	var data = {
        		manufacturer_id: req.body.manufacturer[i].id,
        		part_number: req.body.manufacturer[i].partNumber,
        		component_id: componentId
        	};
        	queries.push(dbConnection.query('INSERT INTO manufacturer_info SET ?', data));
    	};

       	return Promise.all(queries);
    }).then(function(result) {
		console.log("All manufacturer where added to the db");
		res.success();
	}).catch(function(e){
		console.log(e);
	});



	// First find categories id
	// dbConnection.query('SELECT id FROM categories WHERE name="' + req.body.generalInformation.category + '"', function(err, result) {
	// 	if (err) throw err;
	// 	myCategoryId = result[0].id;
	// 	var data = {
	// 		name: req.body.generalInformation.componentName,
	// 		category_id: myCategoryId,
	// 		description: req.body.generalInformation.description,
	// 		weight: req.body.technicalInformation.weight,
	// 		width: req.body.technicalInformation.width,
	// 		depth: req.body.technicalInformation.depth,
	// 		height: req.body.technicalInformation.height,
	// 		quantity: req.body.generalInformation.quantity,
	// 		pins: req.body.technicalInformation.pin,
	// 		image: null,
	// 		scrap: null,
	// 		project_id: null,
	// 		storage_location: req.body.generalInformation.storageLocation,
	// 		comment: req.body.generalInformation.comment
	// 	};
	// 	dbConnection.query('INSERT INTO component SET ?', data, function(err, result) {
	// 		if (err) throw err;

	// 		console.log('new id of component added: ' + result.insertId);


	// 		res.send('success!');
	// 	});	
	// });
});

app.get('/categories', function(req, res) {
	dbConnection.query('SELECT * FROM categories', function(err, result) {
	if (err) throw err;

	var multimap = new MultiMap();
	for (var i = 0 ; i < result.length; i++) {
		var category = new Category(result[i].id, result[i].name, result[i].description);
		multimap.add(result[i].parent, category);
	}

	res.send(multimap);
	});
});

app.get('/add-distributor', function(req, res) {
	dbConnection.query('SELECT * FROM distributor', function(err, result) {
	if (err) throw err;
	res.send(result);
	});

});

app.post('/add-distributor', function(req, res) {
	var query = [];
	dbConnection.query('INSERT INTO distributor SET ?', {name: req.body.name, web_page: req.body.webSite}, function(err, result) {
	if (err) throw err;
	res.statusCode = 200;
	res.json(result.insertId);
	});

});


app.get('/add-distributor-product', function(req, res) {
	var query = [];
	dbConnection.query('SELECT * FROM distributor_info', function(err, result) {
	if (err) throw err;
	res.send(result);
	});

});

app.post('/add-distributor-product', function(req, res) {
	var data = {
		distributor_id: req.body.distributor_id,
		order_no: req.body.order_no,
		package_unit: req.body.package_unit,
		package_price: req.body.package_price,
		price_per_unit: req.body.price_per_unit,
		sku: req.body.sku,
		component_id: req.body.component_id
	};
	dbConnection.query('INSERT INTO distributor_info SET ?', data, function(err, result) {
	if (err) throw err;
	res.send('success!');
	});

});


app.get('/add-manufacturer', function(req, res) {
	var query = [];
	dbConnection.query('SELECT * FROM manufacturer', function(err, result) {
	if (err) throw err;
	res.send(result);
	});

});

app.post('/add-manufacturer', function(req, res) {
	var query = [];
	dbConnection.query('INSERT INTO manufacturer SET ?', {name: req.body.name, web_page: req.body.webSite}, function(err, result) {
	if (err) throw err;
	res.statusCode = 200;
	res.json(result.insertId);
	});

});




app.listen(PORT, function() {
	console.log('Server listening on ' + PORT)
});
