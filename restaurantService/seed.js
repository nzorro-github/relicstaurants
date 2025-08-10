const fs = require('fs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;

const uri = 'mongodb://localhost:27017'; // replace with your MongoDB connection string
const dbName = 'restaurantdb';
const collectionName = 'restaurants';

async function seedDatabase() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to database');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const count = await collection.countDocuments();
        if (count === 0) {
            console.log('Inserting data into the collection because it is empty');
            const dataPath = path.join(__dirname, '../data/restaurants.json');
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            await collection.insertMany(data);
            console.log('Data inserted successfully');
        } else {
            console.log('Collection is not empty, skipping seeding');
        }

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await client.close();
    }
}

seedDatabase();
