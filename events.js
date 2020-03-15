const request = require('request');
const fs = require('fs');


const state = 'QLD';


const userName = 'unswassignment';
const pass = 'q3425qy5dkq3';

// ********** startDate *********************
const baseUrl = 'http://api.eventfinda.com.au/v2/events.json';

main();

function doRequest(url, offset) {
  const query = {
    rows: 20,
    fields: 'event:%28datetime_start,datetime_end,name,category,location_summary%29',
    order: 'date',
    start_date: '2020-03-16',
    end_date: '2020-10-31',
    location: 5,
    offset: offset
  };
  const options = {
    method: 'GET',
    url: url,
    qs: query,
    headers: {
      Authorization: 'Basic dW5zd2Fzc2lnbm1lbnQ6cTM0MjVxeTVka3Ez'
    }
  };
  return new Promise(function (resolve, reject) {
    request(options,
      function (error, res, body) {
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

  // let toWriteCSVData = '';
  let wUrl = '';
  let offset = 0;
  while (true) {
    let row = '';
    wUrl = baseUrl;
    try {

      const res = await doRequest(wUrl, offset);
      const dataObj = JSON.parse(res);

      offset += 20;

      // {
      //   "name": "Comedy Steps Up for Bushfire Relief",
      //   "datetime_start": "2020-03-16 18:00:00",
      //   "datetime_end": "2020-03-16 23:59:59",
      //   "location_summary": "Sydney Opera House, Circular Quay, New South Wales",
      //   "category": {
      //   "id": 93,
      //     "name": "Charity, Fundraisers",
      //     "url_slug": "charity-fundraisers",
      //     "parent_id": 190,
      //     "count_current_events": 38
      // }


      if (dataObj.events.length <= 0) {
        console.log('Finished Successfully!');
        process.exit();
      }
      let content = '';
      for (event of dataObj.events) {
        row = `"${event.datetime_start.substring(0, 10)}","${event.datetime_end.substring(0, 10)}","${event.name}","${event.location_summary}","${event.category ? event.category.name : ''}"\n`;
        content += row;

      }

      fs.appendFile(`export/${state}.csv`, content, function (err) {
        if (err) {
          // append failed
          console.error('Failed to writing to a csv file');
        } else {
          console.log('write 20 rows: ' + state);
          console.log('***********');
        }
      })
    } catch (e) {
      console.log('An error occur');
      process.exit();
    }
  }
}

