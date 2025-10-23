const persistence = require('./persistence')

/**
 * Authenticate a user by username and password.
 * @param {string} username - The username of the user
 * @param {string} password - The password of the user
 * @returns {Promise<Object|null>} The user object if login succeeds, otherwise null
 */
async function login(username, password) {
    return await persistence.findUser(username, password)
}

/**
 * Find a photo by ID if the logged-in user is the owner.
 * @param {number} id - The ID of the photo
 * @param {Object} user - The currently logged-in user
 * @returns {Promise<Object|null>} The photo object if access is allowed, otherwise null
 */
async function findPhotoByIdBusiness(id, user) {
    let photo = await persistence.findPhotoById(id)
    if (photo && photo.owner && photo.owner === user.id) {
        return photo
    }
    return null
}

/**
 * Update details of a photo if the logged-in user is the owner.
 * @param {number} id - The ID of the photo
 * @param {Object} newDetails - The new details to update
 * @param {Object} user - The currently logged-in user
 * @returns {Promise<Object|null>} The updated photo object if access is allowed, otherwise null
 */
async function updatePhotoDetailsBusiness(id, newDetails, user) {
    let photo = await persistence.findPhotoById(id)
    if (photo && photo.owner && photo.owner === user.id) {
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
    login,
    findPhotoByIdBusiness,
    updatePhotoDetailsBusiness,
    findAlbumByNameBusiness
}
