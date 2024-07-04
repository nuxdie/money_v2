// src/utils/transactionHelpers.ts

interface RawTransaction {
    Datum: string;
    Tijd: string;
    Product: string;
    ISIN: string;
    Beurs: string;
    Uitvoeringsplaats: string;
    Aantal: number;
    Koers: number;
    KoersValuta: string;
    LokaleWaarde: number;
    LokaleWaardeValuta: string;
    Waarde: number;
    WaardeValuta: string;
    Wisselkoers: number | null;
    Transactiekosten: number;
    TransactiekostenValuta: string;
    Totaal: number;
    TotaalValuta: string;
    OrderID: string;
  }
  
  interface Transaction extends RawTransaction {
    unixtime: number;
    type: 'buy' | 'sell';
    className: string;
  }
  
  interface GroupedTransactions {
    id: string;
    name: string;
    transactions: Transaction[];
    sumBuy: number;
    sumSell: number;
    sumAll: number;
    sumAantal: number;
    returnsRatio: number;
    className: string;
  }
  
  export function parseData(data: string[][]): Transaction[] {
    const parsedData: RawTransaction[] = data.map(row => ({
      Datum: row[0],
      Tijd: row[1],
      Product: row[2],
      ISIN: row[3],
      Beurs: row[4],
      Uitvoeringsplaats: row[5],
      Aantal: parseFloat(row[6]),
      Koers: parseFloat(row[7]),
      KoersValuta: row[8],
      LokaleWaarde: parseFloat(row[9]),
      LokaleWaardeValuta: row[10],
      Waarde: parseFloat(row[11]),
      WaardeValuta: row[12],
      Wisselkoers: row[13] ? parseFloat(row[13]) : null,
      Transactiekosten: parseFloat(row[14]),
      TransactiekostenValuta: row[15],
      Totaal: parseFloat(row[16]),
      TotaalValuta: row[17],
      OrderID: row[18]
    }));
  
    const parsedDataWithUnixtime = addUnixtime(parsedData);
    const typedData = addType(parsedDataWithUnixtime);
    return typedData.sort((a, b) => a.unixtime - b.unixtime);
  }
  
  export function groupBy(arr: Transaction[], field: keyof Transaction): GroupedTransactions[] {
    const hash: {[key: string]: GroupedTransactions} = {};
    arr.forEach(item => {
      const key = item[field] as string;
      if (hash[key] === undefined)
        hash[key] = { id: key, name: item.Product, transactions: [], sumBuy: 0, sumSell: 0, sumAll: 0, sumAantal: 0, returnsRatio: 0, className: '' };
      hash[key].transactions.push(item);
    });
    const groups = Object.values(hash);
    groups.forEach(group => {
      const data = group.transactions;
      group.sumBuy = data.filter(({ type }) => type === 'buy').reduce(sumField('Totaal'), 0);
      group.sumSell = data.filter(({ type }) => type === 'sell').reduce(sumField('Totaal'), 0);
      group.sumAll = data.reduce(sumField('Totaal'), 0);
      group.sumAantal = data.reduce(sumField('Aantal'), 0);
      group.returnsRatio = ((group.sumSell / group.sumBuy * -1) - 1) * 100;
      group.className = group.sumAantal > 0 ? "bg-blue-100" : (group.sumAll >= 0 ? "bg-green-100" : "bg-red-100");
    });
    return groups.sort((a, b) => b.returnsRatio - a.returnsRatio);
  }
  
  function addUnixtime(data: RawTransaction[]): (RawTransaction & { unixtime: number })[] {
    return data.map(datum => {
      const [DD, MM, YYYY] = datum.Datum.split('-');
      const [HH, mm] = datum.Tijd.split(':');
      return {
        ...datum,
        unixtime: Date.parse(`${YYYY}-${MM}-${DD}T${HH}:${mm}:00`)
      };
    });
  }
  
  function addType(data: (RawTransaction & { unixtime: number })[]): Transaction[] {
    return data.map(datum => ({
      ...datum,
      type: datum.Aantal > 0 ? "buy" : "sell",
      className: datum.Aantal > 0 ? "bg-green-100" : "bg-red-100"
    }));
  }
  
  function sumField(field: keyof Transaction) {
    return (sum: number, item: Transaction) => {
      if (item[field] === null) return sum
      if (item[field] === undefined) return sum
      if (item[field] === 0) return sum
      if (typeof item[field] === 'number') return sum + item[field]
      if (typeof item[field] === 'string')
        return item[field].trim() === '' ? sum : sum + parseFloat(item[field])
      return sum + item[field]
    }
  }