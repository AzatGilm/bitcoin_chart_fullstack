<template>
  <div class="bitcoin-chart">
    <h2>График изменения цены биткоина</h2>
    <div v-if="loading" class="loading">Загрузка данных...</div>
    <div v-else-if="error" class="error">
      Ошибка загрузки данных
    </div>
    <ClientOnly>
      <div v-if="chartComponent">
        <component
          :is="chartComponent"
          ref="chart"
          type="line"
          height="350"
          :options="chartOptions"
          :series="series"
        />
      </div>
    </ClientOnly>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useBitCoinStore } from '../stores/BitcoinStore'

export default {
  data() {
    return {
      loading: false,
      error: false,
      chartComponent: null,
      chartOptions: {
        chart: {
          animations: { enabled: false },
          toolbar: { show: false }
        },
        xaxis: { 
          type: 'datetime',
          labels: {
            formatter: (value) => {
              return new Date(value).toLocaleDateString()
            }
          }
        },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#4bc0c0'],
        tooltip: {
          x: {
            format: 'dd MMM yyyy HH:mm'
          }
        }
      },
      series: [{ name: 'Цена BTC', data: [] }]
    }
  },
  async mounted() {
    await this.loadChartLibrary()
    await this.loadData()
  },
  computed: {
    ...mapState(useBitCoinStore, ['prices', 'period'])
  },
  methods: {
    ...mapActions(useBitCoinStore, ['fetchData']),
    
    async loadChartLibrary() {
      if (process.client) {
        const VueApexCharts = await import('vue3-apexcharts')
        this.chartComponent = VueApexCharts.default
      }
    },
    
    async loadData() {
      this.loading = true
      this.error = false
      try {
        await this.fetchData()
        this.updateChart(this.prices)
      } catch (e) {
        console.error('Ошибка:', e)
        this.error = true
      } finally {
        this.loading = false
      }
    },
    
    updateChart(prices) {
      if (!prices || !prices.length) return
      
      this.series = [{
        name: 'Цена BTC',
        data: prices.map(item => ({
          x: new Date(item.timestamp),
          y: item.price.toFixed(2)
        }))
      }]
    }
  },
  watch: {
    period() {
      this.loadData()
    },
    prices(newVal) {
      this.updateChart(newVal)
    }
  }
}
</script>

<style scoped>
.bitcoin-chart {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #ff5252;
}
</style>
