import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, ViewStyle, StyleProp, TextStyle } from 'react-native';

import NumberPadContext from './NumberPadContext';
import styles from './styles';

const parse = (str: string) => {
  return parseFloat(str.replace(/,/g, ''));
};

const format = (str: string, initial?: boolean) => {
  let decimal = str.includes('.');
  let [whole = '', part = ''] = str.split('.');
  decimal = initial && str !== '0' ? true : decimal;
  whole = whole.replace(/,/g, '').substring(0, 9);
  whole = whole ? parseInt(whole).toLocaleString('en-US') : '0';
  part = part.substring(0, 2);
  part = initial && decimal ? part.padEnd(2, '0') : part;
  return `${whole}${decimal ? '.' : ''}${part}`;
};


type DisplayProps = {
  value: number,
  style: StyleProp<ViewStyle>,
  textStyle: StyleProp<TextStyle>,
  activeStyle: StyleProp<ViewStyle>,
  activeTextStyle: StyleProp<TextStyle>,
  invalidTextStyle: StyleProp<TextStyle>,
  placeholderTextStyle: StyleProp<TextStyle>,
  cursorStyle: StyleProp<ViewStyle>,
  blinkOnStyle: StyleProp<ViewStyle>,
  blinkOffStyle: StyleProp<ViewStyle>,
  onChange: (val: number) => void,
  isValid: (val: string) => boolean,
  cursor: boolean,
  autofocus: boolean
}
type DisplayState = {
  valid: boolean,
  active: boolean,
  blink: boolean,
  value: string,
  lastValue: string,
  empty: boolean,
}
export default class Display extends Component<DisplayProps, DisplayState> {
  blink: null | ReturnType<typeof setInterval>;
  static contextType = NumberPadContext;

  static propTypes = {
    value: PropTypes.number.isRequired,
    style: PropTypes.object.isRequired,
    textStyle: PropTypes.object.isRequired,
    activeStyle: PropTypes.object.isRequired,
    activeTextStyle: PropTypes.object.isRequired,
    invalidTextStyle: PropTypes.object.isRequired,
    placeholderTextStyle: PropTypes.object.isRequired,
    cursorStyle: PropTypes.object.isRequired,
    blinkOnStyle: PropTypes.object.isRequired,
    blinkOffStyle: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    isValid: PropTypes.func.isRequired,
    cursor: PropTypes.bool.isRequired,
    autofocus: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    value: 0.0,
    style: styles.display,
    textStyle: styles.displayText,
    activeStyle: styles.activeDisplay,
    activeTextStyle: styles.activeDisplayText,
    invalidTextStyle: styles.invalidDisplayText,
    placeholderTextStyle: styles.placeholderDisplayText,
    cursorStyle: styles.cursor,
    blinkOnStyle: styles.blinkOn,
    blinkOffStyle: styles.blinkOff,
    onChange: () => { },
    isValid: () => true,
    cursor: false,
    autofocus: false,
  };

  constructor(props: DisplayProps) {
    super(props);

    this.blink = null;

    const value = format(String(this.props.value), true);

    this.state = {
      valid: true,
      active: false,
      blink: true,
      value,
      lastValue: value,
      empty: value === '0',
    };
  }

  componentDidMount() {
    this.context.registerDisplay(this);
    if (this.props.autofocus) {
      setTimeout(this.focus, 0); // setTimeout fixes an issue with it sometimes not focusing
    }
  }

  componentWillUnmount() {
    this.context.unregisterDisplay(this);
    if (this.blink) clearInterval(this.blink);
  }

  focus = (propagate: any = true) => {
    if (propagate) this.context.focus(this);
    this.setState({
      active: true,
      lastValue: format(this.state.value, true),
      value: '0',
    });
    if (this.props.cursor) {
      if (this.blink) clearInterval(this.blink);
      this.blink = setInterval(() => {
        this.setState({
          blink: !this.state.blink,
        });
      }, 600);
    }
  };

  blur = (propagate = true) => {
    if (propagate && this.context.display === (this as any)._reactInternalFiber.key) {
      this.context.blur();
    }

    const value = format(this.state.value, true);

    this.setState({
      active: false,
      value: this.value(value),
    });
  };

  empty = (value?: string) => {
    value = value ? value : this.state.value;
    return value === '0';
  };

  value = (value?: string) => {
    value = value ? value : this.state.value;
    return this.empty(value) ? this.state.lastValue : value;
  };

  onInputEvent = (event: string) => {
    const value = format(
      event === 'backspace'
        ? this.state.value.substring(0, this.state.value.length - 1)
        : `${this.state.value}${event}`
    );
    const valid = this.props.isValid(value);
    this.setState({
      value,
      valid,
    });
    this.props.onChange(parse(this.value(value)));
  };

  render() {
    const { valid, value, active } = this.state;
    const empty = this.empty();
    const blink = this.state.blink
      ? this.props.blinkOnStyle
      : this.props.blinkOffStyle;
    const style: (StyleProp<ViewStyle>)[] = [
      { flexDirection: 'row' },
      this.props.style,
      active ? this.props.activeStyle : null,
    ];
    const textStyle = [
      this.props.textStyle,
      active ? this.props.activeTextStyle : null,
    ];
    const cursorStyle = [this.props.cursorStyle];
    return (
      <TouchableOpacity style={style} onPress={this.focus}>
        <View style={[cursorStyle, active ? blink : null]}>
          <Text
            style={[
              textStyle,
              valid ? null : this.props.invalidTextStyle,
              empty ? this.props.placeholderTextStyle : null,
            ]}
          >
            {empty ? this.state.lastValue : value}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}
