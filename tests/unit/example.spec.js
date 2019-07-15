import { shallowMount } from '@vue/test-utils';
import QuickEdit from '../../src/quick-edit.vue';

describe('quick-edit.vue', () => {
  it('display Empty when there is no value passed', () => {
    const msg = 'Empty';
    const wrapper = shallowMount(QuickEdit, {
      propsData: {},
    });
    expect(wrapper.text()).toMatch(msg);
  });

  it('render the passed value', () => {
    const value = 'MyValue';
    const wrapper = shallowMount(QuickEdit, {
      propsData: { value },
    });
    expect(wrapper.text()).toMatch(value);
  });

  it('render the passed options', () => {
    const options = ['foo', 'bar'];
    const value = 'foo, bar';
    const wrapper = shallowMount(QuickEdit, {
      propsData: { value: options },
    });
    expect(wrapper.text()).toMatch(value);
  });
});
