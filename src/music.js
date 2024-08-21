import fs from 'fs'
import { TUNES_PATH, log } from './app.js'

const RECENT_CUTOFF = 275
let TUNES = []

export const refreshTunes = () => {
  // create an array with all songs in library and duplicate recent entries
  TUNES = []
  
  fs.readdirSync(TUNES_PATH).filter((file) => {
    return !fs.statSync(TUNES_PATH + file).isDirectory()
  }).map((song) => {
    TUNES.push({
      song: song,
      timestamp: fs.statSync(TUNES_PATH + song).mtimeMs
    })
  });

  // sort tunes with latest songs first
  TUNES.sort((a, b) => b.timestamp - a.timestamp)

  for (let i = 0; i < RECENT_CUTOFF; i++) {
    TUNES.push(TUNES.at(i))
    TUNES.push(TUNES.at(i))
  }

  log.info('refreshed tunes')
}

export const shuffle = (query) => {
  query = ( query === undefined ? "" : query )
  const queries = query.split("|")

  let filteredTunes = []

  queries.forEach((query) => {
    const queryTunes = TUNES.filter((song) => {
      return song.song.toLowerCase().includes(query.toLowerCase())
    })

    filteredTunes = filteredTunes.concat(queryTunes)
  })

  if (filteredTunes.length < 1)
    return undefined

  const rand = Math.floor(Math.random() * filteredTunes.length)
  const res = filteredTunes.at(rand)

  return res;
}

export const recentSongs = () => {
  // return an array of most recent song names
  return TUNES.slice(0, 15).map((song) => { return song.song.split(".mp3")[0]})
}

