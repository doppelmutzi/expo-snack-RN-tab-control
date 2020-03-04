import React, { useState, useEffect } from "react";
import { arrayOf, string, func, number, bool, node } from "prop-types";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  ViewPropTypes
} from "react-native";

import theme from "../theme";

import iosTabControlStyles, {
  touchableHighlightColors,
  iosTabVerticalSpacing
} from "./iOSTabControlStyles";
import androidTabControlStyles from "./androidTabControlStyles";

const isIos = Platform.OS === "ios";

const wrapperStyles = StyleSheet.create({
  outerGapStyle: isIos ? { padding: theme.spacing.s } : { padding: 0 }
});

const tabControlStyles = isIos ? iosTabControlStyles : androidTabControlStyles;

const TabControl = ({ values, onChange, renderSeparators }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleIndexChange = index => {
    setSelectedIndex(index);
    onChange(values[index]);
  };

  return (
    <View style={wrapperStyles.outerGapStyle}>
      <SegmentedControl
        values={values}
        selectedIndex={selectedIndex}
        onTabPress={handleIndexChange}
        renderSeparators={renderSeparators}
      />
    </View>
  );
};

TabControl.propTypes = {
  values: arrayOf(string).isRequired,
  onChange: func.isRequired,
  renderSeparators: bool
};

TabControl.defaultProps = {
  renderSeparators: false
};

export default TabControl;

function SegmentedControl({
  values: tabValues,
  selectedIndex,
  onTabPress,
  renderSeparators,
}) {
  return (
    <Container
      style={tabControlStyles}
      numberValues={tabValues.length}
      activeTabIndex={selectedIndex}
    >
      {tabValues.map((tabValue, index) => (
        <Tab
          label={tabValue}
          onPress={() => {
            onTabPress(index);
          }}
          isActive={selectedIndex === index}
          isFirst={index === 0}
          isLast={index === tabValues.length - 1}
          renderLeftSeparator={
            renderSeparators && shouldRenderLeftSeparator(index, selectedIndex)
          }
          key={tabValue}
        />
      ))}
    </Container>
  );
}

function Container({
  children,
  numberValues,
  style,
  activeTabIndex
}) {
  const { tabStyle, activeTabStyle, tabsContainerStyle } = style;

  const margin = theme.spacing.s;

  const [moveAnimation] = useState(new Animated.Value(0));
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const leftVal = (containerWidth / numberValues) * activeTabIndex;
    Animated.timing(moveAnimation, {
      toValue: leftVal,
      duration: 250
      // not supported by native animated module
      // useNativeDriver: true
    }).start();
  }, [containerWidth, activeTabIndex]);

  return isIos ? (
    <View
      style={[
        {
          marginHorizontal: margin,
          flexDirection: "row",
          position: "relative"
        },
        tabsContainerStyle
      ]}
      onLayout={event => {
        setContainerWidth(event.nativeEvent.layout.width);
      }}
    >
      <Animated.View
        style={{
          // works too
          // width: `${100 / numberValues}%`,
          width: containerWidth / numberValues,
          left: moveAnimation,
          top: iosTabVerticalSpacing,
          bottom: iosTabVerticalSpacing,
          position: "absolute",
          ...tabStyle,
          ...activeTabStyle
        }}
      ></Animated.View>
      {children}
    </View>
  ) : (
    <View
      style={[
        { marginHorizontal: margin, flexDirection: "row" },
        tabsContainerStyle
      ]}
    >
      {children}
    </View>
  );
}

Container.propTypes = {
  children: node.isRequired,
  numberValues: number.isRequired,
  style: ViewPropTypes.style.isRequired,
  activeTabIndex: number
};

Container.defaultProps = {
  activeTabIndex: 0
};

function shouldRenderLeftSeparator(index, selectedIndex) {
  const isFirst = index === 0;
  const isSelected = index === selectedIndex;
  const isPrevSelected = index - 1 === selectedIndex;
  if (isFirst || isSelected || isPrevSelected) {
    return false;
  }
  return true;
}

SegmentedControl.propTypes = {
  values: arrayOf(string).isRequired,
  onTabPress: func.isRequired,
  renderSeparators: bool.isRequired,
  selectedIndex: number
};

SegmentedControl.defaultProps = {
  selectedIndex: 0
};

const IosTab = ({
  children,
  style: tabControlStyle,
  onPress,
  renderLeftSeparator
}) => (
  <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
    {renderLeftSeparator && (
      <View
        style={{
          height: "50%",
          width: 1,
          backgroundColor: theme.color.separator
        }}
      ></View>
    )}
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={tabControlStyle}>{children}</View>
    </TouchableWithoutFeedback>
  </View>
);

const AndroidTab = ({ children, style: tabControlStyle, onPress }) => (
  <TouchableNativeFeedback
    onPress={onPress}
    background={TouchableNativeFeedback.Ripple(theme.color.ripple, true)}
    // https://reactnative.dev/docs/touchablenativefeedback.html#useforeground
    // useForeground={!!TouchableNativeFeedback.canUseNativeForeground()}
  >
    <View style={tabControlStyle}>{children}</View>
  </TouchableNativeFeedback>
);

const OsSpecificTab = (props) => {
  return isIos ? <IosTab {...props} /> : <AndroidTab {...props} />;
};

OsSpecificTab.propTypes = {
  children: node.isRequired,
  onPress: func.isRequired,
  style: arrayOf(ViewPropTypes.style).isRequired,
  isActive: bool,
  renderLeftSeparator: bool
};

OsSpecificTab.defaultProps = {
  isActive: false,
  renderLeftSeparator: false
};

function Tab({
  label,
  onPress,
  isActive,
  isFirst,
  isLast,
  renderLeftSeparator
}) {
  const {
    tabStyle,
    tabTextStyle,
    activeTabStyle,
    activeTabTextStyle,
    firstTabStyle,
    lastTabStyle
  } = tabControlStyles;
  return (
    <OsSpecificTab
      isActive={isActive}
      onPress={onPress}
      style={[
        tabStyle,
        !isIos && isActive && activeTabStyle,
        isFirst && firstTabStyle,
        isLast && lastTabStyle
      ]}
      renderLeftSeparator={renderLeftSeparator}
    >
      <Text style={[tabTextStyle, isActive && activeTabTextStyle]}>
        {label}
      </Text>
    </OsSpecificTab>
  );
}

Tab.propTypes = {
  label: string.isRequired,
  onPress: func.isRequired,
  isActive: bool.isRequired,
  isFirst: bool.isRequired,
  isLast: bool.isRequired,
  renderLeftSeparator: bool.isRequired
};
