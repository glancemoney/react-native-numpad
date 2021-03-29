import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, ViewStyle, StyleProp, TextStyle } from 'react-native';

import NumberPadContext from './NumberPadContext';
import styles from './styles';

const parse = (str: string) => {
  return parseFloat(str.replace(/,/g, ''));
};

const format = (str: string, initial?: boolean, integerPlaces: number = 9, decimalPoints: number = 2, minimumDecimalPoints: number = 2) => {
  let decimal: boolean;
  let [whole = '', part = ''] = str.split('.');
  if (initial) {
    decimal = (str !== '0' && (minimumDecimalPoints > 0 || part.length > 0)) ? true : false;
  }
  else {
    decimal = str.includes('.');
  }
  whole = whole.replace(/,/g, '').substring(0, integerPlaces);
  whole = whole ? parseInt(whole).toLocaleString('en-US') : '0';
  part = part.substring(0, decimalPoints);
  part = initial && decimal ? part.padEnd(minimumDecimalPoints, '0') : part;
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
  autofocus: boolean,
  /** Custom number formatter (Advanced)
   * @param str The string to format from
   * @param initial If the value is not in the middle of editing; this is true
  */
  format?: (str: string, initial?: boolean) => string,
  /** The number of decimal places to use when using the default formatter*/
  decimalPlaces: number,
  /** The number of integer places to use when using the default formatter*/
  integerPlaces: number,
  /** The minimum decimal places to show when using the default formatter*/
  minimumDecimalPlaces: number,

  onFocus: () => void,
  onBlur: () => void,
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
  context!: React.ContextType<typeof NumberPadContext>;

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
    decimalPlaces: PropTypes.number,
    integerPlaces: PropTypes.number,
    minimumDecimalPlaces: PropTypes.number,
    onFocus: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
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
    decimalPlaces: 2,
    integerPlaces: 9,
    minimumDecimalPlaces: 2,
    onFocus: () => { },
    onBlur: () => { },
  };

  constructor(props: DisplayProps) {
    super(props);

    this.blink = null;

    const formatter = props.format ? props.format : format;

    const value = formatter(String(this.props.value), true, props.integerPlaces, props.decimalPlaces, props.minimumDecimalPlaces);

    this.state = {
      valid: true,
      active: false,
      blink: true,
      value,
      lastValue: value,
      empty: value === '0',
    };
  }

  format(str: string, initial?: boolean): string {
    const { format: fmt = format, integerPlaces, decimalPlaces, minimumDecimalPlaces } = this.props;
    return fmt(str, initial, integerPlaces, decimalPlaces, minimumDecimalPlaces);
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
    if (!this.state.active) {
      // Explicitly check if was active because 
      // otherwise if tapped again while focussed, value will be reset
      this.setState({
        active: true,
        lastValue: this.format(this.state.value, true),
        value: '0',
      });
    }
    this.props.onFocus();
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

    const value = this.format(this.state.value, true);
    this.props.onBlur();
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
    const value = this.format(
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
