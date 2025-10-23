const express = require('express')
const { engine } = require('express-handlebars')
const business = require('./business') // Requires the new function findAlbumsBusiness

const app = express()
const port = 8000 // Required port

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
    // Middleware to serve static files (e.g., images, CSS)
    app.use(express.static('public')) 
    // IMPORTANT: You will need a 'photos' folder and potentially a 'public' folder for CSS

    app.use('/photos', express.static('photos'))

    // --- LANDING PAGE: 127.0.0.1:8000 ---
    // Lists all albums as bullet points and links.
    app.get('/', handleLandingPage)

    // --- ALBUM DETAILS PAGE ---
    app.get('/album/:albumId', handleAlbumDetailsPage)

    // --- PHOTO DETAILS PAGE ---
    app.get('/photo-details/:photoId', handlePhotoDetailsPage)

    // Start listening on the required port
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
            layout: undefined // Assignment requirement: layout not required
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
    // 1. Validate Input
    const albumId = parseInt(req.params.albumId)
    
    if (isNaN(albumId)) {
        res.status(404).send("Error: Invalid Album ID.")
        return
    }

    try {
        // 2. Call Business Layer (Correct Architecture)
        const album = await business.findAlbumByIdBusiness(albumId)

        if (!album) {
            res.status(404).send("Album not found.")
            return
        }

        // 3. Presentation Logic: Determine singular/plural
        const photoCount = album.photos.length
        
        res.render('album-details', { 
            album: album,
            photoCount: photoCount,
            // Assignment Requirement: must use "photo" if only 1
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
        // We use the existing business function
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
 * Main application entry point to configure and start the server.
 * @returns {void}
 */
function run() {
    configureHandlebars()
    configureServer()
}

run()