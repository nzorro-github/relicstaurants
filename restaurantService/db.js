const { MongoClient, ObjectId } = require('mongodb');
var RestaurantRecord = require('./model').Restaurant;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
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
        if (!client.topology || 
            !client.topology.isConnected()) {
            await client.connect();
        }
    }

    async getAll() {
        await this._connect();
        const items = await this.collection.find().toArray();

        let restaurantItems = [];
        if (items && items.length) {
            items.forEach((item, i) => {
                const record = { ...item };
                restaurantItems.push(new RestaurantRecord(record));
            });
        }

        return restaurantItems;
    }

    async add(data) {
        await this._connect();
        const item = { ...data };
        
        await this.collection.insertOne(item);
    }

    async getById(id) {
        await this._connect();
        const item = await this.collection.findOne({ id: id });
        return item ? {  ...item } : null;
    }

    async deleteById(id) {
        await this._connect();
        const result = await this.collection.deleteOne({ id: id });
        return result.deletedCount > 0;
    }
}

exports.Mongo = MongoStorage;
