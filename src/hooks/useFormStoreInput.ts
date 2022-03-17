import {
  RefObject, useCallback, useEffect, useState,
} from 'react';
import { addEventListener, IAddEventListener } from 'vevet-dom';
import validator from 'email-validator';
import useFormStore from './useFormStore';
import { IFormInput } from '..';

interface InputStates extends IFormInput {
  classNames: string;
}

interface Props {
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>;
  formStore: ReturnType<typeof useFormStore>;
  styles?: any;
  customValidation?: (
    value: string
  ) => boolean;
}

/**
 * Bind form store and the input
 */
export default function useFormInput({
  inputRef,
  formStore,
  styles,
  customValidation,
}: Props) {
  // get input element
  const [input, setInput] = useState<
        HTMLInputElement | HTMLTextAreaElement | undefined
    >(undefined);

  useEffect(() => {
    if (inputRef.current) {
      setInput(inputRef.current);
    }
  }, [inputRef]);

  // get input classnames
  const getClassNames = useCallback((storeData: IFormInput) => {
    if (styles) {
      return [
        storeData.isValid && storeData.isServerValid ? styles.is_valid : '',
        !storeData.isValid || !storeData.isServerValid ? styles.is_invalid : '',
        storeData.isFocus ? styles.is_focus : '',
        storeData.isEmpty ? styles.is_empty : '',
      ].join(' ').trim();
    }
    return [
      storeData.isValid && storeData.isServerValid ? 'is_valid' : '',
      !storeData.isValid || !storeData.isServerValid ? 'is_invalid' : '',
      storeData.isFocus ? 'is_focus' : '',
      storeData.isEmpty ? 'is_empty' : '',
    ].join(' ').trim();
  }, [styles]);

  // create input store state
  const [inputData, setInputData] = useState<InputStates | undefined>();

  const getInputFromFormStore = useCallback(() => {
    if (!input) {
      return undefined;
    }
    const inputFromFormStore = formStore.getState().inputs.find(
      (data) => data.name === input.name,
    );
    if (inputFromFormStore) {
      return {
        ...inputFromFormStore,
        classNames: getClassNames(inputFromFormStore),
      };
    }
    return undefined;
  }, [formStore, getClassNames, input]);

  // update input data on store change
  useEffect(() => {
    // use timeout to prevent multiple renders
    const timeout = setTimeout(() => {
      setInputData(getInputFromFormStore());
    }, 0);
    let storeTimeout: NodeJS.Timeout | undefined;
    const storeEvent = formStore.subscribe(() => {
      if (storeTimeout) {
        clearTimeout(storeTimeout);
        storeTimeout = undefined;
      }
      storeTimeout = setTimeout(() => {
        setInputData(getInputFromFormStore());
      }, 0);
    });
    return () => {
      clearTimeout(timeout);
      storeEvent();
    };
  }, [formStore, getInputFromFormStore]);

  // register input in form store
  useEffect(() => {
    if (!input) {
      return undefined;
    }
    formStore.dispatch({
      type: 'ADD_INPUT',
      input,
    });
    return () => {
      formStore.dispatch({
        type: 'REMOVE_INPUT',
        input,
      });
    };
  }, [formStore, input]);

  /**
     * Validate input type
     */
  const validateType = useCallback(() => {
    if (!input) {
      return true;
    }
    if (input.type === 'email') {
      return validator.validate(input.value);
    }
    return true;
  }, [input]);

  /**
     * Validate input length
     */
  const validateLength = useCallback(() => {
    if (!input) {
      return true;
    }
    const { value } = input;
    if (input.minLength !== -1 || input.maxLength !== -1) {
      let isValid = true;
      if (input.minLength !== -1 && value.length < input.minLength) {
        isValid = false;
      }
      if (input.maxLength !== -1 && value.length > input.maxLength) {
        isValid = false;
      }
      return isValid;
    }
    return true;
  }, [input]);

  /**
     * Test input
     */
  const test = useCallback(() => {
    if (!input) {
      return;
    }
    // make valid when empty
    if (input.value.length === 0) {
      formStore.dispatch({
        type: 'SET_VALID',
        name: input.name,
        value: true,
      });
      return;
    }

    const typeIsValid = validateType();
    const lengthIsValid = validateLength();
    const curstomIsValid = customValidation ? customValidation(input.value) : true;
    const isValid = typeIsValid && lengthIsValid && curstomIsValid;

    formStore.dispatch({
      type: 'SET_VALID',
      name: input.name,
      value: isValid,
    });
    if (typeIsValid) {
      formStore.dispatch({
        type: 'SET_SERVER_VALID',
        name: input.name,
        value: isValid,
      });
    }
  }, [formStore, input, validateLength, validateType]);

  // set input events
  useEffect(() => {
    if (!input) {
      return undefined;
    }
    test();
    // set listeners
    const listeners: IAddEventListener[] = [];
    listeners.push(addEventListener(input, 'change', () => {
      formStore.dispatch({
        type: 'SET_VALUE',
        name: input.name,
        value: input.value,
      });
      test();
    }));
    listeners.push(addEventListener(input, 'keyup', () => {
      formStore.dispatch({
        type: 'SET_VALUE',
        name: input.name,
        value: input.value,
      });
      test();
    }));
    listeners.push(addEventListener(input, 'focus', () => {
      formStore.dispatch({
        type: 'SET_FOCUS',
        name: input.name,
        value: true,
      });
    }));
    listeners.push(addEventListener(input, 'blur', () => {
      formStore.dispatch({
        type: 'SET_FOCUS',
        name: input.name,
        value: false,
      });
      test();
    }));
    return () => {
      listeners.forEach((event) => {
        event.remove();
      });
    };
  }, [formStore, input, test]);

  return inputData;
}
