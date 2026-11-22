import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ShiftApp } from "../../src/features/shifts/presentation/ShiftApp";
import { ShiftStore } from "../../src/features/shifts/presentation/store";
import { Shift } from "../../src/features/shifts/domain/shift";
test("enroll, validate alias, complete and see history", async () => {
  const seed: Shift = {
    id: "demo",
    title: "Registro demo",
    place: "Patio",
    date: "2026-11-29",
    capacity: 2,
    participants: [],
  };
  const store = new ShiftStore({
    list: async () => [seed],
    save: async () => {},
    remove: async () => {},
  });
  const ui = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, bottom: 0, left: 0, right: 0 },
      }}
    >
      <ShiftApp store={store} endpoint="demo" />
    </SafeAreaProvider>,
  );
  await waitFor(() => expect(ui.getByLabelText("Registro demo")).toBeTruthy());
  fireEvent.press(ui.getByLabelText("Registro demo"));
  fireEvent.press(ui.getByLabelText("Inscribir participante"));
  fireEvent.press(ui.getByLabelText("Confirmar inscripción"));
  await waitFor(() =>
    expect(ui.getByText("Alias inválido o repetido.")).toBeTruthy(),
  );
  fireEvent.changeText(ui.getByLabelText("Alias de participante"), "Luna demo");
  fireEvent.press(ui.getByLabelText("Confirmar inscripción"));
  await waitFor(() =>
    expect(ui.getByLabelText("Completar Luna demo")).toBeTruthy(),
  );
  fireEvent.press(ui.getByLabelText("Completar Luna demo"));
  await waitFor(() => expect(ui.getByText("Completado")).toBeTruthy());
  fireEvent.press(ui.getByRole("tab", { name: "Historial" }));
  expect(ui.getByText("Luna demo")).toBeTruthy();
});
