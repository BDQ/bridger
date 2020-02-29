import { Event } from "../event";

const item = {
  account: "acc1",
  description: "something happened"
};

describe("Event", () => {
  test("fills in all defaults", () => {
    expect(Event.put(item)).toMatchObject({
      Item: {
        __model: "Event",
        pk: "acc1#default#2019#145",
        sk: "1558778385000#99999999999999"
      },
      TableName: "test"
    });
  });

  test("fills respects end when prenset", () => {
    expect(Event.put({ ...item, end: 1575753597991 })).toMatchObject({
      Item: {
        __model: "Event",
        pk: "acc1#default#2019#145",
        sk: "1558778385000#1575753597991"
      },
      TableName: "test"
    });
  });

  test("validates required fields", () => {
    expect(() => Event.put({})).toThrowError(/'account' is a required field/);

    expect(() => Event.put({ account: "acc1" })).toThrowError(
      /'description' is a required field/
    );
  });
});
