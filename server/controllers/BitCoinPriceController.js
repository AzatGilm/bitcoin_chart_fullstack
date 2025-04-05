const moment = require("moment");

class BitCoinController {
  constructor(model) {
    this.model = model;
  }

  async updateBitCoinPrices() {
    try {
      // Собираем первонач данные
      const oneYearAgo = moment().subtract(1, "years").valueOf();
      const nowDate = moment().subtract(1, "day").valueOf();
      const max_timestamp = await this.model.getMaxTimestampFromDB();
      console.log(max_timestamp, nowDate);
      console.log(nowDate - max_timestamp);
      
      const isEmpty = await this.model.isEmptyDB();
      // Если БД пустая - заполняем годовалыми данными
      // Если нет - удаляем старые(свыше года) и добавляем свежие
      if (isEmpty) {
        const apiData = await this.model.fetchFromAPI(oneYearAgo, nowDate);
        await this.model.addRecentData(apiData);
      } else {
        if((nowDate - max_timestamp) >= 1000*24*60*60) {
          await this.model.clearExtraData(oneYearAgo);
          const apiData = await this.model.fetchFromAPI(max_timestamp, nowDate);
          await this.model.addRecentData(apiData);
        }else {
          console.log('Nothing to add, all dates are recent');          
        }        
      }
    } catch (error) {
      console.error("Error in controller.updateBitcoinPrices:", error);
      throw error;
    }
  }

  async getBitcoinPrices(startDate, endDate) {
    try {
      const prices = await this.model.getPrices(startDate, endDate);
      return { success: true, data: prices };
    } catch (error) {
      console.error("Error in getBitcoinPrices:", error);
      return { success: false, message: error.message };
    }
  }

  async getLastUpdateTime() {
    const result = await this.model.getMaxTimestampFromDB();
    return result || 0; // timestamp последних данных или 0 если БД пуста
  }
}

module.exports = { BitCoinController };