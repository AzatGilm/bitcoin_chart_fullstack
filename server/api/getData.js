const axios = require("axios");
const moment = require("moment");

async function getDataFromApi(
  customStart = null,
  customEnd = null,
  // standartPeriod = 'day',
  interval = "h2" 
) {
  // Структура стандартных периодов из фронта
  // const periods = {
  //   day: {
  //     start: moment().subtract(1, "days").valueOf(),
  //     end: moment().valueOf(),
  //     interval: "h2",
  //   },
  //   week: {
  //     start: moment().subtract(1, "weeks").valueOf(),
  //     end: moment().valueOf(),
  //     interval: "h2",
  //   },
  //   month: {
  //     start: moment().subtract(1, "months").valueOf(),
  //     end: moment().valueOf(),
  //     interval: "d1",
  //   },
  //   year: {
  //     start: moment().subtract(1, "years").valueOf(),
  //     end: moment().valueOf(),
  //     interval: "d1",
  //   },
  // };

  try {
    // let params = {};

    // if (standartPeriod && periods[standartPeriod]) {
    //   // Используем стандартный период
    //   params = {
    //     start: periods[standartPeriod].start,
    //     end: periods[standartPeriod].end,
    //     interval: periods[standartPeriod].interval,
    //   };
    // } else if (customStart && customEnd) {
    //   // Используем кастомный период
    //   params = {
    //     start: moment(customStart).valueOf(),
    //     end: moment(customEnd).valueOf(),
    //     interval: interval, 
    //   };
    // } else {
    //   throw new Error("Не указаны параметры периода");
    // }

    const res = await axios.get(
      "https://api.coincap.io/v2/assets/bitcoin/history",
      {
        headers: {
          "User-Agent": "MyApp",
        },
        params:{
          start: customStart,
          end: customEnd,
          interval: interval
        },
        timeout: 5000,
      }
    );

    // console.log(res.data.data);
    return res.data.data;
  } catch (error) {
    console.error("Ошибка3:")
    //   , {
    //   message: error.message,
    //   url: error.config?.url,
    //   status: error.response?.status,
    // });
    // throw error;
  }
}

module.exports = { getDataFromApi };
