const bent = require('bent')
const getJSON = bent('json')

if (require.main === module) {
  ;(async () => {
    await fetchNews()
  })()
}

const urls = {
  buildings:
    'https://api.data.gov.hk/v2/filter?q=%7B%22resource%22%3A%22http%3A%2F%2Fwww.chp.gov.hk%2Ffiles%2Fmisc%2Fbuilding_list_chi.csv%22%2C%22section%22%3A1%2C%22format%22%3A%22json%22%2C%22filters%22%3A%5B%5B1%2C%22eq%22%2C%5B%22%E6%B2%99%E7%94%B0%22%5D%5D%5D%7D',
  overview:
    'https://api.data.gov.hk/v2/filter?q=%7B%22resource%22%3A%22http%3A%2F%2Fwww.chp.gov.hk%2Ffiles%2Fmisc%2Flatest_situation_of_reported_cases_covid_19_chi.csv%22%2C%22section%22%3A1%2C%22format%22%3A%22json%22%2C%22filters%22%3A%5B%5B1%2C%22eq%22%2C%5B%22{}%22%5D%5D%5D%7D'
}

const t = (a, b) =>
  new Date(
    new Date(
      a.replace(/([0-9]{2})\/([0-9]{2})\/([0-9]{4})/g, '$2/$1/$3')
    ).getTime() -
      24 * 60 * 60 * 1000 * b
  )
const p = n => n.toString().padStart(2, '0')
const f = d => [p(d.getDate()), p(d.getMonth() + 1), d.getFullYear()].join('/')
const h = j => ({
  date: j.更新日期,
  death: j.死亡,
  unhos: j.出院,
  crit: j.住院危殆個案,
  case: j.嚴重急性呼吸綜合症冠狀病毒2的陽性檢測個案
})

module.exports = async function getCovData (dateOverride) {
  let updatedToday = true
  const buildingsJSON = await getJSON(urls.buildings)
  const tempBuildings = buildingsJSON.map(i => i.大廈名單)

  const buildings = []
  const estates = []

  for (const item of tempBuildings) {
    const estate = item.match(/([^苑邨園]*[苑邨園])|(沙田第一城)|([^心]*中心)/)
    if (!estate || !estate[0]) {
      buildings.push(`${item}、`)
      continue
    }
    if (estates.includes(estate[0])) {
      buildings[buildings.length - 1] = buildings[buildings.length - 1].slice(
        0,
        -1
      )
      buildings.push(`,${item.replace(estate[0], '')}、`)
      continue
    }
    estates.push(estate[0])
    buildings.push(`${item}、`)
  }

  if (
    buildings[buildings.length - 1].endsWith('、') ||
    buildings[buildings.length - 1].endsWith(',')
  ) {
    buildings[buildings.length - 1] = buildings[buildings.length - 1].slice(
      0,
      -1
    )
  }

  const dateNow = dateOverride || f(new Date())
  const dateBefore = f(t(dateNow, 1))
  console.log(dateNow, dateBefore)

  let overviewNowJSON = await getJSON(urls.overview.replace('{}', dateNow))
  let overviewBeforeJSON
  if (!overviewNowJSON[0]) {
    updatedToday = false
    overviewNowJSON = await getJSON(urls.overview.replace('{}', dateBefore))
    overviewBeforeJSON = await getJSON(
      urls.overview.replace('{}', f(t(dateBefore, 1)))
    )
  } else {
    overviewBeforeJSON = await getJSON(urls.overview.replace('{}', dateBefore))
  }

  const overviewNow = h(overviewNowJSON[0] || {})
  const overviewBefore = h(overviewBeforeJSON[0] || {})

  const news = await fetchNews()

  const results = { buildings, overviewNow, overviewBefore, updatedToday, news }
  return results
}

async function fetchNews () {
  const { parse } = require('rss-to-json')
  const { items } = await parse(
    'http://rthk9.rthk.hk/rthk/news/rss/c_expressnews_clocal.xml'
  )
  const filtered = items.filter(
    item =>
      /[多增].*(確診|個案)/.test(item.title) ||
      /[多增].*(確診|個案)/.test(item.description)
  )

  const results = filtered
    .map(({ title, description, link, published, created }) => ({
      title,
      link,
      description:
        description.match(
          /[^，\n]*增([0-9]{1,8})[^0-9。]*(^(個案|確診))*([^。]*)?/g
        )?.[0] ||
        (description.length >= 30
          ? description.substring(0, 27) + '...'
          : description),
      time: (published || created) / 1000
    }))
    .slice(0, 3)

  return results
}
