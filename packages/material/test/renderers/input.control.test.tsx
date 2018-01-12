import '../../../test/helpers/setup';
import * as React from 'react';
import test from 'ava';
import '../../src/fields';
import {
  ControlElement,
  HorizontalLayout,
  initJsonFormsStore,
  JsonSchema,
  update,
  validate
} from '@jsonforms/core';
import InputControl, { inputControlTester } from '../../src/controls/material-input.control';
import HorizontalLayoutRenderer from '../../src/layouts/MaterialHorizontalLayout';
import {
  findRenderedDOMElementWithClass,
  findRenderedDOMElementWithTag,
  renderIntoDocument,
  scryRenderedDOMElementsWithTag
} from '../../../test/helpers/binding';
import { Provider } from 'react-redux';

test.beforeEach(t => {
  t.context.data = { 'foo': 'bar' };
  t.context.schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string'
      }
    }
  };
  t.context.uischema = {
    type: 'Control',
    scope: {
      $ref: '#/properties/foo'
    }
  };
});

test('autofocus on first element', t => {
    const schema: JsonSchema = {
        type: 'object',
        properties: {
            firstStringField: { type: 'string' },
            secondStringField: { type: 'string' }
        }
    };
    const firstControlElement: ControlElement = {
        type: 'Control',
        scope: {
            $ref: '#/properties/firstStringField'
        },
        options: {
            focus: true
        }
    };
    const secondControlElement: ControlElement = {
        type: 'Control',
        scope: {
            $ref: '#/properties/secondStringField'
        },
        options: {
            focus: true
        }
    };
    const uischema: HorizontalLayout = {
        type: 'HorizontalLayout',
        elements: [
            firstControlElement,
            secondControlElement
        ]
    };
    const data = {
        'firstStringField': true,
        'secondStringField': false
    };
    const store = initJsonFormsStore(
        data,
        schema,
        uischema
    );
    const tree = renderIntoDocument(
        <Provider store={store}>
          <HorizontalLayoutRenderer schema={schema} uischema={uischema}/>
        </Provider>
    );
    const inputs = scryRenderedDOMElementsWithTag(tree, 'input');
    t.not(document.activeElement, inputs[0]);
    t.is(document.activeElement, inputs[1]);
});

test('tester', t => {
  t.is(inputControlTester(undefined, undefined), -1);
  t.is(inputControlTester(null, undefined), -1);
  t.is(inputControlTester({type: 'Foo'}, undefined), -1);
  t.is(inputControlTester({type: 'Control'}, undefined), -1);
  const control: ControlElement = {type: 'Control', scope: {$ref: '#/properties/foo'}};
  t.is(inputControlTester(control, undefined), 1);
});

test('render', t => {
  const store = initJsonFormsStore(t.context.data, t.context.schema, t.context.uischema);
  const tree = renderIntoDocument(
    <Provider store={store}>
      <InputControl schema={t.context.schema} uischema={t.context.uischema}/>
    </Provider>
  );

  const control = findRenderedDOMElementWithClass(tree, 'root_properties_foo');
  t.not(control, undefined);
  t.is(control.childNodes.length, 3);
  t.not(findRenderedDOMElementWithClass(tree, 'root_properties_foo'), undefined);
  /*t.not(findRenderedDOMElementWithClass(tree, 'valid'), undefined);*/

  const label = findRenderedDOMElementWithTag(tree, 'label') as HTMLLabelElement;
  t.is(label.textContent, 'Foo');

  const input = findRenderedDOMElementWithTag(tree, 'input') as HTMLInputElement;
  t.not(input, undefined);
  t.not(input, null);

  const validation = findRenderedDOMElementWithTag(tree, 'p');
  t.is(validation.tagName, 'P');
  t.not(validation.className.indexOf('MuiFormHelperText-root'), -1);
  t.is((validation as HTMLParagraphElement).children.length, 0);
});

test('render without label', t => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: {
      $ref: '#/properties/foo'
    },
    label: false
  };
  const store = initJsonFormsStore(t.context.data, t.context.schema, t.context.uischema);
  const tree = renderIntoDocument(
    <Provider store={store}>
      <InputControl schema={t.context.schema} uischema={uischema}/>
    </Provider>
  );

  const control = findRenderedDOMElementWithClass(tree, 'root_properties_foo');
  t.not(control, undefined);
  t.is(control.childNodes.length, 3);
  t.not(findRenderedDOMElementWithClass(tree, 'root_properties_foo'), undefined);
  /*t.not(findRenderedDOMElementWithClass(tree, 'valid'), undefined);*/

  const label = findRenderedDOMElementWithTag(tree, 'label') as HTMLLabelElement;
  t.is(label.textContent, '');

  const input = findRenderedDOMElementWithTag(tree, 'input') as HTMLInputElement;
  t.not(input, undefined);
  t.not(input, null);

  const validation = findRenderedDOMElementWithTag(tree, 'p');
  t.is(validation.tagName, 'P');
  t.not(validation.className.indexOf('MuiFormHelperText-root'), -1);
  t.is((validation as HTMLParagraphElement).children.length, 0);
});

test('hide', t => {
  const store = initJsonFormsStore(t.context.data, t.context.schema, t.context.uischema);
  const tree = renderIntoDocument(
    <Provider store={store}>
      <InputControl schema={t.context.schema} uischema={t.context.uischema} visible={false}/>
    </Provider>
  );
  const control = findRenderedDOMElementWithClass(tree, 'root_properties_foo') as HTMLElement;
  t.is(getComputedStyle(control).display, 'none');
});

