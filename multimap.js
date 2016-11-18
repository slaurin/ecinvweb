function MultiMap() {
	this.multimap = {};
}

MultiMap.prototype.add = function(key, value) {
	if (!this.multimap[key]) {
		this.multimap[key] = [value];
	}
	else {
		this.multimap[key].push(value);
	}
}

MultiMap.prototype.get = function(key) {
	return this.multimap[key];
}

module.exports = MultiMap;


// var mm = new multimap();

// var cat = new category(1, "test1", "");

// mm.add(10, cat);

// var cat = new category(2, "test2", "bonjour");

// mm.add(10, cat);


// console.log(mm.get(10));