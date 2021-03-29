import * as React from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleProp, ViewStyle } from 'react-native';

import NumberPadContext from './NumberPadContext';

type AvoidingViewProps = {
  style: StyleProp<ViewStyle>;
};

export default class AvoidingView extends React.Component<AvoidingViewProps> {
  animation: Animated.Value;

  static contextType = NumberPadContext;

  static propTypes = {
    children: PropTypes.any,
    style: PropTypes.object,
  };

  constructor(props: AvoidingViewProps) {
    super(props);

    this.animation = new Animated.Value(0);
  }

  show = () => {
    Animated.timing(this.animation, {
      duration: 200,
      toValue: this.context.height,
      useNativeDriver: false,
    }).start();
  };

  hide = () => {
    Animated.timing(this.animation, {
      duration: 200,
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  componentDidMount() {
    this.context.registerAvoidingView(this);
  }

  componentWillUnmount() {
    Animated.timing(this.animation, {
      duration: 200,
      toValue: 0,
      useNativeDriver: false,
    }).start();
  }

  render() {
    return (
      <Animated.View
        style={[
          {
            paddingBottom: this.animation.interpolate({
              inputRange: [0, this.context.height],
              outputRange: [0, this.context.height],
            }),
          },
          this.props.style,
        ]}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}
