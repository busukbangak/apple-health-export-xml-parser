<script setup lang="ts">
import { ref } from 'vue';
import convert from 'xml-js';
import DatePicker from 'vue-datepicker-next';
import 'vue-datepicker-next/index.css';

const HEALTH_DATA_TYPES = [
  'HKQuantityTypeIdentifierHeartRate',
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
  'HKQuantityTypeIdentifierBasalEnergyBurned',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierFlightsClimbed',
  'HKQuantityTypeIdentifierAppleExerciseTime',
  'HKQuantityTypeIdentifierWalkingDoubleSupportPercentage',
  'HKQuantityTypeIdentifierWalkingSpeed',
  'HKQuantityTypeIdentifierWalkingStepLength',
  'HKQuantityTypeIdentifierWalkingAsymmetryPercentage',
  'HKCategoryTypeIdentifierAppleStandHour',
  'HKCategoryTypeIdentifierMindfulSession'
]

let dateRange = ref();
let file = ref();
let healtDataType = ref<string>('HKQuantityTypeIdentifierHeartRate');
let result = ref<any>([]);
let mean = ref<number>();

function onFileSelected(ev: any) {
  file.value = ev.target.files[0];
}

function startHealthDataXMLParser() {
  if (!file.value) {
    alert('Pick a file');
    return;
  }

  if (!dateRange.value) {
    alert('Pick a date');
    return;
  }

  const reader = new FileReader();
  reader.readAsText(file.value as any);

  reader.onload = e => {
    // Reset previous values
    result.value = [];

    const exportedHealthData = convert.xml2js(e.target?.result as string, { compact: true });
    let healthRecords = (exportedHealthData as any).HealthData.Record;

    let startDate = new Date(dateRange.value[0]);
    let endDate = new Date(dateRange.value[1]);

    for (let healthRecord of healthRecords) {
      let healthDate = new Date(healthRecord._attributes.startDate);
      let healthType = healthRecord._attributes.type;
      let healthValue = isNaN(Number(healthRecord._attributes.value)) ? healthRecord._attributes : Number(healthRecord._attributes.value);

      if (healthType != healtDataType.value || healthDate.getTime() <= startDate.getTime() || healthDate.getTime() >= endDate.getTime()) continue;
      result.value.push(healthValue)
    }

    mean.value = calculateMean(result.value) as any;

    console.log('HEALTH DATA \n', exportedHealthData);
    console.log('FILTERED RESULTS \n', result.value);
    console.log('MEAN \n', mean.value)
  };

  function calculateMean(values: any) {
    return values.reduce((a: any, b: any) => a + b, 0) / values.length;
  }
}

</script>

<template>
  <header>
    <h1>APPLE HEALTH EXPORT XML PARSER</h1>
    <h2>For HealthKit Export Version: 11</h2>
    <p>Parses health data from apple health. Currently only calculates mean for the selected data type if the values are
      numbers. Check console for more parsed data info.</p>
  </header>

  <main>
    <p>File</p>
    <input type="file" @change="onFileSelected">
    <p>Date Range</p>
    <date-picker v-model:value="dateRange" range confirm="true" type="datetime"></date-picker>
    <p>Health Data Type</p>
    <select v-model="healtDataType">
      <option v-for="type in HEALTH_DATA_TYPES" :value="type">{{ type }}</option>
    </select>
    <button @click="startHealthDataXMLParser">Start</button>
    <p>Calculated Mean: {{ mean ? mean : 'null' }}</p>

  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    flex-direction: column;
    padding-right: calc(var(--section-gap) / 2);
  }

  main {
    display: flex;
    flex-direction: column;
  }

  .logo {
    margin: 0 2rem 0 0;
  }
}
</style>
