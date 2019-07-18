(function (global, factory) {
            typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
            typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = global || self, factory(global.QuickEdit = {}));
}(this, function (exports) { 'use strict';

            var global$1 = (typeof global !== "undefined" ? global :
                        typeof self !== "undefined" ? self :
                        typeof window !== "undefined" ? window : {});

            if (typeof global$1.setTimeout === 'function') ;
            if (typeof global$1.clearTimeout === 'function') ;

            // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
            var performance = global$1.performance || {};
            var performanceNow =
              performance.now        ||
              performance.mozNow     ||
              performance.msNow      ||
              performance.oNow       ||
              performance.webkitNow  ||
              function(){ return (new Date()).getTime() };

            var tasksByHandle = {};
            var currentlyRunningATask = false;
            var doc = global$1.document;

            function clearImmediate(handle) {
                delete tasksByHandle[handle];
            }

            function run(task) {
                var callback = task.callback;
                var args = task.args;
                switch (args.length) {
                case 0:
                    callback();
                    break;
                case 1:
                    callback(args[0]);
                    break;
                case 2:
                    callback(args[0], args[1]);
                    break;
                case 3:
                    callback(args[0], args[1], args[2]);
                    break;
                default:
                    callback.apply(undefined, args);
                    break;
                }
            }

            function runIfPresent(handle) {
                // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
                // So if we're currently running a task, we'll need to delay this invocation.
                if (currentlyRunningATask) {
                    // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
                    // "too much recursion" error.
                    setTimeout(runIfPresent, 0, handle);
                } else {
                    var task = tasksByHandle[handle];
                    if (task) {
                        currentlyRunningATask = true;
                        try {
                            run(task);
                        } finally {
                            clearImmediate(handle);
                            currentlyRunningATask = false;
                        }
                    }
                }
            }

            function canUsePostMessage() {
                // The test against `importScripts` prevents this implementation from being installed inside a web worker,
                // where `global.postMessage` means something completely different and can't be used for this purpose.
                if (global$1.postMessage && !global$1.importScripts) {
                    var postMessageIsAsynchronous = true;
                    var oldOnMessage = global$1.onmessage;
                    global$1.onmessage = function() {
                        postMessageIsAsynchronous = false;
                    };
                    global$1.postMessage("", "*");
                    global$1.onmessage = oldOnMessage;
                    return postMessageIsAsynchronous;
                }
            }

            function installPostMessageImplementation() {
                // Installs an event handler on `global` for the `message` event: see
                // * https://developer.mozilla.org/en/DOM/window.postMessage
                // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

                var messagePrefix = "setImmediate$" + Math.random() + "$";
                var onGlobalMessage = function(event) {
                    if (event.source === global$1 &&
                        typeof event.data === "string" &&
                        event.data.indexOf(messagePrefix) === 0) {
                        runIfPresent(+event.data.slice(messagePrefix.length));
                    }
                };

                if (global$1.addEventListener) {
                    global$1.addEventListener("message", onGlobalMessage, false);
                } else {
                    global$1.attachEvent("onmessage", onGlobalMessage);
                }
            }

            function installMessageChannelImplementation() {
                var channel = new MessageChannel();
                channel.port1.onmessage = function(event) {
                    var handle = event.data;
                    runIfPresent(handle);
                };
            }

            function installReadyStateChangeImplementation() {
                var html = doc.documentElement;
            }

            // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
            var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global$1);
            attachTo = attachTo && attachTo.setTimeout ? attachTo : global$1;

            // Don't get fooled by e.g. browserify environments.
            if ({}.toString.call(global$1.process) === "[object process]") ; else if (canUsePostMessage()) {
                // For non-IE10 modern browsers
                installPostMessageImplementation();

            } else if (global$1.MessageChannel) {
                // For web workers, where supported
                installMessageChannelImplementation();

            } else if (doc && "onreadystatechange" in doc.createElement("script")) {
                // For IE 6–8
                installReadyStateChangeImplementation();

            }

            // DOM APIs, for completeness
            var apply = Function.prototype.apply;
            function clearTimeout(timeout) {
              if (typeof timeout === 'number' && typeof global$1.clearTimeout === 'function') {
                global$1.clearTimeout(timeout);
              } else {
                clearFn(timeout);
              }
            }
            function clearFn(timeout) {
              if (timeout && typeof timeout.close === 'function') {
                timeout.close();
              }
            }
            function setTimeout$1() {
              return new Timeout(apply.call(global$1.setTimeout, window, arguments), clearTimeout);
            }

            function Timeout(id) {
              this._id = id;
            }
            Timeout.prototype.unref = Timeout.prototype.ref = function() {};
            Timeout.prototype.close = function() {
              clearFn(this._id);
            };

            //

            var mune = function (keys) { return keys.reduce(function (acc, cur) {
                acc[cur] = cur;
                return acc;
              }, {}); };
            var states = mune(['display', 'edit']);
            var events = mune(['input', 'rawInput', 'show', 'close', 'invalid', 'focusin']);
            var types = mune([
              'boolean',
              'checkbox',
              'input',
              'password',
              'radio',
              'select',
              'textarea',
              'url' ]);
            var modes = mune(['ok', 'cancel', 'ignore']);

            var script = {
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
                booleanYesText: {
                  type: String,
                  default: 'Yes',
                },
                booleanNoText: {
                  type: String,
                  default: 'No',
                },
                type: {
                  type: String,
                  default: types.input,
                },
                options: {
                  type: Array,
                  default: function default$1() {
                    return [];
                  },
                },
                mode: {
                  type: String,
                  default: modes.ok,
                  validator: function(value) {
                    return !!modes[value];
                  },
                },
                value: {
                  type: [String, Array, Boolean, Number],
                  default: '',
                },
                placeholderValue: {
                  type: String,
                  default: '',
                },
                classes: {
                  type: Object,
                  default: function default$2() {
                    return;
                  },
                },
                validator: {
                  type: Function,
                  default: null,
                },
                showButtons: {
                  type: Boolean,
                  default: true,
                },
                startOpen: {
                  type: Boolean,
                  default: false,
                },
              },
              computed: {
                isEmpty: function isEmpty() {
                  return '' === this.prettyValue || null === this.prettyValue;
                },
                isEditing: function isEditing() {
                  return states.edit === this.inputState;
                },
                isEnabled: function isEnabled() {
                  return !this.$attrs.disabled && this.$attrs.disabled !== '';
                },
                isRequired: function isRequired() {
                  return this.$attrs.required || '' === this.$attrs.required;
                },
                isMultiple: function isMultiple() {
                  return (
                    this.displayOptions.length &&
                    (this.types.select === this.type ||
                      this.types.checkbox === this.type ||
                      this.types.radio === this.type)
                  );
                },
                prettyValue: function prettyValue() {
                  return this.isMultiple
                    ? Array.isArray(this.theValue)
                      ? this.theValue.map(this.getDisplayOption).join(', ')
                      : this.getDisplayOption(this.theValue)
                    : this.theValue;
                },
                displayOptions: function displayOptions() {
                  var ref = this.options;
                  var firstEl = ref[0];
                  return firstEl && typeof firstEl === 'string'
                    ? this.options.map(function (x) { return ({ value: x, text: x }); })
                    : this.options;
                },
                displayValue: function displayValue() {
                  if (this.types.boolean === this.type)
                    { return this.theValue ? this.booleanYesText : this.booleanNoText; }
                  else if (this.types.password === this.type) { return '•'.repeat(8); }
                  return this.isEmpty ? this.emptyText : this.prettyValue;
                },
                classNames: function classNames() {
                  return Object.assign({}, this.defaultClasses, this.classes);
                },
                tabIndex: function tabIndex() {
                  return this.$attrs.tabindex || 0;
                },
              },
              watch: {
                value: function value(value$1) {
                  this.setValue(value$1);
                },
              },
              data: function data() {
                return {
                  inputState: this.startOpen ? states.edit : states.display,
                  theValue: '',
                  inputValue: '',
                  types: types,
                  defaultClasses: {
                    buttonCancel: 'vue-quick-edit__button vue-quick-edit__button--cancel',
                    buttonOk: 'vue-quick-edit__button vue-quick-edit__button--ok',
                    buttons: 'vue-quick-edit__buttons',
                    input: 'vue-quick-edit__input',
                    link: 'vue-quick-edit__link',
                    wrapper: 'vue-quick-edit',
                  },
                };
              },
              methods: {
                handleClick: function handleClick() {
                  if (!this.isEnabled) { return; }

                  if (this.types.boolean === this.type) {
                    this.theValue = !this.theValue;
                    this.$emit(events.input, this.theValue);
                  } else {
                    this.show();
                  }
                },
                handleFocus: function handleFocus(ref) {
                  var type = ref.type;

                  if (events.focusin === type) {
                    clearTimeout(this._handleFocus);
                  } else {
                    this._handleFocus = setTimeout$1(this.clickOutside, 0);
                  }
                },
                show: function show() {
                  this.inputValue = this.theValue;
                  this.inputState = states.edit;
                  this.$emit(events.show, this.theValue);
                  this.focus();
                },
                close: function close() {
                  this.inputState = states.display;
                  this.$emit(events.close, this.theValue);
                },
                ok: function ok() {
                  if (this.validator) {
                    var error = this.validator(this.inputValue);
                    if (error) {
                      this.$emit(events.invalid, this.theValue, error);
                      return;
                    }
                  }
                  this.theValue = this.inputValue;
                  this.$emit(events.input, this.theValue);
                  this.$emit(events.rawInput, this.inputValue);
                  this.close();
                },
                focus: function focus() {
                  var this$1 = this;

                  var className =
                    states.display === this.inputState
                      ? ("." + (this.classNames.link))
                      : ("." + (this.classNames.input));
                  setTimeout$1(function () {
                    var el = this$1.$refs.el && this$1.$refs.el.querySelector(className);
                    el && el.focus();
                  }, 0);
                },
                setValue: function setValue(value) {
                  this.theValue = value;
                  this.inputValue = value;
                },
                clickOutside: function clickOutside() {
                  if (this.inputState !== states.edit) { return; }
                  if (modes.ok === this.mode) { this.ok(); }
                  else if (modes.cancel === this.mode) { this.close(); }
                },
                getDisplayOption: function getDisplayOption(opt) {
                  var option = this.displayOptions.find(function (x) { return x.value === opt; });
                  return option ? option.text : '';
                },
              },
              created: function created() {
                this.setValue(this.value);
              },
            };

            function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
            /* server only */
            , shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
              if (typeof shadowMode !== 'boolean') {
                createInjectorSSR = createInjector;
                createInjector = shadowMode;
                shadowMode = false;
              } // Vue.extend constructor export interop.


              var options = typeof script === 'function' ? script.options : script; // render functions

              if (template && template.render) {
                options.render = template.render;
                options.staticRenderFns = template.staticRenderFns;
                options._compiled = true; // functional template

                if (isFunctionalTemplate) {
                  options.functional = true;
                }
              } // scopedId


              if (scopeId) {
                options._scopeId = scopeId;
              }

              var hook;

              if (moduleIdentifier) {
                // server build
                hook = function hook(context) {
                  // 2.3 injection
                  context = context || // cached call
                  this.$vnode && this.$vnode.ssrContext || // stateful
                  this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
                  // 2.2 with runInNewContext: true

                  if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                    context = __VUE_SSR_CONTEXT__;
                  } // inject component styles


                  if (style) {
                    style.call(this, createInjectorSSR(context));
                  } // register component module identifier for async chunk inference


                  if (context && context._registeredComponents) {
                    context._registeredComponents.add(moduleIdentifier);
                  }
                }; // used by ssr in case component is cached and beforeCreate
                // never gets called


                options._ssrRegister = hook;
              } else if (style) {
                hook = shadowMode ? function () {
                  style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
                } : function (context) {
                  style.call(this, createInjector(context));
                };
              }

              if (hook) {
                if (options.functional) {
                  // register for functional component in vue file
                  var originalRender = options.render;

                  options.render = function renderWithStyleInjection(h, context) {
                    hook.call(context);
                    return originalRender(h, context);
                  };
                } else {
                  // inject component registration as beforeCreate hook
                  var existing = options.beforeCreate;
                  options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
                }
              }

              return script;
            }

            var normalizeComponent_1 = normalizeComponent;

            var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
            function createInjector(context) {
              return function (id, style) {
                return addStyle(id, style);
              };
            }
            var HEAD;
            var styles = {};

            function addStyle(id, css) {
              var group = isOldIE ? css.media || 'default' : id;
              var style = styles[group] || (styles[group] = {
                ids: new Set(),
                styles: []
              });

              if (!style.ids.has(id)) {
                style.ids.add(id);
                var code = css.source;

                if (css.map) {
                  // https://developer.chrome.com/devtools/docs/javascript-debugging
                  // this makes source maps inside style tags work properly in Chrome
                  code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

                  code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
                }

                if (!style.element) {
                  style.element = document.createElement('style');
                  style.element.type = 'text/css';
                  if (css.media) { style.element.setAttribute('media', css.media); }

                  if (HEAD === undefined) {
                    HEAD = document.head || document.getElementsByTagName('head')[0];
                  }

                  HEAD.appendChild(style.element);
                }

                if ('styleSheet' in style.element) {
                  style.styles.push(code);
                  style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
                } else {
                  var index = style.ids.size - 1;
                  var textNode = document.createTextNode(code);
                  var nodes = style.element.childNodes;
                  if (nodes[index]) { style.element.removeChild(nodes[index]); }
                  if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }else { style.element.appendChild(textNode); }
                }
              }
            }

            var browser = createInjector;

            /* script */
            var __vue_script__ = script;

            /* template */
            var __vue_render__ = function() {
              var _obj;
              var _vm = this;
              var _h = _vm.$createElement;
              var _c = _vm._self._c || _h;
              return _c(
                "div",
                { ref: "el", class: _vm.classNames.wrapper },
                [
                  _vm.isEditing && _vm.isEnabled
                    ? [
                        _vm.types.select === _vm.type
                          ? _c(
                              "select",
                              _vm._b(
                                {
                                  directives: [
                                    {
                                      name: "model",
                                      rawName: "v-model",
                                      value: _vm.inputValue,
                                      expression: "inputValue"
                                    }
                                  ],
                                  class: _vm.classNames.input,
                                  attrs: { tabindex: _vm.tabIndex },
                                  on: {
                                    focusin: _vm.handleFocus,
                                    focusout: _vm.handleFocus,
                                    keyup: [
                                      function($event) {
                                        if (
                                          !$event.type.indexOf("key") &&
                                          _vm._k(
                                            $event.keyCode,
                                            "enter",
                                            13,
                                            $event.key,
                                            "Enter"
                                          )
                                        ) {
                                          return null
                                        }
                                        return _vm.ok($event)
                                      },
                                      function($event) {
                                        if (
                                          !$event.type.indexOf("key") &&
                                          _vm._k(
                                            $event.keyCode,
                                            "escape",
                                            undefined,
                                            $event.key,
                                            undefined
                                          )
                                        ) {
                                          return null
                                        }
                                        if (
                                          $event.ctrlKey ||
                                          $event.shiftKey ||
                                          $event.altKey ||
                                          $event.metaKey
                                        ) {
                                          return null
                                        }
                                        return _vm.close($event)
                                      }
                                    ],
                                    change: function($event) {
                                      var $$selectedVal = Array.prototype.filter
                                        .call($event.target.options, function(o) {
                                          return o.selected
                                        })
                                        .map(function(o) {
                                          var val = "_value" in o ? o._value : o.value;
                                          return val
                                        });
                                      _vm.inputValue = $event.target.multiple
                                        ? $$selectedVal
                                        : $$selectedVal[0];
                                    }
                                  }
                                },
                                "select",
                                _vm.$attrs,
                                false
                              ),
                              [
                                _c(
                                  "option",
                                  {
                                    directives: [
                                      {
                                        name: "show",
                                        rawName: "v-show",
                                        value: _vm.$attrs.placeholder,
                                        expression: "$attrs.placeholder"
                                      }
                                    ],
                                    domProps: { value: _vm.placeholderValue }
                                  },
                                  [_vm._v(_vm._s(_vm.$attrs.placeholder))]
                                ),
                                _vm._v(" "),
                                _vm._l(_vm.displayOptions, function(option) {
                                  return _c(
                                    "option",
                                    {
                                      key: option.value,
                                      domProps: { value: option.value }
                                    },
                                    [_vm._v(_vm._s(option.text))]
                                  )
                                })
                              ],
                              2
                            )
                          : _vm.types.textarea === _vm.type
                          ? _c(
                              "textarea",
                              _vm._b(
                                {
                                  directives: [
                                    {
                                      name: "model",
                                      rawName: "v-model",
                                      value: _vm.inputValue,
                                      expression: "inputValue"
                                    }
                                  ],
                                  class: _vm.classNames.input,
                                  attrs: { tabindex: _vm.tabIndex },
                                  domProps: { value: _vm.inputValue },
                                  on: {
                                    focusin: _vm.handleFocus,
                                    focusout: _vm.handleFocus,
                                    keyup: [
                                      function($event) {
                                        if (
                                          !$event.type.indexOf("key") &&
                                          _vm._k(
                                            $event.keyCode,
                                            "enter",
                                            13,
                                            $event.key,
                                            "Enter"
                                          )
                                        ) {
                                          return null
                                        }
                                        if (!$event.ctrlKey) {
                                          return null
                                        }
                                        return _vm.ok($event)
                                      },
                                      function($event) {
                                        if (
                                          !$event.type.indexOf("key") &&
                                          _vm._k(
                                            $event.keyCode,
                                            "escape",
                                            undefined,
                                            $event.key,
                                            undefined
                                          )
                                        ) {
                                          return null
                                        }
                                        if (
                                          $event.ctrlKey ||
                                          $event.shiftKey ||
                                          $event.altKey ||
                                          $event.metaKey
                                        ) {
                                          return null
                                        }
                                        return _vm.close($event)
                                      }
                                    ],
                                    input: function($event) {
                                      if ($event.target.composing) {
                                        return
                                      }
                                      _vm.inputValue = $event.target.value;
                                    }
                                  }
                                },
                                "textarea",
                                _vm.$attrs,
                                false
                              )
                            )
                          : _vm.types.radio === _vm.type || _vm.types.checkbox === _vm.type
                          ? _vm._l(_vm.displayOptions, function(option) {
                              return [
                                _c("label", { key: option.value }, [
                                  _vm._v("\n        " + _vm._s(option.text) + "\n        "),
                                  _vm.type === "checkbox"
                                    ? _c(
                                        "input",
                                        _vm._b(
                                          {
                                            directives: [
                                              {
                                                name: "model",
                                                rawName: "v-model",
                                                value: _vm.inputValue,
                                                expression: "inputValue"
                                              }
                                            ],
                                            attrs: {
                                              tabindex: _vm.tabIndex,
                                              type: "checkbox"
                                            },
                                            domProps: {
                                              value: option.value,
                                              checked: Array.isArray(_vm.inputValue)
                                                ? _vm._i(_vm.inputValue, option.value) > -1
                                                : _vm.inputValue
                                            },
                                            on: {
                                              focusin: _vm.handleFocus,
                                              focusout: _vm.handleFocus,
                                              keyup: [
                                                function($event) {
                                                  if (
                                                    !$event.type.indexOf("key") &&
                                                    _vm._k(
                                                      $event.keyCode,
                                                      "enter",
                                                      13,
                                                      $event.key,
                                                      "Enter"
                                                    )
                                                  ) {
                                                    return null
                                                  }
                                                  return _vm.ok($event)
                                                },
                                                function($event) {
                                                  if (
                                                    !$event.type.indexOf("key") &&
                                                    _vm._k(
                                                      $event.keyCode,
                                                      "escape",
                                                      undefined,
                                                      $event.key,
                                                      undefined
                                                    )
                                                  ) {
                                                    return null
                                                  }
                                                  if (
                                                    $event.ctrlKey ||
                                                    $event.shiftKey ||
                                                    $event.altKey ||
                                                    $event.metaKey
                                                  ) {
                                                    return null
                                                  }
                                                  return _vm.close($event)
                                                }
                                              ],
                                              change: function($event) {
                                                var $$a = _vm.inputValue,
                                                  $$el = $event.target,
                                                  $$c = $$el.checked ? true : false;
                                                if (Array.isArray($$a)) {
                                                  var $$v = option.value,
                                                    $$i = _vm._i($$a, $$v);
                                                  if ($$el.checked) {
                                                    $$i < 0 &&
                                                      (_vm.inputValue = $$a.concat([$$v]));
                                                  } else {
                                                    $$i > -1 &&
                                                      (_vm.inputValue = $$a
                                                        .slice(0, $$i)
                                                        .concat($$a.slice($$i + 1)));
                                                  }
                                                } else {
                                                  _vm.inputValue = $$c;
                                                }
                                              }
                                            }
                                          },
                                          "input",
                                          _vm.$attrs,
                                          false
                                        )
                                      )
                                    : _vm.type === "radio"
                                    ? _c(
                                        "input",
                                        _vm._b(
                                          {
                                            directives: [
                                              {
                                                name: "model",
                                                rawName: "v-model",
                                                value: _vm.inputValue,
                                                expression: "inputValue"
                                              }
                                            ],
                                            attrs: {
                                              tabindex: _vm.tabIndex,
                                              type: "radio"
                                            },
                                            domProps: {
                                              value: option.value,
                                              checked: _vm._q(_vm.inputValue, option.value)
                                            },
                                            on: {
                                              focusin: _vm.handleFocus,
                                              focusout: _vm.handleFocus,
                                              keyup: [
                                                function($event) {
                                                  if (
                                                    !$event.type.indexOf("key") &&
                                                    _vm._k(
                                                      $event.keyCode,
                                                      "enter",
                                                      13,
                                                      $event.key,
                                                      "Enter"
                                                    )
                                                  ) {
                                                    return null
                                                  }
                                                  return _vm.ok($event)
                                                },
                                                function($event) {
                                                  if (
                                                    !$event.type.indexOf("key") &&
                                                    _vm._k(
                                                      $event.keyCode,
                                                      "escape",
                                                      undefined,
                                                      $event.key,
                                                      undefined
                                                    )
                                                  ) {
                                                    return null
                                                  }
                                                  if (
                                                    $event.ctrlKey ||
                                                    $event.shiftKey ||
                                                    $event.altKey ||
                                                    $event.metaKey
                                                  ) {
                                                    return null
                                                  }
                                                  return _vm.close($event)
                                                }
                                              ],
                                              change: function($event) {
                                                _vm.inputValue = option.value;
                                              }
                                            }
                                          },
                                          "input",
                                          _vm.$attrs,
                                          false
                                        )
                                      )
                                    : _c(
                                        "input",
                                        _vm._b(
                                          {
                                            directives: [
                                              {
                                                name: "model",
                                                rawName: "v-model",
                                                value: _vm.inputValue,
                                                expression: "inputValue"
                                              }
                                            ],
                                            attrs: {
                                              tabindex: _vm.tabIndex,
                                              type: _vm.type
                                            },
                                            domProps: {
                                              value: option.value,
                                              value: _vm.inputValue
                                            },
                                            on: {
                                              focusin: _vm.handleFocus,
                                              focusout: _vm.handleFocus,
                                              keyup: [
                                                function($event) {
                                                  if (
                                                    !$event.type.indexOf("key") &&
                                                    _vm._k(
                                                      $event.keyCode,
                                                      "enter",
                                                      13,
                                                      $event.key,
                                                      "Enter"
                                                    )
                                                  ) {
                                                    return null
                                                  }
                                                  return _vm.ok($event)
                                                },
                                                function($event) {
                                                  if (
                                                    !$event.type.indexOf("key") &&
                                                    _vm._k(
                                                      $event.keyCode,
                                                      "escape",
                                                      undefined,
                                                      $event.key,
                                                      undefined
                                                    )
                                                  ) {
                                                    return null
                                                  }
                                                  if (
                                                    $event.ctrlKey ||
                                                    $event.shiftKey ||
                                                    $event.altKey ||
                                                    $event.metaKey
                                                  ) {
                                                    return null
                                                  }
                                                  return _vm.close($event)
                                                }
                                              ],
                                              input: function($event) {
                                                if ($event.target.composing) {
                                                  return
                                                }
                                                _vm.inputValue = $event.target.value;
                                              }
                                            }
                                          },
                                          "input",
                                          _vm.$attrs,
                                          false
                                        )
                                      )
                                ])
                              ]
                            })
                          : _vm.type === "checkbox"
                          ? _c(
                              "input",
                              _vm._b(
                                {
                                  directives: [
                                    {
                                      name: "model",
                                      rawName: "v-model",
                                      value: _vm.inputValue,
                                      expression: "inputValue"
                                    }
                                  ],
                                  class: _vm.classNames.input,
                                  attrs: { tabindex: _vm.tabIndex, type: "checkbox" },
                                  domProps: {
                                    checked: Array.isArray(_vm.inputValue)
                                      ? _vm._i(_vm.inputValue, null) > -1
                                      : _vm.inputValue
                                  },
                                  on: {
                                    focusin: _vm.handleFocus,
                                    focusout: _vm.handleFocus,
                                    keyup: [
                                      function($event) {
                                        if (
                                          !$event.type.indexOf("key") &&
                                          _vm._k(
                                            $event.keyCode,
                                            "enter",
                                            13,
                                            $event.key,
                                            "Enter"
                                          )
                                        ) {
                                          return null
                                        }
                                        return _vm.ok($event)
                                      },
                                      function($event) {
                                        if (
                                          !$event.type.indexOf("key") &&
                                          _vm._k(
                                            $event.keyCode,
                                            "escape",
                                            undefined,
                                            $event.key,
                                            undefined
                                          )
                                        ) {
                                          return null
                                        }
                                        if (
                                          $event.ctrlKey ||
                                          $event.shiftKey ||
                                          $event.altKey ||
                                          $event.metaKey
                                        ) {
                                          return null
                                        }
                                        return _vm.close($event)
                                      }
                                    ],
                                    change: function($event) {
                                      var $$a = _vm.inputValue,
                                        $$el = $event.target,
                                        $$c = $$el.checked ? true : false;
                                      if (Array.isArray($$a)) {
                                        var $$v = null,
                                          $$i = _vm._i($$a, $$v);
                                        if ($$el.checked) {
                                          $$i < 0 && (_vm.inputValue = $$a.concat([$$v]));
                                        } else {
                                          $$i > -1 &&
                                            (_vm.inputValue = $$a
                                              .slice(0, $$i)
                                              .concat($$a.slice($$i + 1)));
                                        }
                                      } else {
                                        _vm.inputValue = $$c;
                                      }
                                    }
                                  }
                                },
                                "input",
                                _vm.$attrs,
                                false
                              )
                            )
                          : _vm.type === "radio"
                          ? _c(
                              "input",
                              _vm._b(
                                {
                                  directives: [
                                    {
                                      name: "model",
                                      rawName: "v-model",
                                      value: _vm.inputValue,
                                      expression: "inputValue"
                                    }
                                  ],
                                  class: _vm.classNames.input,
                                  attrs: { tabindex: _vm.tabIndex, type: "radio" },
                                  domProps: { checked: _vm._q(_vm.inputValue, null) },
                                  on: {
                                    focusin: _vm.handleFocus,
                                    focusout: _vm.handleFocus,
                                    keyup: [
                                      function($event) {
                                        if (
                                          !$event.type.indexOf("key") &&
                                          _vm._k(
                                            $event.keyCode,
                                            "enter",
                                            13,
                                            $event.key,
                                            "Enter"
                                          )
                                        ) {
                                          return null
                                        }
                                        return _vm.ok($event)
                                      },
                                      function($event) {
                                        if (
                                          !$event.type.indexOf("key") &&
                                          _vm._k(
                                            $event.keyCode,
                                            "escape",
                                            undefined,
                                            $event.key,
                                            undefined
                                          )
                                        ) {
                                          return null
                                        }
                                        if (
                                          $event.ctrlKey ||
                                          $event.shiftKey ||
                                          $event.altKey ||
                                          $event.metaKey
                                        ) {
                                          return null
                                        }
                                        return _vm.close($event)
                                      }
                                    ],
                                    change: function($event) {
                                      _vm.inputValue = null;
                                    }
                                  }
                                },
                                "input",
                                _vm.$attrs,
                                false
                              )
                            )
                          : _c(
                              "input",
                              _vm._b(
                                {
                                  directives: [
                                    {
                                      name: "model",
                                      rawName: "v-model",
                                      value: _vm.inputValue,
                                      expression: "inputValue"
                                    }
                                  ],
                                  class: _vm.classNames.input,
                                  attrs: { tabindex: _vm.tabIndex, type: _vm.type },
                                  domProps: { value: _vm.inputValue },
                                  on: {
                                    focusin: _vm.handleFocus,
                                    focusout: _vm.handleFocus,
                                    keyup: [
                                      function($event) {
                                        if (
                                          !$event.type.indexOf("key") &&
                                          _vm._k(
                                            $event.keyCode,
                                            "enter",
                                            13,
                                            $event.key,
                                            "Enter"
                                          )
                                        ) {
                                          return null
                                        }
                                        return _vm.ok($event)
                                      },
                                      function($event) {
                                        if (
                                          !$event.type.indexOf("key") &&
                                          _vm._k(
                                            $event.keyCode,
                                            "escape",
                                            undefined,
                                            $event.key,
                                            undefined
                                          )
                                        ) {
                                          return null
                                        }
                                        if (
                                          $event.ctrlKey ||
                                          $event.shiftKey ||
                                          $event.altKey ||
                                          $event.metaKey
                                        ) {
                                          return null
                                        }
                                        return _vm.close($event)
                                      }
                                    ],
                                    input: function($event) {
                                      if ($event.target.composing) {
                                        return
                                      }
                                      _vm.inputValue = $event.target.value;
                                    }
                                  }
                                },
                                "input",
                                _vm.$attrs,
                                false
                              )
                            ),
                        _vm._v(" "),
                        _vm.showButtons
                          ? _c("div", { class: _vm.classNames.buttons }, [
                              _c(
                                "button",
                                {
                                  class: _vm.classNames.buttonOk,
                                  attrs: { title: _vm.buttonOkText },
                                  on: {
                                    click: _vm.ok,
                                    focusin: _vm.handleFocus,
                                    focusout: _vm.handleFocus
                                  }
                                },
                                [_vm._t("button-ok", [_vm._v(_vm._s(_vm.buttonOkText))])],
                                2
                              ),
                              _vm._v(" "),
                              _c(
                                "button",
                                {
                                  class: _vm.classNames.buttonCancel,
                                  attrs: { title: _vm.buttonCancelText },
                                  on: {
                                    click: _vm.close,
                                    focusin: _vm.handleFocus,
                                    focusout: _vm.handleFocus
                                  }
                                },
                                [
                                  _vm._t("button-cancel", [
                                    _vm._v(_vm._s(_vm.buttonCancelText))
                                  ])
                                ],
                                2
                              )
                            ])
                          : _vm._e()
                      ]
                    : [
                        _vm._t("prepend"),
                        _vm._v(" "),
                        _c(
                          "span",
                          {
                            class: ((_obj = {}),
                            (_obj[_vm.classNames.link] = true),
                            (_obj["vue-quick-edit__link--is-clickable"] = _vm.isEnabled),
                            (_obj["vue-quick-edit__link--is-empty"] = _vm.isEmpty),
                            (_obj["vue-quick-edit__link--is-required"] =
                              _vm.isRequired && _vm.isEmpty),
                            _obj),
                            attrs: { tabindex: _vm.isEnabled ? _vm.tabIndex : false },
                            on: {
                              click: _vm.handleClick,
                              keyup: function($event) {
                                if (
                                  !$event.type.indexOf("key") &&
                                  _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
                                ) {
                                  return null
                                }
                                return _vm.handleClick($event)
                              }
                            }
                          },
                          [
                            _vm._t("default", [_vm._v(_vm._s(_vm.displayValue))], {
                              value: _vm.displayValue,
                              rawValue: _vm.theValue
                            })
                          ],
                          2
                        ),
                        _vm._v(" "),
                        _vm._t("append")
                      ]
                ],
                2
              )
            };
            var __vue_staticRenderFns__ = [];
            __vue_render__._withStripped = true;

              /* style */
              var __vue_inject_styles__ = function (inject) {
                if (!inject) { return }
                inject("data-v-3d12ae2a_0", { source: ".vue-quick-edit__link {\n  white-space: pre-wrap;\n  color: #0088cc;\n}\n.vue-quick-edit__link--is-clickable {\n  border-bottom: 1px dashed #0088cc;\n  cursor: pointer;\n  user-select: none;\n}\n.vue-quick-edit__link--is-clickable:hover {\n  color: #2a6496;\n  border-color: #2a6496;\n}\n.vue-quick-edit__link--is-empty {\n  font-style: italic;\n  color: gray;\n}\n.vue-quick-edit__link--is-required {\n  color: #dc3545;\n}\n.vue-quick-edit__input {\n  background-color: #f9f9f9;\n  color: #333;\n  border: 1px solid #ccc;\n  height: 32px;\n  padding: 0;\n}\n.vue-quick-edit__buttons {\n  margin-top: 8px;\n}\n.vue-quick-edit__button {\n  height: 34px;\n  min-width: 34px;\n  border: 1px solid #ccc;\n}\n.vue-quick-edit__button--ok {\n  color: #fff;\n  background-color: #3276b1;\n  border-color: #357ebd;\n}\n.vue-quick-edit__button--cancel {\n  color: #333;\n  margin-left: 8px;\n  background-color: #fff;\n}\n[multiple].vue-quick-edit__input,\ntextarea.vue-quick-edit__input {\n  height: unset;\n  min-height: 64px;\n  display: block;\n}\n.vue-quick-edit__input:not(textarea):not([multiple]) + .vue-quick-edit__buttons,\nlabel + .vue-quick-edit__buttons {\n  display: inline;\n  margin-left: 8px;\n}", map: undefined, media: undefined });

              };
              /* scoped */
              var __vue_scope_id__ = undefined;
              /* module identifier */
              var __vue_module_identifier__ = undefined;
              /* functional template */
              var __vue_is_functional_template__ = false;
              /* style inject SSR */
              

              
              var component = normalizeComponent_1(
                { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
                __vue_inject_styles__,
                __vue_script__,
                __vue_scope_id__,
                __vue_is_functional_template__,
                __vue_module_identifier__,
                browser,
                undefined
              );

            function install(Vue) {
              if (install.installed) { return; }
              install.installed = true;
              Vue.component('QuickEdit', component);
            }

            var plugin = {
              install: install,
            };

            var GlobalVue = null;
            if (typeof window !== 'undefined') {
              GlobalVue = window.Vue;
            } else if (typeof global$1 !== 'undefined') {
              GlobalVue = global$1.Vue;
            }
            if (GlobalVue) {
              GlobalVue.use(plugin);
            }

            exports.default = component;
            exports.install = install;

            Object.defineProperty(exports, '__esModule', { value: true });

}));
