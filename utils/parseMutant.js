const getIdenticalCount = (str1, str2) => {
  let count = 0

  for (let ch of str1) {
    if (str2.includes(ch)) {
      count++
    }
  }

  return count
}

module.exports = (path, data, nicks) => {
  if (data.includes('^>')) data.replace('^>', '')

  let stats = data.split('Map: ')[0].split('Accuracy info for: ')

  let table = data.split('Player')[1].split('WP')[0]

  table.split('\n').forEach((t) => {
    if (!t.includes('Score')) {
      t = t.replace(/\s+/g, ' ')
    }
  })

  let playersStats = table
    .split('-------------------------------------------------------------')[1]
    .split('Best Match Accuracies')[0]

  let map = data.split('Map: ')[1].split('\n')[0]
  let date = data.split('Current time: ')[1].split('\n')[0]

  if (data.includes('\r')) {
    map = data.split('Map: ')[1].split('\r')[0]
    date = data.split('Current time: ')[1].split('\r')[0]
  }

  let players = []

  console.log(`Parsing game ${path} - Mutant ${map} ${date}`)

  if (data.indexOf('Accuracy info for: ') == -1)
    stats = playersStats.split('\n').filter((a) => a != '')

  stats.forEach((p, ind) => {
    if (ind == 0) return

    // players stats
    let obj = {
      nick:
        data.indexOf('Accuracy info for: ') > -1
          ? p.split('\r')[0].split('\n')[0]
          : p.replace(/\s+/g, ' ').trim().split(' ')[1].split(' ')[0],
      kills: 0,
      deaths: 0,
      thw: 0,
      sui: 0,
      score: 0,
      damageGiven: 0,
      damageRecvd: 0
    }
    playersStats.split('\n').forEach((h, k) => {
      let needToTrue = h.includes(obj.nick.slice(0, 15))
      if (obj.nick.includes('gepron1x'))
        needToTrue = h.includes(obj.nick.slice(0, 15))
      if (obj.nick.includes('Adrenal'))
        needToTrue = h.includes(obj.nick.slice(0, 15))
      if (
        obj.nick == '^>!<HEERO-2B' ||
        obj.nick == '^>!<Shantu' ||
        obj.nick == '^>!<KF' || 
        obj.nick == '^<!>Shantu'
      ) {
        obj.nick = obj.nick.slice(2)
      }
      if (needToTrue) {
        h = h.replace(obj.nick.slice(0, 15), ' ')
        h = h.replace(/\s+/g, ' ').trim()
        obj.kills = +h.split(' ')[0].split(' ')[0]
        obj.deaths = +h.split(' ')[1].split(' ')[0]
        obj.sui = +h.split(' ')[2].split(' ')[0]
        obj.damageGiven = +h.split(' ')[6].split(' ')[0]
        obj.damageRecvd = +h.split(' ')[7].split(' ')[0]
        obj.score = +h.split(' ')[8].split(' ')[0]
        obj.thw = obj.score - obj.kills
      }
    })

    if (
      obj.nick == '!<HEERO-2B' ||
      obj.nick == '!<Shantu' ||
      obj.nick == '!<KF'
    ) {
      obj.nick = `^>${obj.nick}`
    }

    //split nicks
    let findChange = nicks.find(a => a.old == obj.nick)

    if (findChange) {
      obj.nick = findChange.new
    }

    // weapons stats
    if (
      p.indexOf('No weapon info available.') == -1 &&
      data.indexOf('Accuracy info for: ') > -1
    ) {
      obj.weaponStats = {}
      let weaponStats = p
        .split(`---------------------------------------------------------`)[1]
        .split('Damage Given:')[0]
        .split('\n')

      weaponStats.forEach((w, i) => {
        let weaponName = w.split(' ')[0]
        if (i == 0 || weaponName == false) return
        w = w.replace(/\s+/g, ' ').trim()
        if (weaponName == 'Machinegun') weaponName = 'MachineGun'
        obj.weaponStats[weaponName] = {
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
        obj.weaponStats[weaponName].acc = Math.round(
          (obj.weaponStats[weaponName].hits /
            obj.weaponStats[weaponName].miss) *
            100
        )
      })
    }

    players.push(obj)
  })

  return {
    players,
    map
  }
}
