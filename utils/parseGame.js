const fs = require('fs')
const parseOsp = require('./parseOsp.js')
const parseMutant = require('./parseMutant.js')

module.exports = (path, nicks) => {
  const data = fs.readFileSync(path).toString()

  try {
    let players = []
    if(data.includes('Time Remaining: MATCH COMPLETE')) {
      players = parseOsp(path, data, nicks)
    } else {
      players = parseMutant(path, data, nicks)
    }

    return players
  } catch (er) {
    console.error(er)
  }
}
