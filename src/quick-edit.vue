<template>
  <div ref="el" :class="classes.wrapper" @click="clickInside">
    <template v-if="inputState === states.edit && isEnabled">
      <select
        v-if="type === types.select"
        :class="classes.input"
        v-model="inputValue"
        v-bind="$attrs"
        :tabindex="$attrs.tabindex || 0"
      >
        <option v-show="$attrs.placeholder" :value="placeholderValue">{{ $attrs.placeholder }}</option>
        <option
          v-for="option in displayOptions"
          :key="option.value"
          :value="option.value"
        >{{ option.text }}</option>
      </select>
      <textarea
        v-else-if="type === types.textarea"
        :class="classes.input"
        v-model="inputValue"
        v-bind="$attrs"
        :tabindex="$attrs.tabindex || 0"
      ></textarea>
      <template
        v-else-if="type === types.radio || type === types.checkbox"
        v-for="option in displayOptions"
      >
        <label :key="option.value">
          {{ option.text }}
          <input
            :type="type"
            :value="option.value"
            v-model="inputValue"
            v-bind="$attrs"
            :tabindex="$attrs.tabindex || 0"
          >
        </label>
      </template>
      <input
        v-else
        :class="classes.input"
        :type="type"
        v-model="inputValue"
        v-bind="$attrs"
        :tabindex="$attrs.tabindex || 0"
      >
      <div :class="classes.buttons">
        <button
          :class="classes.buttonOk"
          :title="buttonOkText"
          :disabled="isRequired && !inputValue"
          @click="ok"
        >
          <slot name="button-ok">{{ buttonOkText }}</slot>
        </button>
        <button :class="classes.buttonCancel" @click="close" :title="buttonCancelText">
          <slot name="button-cancel">{{ buttonCancelText }}</slot>
        </button>
      </div>
    </template>
    <template v-else>
      <slot name="prepend"></slot>
      <span
        :class="{
          [classes.link]: true,
          'vue-quick-edit__link--is-clickable': isEnabled,
          'vue-quick-edit__link--is-empty': !prettyValue,
          'vue-quick-edit__link--is-required': isRequired && !prettyValue,
        }"
        :tabindex="$attrs.tabindex || 0"
        @click="show"
      >{{ displayValue }}</span>
      <slot name="append"></slot>
    </template>
  </div>
</template>

<script>
import { setTimeout } from 'timers';

const mune = keys =>
  keys.reduce((acc, cur) => {
    acc[cur] = cur;
    return acc;
  }, {});

export default {
  name: 'QuickEdit',
  props: {
    buttonOkText: {
      type: String,
      default: 'Ok',
    },
    buttonCancelText: {
      type: String,
      default: 'Cancel',
    },
    emptyText: {
      type: String,
      default: 'Empty',
    },
    type: {
      type: String,
      default: 'input',
    },
    options: {
      type: Array,
      default() {
        return [];
      },
    },
    mode: {
      type: String,
      default: 'ok',
    },
    value: {
      type: [String, Number, Array],
      default: '',
    },
    placeholderValue: {
      type: String,
      default: '',
    },
    classes: {
      type: Object,
      default() {
        return {
          buttonCancel: 'vue-quick-edit__button--cancel',
          buttonOk: 'vue-quick-edit__button--ok',
          buttons: 'vue-quick-edit__buttons',
          input: 'vue-quick-edit__input',
          link: 'vue-quick-edit__link',
          wrapper: '',
        };
      },
    },
  },
  computed: {
    isEnabled() {
      return typeof this.$attrs.disabled === 'undefined' || !this.$attrs.disabled;
    },
    isRequired() {
      return typeof this.$attrs.required !== 'undefined' || this.$attrs.required;
    },
    prettyValue() {
      return Array.isArray(this.theValue) ? this.theValue.join(', ') : this.theValue;
    },
    displayOptions() {
      const [firstEl] = this.options;
      return firstEl && typeof firstEl === 'string'
        ? this.options.map(x => ({
            value: x,
            text: x,
          }))
        : this.options;
    },
    displayValue() {
      return this.prettyValue || this.emptyText;
    },
  },
  watch: {
    value(value) {
      this.setValue(value);
    },
  },
  data() {
    const states = mune(['static', 'edit']);

    return {
      inputState: states.static,
      theValue: '',
      inputValue: '',
      types: mune(['input', 'select', 'textarea', 'radio', 'checkbox']),
      states,
    };
  },
  methods: {
    show() {
      this.inputValue = this.theValue;
      this.inputState = this.states.edit;
      setTimeout(() => {
        const el = this.$refs.el.querySelector('input,select,textarea');
        el && el.focus();
      }, 0);
      this.$emit('show', this.theValue);
    },
    close() {
      this.inputState = this.states.static;
      this.$emit('close', this.theValue);
    },
    ok() {
      this.$emit('beforeinput', this.inputValue);
      this.theValue = this.inputValue;
      this.$emit('input', this.theValue);
      this.close();
    },
    setValue(value) {
      this.theValue = value;
      this.inputValue = value;
    },
    clickInside() {
      this.inside = true;
      setTimeout(() => (this.inside = false), 0);
    },
    clickOutside() {
      if (this.inside) return;
      if (this.mode === 'ok') this.ok();
      else if (this.mode === 'cancel') this.close();
    },
  },
  created() {
    this.setValue(this.value);
    this.__handlerRef__ = this.clickOutside.bind(this);
    document.body.addEventListener('click', this.__handlerRef__);
  },
  destroyed() {
    document.body.removeEventListener('click', this.__handlerRef__);
  },
};
</script>

<style lang="scss">
$link-color: #0088cc;
$link-hover-color: #2a6496;
$success-color: #3276b1;
$success-text-color: #fff;
$success-border-color: #357ebd;
$danger-color: #dc3545;
$default-color: #fff;
$default-text-color: #333;
$quick-edit-height: 32px;

.vue-quick-edit {
  &__link {
    white-space: pre-wrap;
    color: $link-color;

    &--is-clickable {
      border-bottom: 1px dashed $link-color;
      cursor: pointer;
      &:hover {
        color: $link-hover-color;
        border-color: $link-hover-color;
      }
    }

    &--is-empty {
      font-style: italic;
    }

    &--is-required {
      color: $danger-color;
    }
  }

  &__input {
    background-color: #f9f9f9;
    color: #333;
    border: 1px solid #ccc;
    height: $quick-edit-height;
    padding: 0;
  }

  &__buttons {
    margin-top: 8px;

    button {
      height: $quick-edit-height + 2px;
      border: 1px solid #ccc;

      &[disabled] {
        color: $default-text-color;
        background-color: #ccc;
        border-color: #ddd;
      }
    }
  }

  &__button {
    &--ok {
      color: $success-text-color;
      background-color: $success-color;
      border-color: $success-border-color;
    }

    &--cancel {
      color: $default-text-color;
      margin-left: 8px;
      background-color: $default-color;
    }
  }
}

[multiple].vue-quick-edit__input,
textarea.vue-quick-edit__input {
  height: unset;
  min-height: $quick-edit-height * 2;
  display: block;
}

.vue-quick-edit__input:not(textarea):not([multiple]) + .vue-quick-edit__buttons,
label + .vue-quick-edit__buttons {
  display: inline;
  margin-left: 8px;
}

// Bootstrap theme override
.form-group {
  margin-bottom: 0;
}
.btn-group {
  display: inline-block;
}
</style>
