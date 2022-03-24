import React, { useRef } from 'react';
import { useFormHandler, useFormInput, useFormStore } from '../../src';

function App() {
  const formRef = useRef<HTMLFormElement>(null);
  const formStore = useFormStore();
  const formHandler = useFormHandler({
    formRef,
    formStore,
    resetOnSuccess: true,
  });

  const nameRef = useRef<HTMLInputElement>(null);
  const nameHandler = useFormInput({
    inputRef: nameRef,
    formStore,
  });

  const emailRef = useRef<HTMLInputElement>(null);
  const emailHandler = useFormInput({
    inputRef: emailRef,
    formStore,
  });

  return (
    <div className="container">

      <h1 className="h1 mt-3">Form handler</h1>

      <form
        ref={formRef}
        action="https://react-form.free.beeceptor.com"
        method="post"
      >

        <div className="form-group">
          <label
            htmlFor="input-name"
            className="form-label"
          >
            Name
          </label>
          <input
            ref={nameRef}
            id="input-name"
            className={[
              'form-control',
              nameHandler ? [
                nameHandler.isValid && !nameHandler.isEmpty ? 'is-valid' : '',
                !nameHandler.isValid ? 'is-invalid' : '',
              ].join(' ') : '',
            ].join(' ')}
            type="name"
            name="name"
            minLength={3}
            maxLength={20}
          />
          <div className="form-label small mt-2">Min length: 3 & Max length: 20</div>
        </div>

        <div className="form-group mt-3">
          <label
            htmlFor="input-email"
            className="form-label"
          >
            Email
          </label>
          <input
            ref={emailRef}
            id="input-email"
            className={[
              'form-control',
              emailHandler ? [
                emailHandler.isValid && !emailHandler.isEmpty ? 'is-valid' : '',
                !emailHandler.isValid ? 'is-invalid' : '',
              ].join(' ') : '',
            ].join(' ')}
            type="email"
            name="email"
          />
        </div>

        <br />
        <button
          type="submit"
          disabled={formHandler.isLoading}
          className="btn btn-primary"
        >
          Submit
        </button>

        <br />
        {formHandler.isLoading ? (
          <div className="spinner-border mt-4" role="status">
            <span className="sr-only" />
          </div>
        ) : ''}

      </form>

    </div>
  );
}
export default App;
