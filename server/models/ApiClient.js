const axios = require('axios');

class ApiClient {

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.coincap.io/v2/',
      timeout: 5000, 
      headers: {
        'UserAgent': 'MyApp'
      }
    })
  }

  async get(endpoint, params= {}) {
    try {
      const response = await this.client.get(endpoint, { params })
      return response.data;
    } catch (error) {
      console.log(`Ошибка в апиклиент: ${error}`); 
      throw new Error(`API request failed: ${endpoint}`);     
    }
  }
}

module.exports = { ApiClient };