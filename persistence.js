const { MongoClient } = require('mongodb')

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
        const uri = 'mongodb+srv://60305598_db_user:Benz745@cluster0.uq9v0vd.mongodb.net/' 
        
        if (!client) {
            client = new MongoClient(uri)
        }
        
        await client.connect() 
        db = client.db(databaseName) 

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
    closeDatabase
}