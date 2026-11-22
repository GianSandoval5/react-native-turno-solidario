import {
  Shift,
  validate,
  enroll,
  cancel,
  complete,
  free,
  validDate,
} from "../../src/features/shifts/domain/shift";
import {
  decode,
  MobileLabRepository,
} from "../../src/features/shifts/data/repository";
import { ShiftStore } from "../../src/features/shifts/presentation/store";
const sample: Shift = {
  id: "demo",
  title: "Registro",
  place: "Patio",
  date: "2026-11-29",
  capacity: 2,
  participants: [],
};
test("valid dates and capacity bounds", () => {
  expect(validDate("2026-02-30")).toBe(false);
  expect(validDate("2028-02-29")).toBe(true);
  expect(() => validate({ ...sample, capacity: 0 })).toThrow();
  expect(() => validate({ ...sample, capacity: 1.5 })).toThrow();
});
test("enroll, prevent duplicates and overbooking, preserve original", () => {
  const a = enroll(sample, " Ana ");
  expect(sample.participants).toHaveLength(0);
  expect(free(a)).toBe(1);
  expect(() => enroll(a, "ana")).toThrow();
  expect(() => enroll(a, " ")).toThrow();
  expect(() => enroll(enroll(a, "Sol"), "Luz")).toThrow();
});
test("complete and cancel respect status", () => {
  const a = enroll(sample, "Ana");
  const b = complete(a, "Ana");
  expect(b.participants[0].completed).toBe(true);
  expect(() => cancel(b, "Ana")).toThrow();
  expect(() => complete(b, "Ana")).toThrow();
  expect(cancel(a, "Ana").participants).toHaveLength(0);
});
test("DTO round trip and malformed response", () => {
  const a = complete(enroll(sample, "Ana"), "Ana");
  expect(decode(JSON.parse(JSON.stringify(a)))).toEqual(a);
  expect(() =>
    decode({ ...a, participants: [{ alias: "A", completed: 1 }] }),
  ).toThrow();
});
const response = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;
test("HTTP list, PUT and DELETE routes", async () => {
  const transport = jest.fn(async (..._args: Parameters<typeof fetch>) =>
    response(200, [sample]),
  );
  const repo = new MobileLabRepository("http://localhost:4566/", transport);
  expect(await repo.list()).toEqual([sample]);
  await repo.save(sample);
  await repo.remove("demo");
  expect(transport.mock.calls[0][0]).toBe("http://localhost:4566/api/shifts");
  expect(transport.mock.calls[1][1]?.method).toBe("PUT");
  expect(JSON.parse(String(transport.mock.calls[1][1]?.body))).toEqual(sample);
  expect(transport.mock.calls[2][1]?.method).toBe("DELETE");
});
test.each([401, 403, 500])("HTTP %i rejected", async (status) => {
  const repo = new MobileLabRepository("http://localhost", async () =>
    response(status, {}),
  );
  await expect(repo.list()).rejects.toThrow("HTTP " + status);
});
test("timeout abort is propagated", async () => {
  const repo = new MobileLabRepository(
    "http://localhost",
    async (_url, init) =>
      new Promise((_, reject) =>
        init?.signal?.addEventListener("abort", () =>
          reject(new Error("timeout")),
        ),
      ),
    5,
  );
  await expect(repo.list()).rejects.toThrow("timeout");
});
test("store preserves confirmed state on failure and recovers", async () => {
  let fail = false;
  const repo = {
    list: async () => [sample],
    save: async () => {
      if (fail) throw new Error("offline");
    },
    remove: async () => {},
  };
  const s = new ShiftStore(repo);
  await s.refresh();
  fail = true;
  expect(await s.save(enroll(sample, "Ana"))).toBe(false);
  expect(s.snapshot().shifts).toEqual([sample]);
  expect(s.snapshot().error).toBe("offline");
  fail = false;
  expect(await s.save(enroll(sample, "Ana"))).toBe(true);
  expect(s.snapshot().error).toBeNull();
  expect(await s.remove(s.snapshot().shifts[0])).toBe(false);
});
