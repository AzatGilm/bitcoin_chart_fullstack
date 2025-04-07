import axios from "axios";
import moment, { type Moment } from "moment";

interface CustomRange {
  start: number
  end: number
}

interface BitcoinPrice {
  time: number
  priceUsd: number
}

interface BitcoinState {
  prices: BitcoinPrice[];
  period: "day" | "week" | "month" | "year" | "custom";
  customRange: CustomRange;
}

export const useBitCoinStore = defineStore("bitcoin", {
  state: (): BitcoinState => ({
    prices: [],
    period: "day",
    customRange: {
      start: moment().subtract(1, "day").valueOf(),
      end: moment().valueOf(),
    },
  }),
  actions: {
    async fetchData(): Promise<void> {
      try {
        let start: number
        let end: number

        if (this.period === 'custom') {
          start = this.customRange.start.valueOf();
          end = this.customRange.end.valueOf();
        }else{
          start = moment().subtract(1, this.period).valueOf();
          end = moment().valueOf();
        }

        const response = await axios.get<BitcoinPrice[]>('/api/bitcoin-history', {
          params: { start, end }
        })
        this.prices = response.data
      } catch (error) {
        console.error(`Ошибка в fetch`);        
      }
    },  

    setCustomRange(start: number, end: number): void {
      this.customRange.start = start
      this.customRange.end = end
      if (this.period === 'custom') {
        this.fetchData()
      }
    }
  },
});
