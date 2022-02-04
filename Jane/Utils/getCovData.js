const bent = require('bent')
const getJSON = bent('json')

const urls = {
  vaccineDataAPI: 'https://static.data.gov.hk/covid-vaccine/summary.json',
  covidDataAPI: 'https://chp-dashboard.geodata.gov.hk/covid-19/data/keynum.json'
}

module.exports = async function getCovData () {
  const vaccineData = await getJSON(urls.vaccineDataAPI)
  const covidData = await getJSON(urls.covidDataAPI)

  return {
    vaccine: {
      latestDay: Number(vaccineData?.latestDaily ?? '0').toLocaleString(),
      sevenDayAvg: Number(vaccineData?.sevenDayAvg ?? '0').toLocaleString(),
      totalDoses: Number(
        vaccineData?.totalDosesAdministered ?? '0'
      ).toLocaleString(),
      child: {
        doses: [
          {
            total: Number(
              vaccineData?.age5to11FirstDose ?? '0'
            ).toLocaleString(),
            percent: vaccineData?.age5to11FirstDosePercent ?? '0'
          },
          {
            total: Number(
              vaccineData?.age5to11SecondDose ?? '0'
            ).toLocaleString(),
            percent: vaccineData?.age5to11SecondDosePercent ?? '0'
          }
        ]
      },
      doses: [
        {
          total: Number(vaccineData?.firstDoseTotal ?? '0').toLocaleString(),
          percent: vaccineData?.firstDosePercent?.replace('%', '') ?? '0',
          daily: Number(vaccineData?.firstDoseDaily ?? '0').toLocaleString()
        },
        {
          total: Number(vaccineData?.secondDoseTotal ?? '0').toLocaleString(),
          percent: vaccineData?.secondDosePercent?.replace('%', '') ?? '0',
          daily: Number(vaccineData?.secondDoseDaily ?? '0').toLocaleString()
        },
        {
          total: Number(vaccineData?.thirdDoseTotal ?? '0').toLocaleString(),
          percent: vaccineData?.thirdDosePercent?.replace('%', '') ?? '0',
          daily: Number(vaccineData?.thirdDoseDaily ?? '0').toLocaleString()
        }
      ]
    },
    covid: {
      updateTime: Math.floor(
        Number(covidData?.As_of_date ?? 0) / 1000
      ).toString(),
      positiveTotal: Number(covidData?.Confirmed ?? '0').toLocaleString(),
      confirmedTotal: Number(covidData?.Confirmed2 ?? '0').toLocaleString(),
      confirmedDeltaTotal: Number(
        covidData?.Confirmed_Delta ?? '0'
      ).toLocaleString(),
      asymptomaticTotal: Number(
        covidData?.Asymptomatic ?? '0'
      ).toLocaleString(),
      repositiveTotal: Number(covidData?.RePositive ?? '0').toLocaleString(),
      hospitalizedTotal: Number(
        covidData?.Hospitalised ?? '0'
      ).toLocaleString(),
      deathTotal: Number(covidData?.Death ?? '0').toLocaleString(),
      daily: {
        local: covidData?.Local_Case2 ?? '0',
        localRelated: covidData?.Local_Case2_Related ?? '0',
        import: covidData?.Import_Case2 ?? '0',
        importRelated: covidData?.Import_case2_Related ?? covidData?.Import_Case2_Related ?? '0',
        total:
          Number(covidData?.Local_Case2 ?? '0') +
          Number(covidData?.Local_Case2_Related ?? '0') +
          Number(covidData?.Import_Case2 ?? '0') +
          Number(
            covidData?.Import_case2_Related ??
              covidData?.Import_Case2_Related ??
              '0'
          )
      }
    }
  }
}
