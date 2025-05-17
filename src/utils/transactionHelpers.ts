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
  
  export interface Transaction extends RawTransaction {
    unixtime: number;
    id: string;
    type: 'buy' | 'sell';
    className: string;
  }
  
  export interface GroupedTransactions {
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
      id: datum.Datum + datum.Tijd + datum.Aantal,
      type: datum.Aantal > 0 ? "buy" : "sell",
      className: datum.Aantal > 0 ? "bg-green-100" : "bg-red-100"
    }));
  }
  
  type NumericFields = {
    [K in keyof Transaction]: Transaction[K] extends number ? K : never
  }[keyof Transaction];
  
  function sumField(field: NumericFields) {
    return (sum: number, item: Transaction) => {
      return sum + (item[field] as number);
    }
  }
import { evaluate } from 'mathjs';

export function evaluateMathExpression(expression: string): number | null {
  if (expression === null || typeof expression === 'undefined' || expression.trim() === '') {
    return null;
  }
  try {
    const result = evaluate(expression);
    if (typeof result === 'number' && !isNaN(result)) {
      return result;
    }
    return null;
  } catch (error) {
    console.error("Error evaluating math expression:", error);
    return null;
  }
}