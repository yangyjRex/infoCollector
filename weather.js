const request = require('request');
const fs = require('fs');

// dark sky api key
const secretKey = '';
// city geo location
// latitude: N is + | S is -
// longitude: E is + | W is -
const cityName = 'Los Angeles';
const latitude = 34.0522;
const longitude = -118.2437;
// timeoff set: E is - | W is +
const timeOffset = 8;
// startDate startDate Date.UTC(startYear, month, day)
const startYear = 2018;
const startMonth = 4;
const startDay = 24;
// ====================
const endYear = 2019;
const endMonth = 9;
const endDay = 30;
// !important month starts from 0
const startDate = Date.UTC(startYear, startMonth - 1, startDay, 12) / 1000 + timeOffset * 60 * 60;
const endDate = Date.UTC(endYear, endMonth - 1, endDay) / 1000 + timeOffset * 60 * 60;

// ********** startDate *********************
const baseUrl = 'https://api.darksky.net/forecast';

main();

function doRequest(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, res, body) {
      if (!error && res.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

async function main() {
  console.log('***********');
  console.log('start:');
  console.log('***********');

  let date = startDate;
  // let toWriteCSVData = '';
  let wUrl = '';
  while (true) {
    let row = '';
    wUrl = `${baseUrl}/${secretKey}/${latitude},${longitude},${date}?exclude=currently,minutely,hourly,alerts`;
    try {
      const res = await doRequest(wUrl);
      const dataObj = JSON.parse(res);
      const data = dataObj.daily.data[0];
      const localDate = getFormattedDay(data.time * 1000);
      if (data.time > endDate) {
        console.log('Finished Successfully!');
        process.exit();
      }
      row = `${cityName},${localDate},${data.summary},${data.icon},${data.apparentTemperatureMin},${data.apparentTemperatureMax},${data.windSpeed}\n`
      fs.appendFile(`export/${cityName}.csv`, row, function (err) {
        if (err) {
          // append failed
          console.error('Failed to writing to a csv file');
        } else {
          console.log('write one row: ' + cityName + ' - ' + localDate);
          console.log('***********');
        }
      })
    } catch (e) {
      console.log('Finished. (Maybe 1000 free call finished. Refresh the secret key)');
      process.exit();
    }
    date = date + 24 * 60 * 60;
  }
}

function getFormattedDay(unix) {
  const monthMap = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sep',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec',
  };
  const date = new Date(unix);
  const year = date.getFullYear();
  const month = monthMap[date.getMonth()];
  const day = date.getDate();
  return `${day}${month}${year}`;
}
