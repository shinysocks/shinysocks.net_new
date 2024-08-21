import fs from 'fs'
import { MEMES_PATH, log } from './app.js'

const MEMES = []

export const refreshMemes = () => {
  fs.readdirSync(MEMES_PATH).filter((file) => MEMES.push(file))
}

export const getMeme = () => {
  // return a random meme
  return MEMES.at(Math.floor(Math.random() * MEMES.length))
}
