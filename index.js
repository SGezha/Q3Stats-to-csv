const fs = require('fs')
const parseGame = require('./utils/parseGame.js')
let converter = require('json-2-csv')
const playersBase = []

const statsDir = fs.readdirSync('stats')

statsDir.forEach((path) => {
  const playersStats = parseGame(`stats/${path}`)

  //   add info to bd
  playersStats.forEach((pl) => {
    const profile = playersBase.find((a) => a.nick == pl.nick)
    if (profile) {
      profile.nick = pl.nick
      profile.kills += pl.kills
      profile.deaths += pl.deaths
      profile.thw += pl.thw
      profile.damageGiven += pl.damageGiven
      profile.damageRecvd += pl.damageRecvd
      for (let key in profile.weaponStats) {
        if (!profile.weaponStats[key] || key == 'MachineGun') continue
        profile.weaponStats[key].hits += pl.weaponStats[key].hits
        profile.weaponStats[key].miss += pl.weaponStats[key].miss
        profile.weaponStats[key].kills += pl.weaponStats[key].kills
        profile.weaponStats[key].deaths += pl.weaponStats[key].deaths
        profile.weaponStats[key].acc = +(
          (+profile.weaponStats[key].hits / +profile.weaponStats[key].miss) *
          100
        ).toFixed(1)
      }
    } else {
      playersBase.push(pl)
    }
  })
})

async function start() {
  const csv = await converter.json2csv(playersBase)
  fs.writeFileSync('result.csv', csv)
  console.log('Parse completed -->> result.csv')
}

start()
