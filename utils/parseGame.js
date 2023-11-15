const fs = require('fs')
const parseOsp = require('./parseOsp.js')
const parseMutant = require('./parseMutant.js')

module.exports = (path) => {
  const data = fs.readFileSync(path).toString()

  try {
    let players = []
    if(data.includes('Time Remaining: MATCH COMPLETE')) {
      players = parseOsp(path, data)
    } else {
      players = parseMutant(path, data)
    }

    return players
  } catch (er) {
    console.error(er)
  }
}
