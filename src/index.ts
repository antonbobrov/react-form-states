import useFormHandler from './hooks/useFormHandler';
import useFormStore from './hooks/useFormStore';
import useFormInput from './hooks/useFormStoreInput';

export interface IFormInput {
  input: HTMLInputElement | HTMLTextAreaElement;
  name: string;
  value: string;
  isEmpty: boolean;
  isFocus: boolean;
  isValid: boolean;
  isServerValid: boolean;
}

export interface IFormError {
  name: string;
  message?: string;
}

export interface IFormResponse {
  success?: boolean;
  errors?: IFormError[];
  data?: any;
}

export {
  useFormStore,
  useFormHandler,
  useFormInput,
};
