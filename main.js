const {app, Menu, Tray} = require('electron')
const path = require('path')
const wallpaper = require('wallpaper')
const fs = require('fs')
const https = require('https')
const req = require('request')
const moment = require('moment')

let tray = null

const buildTray = (updatedDT = 'Never') => {
  let contextMenu = Menu.buildFromTemplate([
    {
      label: `Last Updated: ${updatedDT}`
    },
    {
      label: 'Quit',
      role: 'quit'
    }
  ])

  tray.setToolTip('NASA Astronomy Picture of the Day')
  tray.setContextMenu(contextMenu)
}

app.on('ready', () => {
  if (process.platform == 'darwin') {
    app.dock.hide()
  }

  tray = new Tray(path.join('assets', 'earthTemplate.png'))

  buildTray()

  getPhotoUrl()
})

const getPhotoUrl = () => {
  let request = https.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', (response) => {
    response.on('data', (data) => {
      let photoUrl = JSON.parse(data).hdurl
      getPhoto(photoUrl)
    })
  })
}

const getPhoto = (photoUrl) => {
  let file = path.join(app.getPath('userData'), 'current.jpg')
  req(photoUrl, { encoding: 'binary' }, (error, response, body) => {
    fs.writeFileSync(file, body, { encoding: 'binary' })
    updateWallpaper(file)
  })
}

const updateWallpaper = (file) => {
  wallpaper.set(file).then(() => {
    return
  })
  let updateDT = moment(new Date()).format('MM/DD/YYYY h:mm a')
  buildTray(updateDT)

  setInterval(getPhotoUrl, 86400000) // 24 hours
}
