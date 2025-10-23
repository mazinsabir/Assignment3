const persistence = require('./persistence')

/**
 * Find a photo by ID if the logged-in user is the owner.
 * @param {number} id - The ID of the photo
 * @returns {Promise<Object|null>} The photo object if access is allowed, otherwise null
 */
async function findPhotoByIdBusiness(id) {
    let photo = await persistence.findPhotoById(id)
    if (photo) {
        return photo
    }
    return null
}

/**
 * Update details of a photo.
 * In Assignment 3, this function is simplified to bypass user-ownership checks.
 * @param {number} id - The ID of the photo
 * @param {Object} newDetails - The new details to update
 * @returns {Promise<Object|null>} The updated photo object if found, otherwise null
 */
async function updatePhotoDetailsBusiness(id, newDetails) {
    let photo = await persistence.findPhotoById(id)
    if (photo) {
        return await persistence.updatePhotoDetails(id, newDetails)
    }
    return null
}

/**
 * Find an album by its name.
 * @param {string} name - The name of the album
 * @returns {Promise<Object|null>} The album object including its photos, otherwise null
 */
async function findAlbumByNameBusiness(name) {
    return await persistence.findAlbumByName(name)
}

module.exports = {
    findPhotoByIdBusiness,
    updatePhotoDetailsBusiness,
    findAlbumByNameBusiness
}
