module.exports = (path, data, nicks) => {
  if (data.indexOf('COMPLETE') == -1 || data.toLowerCase().indexOf('red') == -1)
    return

  let stats = data.split('Map: ')[0].split('Accuracy info for: ')

  let score = { blue: 0, red: 0 }

  let table = data
    .split('Time Remaining: MATCH COMPLETE')[1]
    .split('Current time:')[0]

  table.split('\n').forEach((t) => {
    if (t.indexOf('Totals') > -1) {
      t = t.replace(/\s+/g, ' ')
      if (t.indexOf('RED') > -1) {
        score.red = +t.split(' ')[12].split('\n')[0]
      } else {
        score.blue = +t.split(' ')[12].split('\n')[0]
      }
    }
  })

  let red = table
    .split(
      '-----------------------------------------------------------------------'
    )[1]
    .split('TEAM Player')[0]
  let blue = table
    .split(
      '-----------------------------------------------------------------------'
    )[3]
    .split(
      '-----------------------------------------------------------------------'
    )[0]

  let map = data.split('Map: ')[1].split('\r')[0]
  let date = data.split('Current time: ')[1].split('\r')[0]

  let players = []

  console.log(`Parsing game ${path} - OSP ${map} ${date}`)

  if (data.indexOf('Accuracy info for: ') == -1)
    stats = red
      .concat(blue)
      .split('\n')
      .filter((a) => a != '\r' && a != '')

  stats.forEach((p, ind) => {
    if (ind == 0) return

    // players stats
    let obj = {
      nick:
        data.indexOf('Accuracy info for: ') > -1
          ? p.split('\r')[0]
          : p.replace(/\s+/g, ' ').trim().split(' ')[1].split(' ')[0],
      kills: 0,
      deaths: 0,
      thw: 0,
      sui: 0,
      score: 0
    }
    obj.team = red.indexOf(obj.nick) > -1 ? 'RED' : 'BLUE'
    if (obj.team == 'RED') {
      red.split('\n').forEach((h, k) => {
        if (h.indexOf(obj.nick) > -1) {
          h = h.replace(obj.nick, ' ')
          h = h.replace(/\s+/g, ' ').trim()
          obj.kills = +h.split(' ')[1].split(' ')[0]
          obj.thw = +h.split(' ')[2].split(' ')[0]
          obj.deaths = +h.split(' ')[3].split(' ')[0]
          obj.sui = +h.split(' ')[4].split(' ')[0]
          obj.score = +h.split(' ')[11].split(' ')[0]
        }
      })
    } else {
      blue.split('\n').forEach((h, k) => {
        if (h.indexOf(obj.nick) > -1) {
          h = h.replace(obj.nick, ' ')
          h = h.replace(/\s+/g, ' ').trim()
          obj.kills = +h.split(' ')[1].split(' ')[0]
          obj.thw = +h.split(' ')[2].split(' ')[0]
          obj.deaths = +h.split(' ')[3].split(' ')[0]
          obj.sui = +h.split(' ')[4].split(' ')[0]
          obj.score = +h.split(' ')[11].split(' ')[0]
        }
      })
    }

    let findChange = nicks.find(a => a.old == obj.nick)

    if (findChange) {
      obj.nick = findChange.new
    }

    if (data.indexOf('Accuracy info for: ') > -1) {
      obj.damageGiven = +p.split('Damage Given: ')[1].split(' ')[0]
      obj.damageRecvd = +p.split('Damage Recvd: ')[1].split(' ')[0]
    }

    // weapons stats
    if (
      p.indexOf('No weapon info available.') == -1 &&
      data.indexOf('Accuracy info for: ') > -1
    ) {
      obj.weaponStats = {}
      let weaponStats = p
        .split(`--------------------------------------------------------`)[1]
        .split('Damage Given:')[0]
        .split('\n')
      weaponStats.forEach((w, i) => {
        if (i == 0 || w.split(' ')[0] == false) return
        w = w.replace(/\s+/g, ' ').trim()
        obj.weaponStats[w.split(' ')[0]] = {
          hits:
            w.split(':')[1].split(' ').length > 6
              ? +w.split(':')[1].split(' ')[2].split('/')[0]
              : 0,
          miss:
            w.split(':')[1].split(' ').length > 6
              ? +w.split(':')[1].split(' ')[2].split('/')[1].split(' ')[0]
              : 0,
          kills:
            w.split(':')[1].split(' ').length > 6
              ? +w.split(':')[1].split(' ')[3].split(' ')[0]
              : 0,
          deaths:
            w.split(':')[1].split(' ').length > 6
              ? +w.split(':')[1].split(' ')[4].split(' ')[0]
              : 0
        }
        obj.weaponStats[w.split(' ')[0]].acc = Math.round(
          (obj.weaponStats[w.split(' ')[0]].hits /
            obj.weaponStats[w.split(' ')[0]].miss) *
            100
        )
      })
    }

    delete obj['team']
    players.push(obj)
  })

  return {
    players,
    map
  }
}
