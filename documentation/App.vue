<template>
  <div id="app">
    <h1>Quick Edit</h1>
    <div class="app-display">
      <quick-edit
        v-model="textValue"
        :buttonCancelText="buttonCancelText"
        :buttonOkText="buttonOkText"
        :emptyText="emptyText"
        :booleanYesText="booleanYesText"
        :booleanNoText="booleanNoText"
        :mode="mode"
        :options="options"
        :placeholderValue="placeholderValue"
        :type="type"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :multiple="multiple"
        :min="min"
        :max="max"
        :maxlength="maxlength"
        :showButtons="showButtons"
        @beforeinput="log"
        @input="log"
        @close="log"
        @show="log"
      ></quick-edit>
      <hr>
      <h2>Custom slots</h2>
      <quick-edit
        v-model="textValue"
        :buttonCancelText="buttonCancelText"
        :buttonOkText="buttonOkText"
        :emptyText="emptyText"
        :booleanYesText="booleanYesText"
        :booleanNoText="booleanNoText"
        :mode="mode"
        :options="options"
        :placeholderValue="placeholderValue"
        :type="type"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :multiple="multiple"
        :min="min"
        :max="max"
        :maxlength="maxlength"
        :showButtons="showButtons"
        @beforeinput="log"
        @input="log"
        @close="log"
        @show="log"
      >
        <template v-slot:default="{ value, options, rawValue }">
          <span>The value is "{{ value }}" and the raw value is "{{ rawValue }}"</span>
        </template>
        <span slot="button-ok">✔</span>
        <span slot="button-cancel">×</span>
      </quick-edit>
      <hr>
    </div>
    <div class="app-properties">
      <h2>Properties</h2>
      <div>
        <label>
          Type
          <quick-edit v-model="type" type="select" :options="types"></quick-edit>
        </label>
        <label>
          Empty text
          <quick-edit v-model="emptyText"></quick-edit>
        </label>
      </div>
      <div>
        <label>
          Button Cancel text
          <quick-edit v-model="buttonCancelText"></quick-edit>
        </label>
        <label>
          Button Ok text
          <quick-edit v-model="buttonOkText"></quick-edit>
        </label>
        <label>
          Show buttons
          <quick-edit v-model="showButtons" type="boolean"></quick-edit>
        </label>
      </div>

      <div>
        <label>
          Boolean Yes text
          <quick-edit v-model="booleanYesText"></quick-edit>
        </label>
        <label>
          Boolean No text
          <quick-edit v-model="booleanNoText"></quick-edit>
        </label>
      </div>
      <div>
        <label>
          Click outside mode
          <quick-edit v-model="mode" type="select" :options="modes"></quick-edit>
        </label>
      </div>
      <div>
        <label>
          Required
          <quick-edit v-model="required" type="boolean"></quick-edit>
        </label>
        <label>
          Disabled
          <quick-edit v-model="disabled" type="boolean"></quick-edit>
        </label>
        <label>
          Read only
          <quick-edit v-model="readonly" type="boolean"></quick-edit>
        </label>
        <label>
          Min
          <quick-edit v-model="min" type="number"></quick-edit>
        </label>
        <label>
          Max
          <quick-edit v-model="max" type="number"></quick-edit>
        </label>
        <label>
          Max length
          <quick-edit v-model="maxlength" type="number"></quick-edit>
        </label>
      </div>
      <div>
        <label>
          Placeholder value
          <quick-edit v-model="placeholderValue"></quick-edit>
        </label>
        <label>
          Multiple
          <quick-edit v-model="multiple" type="boolean"></quick-edit>
        </label>
      </div>
    </div>
    <div class="example-display">
      <h2>Example configurations</h2>
      Start open without buttons and ignore outside click.
      <quick-edit start-open :showButtons="false" mode="ignore"></quick-edit>
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
  data() {
    return {
      buttonCancelText: 'Cancel',
      buttonOkText: 'Ok',
      booleanYesText: 'Yes',
      booleanNoText: 'No',
      classes: {},
      emptyText: 'Edit me!',
      mode: 'ok',
      placeholderValue: '',
      type: 'text',
      required: false,
      readonly: false,
      disabled: false,
      multiple: false,
      showButtons: true,
      min: 0,
      max: 100,
      maxlength: 10,
      textValue: '',
      multipleValue: [],
      options: [
        {
          text: 'Foo',
          value: 'fooValue',
        },
        {
          text: 'Bar',
          value: 'barValue',
        },
        {
          text: 'Qux',
          value: 'quxValue',
        },
      ],
      types: [
        'text',
        'textarea',
        'select',
        'checkbox',
        'radio',
        'boolean',
        // Input types
        'button',
        'color',
        'date',
        'datetime',
        'email',
        'file',
        'hidden',
        'image',
        'month',
        'note',
        'number',
        'password',
        'range',
        'reset',
        'search',
        'submit',
        'tel',
        'time',
        'url',
        'week',
      ],
      modes: ['ok', 'cancel', 'ignore'],
    };
  },
  methods: {
    log(...args) {
      console.log(...args);
    },
  },
};
</script>

<style lang="scss">
body {
  color: #f8f8f8;
  background: #333;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 60px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > div {
    width: 740px;
  }

  .app-properties {
    > div {
      margin: 0 8px 8px 0;

      > label {
        display: block;
      }
      .vue-quick-edit {
        display: inline-block;
        margin-left: 8px;
      }
    }
  }
}
</style>
