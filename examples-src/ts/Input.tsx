import React, {
  InputHTMLAttributes, useRef,
} from 'react';
import { createFormStore, useFormInput } from '../../src';

interface IProps {
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  formStore: ReturnType<typeof createFormStore>;
}

function Input({
  inputProps,
  formStore,
}: IProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const inputHandler = useFormInput({
    inputRef,
    formStore,
  });

  return (
    <>
      <label
        htmlFor={inputProps.id}
        className="form-label"
      >
        Email
      </label>
      <input
        ref={inputRef}
        {...inputProps}
        className={[
          'form-control',
          inputHandler ? [
            inputHandler.isValid && !inputHandler.isEmpty ? 'is-valid' : '',
            !inputHandler.isValid ? 'is-invalid' : '',
          ].join(' ') : '',
          inputHandler?.classNames,
        ].join(' ')}
      />
    </>
  );
}

export default Input;
