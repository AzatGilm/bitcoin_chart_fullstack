<template>
  <div>
    <period-selector />
    <ChartBitCoin />
  </div>
</template>

<script>
import ChartBitCoin from "../components/ChartBitCoin.vue";
import PeriodSelector from "../components/PeriodSelector.vue";
// import { useBitCoinStore } from '../stores/BitcoinStore';

export default {
  components: { ChartBitCoin, PeriodSelector },
  // components: { PeriodSelector },

};
</script>

<style></style>
