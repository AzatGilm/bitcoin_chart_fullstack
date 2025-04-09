import axios from "axios";
import moment, { type Moment } from "moment";
import { defineStore } from "pinia";

interface CoinCapResponse {
  data: {
    priceUsd: string;
    time: number;
  }[];
}

interface CustomRange {
  start: number;
  end: number;
}
interface ApiResponse {
  success: boolean;
  data: BitcoinPrice[];
}

interface BitcoinPrice {
  timestamp: number;
  price: number;
}

interface BitcoinState {
  prices: BitcoinPrice[];
  period: "days" | "week" | "month" | "year" | "custom";
  customRange: CustomRange;
}

export const useBitCoinStore = defineStore("bitcoin", {
  state: (): BitcoinState => ({
    prices: [],
    period: "days",
    customRange: {
      start: moment().subtract(2, "day").valueOf(),
      end: moment().subtract(1, "day").valueOf(),
    },
  }),
  actions: {
    async fetchData(): Promise<void> {
      try {
        let start: number;
        let end: number;

        if (this.period === "custom") {
          start = this.customRange.start; 
          end = this.customRange.end; 
        } else if (this.period === "days") {
          start = moment().subtract(2, this.period).valueOf();
          end = moment().subtract(1, this.period).valueOf();
          const response = await axios.get<CoinCapResponse>(
            `https://api.coincap.io/v2/assets/bitcoin/history`,
            {
              params: {
                interval: "h2",
                start: start,
                end: end
              }
            }
          );

          this.prices = response.data.data.map(item => ({
            timestamp: item.time,
            price: parseFloat(item.priceUsd)
          }));
          
          console.log("CoinCap data:", this.prices);
          return;
          
        } else {
          start = moment().subtract(1, this.period).valueOf();
          end = moment().valueOf();
        }

        const response = await axios.get<ApiResponse>(
          "http://localhost:5000/api/prices",
          { params: { start, end } }
        );
        
        this.prices = response.data.success
          ? response.data.data.map((item) => ({
              timestamp: Number(item.timestamp),
              price: Number(item.price),
            }))
          : [];
          console.log(this.prices);
          
      } catch (error) {
        console.error("Ошибка:", error);
        this.prices = []; 
      }
    },

    setCustomRange(start: number, end: number): void {
      this.customRange.start = start;
      this.customRange.end = end;
      if (this.period === "custom") {
        this.fetchData();
      }
    },
  },
});
