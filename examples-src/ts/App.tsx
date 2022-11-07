import React, { useRef, useState } from 'react';
import { useFormHandler, createFormStore } from '../../src';
import Input from './Input';

function App() {
  const [progress, setProgress] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);
  const formStore = createFormStore();
  const formHandler = useFormHandler({
    formRef,
    formStore,
    resetOnSuccess: true,
    onProgress(val) {
      setProgress(val);
    },
    onFinish() {
      setProgress(0);
    },
  });

  return (
    <div className="container">

      <h1 className="h1 mt-3">Form handler</h1>

      <form
        ref={formRef}
        action="https://react-form-states.free.beeceptor.com"
        method="post"
        encType="multipart/form-data"
      >

        <div className="form-group">
          <Input
            formStore={formStore}
            inputProps={{
              type: 'text',
              name: 'name',
              id: 'input-name',
              minLength: 3,
              maxLength: 20,
            }}
          />
          <div className="form-label small mt-2">Min length: 3 & Max length: 20</div>
        </div>

        <div className="form-group mt-3">
          <Input
            formStore={formStore}
            inputProps={{
              type: 'email',
              name: 'email',
              id: 'input-email',
            }}
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

        {formHandler.isLoading ? (
          <>
            <br />
            Progress:
            {' '}
            {progress * 100}
            %
            <br />
            <div className="spinner-border mt-4" role="status">
              <span className="sr-only" />
            </div>
          </>
        ) : ''}

      </form>

    </div>
  );
}
export default App;
