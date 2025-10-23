const express = require('express')
const { engine } = require('express-handlebars')
const business = require('./business') 

const app = express()
const port = 8000 

/**
 * Configure Handlebars template engine.
 * NOTE: The assignment says layouts are not required; we are disabling the default layout.
 * @returns {void}
 */
function configureHandlebars() {
    app.engine('handlebars', engine({
        defaultLayout: false
    }))
    app.set('view engine', 'handlebars')
    app.set('views', './views')
}

/**
 * Configure the Express server to handle static files and routes.
 * @returns {void}
 */
function configureServer() {
    app.use(express.static('public')) 

    app.use('/photos', express.static('photos'))

    app.use(express.urlencoded({ extended: true }))

    //LANDING PAGE
    app.get('/', handleLandingPage)

    //ALBUM DETAILS PAGE
    app.get('/album/:albumId', handleAlbumDetailsPage)

    //PHOTO DETAILS PAGE
    app.get('/photo-details/:photoId', handlePhotoDetailsPage)

    app.get('/edit-photo', handleEditPhotoGet)      // Handles form display
    app.post('/edit-photo', handleEditPhotoPost)   // Handles form submission

    app.listen(8000, () => {
        console.log(`Server running at http://127.0.0.1:8000`)
    })
}

/**
 * Handles the root route to display a list of all albums.
 * @param {Object} req - The Express request object
 * @param {Object} res - The Express response object
 * @returns {Promise<void>}
 */
async function handleLandingPage(req, res) {
    try {
        const albums = await business.findAlbumsBusiness()
        
        res.render('index', { 
            title: 'Digital Media Catalog',
            albums: albums,
            layout: undefined
        })
    } catch (error) {
        console.error("Error retrieving albums:", error)
        res.status(500).send("An error occurred while loading the album catalog.")
    }
}

/**
 * Handles the Album Details route to display all photos in a specific album.
 * Route: /album/:albumId
 * @param {Object} req - The Express request object
 * @param {Object} res - The Express response object
 * @returns {Promise<void>}
 */
async function handleAlbumDetailsPage(req, res) {
    const albumId = parseInt(req.params.albumId)
    
    if (isNaN(albumId)) {
        res.status(404).send("Error: Invalid Album ID.")
        return
    }

    try {
        const album = await business.findAlbumByIdBusiness(albumId)

        if (!album) {
            res.status(404).send("Album not found.")
            return
        }
        const photoCount = album.photos.length
        
        res.render('album-details', { 
            album: album,
            photoCount: photoCount,
            photoLabel: photoCount === 1 ? 'photo' : 'photos', 
            layout: undefined
        })

    } catch (error) {
        console.error("Error retrieving album details:", error)
        res.status(500).send("An error occurred while loading the album details.")
    }

    
}

/**
 * Handles the Photo Details route to display a specific photo.
 * Route: /photo-details/:photoId
 * @param {Object} request - The Express request object
 * @param {Object} response - The Express response object
 * @returns {Promise<void>}
 */
async function handlePhotoDetailsPage(request, response) {
    const photoId = parseInt(request.params.photoId)

    if (isNaN(photoId)) {
        response.status(404).send("Error: Invalid Photo ID.")
        return
    }

    try {
        const photo = await business.findPhotoByIdBusiness(photoId) 

        if (!photo) {
            response.status(404).send("Photo not found.")
            return
        }

        response.render('photo-details', { 
            photo: photo,
            layout: undefined
        })

    } catch (error) {
        console.error("Error retrieving photo details:", error)
        response.status(500).send("An error occurred while loading the photo details.")
    }
}

/**
 * Renders the edit-photo template with current photo details and an optional error message.
 * This helper function is used by both the GET route (initial load) and the POST route (failure case).
 *
 * @param {Object} res - The Express response object used to render the page.
 * @param {number} photoId - The ID of the photo being edited.
 * @param {string|null} errorMessage - The error message to display on the form, or null if none.
 * @returns {Promise<void>} Renders the 'edit-photo' view or sends a 404/500 response.
 */
async function renderEditPhotoPage(res, photoId, errorMessage) {
    try {
        const photo = await business.findPhotoByIdBusiness(photoId) 

        if (!photo) {
            res.status(404).send("Photo not found.")
            return
        }

        res.render('edit-photo', { 
            photo: photo,
            errorMessage: errorMessage,
            layout: undefined
        })
    } catch (error) {
        res.status(500).send("A server error occurred.")
    }
}

/**
 * Handles the GET request for the Edit Photo form.
 * It retrieves the photo's details and renders the form with pre-filled fields.
 *
 * @param {Object} req - The Express request object, containing the photo ID in query parameters (pid).
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Renders the 'edit-photo' view or sends a 404 response.
 */
async function handleEditPhotoGet(req, res) {
    const photoId = parseInt(req.query.pid)
    
    if (isNaN(photoId)) {
        res.status(404).send("Error: Invalid Photo ID.")
        return
    }
    await renderEditPhotoPage(res, photoId, null)
}

/**
 * Handles the POST request to update photo details.
 * Implements the PRG pattern on success (Redirect).
 * Implements direct render on failure (No automatic redirection, per assignment rules).
 *
 * @param {Object} req - The Express request object, containing form data in the body.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Redirects on success, or renders the form with an error on failure.
 */
async function handleEditPhotoPost(req, res) {
    const photoId = parseInt(req.body.photoId)
    const newTitle = req.body.title
    const newDescription = req.body.description
    
    if (!newTitle || !newDescription) {
        const errorMessage = 'Update failed: Title and Description are required.'
        await renderEditPhotoPage(res, photoId, errorMessage) 
        return
    }

    try {
        const updatedPhoto = await business.updatePhotoDetailsBusiness(photoId, { 
            title: newTitle, 
            description: newDescription 
        })
        
        if (updatedPhoto) {
            res.redirect(`/photo-details/${photoId}`) 
        } else {
            const errorMessage = 'Update failed. The photo ID could not be found or updated.'
            await renderEditPhotoPage(res, photoId, errorMessage)
        }

    } catch (error) {
        const errorMessage = 'A system error occurred during the update.'
        await renderEditPhotoPage(res, photoId, errorMessage)
    }
}

/**
 * Main application entry point to configure and start the server.
 * @returns {void}
 */
function run() {
    configureHandlebars()
    configureServer()
}

run()