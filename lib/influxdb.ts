import { InfluxDB } from "@influxdata/influxdb-client";

const influxdb = new InfluxDB({
  url: process.env.INFLUX_URL!,
  token: process.env.INFLUX_TOKEN,
});

type Item = {
  result: "_result";
  table: number;
  _start: Date;
  _stop: Date;
  _time: Date;
  _value: number | string;
  _field: string;
  _measurement: "sensor_data";
};

export const influxQuery = async (fluxQuery: string): Promise<Item[]> => {
  const influxdbQueryApi = influxdb.getQueryApi(process.env.INFLUX_ORG!);
  const rows: Item[] = [];

  return new Promise((resolve, reject) => {
    influxdbQueryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        rows.push(o as Item);
      },
      error(err) {
        console.error("Query error:", err);
        reject(err);
      },
      complete() {
        resolve(rows);
      },
    });
  });
};
