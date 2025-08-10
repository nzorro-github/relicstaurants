const { MongoClient, ObjectId } = require('mongodb');

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
        if (!client.isConnected()) {
            await client.connect();
        }
    }

    async getAll() {
        await this._connect();
        const items = await this.collection.find().toArray();
        return items.map(item => ({ id: item._id.toString(), ...item, _id: undefined }));
    }

    async add(data) {
        await this._connect();
        const item = { ...data };
        if (!item.id) {
            item._id = new ObjectId();
        } else {
            item._id = ObjectId(item.id);
            delete item.id;
        }
        await this.collection.insertOne(item);
        return { id: item._id.toString(), ...item, _id: undefined };
    }

    async getById(id) {
        await this._connect();
        const item = await this.collection.findOne({ _id: ObjectId(id) });
        return item ? { id: item._id.toString(), ...item, _id: undefined } : null;
    }

    async deleteById(id) {
        await this._connect();
        const result = await this.collection.deleteOne({ _id: ObjectId(id) });
        return result.deletedCount > 0;
    }
}

exports.MongoStorage = MongoStorage;
