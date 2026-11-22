import { Shift, ShiftRepository } from "../domain/shift";
export type Snapshot = { shifts: Shift[]; busy: boolean; error: string | null };
export class ShiftStore {
  private state: Snapshot = { shifts: [], busy: false, error: null };
  private listeners = new Set<() => void>();
  constructor(private repo: ShiftRepository) {}
  snapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private update(patch: Partial<Snapshot>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn());
  }
  private async run(action: () => Promise<void>): Promise<boolean> {
    if (this.state.busy) return false;
    this.update({ busy: true, error: null });
    try {
      await action();
      return true;
    } catch (e) {
      this.update({
        error: e instanceof Error ? e.message : "Error de conexión",
      });
      return false;
    } finally {
      this.update({ busy: false });
    }
  }
  refresh = () =>
    this.run(async () => this.update({ shifts: await this.repo.list() }));
  save = (shift: Shift) =>
    this.run(async () => {
      await this.repo.save(shift);
      this.update({
        shifts: [...this.state.shifts.filter((x) => x.id !== shift.id), shift],
      });
    });
  remove = (shift: Shift) =>
    this.run(async () => {
      if (shift.participants.length)
        throw new Error("El turno tiene inscripciones.");
      await this.repo.remove(shift.id);
      this.update({
        shifts: this.state.shifts.filter((x) => x.id !== shift.id),
      });
    });
}
