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

    // --- LANDING PAGE: 127.0.0.1:8000 ---
    // Lists all albums as bullet points and links.
    app.get('/', handleLandingPage)

    // Start listening on the required port
    app.listen(8000, () => {
        console.log(`Server running at http://127.0.0.1:8000`)
    })
}

/**
 * Handles the root route to display a list of all albums.
 * @param {Object} request - The Express request object
 * @param {Object} response - The Express response object
 * @returns {Promise<void>}
 */
async function handleLandingPage(request, response) {
    try {
        const albums = await business.findAlbumsBusiness()
        
        response.render('index', { 
            title: 'Digital Media Catalog',
            albums: albums,
            layout: undefined // Assignment requirement: layout not required
        })
    } catch (error) {
        console.error("Error retrieving albums:", error)
        response.status(500).send("An error occurred while loading the album catalog.")
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