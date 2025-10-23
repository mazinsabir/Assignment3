const { MongoClient } = require('mongodb')
require('dotenv').config()

let client = undefined
let db = undefined

const databaseName = 'infs3201_fall2025'

/**
 * Connects to the MongoDB database client.
 * NOTE: You MUST replace the URI with your actual connection string.
 * @returns {Promise<void>}
 */
async function connectDatabase() {
    if (db) {
        return
    }

    try {
        const uri = process.env.MONGO_URI
        
        if (!client) {
            client = new MongoClient(uri)
        }
        
        await client.connect() 
        db = client.db(databaseName) 
        console.log("Connected successfully to database: " + databaseName)

    } catch (error) {
        console.error("Could not connect to MongoDB:", error)
        client = undefined
        db = undefined
        throw error
    }
}

/**
 * Find a photo by its ID from the 'photos' collection.
 * @param {number} id - The ID of the photo
 * @returns {Promise<Object|null>} The photo object if found, otherwise null
 */
async function findPhotoById(id) {
    await connectDatabase()
    const photosCollection = db.collection('photos') 
    const photo = await photosCollection.findOne({ id: id })
    return photo
}

/**
 * Update details of a photo by ID in the 'photos' collection.
 * @param {number} id - The ID of the photo
 * @param {Object} newDetails - The new details to update (e.g., { title: "New Title" })
 * @returns {Promise<Object|null>} The updated photo object if found, otherwise null
 */
async function updatePhotoDetails(id, newDetails) {
    await connectDatabase()
    const photosCollection = db.collection('photos') 
    
    const result = await photosCollection.updateOne(
        { id: id },
        { $set: newDetails }
    )

    if (result.matchedCount > 0) {
        const updatedPhoto = await photosCollection.findOne({ id: id })
        return updatedPhoto
    }

    return null
}

/**
 * Find an album by its name and include all its photos.
 * @param {string} name - The album name
 * @returns {Promise<Object|null>} Album object with a `photos` array if found, otherwise null
 */
async function findAlbumByName(name) {
    await connectDatabase()
    const albumsCollection = db.collection('albums') 
    const photosCollection = db.collection('photos') 

    const album = await albumsCollection.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } }) 

    if (!album) {
        return null
    }

    const albumPhotos = await photosCollection.find({ albums: album.id }).toArray()

    album.photos = albumPhotos
    return album
}

/**
 * Find all albums in the 'albums' collection.
 * @returns {Promise<Array>} Array of all album objects
 */
async function findAllAlbums() {
    await connectDatabase()
    const albumsCollection = db.collection('albums')
    const allAlbums = await albumsCollection.find({}).toArray()
    return allAlbums
}

/**
 * Finds an album by its ID in the MongoDB 'albums' collection.
 * It also finds and attaches all related photos from the 'photos' collection
 * where the photo's 'albums' array contains the target album's ID.
 *
 * @param {number} id - The ID of the album to search for.
 * @returns {Promise<Object|null>} The album object including a 'photos' array if found, otherwise null.
 */
async function findAlbumById(id) {
    await connectDatabase()
    const albumsCollection = db.collection('albums') 
    const photosCollection = db.collection('photos') 

    const album = await albumsCollection.findOne({ id: id })

    if (!album) {
        return null
    }

    const albumPhotos = await photosCollection.find({ albums: album.id }).toArray()

    album.photos = albumPhotos
    return album
}

/**
 * Closes the MongoDB client connection.
 * This is necessary to allow the Node.js process to exit gracefully.
 * @returns {Promise<void>}
 */
async function closeDatabase() {
    if (client) {
        console.log("Closing MongoDB connection...")
        await client.close()
        client = undefined
        db = undefined
        console.log("Connection closed.")
    }
}

module.exports = {
    connectDatabase,
    findPhotoById,
    updatePhotoDetails,
    findAlbumByName,
    findAllAlbums,
    findAlbumById,
    closeDatabase
}