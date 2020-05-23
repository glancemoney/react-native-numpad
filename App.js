import React from 'react';
import { SafeAreaView } from 'react-native';
import NumberPad, { Input, Display } from './index';

export default class App extends React.Component {
  render() {
    return (
      <NumberPad>
        <SafeAreaView>
          {[0, 1, 2].map((i) => (
            <Display key={i} cursor value={101} />
          ))}
        </SafeAreaView>
        <Input />
      </NumberPad>
    );
  }
}
