const fs = require('fs').promises

/**
 * Load all photos from the JSON file.
 * @returns {Promise<Array>} Array of photo objects
 */
async function loadPhotosFromJson() {
    let raw = await fs.readFile('photos.json', 'utf8')
    return JSON.parse(raw)
}

/**
 * Save the given list of photos back into the JSON file.
 * @param {Array} photos - Array of photo objects
 * @returns {Promise<void>}
 */
async function savePhotosToJson(photos) {
    let json = JSON.stringify(photos, null, 4)
    await fs.writeFile('photos.json', json, 'utf8')
}

/**
 * Load all albums from the JSON file.
 * @returns {Promise<Array>} Array of album objects
 */
async function loadAlbumsFromJson() {
    let raw = await fs.readFile('albums.json', 'utf8')
    return JSON.parse(raw)
}

/**
 * Find a photo by its ID.
 * @param {number} id - The ID of the photo
 * @returns {Promise<Object|null>} The photo object if found, otherwise null
 */
async function findPhotoById(id) {
    let photos = await loadPhotosFromJson()
    for (let i = 0; i < photos.length; i++) {
        if (photos[i].id === id) {
            return photos[i]
        }
    }
    return null
}

/**
 * Update details of a photo by ID.
 * @param {number} id - The ID of the photo
 * @param {Object} newDetails - The new details to update
 * @returns {Promise<Object|null>} The updated photo object if found, otherwise null
 */
async function updatePhotoDetails(id, newDetails) {
    let photos = await loadPhotosFromJson()
    for (let i = 0; i < photos.length; i++) {
        if (photos[i].id === id) {
            for (let key in newDetails) {
                photos[i][key] = newDetails[key]
            }
            await savePhotosToJson(photos)
            return photos[i]
        }
    }
    return null
}

/**
 * Find an album by its name and include all its photos.
 * @param {string} name - The album name
 * @returns {Promise<Object|null>} Album object with a `photos` array if found, otherwise null
 */
async function findAlbumByName(name) {
    let albums = await loadAlbumsFromJson()
    let photos = await loadPhotosFromJson()

    let album = null
    for (let i = 0; i < albums.length; i++) {
        if (albums[i].name.toLowerCase() === name.toLowerCase()) {
            album = albums[i]
            break
        }
    }

    if (!album) {
        return null
    }

    let albumPhotos = []
    for (let i = 0; i < photos.length; i++) {
        let photoAlbums = photos[i].albums
        for (let j = 0; j < photoAlbums.length; j++) {
            if (photoAlbums[j] === album.id) {
                albumPhotos.push(photos[i])
                break
            }
        }
    }

    album.photos = albumPhotos
    return album
}


module.exports = {
    loadPhotosFromJson,
    savePhotosToJson,
    loadAlbumsFromJson,
    findPhotoById,
    updatePhotoDetails,
    findAlbumByName
}
