import { Shift, ShiftRepository, validate } from "../domain/shift";
export type Transport = typeof fetch;
export function decode(value: unknown): Shift {
  if (!value || typeof value !== "object")
    throw new Error("Respuesta inválida");
  const x = value as Record<string, unknown>;
  if (
    typeof x.id !== "string" ||
    typeof x.title !== "string" ||
    typeof x.place !== "string" ||
    typeof x.date !== "string" ||
    typeof x.capacity !== "number" ||
    !Array.isArray(x.participants)
  )
    throw new Error("Respuesta inválida");
  const participants = x.participants.map((p: unknown) => {
    if (!p || typeof p !== "object") throw new Error("Participante inválido");
    const v = p as Record<string, unknown>;
    if (typeof v.alias !== "string" || typeof v.completed !== "boolean")
      throw new Error("Participante inválido");
    return { alias: v.alias, completed: v.completed };
  });
  return validate({
    id: x.id,
    title: x.title,
    place: x.place,
    date: x.date,
    capacity: x.capacity,
    participants,
  });
}
export class MobileLabRepository implements ShiftRepository {
  constructor(
    private base: string,
    private transport: Transport = fetch,
    private timeoutMs = 6000,
  ) {}
  private async request(path: string, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.transport(
        this.base.replace(/\/$/, "") + "/api/shifts" + path,
        { ...init, signal: controller.signal },
      );
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response;
    } finally {
      clearTimeout(timer);
    }
  }
  async list(): Promise<Shift[]> {
    const value: unknown = await (await this.request("")).json();
    if (!Array.isArray(value)) throw new Error("Lista inválida");
    return value.map(decode);
  }
  async save(shift: Shift): Promise<void> {
    await this.request("/" + encodeURIComponent(shift.id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validate(shift)),
    });
  }
  async remove(id: string): Promise<void> {
    await this.request("/" + encodeURIComponent(id), { method: "DELETE" });
  }
}
