const fs = require('fs')
const parseGame = require('./utils/parseGame.js')
let converter = require('json-2-csv')
const playersBase = []
const mapsBase = []
let nicks = []

const statsDir = fs.readdirSync('stats')

if(fs.existsSync('fixNick.json')) nicks = JSON.parse(fs.readFileSync('fixNick.json').toString())

statsDir.forEach((path) => {
  const playersStats = parseGame(`stats/${path}`, nicks)

  if(!playersStats) return console.log(`Error parse file - stats/${path}`)

  try {
    //   add info to bd
    playersStats.players.forEach((pl) => {
      const profile = playersBase.find((a) => a.nick == pl.nick)
      if (profile) {
        profile.games += 1
        profile.kills += pl.kills
        profile.deaths += pl.deaths
        profile.thw += pl.thw
        profile.score += pl.score
        profile.damageGiven += pl.damageGiven
        profile.damageRecvd += pl.damageRecvd
        for (let key in profile.weaponStats) {
          if (!pl.weaponStats[key] || key == 'Gauntlet') continue
          profile.weaponStats[key].hits += pl.weaponStats[key].hits
          profile.weaponStats[key].miss += pl.weaponStats[key].miss
          profile.weaponStats[key].kills += pl.weaponStats[key].kills
          profile.weaponStats[key].deaths += pl.weaponStats[key].deaths
          profile.weaponStats[key].acc = +(
            (+profile.weaponStats[key].hits / +profile.weaponStats[key].miss) *
            100
          ).toFixed(1)
          if (
            profile.weaponStats[key].hits == 0 &&
            profile.weaponStats[key].miss == 0
          ) {
            profile.weaponStats[key].acc = 0
          }
        }
      } else {
        let weaponStats = {
          MachineGun: {
            hits: 0,
            miss: 0,
            kills: 0,
            deaths: 0,
            acc: 0
          },
          Shotgun: {
            hits: 0,
            miss: 0,
            kills: 0,
            deaths: 0,
            acc: 0
          },
          'G.Launcher': {
            hits: 0,
            miss: 0,
            kills: 0,
            deaths: 0,
            acc: 0
          },
          'R.Launcher': {
            hits: 0,
            miss: 0,
            kills: 0,
            deaths: 0,
            acc: 0
          },
          'LightningGun:': {
            hits: 0,
            miss: 0,
            kills: 0,
            deaths: 0,
            acc: 0
          },
          Railgun: {
            hits: 0,
            miss: 0,
            kills: 0,
            deaths: 0,
            acc: 0
          },
          Plasmagun: {
            hits: 0,
            miss: 0,
            kills: 0,
            deaths: 0,
            acc: 0
          }
        }
        for (let key in pl.weaponStats) {
          if (!pl.weaponStats[key] || key == 'Gauntlet') continue
          weaponStats[key].hits += pl.weaponStats[key].hits
          weaponStats[key].miss += pl.weaponStats[key].miss
          weaponStats[key].kills += pl.weaponStats[key].kills
          weaponStats[key].deaths += pl.weaponStats[key].deaths
          weaponStats[key].acc = +(
            (+pl.weaponStats[key].hits / +pl.weaponStats[key].miss) *
            100
          ).toFixed(2)
          if (pl.weaponStats[key].hits == 0 && pl.weaponStats[key].miss == 0) {
            weaponStats[key].acc = 0
          }
        }
        playersBase.push({
          ...pl,
          games: 1,
          weaponStats
        })
      }
    })

    const map = mapsBase.find((a) => a.name == playersStats.map)
    if(map) {
      map.count += 1
    } else {
      mapsBase.push({
        name: playersStats.map,
        count: 1
      })
    }
  } catch (er) {
    console.log(er)
  }
})

async function start() {
  const plCSV = await converter.json2csv(playersBase)
  const mapCSV = await converter.json2csv(mapsBase)
  fs.writeFileSync('result.csv', plCSV)
  fs.writeFileSync('maps.csv', mapCSV)
  console.log('Parse completed -->> result.csv')
  console.log('Parse completed -->> maps.csv')
  console.log('Консоль закроется через 30 сек')
  setTimeout(() => {}, 30 * 1000)
}

start()
