const business = require('./business')
const prompt = require('prompt-sync')()

/**
 * Find and display a photo by its ID.
 * @returns {Promise<void>}
 */
async function handleFindPhoto() {
    let getId = prompt("Photo ID? ")
    let photo = await business.findPhotoByIdBusiness(parseInt(getId))

    if (photo) {
        console.log("Photo ID? " + photo.id)
        console.log("Filename: " + photo.filename)
        console.log(" Title: " + photo.title)
        console.log("  Date: " + formatDate(photo.date))
        console.log("Albums: " + joinArray(photo.albums))
        console.log("  Tags: " + joinArray(photo.tags))
    } else {
        console.log("Photo does not exist.")
    }
}

/**
 * Update the details of a photo.
 * @returns {Promise<void>}
 */
async function handleUpdatePhoto() {
    let getId = prompt("Enter photo ID to update: ")
    let newTitle = prompt("Enter new title: ")
    let updated = await business.updatePhotoDetailsBusiness(parseInt(getId), { title: newTitle })

    if (updated) {
        console.log("Photo updated successfully.")
        console.log("Photo ID? " + updated.id)
        console.log("Filename: " + updated.filename)
        console.log(" Title: " + updated.title)
        console.log("  Date: " + formatDate(updated.date))
        console.log("Albums: " + joinArray(updated.albums))
        console.log("  Tags: " + joinArray(updated.tags))
    } else {
        console.log("Photo not found or could not be updated.")
    }
}

/**
 * Find and display the details of an album by name, 
 * including all photos inside the album.
 * @returns {Promise<void>}
 */
async function handleFindAlbum() {
    let albumName = prompt("What is the name of the album? ")
    let album = await business.findAlbumByNameBusiness(albumName)

    if (album && album.photos && album.photos.length > 0) {
        console.log("filename,resolution,tags")
        for (let i = 0; i < album.photos.length; i++) {
            let p = album.photos[i]
            let tags = ""
            for (let j = 0; j < p.tags.length; j++) {
                tags += p.tags[j]
                if (j < p.tags.length - 1) {
                    tags += ":"
                }
            }
            console.log(p.filename + "," + p.resolution + "," + tags)
        }
    } else {
        console.log("Album not found or has no photos.")
    }
}

/**
 * Format a raw date string into a human-readable format.
 * @param {string} dateString - The ISO date string
 * @returns {string} A formatted date string
 */
function formatDate(dateString) {
    let date = new Date(dateString)
    let options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
}

/**
 * Convert an array of values into a comma-separated string.
 * @param {Array} arr - The array of items
 * @returns {string} The comma-separated values
 */
function joinArray(arr) {
    let result = ""
    for (let i = 0; i < arr.length; i++) {
        result += arr[i]
        if (i < arr.length - 1) {
            result += ", "
        }
    }
    return result
}

/**
 * Display the main menu and handle user actions until exit.
 * @returns {Promise<void>}
 */
async function mainMenu() {
    let running = true
    while (running) {
        console.log("\n=== Main Menu ===")
        console.log("1. Find Photo by ID")
        console.log("2. Update Photo Details")
        console.log("3. Find Album by Name")
        console.log("4. Exit")
        let choice = prompt("Enter choice: ")

        if (choice === "1") {
            await handleFindPhoto()
        } else if (choice === "2") {
            await handleUpdatePhoto()
        } else if (choice === "3") {
            await handleFindAlbum()
        } else if (choice === "4") {
            console.log("Goodbye!")
            running = false
        } else {
            console.log("Invalid choice, please try again.")
        }
    }
}

/**
 * Run the application: display the main menu.
 * @returns {Promise<void>}
 */
async function run() {
    await mainMenu()
}

run()