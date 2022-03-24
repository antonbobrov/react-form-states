import {
  RefObject, useCallback, useEffect, useState,
} from 'react';
import { addEventListener } from 'vevet-dom';
import { IFormResponse } from '..';
import useFormStore from './useFormStore';

interface Props {
  formRef: RefObject<HTMLFormElement>;
  formStore: ReturnType<typeof useFormStore>;
  onStart?: () => void;
  onFinish?: () => void;
  onSuccess?: (data: IFormResponse) => void;
  onError?: (data: IFormResponse) => void;
  /**
   * @default false
   */
  resetOnSuccess?: boolean;
}

/**
 * Hook that sends a request on submit
 */
export default function useFormHandler({
  formRef,
  formStore,
  onStart,
  onFinish,
  onSuccess,
  onError,
  resetOnSuccess = false,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const submit = useCallback(async () => {
    if (!formRef.current) {
      return;
    }
    if (onStart) {
      onStart();
    }
    setIsLoading(true);

    try {
      const response: IFormResponse = await (await fetch(formRef.current.action, {
        method: 'POST',
        body: new FormData(formRef.current),
      })).json();

      if (response.success) {
        if (onSuccess) {
          onSuccess(response);
        }
        if (resetOnSuccess) {
          formStore.dispatch({
            type: 'RESET',
          });
        }
      } else if (response.errors && response.errors.length > 0) {
        if (onError) {
          onError(response);
        }
        const { errors } = response;
        const { inputs } = formStore.getState();
        inputs.forEach((input) => {
          formStore.dispatch({
            type: 'SET_SERVER_VALID',
            name: input.name,
            value: !errors.find((error) => error.name === input.name),
          });
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }

    if (onFinish) {
      onFinish();
    }
    setIsLoading(false);
  }, [formRef, formStore]);

  // set form events
  useEffect(() => {
    if (!formRef.current) {
      return undefined;
    }
    const listener = addEventListener(formRef.current, 'submit', (evt) => {
      evt.preventDefault();
      submit();
    });
    return listener.remove;
  }, [formRef, submit]);

  return {
    isLoading,
  };
}
