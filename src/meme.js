import fs from 'fs'
import { MEMES_PATH } from './app.js'

const MEMES = []

export const refreshMemes = () => {
  MEMES.push(...fs.readdirSync(MEMES_PATH))
  return MEMES.length
}

export const getMeme = () => {
  // return a random meme
  return MEMES.at(Math.floor(Math.random() * MEMES.length))
}
