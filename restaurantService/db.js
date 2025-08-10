const { MongoClient, ObjectId } = require('mongodb');
var RestaurantRecord = require('./model').Restaurant;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://restaurant-mongo-svc:27017/restaurantdb';
let client = null;

// Seed database if the collection is empty
const seedDatabase = require('./seed');
seedDatabase();

class MongoStorage {
    constructor() {
        if (!client) {
            client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
        }
        this.collection = client.db().collection('restaurants');
    }

    async _connect() {
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }
    }

    async getAll() {
        await this._connect();
        const items = await this.collection.find().toArray()[0];
	    
  	var restaurantItems = [];
	if(items) {
            console.log(items);
	    items.forEach((item, i) => {
		const record =  { ...item };
	        console.log(`Item ${i}: ${item}, record=${record} `);
	        restaurantItems.push(new RestaurantRecord(record));
	    });
	}
	    
        return restaurantItems;
    }

    async add(data) {
        await this._connect();
        const item = { ...data };
        
        await this.collection.insertOne(item);
        return ;
    }

    async getById(id) {
        await this._connect();
        const item = await this.collection.findOne({ id: id });
	// item._id = null;
        return item ? {  ...item } : null;
    }

    async deleteById(id) {
        await this._connect();
        const result = await this.collection.deleteOne({ id: id });
        return result.deletedCount > 0;
    }
}

exports.Mongo = MongoStorage;
