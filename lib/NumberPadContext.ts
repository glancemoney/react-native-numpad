import React from 'react';
import type Input from './Input';
import type Display from './Display';
import type AvoidingView from './AvoidingView';

type NumberPadContextType = {
  display: null | string,
  input: null | Input,
  height: number,
  focus: (display: Display) => void,
  blur: () => void,
  onInputEvent: (ev: string) => void,
  registerDisplay: (display: Display) => void,
  unregisterDisplay: (display: Display) => void,
  registerAvoidingView: (view: AvoidingView) => void,
  unregisterAvoidingView: (view: AvoidingView) => void,
  registerInput: (input: Input) => void,
  setHeight: (height: number) => void,
}
const nullFn = () => { };
const defaultContext: NumberPadContextType = {
  display: null,
  input: null,
  height: 0,
  focus: nullFn,
  blur: nullFn,
  onInputEvent: nullFn,
  registerDisplay: nullFn,
  unregisterDisplay: nullFn,
  registerAvoidingView: nullFn,
  unregisterAvoidingView: nullFn,
  registerInput: nullFn,
  setHeight: nullFn
}

export default React.createContext(defaultContext);
