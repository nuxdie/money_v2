import initSqlJs from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import fs from "fs/promises";
import * as schema from "../src/schema.ts";

export async function loadDatabase(path: string) {
  const SQL = await initSqlJs({
    locateFile: (file) => `../public/${file}`,
  });

  let buffer: Buffer | null = null;
  let shouldInit = false;

  try {
    buffer = await fs.readFile(path);
  } catch {
    shouldInit = true;
  }

  const database = new SQL.Database(buffer);
  const db = drizzle(database, { schema });

  async function save() {
    const exportBuffer = database.export();
    await fs.writeFile(path, exportBuffer);
  }

  if (shouldInit) {
    try {
      const initialMigrationSql = await fs.readFile(
        "../drizzle/0000_luxuriant_johnny_blaze.sql",
        "utf8"
      );

      database.exec(initialMigrationSql);
      await save();
    } catch (err) {
      console.error(err);
    }
  }

  return {
    db,
    save,
  };
}


console.log("⌛ Seeding database...");
const { db, save } = await loadDatabase("./sqlite.db");

// Existing user data
await db.insert(schema.users).values({ name: "John" });
await db.insert(schema.users).values({ name: "Jane" });

// New financial data
const financialData = [
  { date: "2012-09-30", income: null, worth: 918 },
  { date: "2012-10-30", income: null, worth: 1032 },
  { date: "2012-11-30", income: null, worth: 469 },
  { date: "2012-12-30", income: null, worth: 788 },
  { date: "2013-01-30", income: 2106, worth: 2456 },
  { date: "2013-02-28", income: 42, worth: 1687 },
  { date: "2013-03-30", income: 1085, worth: 454 },
  { date: "2013-04-30", income: 1076, worth: 1113 },
  { date: "2013-05-30", income: 994, worth: 602 },
  { date: "2013-06-30", income: 852, worth: 478 },
  { date: "2013-07-30", income: 1139, worth: 1796 },
  { date: "2013-08-30", income: 871, worth: 620 },
  { date: "2013-09-30", income: 1098, worth: 562 },
  { date: "2013-10-30", income: 1575, worth: null },
  { date: "2013-11-30", income: 1430, worth: null },
  { date: "2013-12-30", income: 2244, worth: 4280 },
  { date: "2014-01-30", income: 122, worth: 3449 },
  { date: "2014-02-28", income: 1066, worth: null },
  { date: "2014-03-30", income: 1179, worth: null },
  { date: "2014-04-30", income: 988, worth: null },
  { date: "2014-05-30", income: 1601, worth: 4656 },
  { date: "2014-06-30", income: 210, worth: 6098 },
  { date: "2014-07-30", income: 1196, worth: 5437 },
  { date: "2014-08-30", income: 1107, worth: 1132 },
  { date: "2014-09-30", income: 1039, worth: 1137 },
  { date: "2014-10-30", income: 1194, worth: 1413 },
  { date: "2014-11-30", income: 1088, worth: 1309 },
  { date: "2014-12-30", income: 1555, worth: 2292 },
  { date: "2015-01-30", income: 1249, worth: 1335 },
  { date: "2015-02-28", income: 1294, worth: 2089 },
  { date: "2015-03-30", income: 1388, worth: 2330 },
  { date: "2015-04-30", income: 1572, worth: 1708 },
  { date: "2015-05-20", income: 1603, worth: 1393 },
  { date: "2015-06-20", income: 1465, worth: null },
  { date: "2015-07-20", income: 656, worth: null },
  { date: "2015-08-30", income: 305, worth: -953 },
  { date: "2015-09-30", income: 1523, worth: -968 },
  { date: "2015-10-30", income: 1609, worth: -681 },
  { date: "2015-11-30", income: 1523, worth: -705 },
  { date: "2015-12-30", income: 1421, worth: 241 },
  { date: "2016-01-30", income: 1253, worth: -297 },
  { date: "2016-02-27", income: 1445, worth: 1283 },
  { date: "2016-03-30", income: 1458, worth: 509 },
  { date: "2016-04-30", income: 1585, worth: -56 },
  { date: "2016-05-30", income: 2018, worth: 612 },
  { date: "2016-06-30", income: 982, worth: -2052 },
  { date: "2016-07-30", income: 1879, worth: -3152 },
  { date: "2016-08-30", income: 1544, worth: -3749 },
  { date: "2016-09-30", income: 1562, worth: -4546 },
  { date: "2016-10-30", income: 1607, worth: -4200 },
  { date: "2016-11-30", income: 2622, worth: -4067 },
  { date: "2016-12-30", income: 3301, worth: -3070 },
  { date: "2017-01-30", income: 2855, worth: -4474 },
  { date: "2017-02-28", income: 2882, worth: -4071 },
  { date: "2017-03-30", income: 3056, worth: -4052 },
  { date: "2017-04-30", income: 3030, worth: -2933 },
  { date: "2017-05-30", income: 2990, worth: -1593 },
  { date: "2017-06-30", income: 3064, worth: -1607 },
  { date: "2017-07-30", income: 4482, worth: 360 },
  { date: "2017-08-30", income: 9210, worth: 1890 },
  { date: "2017-09-30", income: 5454, worth: 3048 },
  { date: "2017-10-30", income: 4671, worth: 772 },
  { date: "2017-11-30", income: 4819, worth: 2030 },
  { date: "2017-12-31", income: 4777, worth: 1471 },
  { date: "2018-01-31", income: 5024, worth: 2262 },
  { date: "2018-02-28", income: 9023, worth: 6712 },
  { date: "2018-03-30", income: 5520, worth: 8080 },
  { date: "2018-04-30", income: 5497, worth: 4804 },
  { date: "2018-05-30", income: 5191, worth: 4421 },
  { date: "2018-06-30", income: 5146, worth: 3981 },
  { date: "2018-07-31", income: 5187, worth: 3241 },
  { date: "2018-08-31", income: 5182, worth: 4044 },
  { date: "2018-09-30", income: 5236, worth: 8120 },
  { date: "2018-10-31", income: 9750, worth: 11803 },
  { date: "2018-11-30", income: 5225, worth: 13803 },
  { date: "2018-12-30", income: 5095, worth: 14692 },
  { date: "2019-01-31", income: 5151, worth: 16377 },
  { date: "2019-02-28", income: 13505, worth: 24991 },
  { date: "2019-03-30", income: 6706, worth: 26563 },
  { date: "2019-04-30", income: 5937, worth: 26244 },
  { date: "2019-06-04", income: 6129, worth: 26554 },
  { date: "2019-07-09", income: 6505, worth: 26361 },
  { date: "2019-08-01", income: 5605, worth: 27693 },
  { date: "2019-09-03", income: 5524, worth: 27653 },
  { date: "2019-10-08", income: 5516, worth: 26116 },
  { date: "2019-10-31", income: 5622, worth: 28866 },
  { date: "2019-12-05", income: 5082, worth: 27522 },
  { date: "2019-12-29", income: 5085, worth: 33248 },
  { date: "2020-02-01", income: 5651, worth: 29625 },
  { date: "2020-03-06", income: 13582, worth: 39636 },
  { date: "2020-04-01", income: 7172, worth: 33662 },
  { date: "2020-04-27", income: 6044, worth: 37631 },
  { date: "2020-05-25", income: 5682, worth: 40406 },
  { date: "2020-06-27", income: 5989, worth: null },
  { date: "2020-07-21", income: 6692, worth: 40908 },
  { date: "2020-08-01", income: 6395, worth: 41599 },
  { date: "2020-08-28", income: 6251, worth: 49121 },
  { date: "2020-10-07", income: 6342, worth: 44503 },
  { date: "2020-11-07", income: 6313, worth: 44114 },
  { date: "2020-12-01", income: 6470, worth: 47933 },
  { date: "2021-01-05", income: 6530, worth: 50128 },
  { date: "2021-02-02", income: 7735, worth: 50253 },
  { date: "2021-03-05", income: 9919, worth: 63991 },
  { date: "2021-04-02", income: 10142, worth: 69491 },
  { date: "2021-05-02", income: 6442, worth: 72398 },
  { date: "2021-06-09", income: 6530, worth: 67950 },
  { date: "2021-07-01", income: 6344, worth: 67396 },
  { date: "2021-08-06", income: 6295, worth: 68931 },
  { date: "2021-09-01", income: 6354, worth: 67507 },
  { date: "2021-10-02", income: 6208, worth: 68886 },
  { date: "2021-11-15", income: 6126, worth: 56477 },
  { date: "2021-12-02", income: 7282, worth: 53163 },
  { date: "2022-01-16", income: 6612, worth: 50526 },
  { date: "2022-02-02", income: 6565, worth: 50446 },
  { date: "2022-03-02", income: 17308, worth: 54274 },
  { date: "2022-04-04", income: 10848, worth: 71391 },
  { date: "2022-05-04", income: 6418, worth: 66008 },
  { date: "2022-06-01", income: 5380, worth: 69247 },
  { date: "2022-07-18", income: 6221, worth: 59022 },
  { date: "2022-08-01", income: 4934, worth: 66470 },
  { date: "2022-09-08", income: 4812, worth: 59171 },
  { date: "2022-10-03", income: 4713, worth: 54095 },
  { date: "2022-11-03", income: 4747, worth: 54406 },
  { date: "2022-12-01", income: 5149, worth: 56166 },
  { date: "2023-01-25", income: 5250, worth: 51673 },
  { date: "2023-02-01", income: 5349, worth: 54072 },
  { date: "2023-04-17", income: 11072, worth: 74100 },
  { date: "2023-05-01", income: 5419, worth: 75660 },
  { date: "2023-06-01", income: 5500, worth: null },
  { date: "2023-07-15", income: 5528, worth: 84995 },
  { date: "2023-08-01", income: 5418, worth: 85913 },
  { date: "2023-09-04", income: 5337, worth: 84921 },
  { date: "2023-10-02", income: 5209, worth: 81239 },
  { date: "2023-11-05", income: 5815, worth: 77013 },
  { date: "2023-12-03", income: 5394, worth: 83811 },
  { date: "2024-01-01", income: 5490, worth: 92708 },
  { date: "2024-02-01", income: 5476, worth: 91361 },
  { date: "2024-03-08", income: 5816, worth: 97480 },
  { date: "2024-04-01", income: 8686, worth: 104377 },
  { date: "2024-05-01", income: 5292, worth: 17345 },
  { date: "2024-06-02", income: 10957, worth: 110899 },
  { date: "2024-07-03", income: 0, worth: 105821 },
];

for (const data of financialData) {
  await db.insert(schema.financialData).values(data);
}

await save();
console.log("✅ Database seeded.");