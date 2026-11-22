import React from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileLabRepository } from "./src/features/shifts/data/repository";
import { ShiftStore } from "./src/features/shifts/presentation/store";
import { ShiftApp } from "./src/features/shifts/presentation/ShiftApp";
const endpoint =
  process.env.EXPO_PUBLIC_MOBILELAB_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:4566"
    : "http://127.0.0.1:4566");
const store = new ShiftStore(new MobileLabRepository(endpoint));
export default function App() {
  return (
    <SafeAreaProvider>
      <ShiftApp store={store} endpoint={endpoint} />
    </SafeAreaProvider>
  );
}