test('show by default', t => {
  const store = initJsonFormsStore(
    t.context.data,
    t.context.schema,
    t.context.uischema
  );
  const tree = renderIntoDocument(
    <Provider store={store}>
      <InputControl schema={t.context.schema} uischema={t.context.uischema}/>
    </Provider>
  );
  const control = findRenderedDOMElementWithClass(tree, 'root_properties_foo') as HTMLElement;
  t.false(control.hidden);
});

test('single error', t => {
  const store = initJsonFormsStore(t.context.data, t.context.schema, t.context.uischema);
  const tree = renderIntoDocument(
    <Provider store={store}>
      <InputControl schema={t.context.schema} uischema={t.context.uischema}/>
    </Provider>
  );
  const validation = findRenderedDOMElementWithTag(tree, 'p');
  store.dispatch(update('foo', () => 2));
  store.dispatch(validate());
  t.is(validation.textContent, 'should be string');
});

test('multiple errors', t => {
  const store = initJsonFormsStore(t.context.data, t.context.schema, t.context.uischema);
  const tree = renderIntoDocument(
    <Provider store={store}>
      <InputControl schema={t.context.schema} uischema={t.context.uischema}/>
    </Provider>
  );
  const validation = findRenderedDOMElementWithTag(tree, 'p');
  store.dispatch(update('foo', () => 3));
  store.dispatch(validate());
  t.is(validation.textContent, 'should be string');
});

test('empty errors by default', t => {
  const store = initJsonFormsStore(
    t.context.data,
    t.context.schema,
    t.context.uischema
  );
  const tree = renderIntoDocument(
    <Provider store={store}>
      <InputControl schema={t.context.schema} uischema={t.context.uischema}/>
    </Provider>
  );
  const validation = findRenderedDOMElementWithTag(tree, 'p');
  t.is(validation.textContent, '');
});

test('reset validation message', t => {
  const store = initJsonFormsStore(
    t.context.data,
    t.context.schema,
    t.context.uischema
  );
  const tree = renderIntoDocument(
    <Provider store={store}>
      <InputControl schema={t.context.schema} uischema={t.context.uischema}/>
    </Provider>
  );
  const validation = findRenderedDOMElementWithTag(tree, 'p');
  store.dispatch(update('foo', () => 3));
  store.dispatch(update('foo', () => 'bar'));
  store.dispatch(validate());
  t.is(validation.textContent, '');
});

test('validation of nested schema', t => {
  const schema = {
    'type': 'object',
    'properties': {
       'name': {
          'type': 'string'
       },
       'personalData': {
          'type': 'object',
          'properties': {
             'middleName': {
                 'type': 'string'
             },
             'lastName': {
                 'type': 'string'
             }
          },
          'required': ['middleName', 'lastName']
       }
    },
    'required': ['name']
  };
  const firstControlElement: ControlElement = {
    type: 'Control',
    scope: {
        $ref: '#/properties/name'
    }
  };
  const secondControlElement: ControlElement = {
    type: 'Control',
    scope: {
        $ref: '#/properties/personalData/properties/middleName'
    }
  };
  const thirdControlElement: ControlElement = {
    type: 'Control',
    scope: {
        $ref: '#/properties/personalData/properties/lastName'
    }
  };
  const uischema: HorizontalLayout = {
    type: 'HorizontalLayout',
    elements: [
        firstControlElement,
        secondControlElement,
        thirdControlElement
    ]
  };
  const data = {
    name: 'John Doe',
    personalData: {}
  };
  const store = initJsonFormsStore(
      data,
      schema,
      uischema
  );
  const tree = renderIntoDocument(
    <Provider store={store}>
      <HorizontalLayoutRenderer schema={schema} uischema={uischema}/>
    </Provider>
  );
  const validation = scryRenderedDOMElementsWithTag(tree, 'p');
  store.dispatch(validate());
  t.is(validation[0].textContent, '');
  t.is(validation[1].textContent, 'is a required property');
  t.is(validation[2].textContent, 'is a required property');
});
test('required field is marked', t => {
    const schema: JsonSchema = {
        type: 'object',
        properties: {
            dateField: {
                type: 'string',
                format: 'date'
            }
        },
        required: ['dateField']
    };
    const uischema: ControlElement = {
        type: 'Control',
        scope: {
            $ref: '#/properties/dateField'
        }
    };

    const store = initJsonFormsStore({}, schema, uischema);
    const tree = renderIntoDocument(
        <Provider store={store}>
          <InputControl schema={schema} uischema={uischema}/>
        </Provider>
    );
    const label = findRenderedDOMElementWithTag(tree, 'label');
    t.is(label.textContent, 'Date Field*');
});

test('not required', t => {
    const schema: JsonSchema = {
        type: 'object',
        properties: {
            dateField: {
                type: 'string',
                format: 'date'
            }
        }
    };
    const uischema: ControlElement = {
        type: 'Control',
        scope: {
            $ref: '#/properties/dateField'
        }
    };

    const store = initJsonFormsStore({}, schema, uischema);
    const tree = renderIntoDocument(
        <Provider store={store}>
          <InputControl schema={schema} uischema={uischema}/>
        </Provider>
    );
    const label = findRenderedDOMElementWithTag(tree, 'label');
    t.is(label.textContent, 'Date Field');
});