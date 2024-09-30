import cors from 'cors'
import fs from "fs"
import express from 'express'
import { refreshTunes, shuffle, recentSongs, } from './music.js'
import { getMeme, refreshMemes } from './meme.js'
import ShortUniqueId from 'short-unique-id'
import { fileTypeFromFile } from 'file-type'
import path from 'path'
import pino from 'pino'
import compression from 'compression'

export const log = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})

const __dirname = path.resolve()

export const TUNES_PATH = path.join(__dirname, 'public', 'tunes', '/')
export const MEMES_PATH = path.join(__dirname, 'public', 'memes', '/')

const SHARE_URL = "https://shinysocks.net/s/"
const suid = new ShortUniqueId({ length: 6 })

const app = express()
const port = 8888

log.info(`found ${refreshTunes()} tunes 🎶`)
log.info(`found ${refreshMemes()} memes 🤪`)

// refresh tunes every 5 minutes
setInterval(refreshTunes, 1000 * 60 * 5)

app.use(cors(), express.json(), compression({ level: 9, threshold: 512 }))
app.use('/s', express.static(path.join(__dirname, 'public', 'share')))

app.get('/', (req, res) => {
  // shinysocks.net homepage route
  try {
    const userAgent = req.headers['user-agent']
    if (userAgent.includes('curl')) {
      res.status(200).sendFile(path.join(__dirname, 'public', 'static', 'index.txt'))
      log.info("terminal query! 🐚")
    } else {
      res.status(200).sendFile(path.join(__dirname, 'public', 'static', 'index.html'))
    }
  } catch (err) {
    res.status(200).sendFile(path.join(__dirname, 'public', 'static', 'index.html'))
    log.error("probably no user agent", err)
  }
})

app.get('/sh', (_req, res) => {
  res.send('echo -e "$(curl https://shinysocks.net --silent)" | less --raw-control-chars #TODO: music??')
})

app.get('/robots.txt', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'static', 'robots.txt'))
  log.info("bot found! 🤖")
})

app.get('/t/:query?', (req, res, next) => {
  // t (tunes) route streams a random file
  const song = shuffle(req.params.query)
  if (song) {
    res.sendFile(path.join(TUNES_PATH + song.song))
  } else {
    log.error("tunes query returned no matches")
    next()
  }
})

app.get('/recentsongs', (_req, res) => {
  // grabs recent songs
  res.send(recentSongs())
})

app.get('/meme', (_req, res) => {
  // grab random meme
  const meme = getMeme()
  res.setHeader('meme', meme)
  res.sendFile(path.join(MEMES_PATH, meme))
})

app.put('/upload', (req, res) => {
  // uploads a file and returns a random generated url
  const filename = suid.rnd()
  let ext = ""
  const filepath = path.join(__dirname, 'public', 'share', filename)
  const stream = fs.createWriteStream(filepath)

  req.pipe(stream).on('finish', () => {
    fileTypeFromFile(filepath).then((result) => {
      ext = '.' + result.ext
      fs.renameSync(filepath, filepath + ext)
      res.status(201).send(SHARE_URL + filename + ext)
      log.info(`uploaded ${filename}${ext}`)
    }).catch(() => {
      ext = '.txt' // TODO: read text based formats correctly
      fs.renameSync(filepath, filepath + ext)
      res.status(201).send(SHARE_URL + filename + ext)
      log.info(`uploaded ${filename}${ext}`)
    })

  }).on('error', () => {
    res.status(500).send('upload failed.')
    log.error("file upload failed")
  })
})

app.get('*', (req, res) => {
  log.warn(`client attempted: ${req.originalUrl}`)
  try {
    if (req.headers['user-agent'].includes('curl')) {
      res.status(404).send("not found")
    } else {
      res.status(404).sendFile(path.join(__dirname, 'public', 'static', '404.html'))
    }
  } catch(_err) {
    res.status(404).send("not found")
  }
})

app.listen(port, () => {
  log.info(`shinysocks.net started on port ${port}! 🚀`)
})

// app.get('/textme/:message', (req, res) => {
//   if (req.params.message) {
//     subProcess.exec(`./textme "${req.params.message}"`, (err, stdout, stderr) => {
//       if (err) {
//         log.error(`textme script failed with: ${err}`)
//         process.exit(1)
//         res.sendStatus(500)
//       } else {
//         res.send(stdout.toString())
//       }
//     })
//   } else {
//     res.status(400).send("no message body")
//   }
// })

