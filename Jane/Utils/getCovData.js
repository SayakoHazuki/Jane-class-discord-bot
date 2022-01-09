const get = require('get')

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

module.exports = async function getCovData (call) {
  get(
    'https://chp-dashboard.geodata.gov.hk/covid-19/data/keynum.json'
  ).asString(async function (err, data) {
    if (err) return
    const covdata = JSON.parse(data)
    const asOfJSDate = new Date(Number(covdata.As_of_date))
    const asOfReadable = `<t:${Math.round(asOfJSDate.getTime() / 1000)}:R>`
    const plrec = Number(covdata.Discharged) - Number(covdata.P_Discharged)
    const plcon = `+${covdata.LocalCasesAdded ||
      0} 本地 | +${covdata.ImportedCasedAdded ||
      covdata.ImportedCasesAdded ||
      0} 輸入`
    const pldeath = Number(covdata.Death) - Number(covdata.P_Death)
    const preCritical = Number(covdata.Critical) - Number(covdata.P_Critical)
    const preHospital =
      Number(covdata.Hospitalised) - Number(covdata.P_Hospitalised)
    const plcrit = preCritical > -1 ? `+${preCritical}` : preCritical.toString()
    const plhos = preHospital > -1 ? `+${preHospital}` : preHospital.toString()
    const res2 = covdata.Confirmed + ' (' + plcon + ')'
    const res3 = `${covdata.Death} (+${pldeath})`
    const res4 = `${covdata.Discharged} (+${plrec})`
    const res5 = `${covdata.Critical} (${plcrit})`
    const res6 = `${covdata.Hospitalised} (${plhos})`
    const casePerc = `${(Number(covdata.Confirmed) / 7552810) * 100}`
    const res7 = `${casePerc.substring(0, 6)}%`
    const dateObj = new Date()
    const month = monthNames[dateObj.getMonth()]
    const day = String(dateObj.getDate()).padStart(2, '0')
    const year = dateObj.getFullYear()
    const output = `${day} ${month}, ${year}`
    const res1 = `${output} (數據上次更新於 ${asOfReadable})`
    call([res1, res2, res3, res4, res5, res6, res7, data])
  })
}
