<template>
  <div id="app">
    <label>
      Disabled
      <input type="checkbox" v-model="disabled">
    </label>
    <div class="wrapper">
      <span>Default</span>
      <quick-edit v-model="textValue"></quick-edit>
      <span>Properties</span>
      <quick-edit v-model="textValue" emptyText="-" buttonOkText="✔" buttonCancelText="×"></quick-edit>
      <span>Input attributes</span>
      <quick-edit
        v-model="textValue"
        :disabled="disabled"
        :maxlength="10"
        placeholder="Set a value"
        required
      ></quick-edit>
      <span>Number</span>
      <quick-edit v-model="numberValue" :disabled="disabled" type="number" :min="0" :max="42"></quick-edit>
      <span>Checkbox</span>
      <quick-edit
        v-model="checkboxtValue"
        :disabled="disabled"
        type="checkbox"
        :options="selectOptions"
      ></quick-edit>
      <span>Radio</span>
      <quick-edit v-model="radioValue" :disabled="disabled" type="radio" :options="selectOptions"></quick-edit>
      <span>Email</span>
      <quick-edit v-model="textValue" :disabled="disabled" type="email"></quick-edit>
      <span>Date</span>
      <quick-edit v-model="dateValue" :disabled="disabled" type="date"></quick-edit>
      <span>Time</span>
      <quick-edit v-model="timeValue" :disabled="disabled" type="time"></quick-edit>
      <span>Select</span>
      <quick-edit type="select" v-model="selectValue" :disabled="disabled" :options="selectOptions"></quick-edit>
      <span>Select with placeholder</span>
      <quick-edit
        type="select"
        v-model="selectValue"
        :disabled="disabled"
        :options="selectOptions"
        placeholder="test"
      ></quick-edit>
      <span>Multiple select</span>
      <quick-edit
        type="select"
        v-model="selectMultipleValue"
        :disabled="disabled"
        :options="selectOptions"
        multiple
      ></quick-edit>
      <span>Textarea</span>
      <quick-edit type="textarea" v-model="textareaValue" :disabled="disabled"></quick-edit>
      <span>Custom slots</span>
      <quick-edit :value="timeDateValue" :disabled="disabled" class="input-group">
        <span slot="prepend" class="input-group-addon">&gt;&gt;</span>
        <span slot="append" class="input-group-addon">&lt;&lt;</span>
        <span slot="button-ok">✔</span>
        <span slot="button-cancel">×</span>
        <div>
          <input type="time" v-model="timeValue">
          <input type="date" v-model="dateValue">
        </div>
      </quick-edit>
      <span>Custom classes</span>
      <quick-edit v-model="textValue" :disabled="disabled" class="form-group"></quick-edit>
    </div>
  </div>
</template>

<script>
import QuickEdit from './../src/quick-edit.vue';

export default {
  name: 'app',
  components: {
    QuickEdit,
  },
  computed: {
    timeDateValue() {
      return `${this.dateValue}${this.timeValue}`;
    },
  },
  data() {
    return {
      disabled: false,
      textValue: '',
      numberValue: 0,
      textareaValue: '',
      radioValue: '',
      checkboxtValue: [],
      selectValue: '',
      selectMultipleValue: [],
      selectOptions: ['foo', 'bar', 'qux'],
      timeValue: '',
      dateValue: '',
    };
  },
};
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.wrapper {
  > * {
    margin: 8px;
    // border-top: 1px solid #s333;
  }
}
</style>
