<template>
  <div class="period-selector">
    <!-- Select для станд периодов -->
    <select name="" id="" v-model="period">
      <option value="day">День</option>
      <option value="week">Неделя</option>
      <option value="month">Месяц</option>
      <option value="year">Год</option>
      <option value="custom">Вручную</option>
    </select>

    <!-- Поля для кастомного периода -->
    <div v-if="period === 'custom'" class="custom-range">
      <div class="date-field">
        <label>Начало:</label>
        <input type="date" v-model="startDateStr" />
      </div>
      <div class="date-field">
        <label>Конец:</label>
        <input type="date" v-model="endDateStr" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState, mapWritableState, mapActions } from "pinia";
import moment from "moment";
import { useBitCoinStore } from "../stores/BitcoinStore";

export default {
  name: "PeriodSelector",
  data() {
    return {};
  },
  computed: {
    ...mapWritableState(useBitCoinStore, ["period"]),
    ...mapState(useBitCoinStore, ["customRange"]),

    startDateStr: {
      get(): string {
        return moment(this.customRange.start).format("YYYY-MM-DD");
      },
      set(value: string) {
        const date = moment(value).valueOf();
        this.setCustomRange(date, this.customRange.end);
      },
    },
    endDateStr: {
      get(): string {
        return moment(this.customRange.end).format("YYYY-MM-DD");
      },
      set(value: string) {
        const date = moment(value).valueOf();
        this.setCustomRange(this.customRange.start, date);
      },
    },
  },
  methods: {
    ...mapActions(useBitCoinStore, ["setCustomRange", "fetchData"]),
  },
  mounted() {
    console.log("Компонент смонтирован");
    this.fetchData(); // Вызов вручную
  },
  watch: {
    // При изменении периода запускаем загрузку данных

    period(newVal) {
      console.log("Period changed from", newVal);
      if (newVal !== "custom") {
        this.fetchData();
      }
    },
  },
};
</script>

<style></style>
