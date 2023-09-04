import React, { useState, useEffect, useCallback } from "react";
import * as Battery from "expo-battery";
import { StyleSheet, Text, View } from "react-native";
import { Accelerometer } from "expo-sensors";

export const BatterySDK = () => {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [subscription, setSubscription] = useState<Battery.Subscription | null>(
    null
  );

  const _subscribe = async () => {
    const batteryLevelDecimal = await Battery.getBatteryLevelAsync();
    const batteryLevelPercentage = (batteryLevelDecimal * 100).toFixed(0);

    setBatteryLevel(Number(batteryLevelPercentage));
  };

  const _unsubscribe = useCallback(() => {
    subscription && subscription.remove();
    setSubscription(null);
  }, [subscription]);

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  useEffect(() => {
    const accelerometerSubscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude > 1.2) {
        setBatteryLevel((prevBatteryLevel) => {
          if (prevBatteryLevel !== null) {
            // Добавляем 1% к текущему заряду, но не больше 100%
            return Math.min(prevBatteryLevel + 1, 100);
          }
          return prevBatteryLevel;
        });
      }
    });

    return () => {
      accelerometerSubscription.remove();
    };
  }, []);

  const getBatterySegmentColor = () => {
    if (batteryLevel !== null) {
      if (batteryLevel <= 20) {
        return "red";
      } else if (batteryLevel <= 50) {
        return "yellow";
      } else {
        return "green";
      }
    }
    return "black";
  };

  const segmentWidth = batteryLevel !== null ? `${batteryLevel}%` : "0%";

  return (
    <View style={styles.container}>
      <View style={styles.batteryIcon}>
        <View
          style={[
            styles.batterySegment,
            { backgroundColor: getBatterySegmentColor() },
            { width: segmentWidth },
          ]}
        />
        <Text>Current Battery Level: {batteryLevel}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  batteryIcon: {
    marginBottom: 50,
    width: 200,
    height: 90,
    borderWidth: 1,
    borderColor: "black",
  },
  batterySegment: {
    height: "100%",
  },
});
