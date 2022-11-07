import {
  RefObject, useCallback, useEffect, useState,
} from 'react';
import { addEventListener } from 'vevet-dom';
import { IFormResponse } from '..';
import createFormStore from './createFormStore';

interface Props {
  formRef: RefObject<HTMLFormElement>;
  formStore: ReturnType<typeof createFormStore>;
  onStart?: () => void;
  onFinish?: () => void;
  onSuccess?: (data: IFormResponse) => void;
  onError?: (data: IFormResponse) => void;
  onProgress?: (progress: number) => void;
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
  onProgress,
  resetOnSuccess = false,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const [store, setStore] = useState(formStore.getState());
  useEffect(() => formStore.subscribe(() => {
    setStore({
      ...formStore.getState(),
    });
  }), []);

  const fetchData = useCallback(() => new Promise<IFormResponse>((resolve, reject) => {
    const form = formRef.current!;
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => onProgress?.(e.loaded / e.total));
    xhr.addEventListener('load', () => {
      try {
        const json = JSON.parse(xhr.responseText);
        resolve(json);
      } catch (e) {
        reject(e);
      }
    });
    xhr.addEventListener('error', () => reject(new Error('Request failed')));
    xhr.addEventListener('abort', () => reject(new Error('Request aborted')));

    xhr.open(form.method, form.action, true);
    xhr.send(new FormData(form));
  }), []);

  const submit = useCallback(async () => {
    if (!formRef.current) {
      return;
    }

    onStart?.();
    setIsLoading(true);

    fetchData().then((response) => {
      if (response.success) {
        onSuccess?.(response);
        if (resetOnSuccess) {
          formStore.dispatch({
            type: 'RESET',
          });
        }
      } else if (response.errors && response.errors.length > 0) {
        onError?.(response);
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
    }).catch((reason) => {
      // eslint-disable-next-line no-console
      console.error(reason);
    }).finally(() => {
      onFinish?.();
      setIsLoading(false);
    });
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
    store,
  };
}
