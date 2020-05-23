import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, Animated } from 'react-native';

import NumberPadContext from './NumberPadContext';
import styles from './styles';

const inputs = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

const Icon = (props) => {
  try {
    const { Ionicons } = require('@expo/vector-icons');
    return <Ionicons {...props} />;
  } catch (error) {
    try {
      const Ionicons = require('react-native-vector-icons/Ionicons');
      return <Ionicons {...props} />;
    } catch (error) {
      console.warn(
        'react-native-numer-pad: you need to install @expo/vector-icons or react-native-vector-icons for icons to work.'
      );
    }
  }
};

export default class Input extends Component {
  static contextType = NumberPadContext;

  static propTypes = {
    height: PropTypes.number,
    position: PropTypes.oneOf(['relative', 'absolute']).isRequired,
    style: PropTypes.object,
    onWillHide: PropTypes.func,
    onDidHide: PropTypes.func,
    onWillShow: PropTypes.func,
    onDidShow: PropTypes.func,
  };

  static defaultProps = {
    height: 270,
    position: 'absolute',
  };

  constructor(props) {
    super(props);

    this.animation = new Animated.Value(0);
  }

  show = () => {
    if (this.props.onWillShow) this.props.onWillShow();
    Animated.timing(this.animation, {
      duration: 200,
      toValue: this.props.height,
      useNativeDriver: true,
    }).start(this.props.onDidShow);
  };

  hide = () => {
    if (this.props.onWillHide) this.props.onWillHide();
    Animated.timing(this.animation, {
      duration: 200,
      toValue: 0,
      useNativeDriver: true,
    }).start(this.props.onDidHide);
  };

  componentDidMount() {
    this.context.registerInput(this);
    this.context.setHeight(this.props.height);
  }

  componentWillUnmount() {
    Animated.timing(this.animation, {
      duration: 200,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }

  getStyle = () => {
    const interpolation = this.animation.interpolate({
      inputRange: [0, this.props.height],
      outputRange: [this.props.height, 0],
    });
    return this.props.position === 'absolute'
      ? {
          position: 'absolute',
          bottom: 0,
          height: this.props.height,
          transform: [
            {
              translateY: interpolation,
            },
          ],
        }
      : {
          height: interpolation,
        };
  };

  render() {
    return (
      <Animated.View style={[this.getStyle(), this.props.style]}>
        <View style={styles.input}>
          <View style={styles.pad}>
            {inputs.map((value, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.button}
                  onPress={() => this.context.onInputEvent(value)}
                >
                  <Text style={styles.buttonText}>{value}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              key="backspace"
              style={styles.button}
              onPress={() => this.context.onInputEvent('backspace')}
            >
              <Icon
                name="ios-backspace"
                size={
                  styles.buttonText.fontSize ||
                  36 /* fixes bug where react-native-web can't access stylesheet properties */
                }
                color={
                  styles.buttonText.color ||
                  '#888' /* fixes bug where react-native-web can't access stylesheet properties */
                }
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.hide} onPress={this.context.blur}>
            <Icon name="ios-arrow-down" size={36} color="#aaa" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
}
