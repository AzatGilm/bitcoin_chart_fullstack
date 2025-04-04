const moment = require("moment");

class BitCoinController {
  constructor(model) {
    this.model = model;
  }

  async updateBitCoinPrices() {
    try {
      // Собираем первонач данные
      const oneYearAgo = moment().subtract(1, "years").valueOf();
      const nowDate = moment().valueOf();
      const max_timestamp = this.model.getMaxTimestampFromDB();
      const isEmpty = this.model.isEmptyDB();
      // Если БД пустая - заполняем годовалыми данными
      // Если нет - удаляем старые(свыше года) и добавляем свежие
      if (isEmpty) {
        const apiData = await this.model.fetchFromAPI(oneYearAgo, nowDate);
        await addRecentData(apiData);
      } else {
        await this.model.clearExtraData(oneYearAgo);
        const apiData = await this.model.fetchFromAPI(max_timestamp, nowDate);
        await addRecentData(apiData);
      }
    } catch (error) {
      console.error("Error in controller.updateBitcoinPrices:", error);
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
}

module.exports = { BitCoinPriceController };