# vue-quick-edit

> In-place editing with native HTML inputs. Inspired by x-editable

## [Example](https://a1rpun.github.io/vue-quick-edit/)

## Features
- [x] In-place editing
- [x] Multiple input types
- [x] Native element property bindings
- [x] Theming with CSS overrides or even apply your own classes
- [ ] Keyboard support

## Install

```shell
$ npm install --save vue-quick-edit
```

**Global include**
```
import QuickEdit from 'vue-quick-edit';

Vue.component('quick-edit', QuickEdit);
```

**Local include**
```
import QuickEdit from 'vue-quick-edit';

export default {
  components: {
    QuickEdit,
  },
};
```

## Usage

```html
<quick-edit v-model="myValue"><quick-edit>
```

### Bootstrap theme

Set up the classes for the corresponding elements
```
vueQuickEditClasses: {
  wrapper: 'form-group form-inline',
  input: 'form-control input-sm',
  buttons: 'btn-group btn-group-sm',
  buttonOk: 'btn btn-primary',
  buttonCancel: 'btn btn-link',
},
```

Use it like this

```html
<quick-edit :classes="vueQuickEditClasses"><quick-edit>
```

### Custom theme

For example just override this class in your style
```css
.vue-quick-edit__link {
  color: #BADA55;
}
```

## Properties

Name | Type | Default | Description
--- | --- | --- | ---
buttonCancelText | String | Cancel | The text on the Cancel button.
buttonOkText | String | Ok | The text on the Ok button.
classes | Object | See Description | buttonCancel: 'vue-quick-edit__button--cancel'<br>  buttonOk: 'vue-quick-edit__button--ok'<br>  buttons: 'vue-quick-edit__buttons'<br>  input: 'vue-quick-edit__input'<br>  link: 'vue-quick-edit__link'<br>  wrapper: ''
emptyText | String | Empty | The text to display when there is a falsy value in the `v-model` directive.
mode | String | ok | Specify what the input should do when the user clicks outside of the component. Possible options are `ok`,`cancel` or `ignore`.
options | Array | [] | The options to display for a `select`, `checkbox` or `radio` type.
placeholderValue | String | `''` | When you pass a `placeholder` to a select it will display the placeholder as the first default option, you can set the value of this option with `placeholderValue`.
theme | String | `''` | For now if you pass a truthy value `vue-quick-edit` will apply bootstrap classes.
type | String | input | This can be `input`, `textarea`, `select`, `checkbox`, `radio` or any other type you can pass to `input`.
v-model | String, Number, Array | `''` | The value .

## Events
Name | Parameters | Description
--- | --- | ---
beforeinput | Current input value | After the user has interacted with the "ok" button this event will fire the current input value just before the `input` event gets fired.
close | Current value | Fires when the user has interacted with the "ok" or "close" button.
input | Current value | Fires when the user has interacted with the "ok" button.
show | Current value | Fires when the user has interacted with the display label.

## Slots
Name | Default | Description
--- | --- | ---
button-ok | `<slot>{{ buttonOkText }}</slot>` | A slot to use HTML as a the Ok button text, useful for FontAwesome.
button-cancel | `<slot>{{ buttonCancelText }}</slot>` | A slot to use HTML as the Cancel button text, useful for FontAwesome.
prepend | `<slot></slot>` | Prepend HTML before the display text
append | `<slot></slot>` | Append HTML after the display text
