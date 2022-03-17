import { useMemo } from 'react';
import { createStore, Store } from 'redux';
import { IFormInput } from '..';

type State = {
    inputs: IFormInput[];
};

type Action = {
  type: 'ADD_INPUT';
  input: HTMLInputElement | HTMLTextAreaElement;
} | {
  type: 'REMOVE_INPUT';
  input: HTMLInputElement | HTMLTextAreaElement;
} | {
  type: 'SET_VALUE';
  name: string;
  value: string;
} | {
  type: 'SET_FOCUS';
  name: string;
  value: boolean;
} | {
  type: 'SET_VALID';
  name: string;
  value: boolean;
} | {
  type: 'SET_SERVER_VALID';
  name: string;
  value: boolean;
} | {
  type: 'RESET';
};

/**
 * Create a store that would contain information about inputs
 */
export default function useFormStore(): Store<State, Action> {
  const store = useMemo(() => createStore((
    state: State = {
      inputs: [],
    },
    action: Action,
  ) => {
    const getInput = (name: string) => state.inputs.find((data) => data.name === name);

    switch (action.type) {
      case 'ADD_INPUT':
        const exists = state.inputs.find((data) => action.input.name === data.name);
        if (!exists) {
          state.inputs.push({
            input: action.input,
            name: action.input.name,
            value: action.input.value,
            isEmpty: action.input.value.length === 0,
            isFocus: false,
            isValid: true,
            isServerValid: true,
          });
        }
        break;

      case 'REMOVE_INPUT':
        state.inputs = state.inputs.filter((data) => data.name !== action.input.name);
        break;

      case 'SET_VALUE':
      case 'SET_FOCUS':
      case 'SET_VALID':
      case 'SET_SERVER_VALID':
        const input = getInput(action.name);
        if (input) {
          switch (action.type) {
            case 'SET_VALUE':
              input.value = action.value;
              input.isEmpty = action.value.length === 0;
              break;
            case 'SET_FOCUS':
              input.isFocus = action.value;
              break;
            case 'SET_VALID':
              input.isValid = action.value;
              break;
            case 'SET_SERVER_VALID':
              input.isServerValid = action.value;
              break;
            default:
              break;
          }
        }
        break;

      case 'RESET':
        state.inputs.forEach((obj) => {
          obj.input.value = '';
          obj.isValid = true;
          obj.isServerValid = true;
          setTimeout(() => {
            obj.input.dispatchEvent(new Event('change'));
          }, 10);
        });
        break;

      default:
        break;
    }

    return state;
  }), []);

  return store;
}
