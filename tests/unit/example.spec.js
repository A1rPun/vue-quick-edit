import { shallowMount } from '@vue/test-utils';
import QuickEdit from '../../src/quick-edit.vue';

describe('quick-edit.vue', () => {
  it('display Empty when there is no value passed', () => {
    const expected = 'Empty';
    const wrapper = shallowMount(QuickEdit, {
      propsData: {},
    });
    expect(wrapper.text()).toMatch(expected);
  });

  it('render the passed value', () => {
    const expected = 'MyValue';
    const wrapper = shallowMount(QuickEdit, {
      propsData: { value: expected },
    });
    expect(wrapper.text()).toMatch(expected);
  });

  it('render the passed value after initialization', () => {
    const expected = 'MyValue';
    const wrapper = shallowMount(QuickEdit, {
      propsData: {},
    });
    wrapper.setProps({ value: expected });
    expect(wrapper.text()).toMatch(expected);
  });

  it('render the passed options', () => {
    const options = ['foo', 'bar', 'qux'];
    const value = ['foo', 'bar'];
    const expected = 'foo, bar';
    const wrapper = shallowMount(QuickEdit, {
      propsData: { type: 'select', value, options },
    });
    expect(wrapper.text()).toMatch(expected);
  });

  it('render type boolean', () => {
    const expected = 'No';
    const wrapper = shallowMount(QuickEdit, {
      propsData: { type: 'boolean' },
    });
    expect(wrapper.text()).toMatch(expected);
  });

  it('render type boolean with custom Yes text', () => {
    const expected = 'Yey';
    const wrapper = shallowMount(QuickEdit, {
      propsData: { type: 'boolean', value: true, booleanYesText: expected },
    });
    expect(wrapper.text()).toMatch(expected);
  });

  it('render type password', () => {
    const expected = '••••••••';
    const wrapper = shallowMount(QuickEdit, {
      propsData: { type: 'password', value: '1234' },
    });
    expect(wrapper.text()).toMatch(expected);
  });

  it('render the input when the label is clicked', () => {
    const wrapper = shallowMount(QuickEdit, {
      propsData: {},
    });
    wrapper.find('.vue-quick-edit__link').trigger('click');
    expect(wrapper.findAll('input')).toHaveLength(1);
  });

  it('toggle the value when the label is clicked on type boolean', () => {
    const wrapper = shallowMount(QuickEdit, {
      propsData: { type: 'boolean' },
    });
    wrapper.find('.vue-quick-edit__link').trigger('click');
    expect(wrapper.text()).toMatch('Yes');
  });

  it('do nothing when disabled and the label is clicked', () => {
    const wrapper = shallowMount(QuickEdit, {
      propsData: { disabled: true, type: 'boolean' },
    });
    wrapper.find('.vue-quick-edit__link').trigger('click');
    expect(wrapper.text()).toMatch('No');
  });

  it('render the input when startOpen is true', () => {
    const wrapper = shallowMount(QuickEdit, {
      propsData: { startOpen: true },
    });
    expect(wrapper.findAll('input')).toHaveLength(1);
  });

  it('update value when Ok is clicked', async () => {
    const value = 'MyValue';
    const expected = 'MyChangedValue';
    const wrapper = shallowMount(QuickEdit, {
      propsData: { value, startOpen: true },
    });
    wrapper.vm.inputValue = expected; // TODO: Set value via DOM
    wrapper.find('.vue-quick-edit__button--ok').trigger('click');
    expect(wrapper.text()).toMatch(expected);
  });

  it('not update value when Cancel is clicked', async () => {
    const expected = 'MyValue';
    const wrapper = shallowMount(QuickEdit, {
      propsData: { value: expected, startOpen: true },
    });
    wrapper.vm.inputValue = 'MyChangedValue'; // TODO: Set value via DOM
    wrapper.find('.vue-quick-edit__button--cancel').trigger('click');
    expect(wrapper.text()).toMatch(expected);
  });

  it('validate the input', () => {
    const wrapper = shallowMount(QuickEdit, {
      propsData: { startOpen: true, validator: () => 'Invalidated!' },
    });
    const stub = jest.fn();
    wrapper.vm.$on('invalid', stub);
    wrapper.find('.vue-quick-edit__button--ok').trigger('click');
    expect(stub).toBeCalled();
    expect(wrapper.findAll('input')).toHaveLength(1);
  });

  it('pass validation', () => {
    const wrapper = shallowMount(QuickEdit, {
      propsData: { startOpen: true, validator: () => {} },
    });
    const stub = jest.fn();
    wrapper.vm.$on('invalid', stub);
    wrapper.find('.vue-quick-edit__button--ok').trigger('click');
    expect(stub).not.toBeCalled();
    expect(wrapper.findAll('input')).toHaveLength(0);
  });
});
