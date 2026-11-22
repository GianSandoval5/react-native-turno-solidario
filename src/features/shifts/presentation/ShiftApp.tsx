import React, { useEffect, useState, useSyncExternalStore } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Shift,
  cancel,
  complete,
  enroll,
  free,
  validate,
} from "../domain/shift";
import { ShiftStore } from "./store";

type Screen =
  "Inicio" | "Turnos" | "Historial" | "Detalle" | "Formulario" | "Inscripción";
const green = "#14645c";
function Button({
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.secondary,
        disabled && { opacity: 0.45 },
      ]}
    >
      <Text style={[styles.buttonText, secondary && { color: green }]}>
        {label}
      </Text>
    </Pressable>
  );
}
function Field({
  label,
  value,
  change,
  numeric = false,
}: {
  label: string;
  value: string;
  change: (v: string) => void;
  numeric?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={change}
        keyboardType={numeric ? "number-pad" : "default"}
        style={styles.input}
      />
    </View>
  );
}
export function ShiftApp({
  store,
  endpoint,
}: {
  store: ShiftStore;
  endpoint: string;
}) {
  const { shifts, busy, error } = useSyncExternalStore(
    store.subscribe,
    store.snapshot,
  );
  const [screen, setScreen] = useState<Screen>("Inicio");
  const [selected, setSelected] = useState("");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [alias, setAlias] = useState("");
  const [query, setQuery] = useState("");
  const [available, setAvailable] = useState(false);
  const [localError, setLocalError] = useState("");
  const shift = shifts.find((x) => x.id === selected);
  useEffect(() => {
    void store.refresh();
  }, [store]);
  const go = (next: Screen) => {
    setLocalError("");
    setScreen(next);
  };
  const detail = (item: Shift) => {
    setSelected(item.id);
    go("Detalle");
  };
  const form = (item?: Shift) => {
    setEditing(!!item);
    setTitle(item?.title ?? "");
    setPlace(item?.place ?? "");
    setDate(item?.date ?? new Date().toISOString().slice(0, 10));
    setCapacity(String(item?.capacity ?? 4));
    go("Formulario");
  };
  const execute = async (action: () => Promise<boolean>, next?: Screen) => {
    setLocalError("");
    try {
      if ((await action()) && next) go(next);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Error");
    }
  };
  const card = (item: Shift) => (
    <Pressable
      key={item.id}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={() => detail(item)}
      style={styles.card}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.muted}>
        {item.date} · {item.place}
      </Text>
      <View style={styles.bar}>
        <View
          style={[
            styles.fill,
            { width: `${(item.participants.length / item.capacity) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.label}>
        {free(item)} cupos libres de {item.capacity}
      </Text>
    </Pressable>
  );
  const pending = shifts.reduce(
    (n, s) => n + s.participants.filter((p) => !p.completed).length,
    0,
  );
  const finished = shifts.reduce(
    (n, s) => n + s.participants.filter((p) => p.completed).length,
    0,
  );
  const filtered = shifts
    .filter(
      (s) =>
        (!available || free(s) > 0) &&
        (s.title + " " + s.place).toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const save = () =>
    execute(
      () =>
        store.save(
          validate({
            id:
              editing && shift
                ? shift.id
                : Date.now().toString(36) +
                  "-" +
                  Math.random().toString(36).slice(2),
            title: title.trim(),
            place: place.trim(),
            date: date.trim(),
            capacity: Number(capacity),
            participants: editing && shift ? shift.participants : [],
          }),
        ),
      editing ? "Detalle" : "Turnos",
    );
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>Turno Solidario</Text>
        <Text style={styles.muted}>
          Organiza la ayuda, multiplica el impacto.
        </Text>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.heading}>
            {screen}
          </Text>
          {busy && (
            <ActivityIndicator accessibilityLabel="Cargando" color={green} />
          )}
          {!!(localError || error) && (
            <View style={styles.error}>
              <Text accessibilityRole="alert">{localError || error}</Text>
              <Button
                label="Actualizar datos"
                secondary
                onPress={() => {
                  setLocalError("");
                  void store.refresh();
                }}
                disabled={busy}
              />
            </View>
          )}
          {screen === "Inicio" && (
            <>
              <Text style={styles.hero}>Cada hora cuenta.</Text>
              <Text style={styles.muted}>
                Coordina turnos y registra los aportes de tu comunidad.
              </Text>
              <View style={styles.metrics}>
                {[
                  ["Turnos", shifts.length],
                  ["Pendientes", pending],
                  ["Completados", finished],
                ].map(([label, n]) => (
                  <View key={label} style={styles.metric}>
                    <Text style={styles.number}>{n}</Text>
                    <Text style={styles.muted}>{label}</Text>
                  </View>
                ))}
              </View>
              <Button label="Explorar turnos" onPress={() => go("Turnos")} />
              <Text style={styles.cardTitle}>Próximos turnos</Text>
              {shifts.length === 0 && !busy ? (
                <Text>No hay turnos todavía.</Text>
              ) : (
                shifts
                  .slice()
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 3)
                  .map(card)
              )}
              <Text style={styles.muted}>Demo local · {endpoint}</Text>
            </>
          )}
          {screen === "Turnos" && (
            <>
              <Field
                label="Buscar turno o lugar"
                value={query}
                change={setQuery}
              />
              <Button
                label={available ? "Mostrar todos" : "Solo cupos disponibles"}
                secondary
                onPress={() => setAvailable(!available)}
              />
              <Button
                label="Nuevo turno"
                onPress={() => form()}
                disabled={busy}
              />
              {filtered.length === 0 && !busy ? (
                <Text>No hay resultados.</Text>
              ) : (
                filtered.map(card)
              )}
            </>
          )}
          {screen === "Historial" && (
            <>
              {finished === 0 ? (
                <Text>No hay participaciones completadas.</Text>
              ) : (
                shifts.flatMap((s) =>
                  s.participants
                    .filter((p) => p.completed)
                    .map((p) => (
                      <View key={s.id + p.alias} style={styles.card}>
                        <Text style={styles.cardTitle}>{p.alias}</Text>
                        <Text>
                          {s.title} · {s.date}
                        </Text>
                        <Text style={styles.label}>Completado</Text>
                      </View>
                    )),
                )
              )}
            </>
          )}
          {screen === "Detalle" && shift && (
            <>
              <Text style={styles.hero}>{shift.title}</Text>
              <Text>
                {shift.place} · {shift.date}
              </Text>
              <Text style={styles.label}>{free(shift)} cupos disponibles</Text>
              <Button
                label="Inscribir participante"
                disabled={busy || free(shift) === 0}
                onPress={() => {
                  setAlias("");
                  go("Inscripción");
                }}
              />
              <Button
                label="Editar turno"
                secondary
                disabled={busy}
                onPress={() => form(shift)}
              />
              <Text style={styles.cardTitle}>Participantes</Text>
              {shift.participants.length === 0 && (
                <Text>No hay inscripciones.</Text>
              )}
              {shift.participants.map((p) => (
                <View key={p.alias} style={styles.card}>
                  <Text style={styles.cardTitle}>{p.alias}</Text>
                  <Text>{p.completed ? "Completado" : "Pendiente"}</Text>
                  {!p.completed && (
                    <>
                      <Button
                        label={"Completar " + p.alias}
                        disabled={busy}
                        onPress={() =>
                          void execute(() =>
                            store.save(complete(shift, p.alias)),
                          )
                        }
                      />
                      <Button
                        label={"Cancelar " + p.alias}
                        secondary
                        disabled={busy}
                        onPress={() =>
                          void execute(() => store.save(cancel(shift, p.alias)))
                        }
                      />
                    </>
                  )}
                </View>
              ))}
              {shift.participants.length === 0 && (
                <Button
                  label="Eliminar turno"
                  secondary
                  disabled={busy}
                  onPress={() =>
                    Alert.alert("Eliminar turno", "¿Confirmar eliminación?", [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Eliminar",
                        style: "destructive",
                        onPress: () =>
                          void execute(() => store.remove(shift), "Turnos"),
                      },
                    ])
                  }
                />
              )}
              <Button
                label="Volver a turnos"
                secondary
                onPress={() => go("Turnos")}
              />
            </>
          )}
          {screen === "Formulario" && (
            <>
              <Field label="Nombre del turno" value={title} change={setTitle} />
              <Field label="Lugar" value={place} change={setPlace} />
              <Field label="Fecha (AAAA-MM-DD)" value={date} change={setDate} />
              <Field
                label="Cupo"
                value={capacity}
                change={setCapacity}
                numeric
              />
              <Button
                label="Guardar turno"
                onPress={() => void save()}
                disabled={busy}
              />
              <Button
                label="Cancelar"
                secondary
                onPress={() => go(editing ? "Detalle" : "Turnos")}
              />
            </>
          )}
          {screen === "Inscripción" && shift && (
            <>
              <Text>
                {shift.title} · {free(shift)} cupos disponibles
              </Text>
              <Field
                label="Alias de participante"
                value={alias}
                change={setAlias}
              />
              <Button
                label="Confirmar inscripción"
                disabled={busy}
                onPress={() =>
                  void execute(
                    () => store.save(enroll(shift, alias)),
                    "Detalle",
                  )
                }
              />
              <Button
                label="Cancelar"
                secondary
                onPress={() => go("Detalle")}
              />
            </>
          )}
        </View>
      </ScrollView>
      <View style={styles.nav}>
        {(["Inicio", "Turnos", "Historial"] as const).map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: screen === tab }}
            onPress={() => go(tab)}
            style={[styles.navItem, screen === tab && styles.navActive]}
          >
            <Text style={styles.label}>{tab}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f6ed" },
  header: { padding: 20, borderBottomWidth: 1, borderColor: "#d6e1d9" },
  brand: { fontSize: 27, fontWeight: "800", color: green },
  muted: { color: "#435a55", fontSize: 14 },
  scroll: { padding: 20, alignItems: "center", flexGrow: 1 },
  content: { width: "100%", maxWidth: 760, gap: 12 },
  heading: { fontSize: 17, color: green, fontWeight: "700" },
  hero: { fontSize: 30, fontWeight: "800", color: "#173d36" },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: {
    flexGrow: 1,
    minWidth: 95,
    padding: 14,
    backgroundColor: "#dbeae1",
    borderRadius: 16,
  },
  number: { fontSize: 27, fontWeight: "800", color: green },
  card: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#d6e1d9",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#173d36" },
  bar: {
    height: 8,
    backgroundColor: "#e4e9e4",
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: { height: 8, backgroundColor: green },
  label: { fontWeight: "600", color: green },
  button: {
    minHeight: 48,
    backgroundColor: green,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
  secondary: { backgroundColor: "#dceae3" },
  field: { gap: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#7b9b8a",
    borderRadius: 10,
    padding: 12,
    minHeight: 48,
    backgroundColor: "white",
    fontSize: 16,
    color: "#173d36",
  },
  error: { backgroundColor: "#fce8d9", padding: 12, borderRadius: 12, gap: 8 },
  nav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#d6e1d9",
    padding: 8,
    gap: 6,
  },
  navItem: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  navActive: { backgroundColor: "#dceae3", borderRadius: 12 },
});
