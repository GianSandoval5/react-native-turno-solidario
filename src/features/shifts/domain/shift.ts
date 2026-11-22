export type Participant = { alias: string; completed: boolean };
export type Shift = {
  id: string;
  title: string;
  place: string;
  date: string;
  capacity: number;
  participants: Participant[];
};
export interface ShiftRepository {
  list(): Promise<Shift[]>;
  save(shift: Shift): Promise<void>;
  remove(id: string): Promise<void>;
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const t = new Date(value + "T00:00:00Z");
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === value;
}
export function validate(shift: Shift): Shift {
  if (
    !shift.id.trim() ||
    !shift.title.trim() ||
    !shift.place.trim() ||
    !validDate(shift.date) ||
    !Number.isInteger(shift.capacity) ||
    shift.capacity < 1 ||
    shift.capacity > 100 ||
    shift.participants.length > shift.capacity
  )
    throw new Error("Revisa los datos y el cupo (1–100).");
  const aliases = shift.participants.map((p) => p.alias.trim().toLowerCase());
  if (aliases.some((a) => !a) || new Set(aliases).size !== aliases.length)
    throw new Error("Alias inválido o repetido.");
  return shift;
}
export function enroll(shift: Shift, alias: string): Shift {
  return validate({
    ...shift,
    participants: [
      ...shift.participants,
      { alias: alias.trim(), completed: false },
    ],
  });
}
export function complete(shift: Shift, alias: string): Shift {
  if (!shift.participants.some((p) => p.alias === alias && !p.completed))
    throw new Error("Inscripción no pendiente.");
  return {
    ...shift,
    participants: shift.participants.map((p) =>
      p.alias === alias ? { ...p, completed: true } : p,
    ),
  };
}
export function cancel(shift: Shift, alias: string): Shift {
  if (!shift.participants.some((p) => p.alias === alias && !p.completed))
    throw new Error("No se puede cancelar.");
  return {
    ...shift,
    participants: shift.participants.filter((p) => p.alias !== alias),
  };
}
export function free(shift: Shift): number {
  return shift.capacity - shift.participants.length;
}
