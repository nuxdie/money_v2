// src/utils/transactionHelpers.ts
export function parseData(data) {
    let parsedData = addUnixtime(data);
    parsedData = parseNums(parsedData, ['Aantal']);
    parsedData = parseFloats(parsedData, ['Waarde', 'Transactiekosten en/of', 'Totaal', 'Koers', 'Lokale waarde', 'Wisselkoers']);
    addType(parsedData);
    return parsedData.sort((a, b) => a.unixtime - b.unixtime);
  }
  
  export function groupBy(arr, field) {
    const hash = {};
    arr.forEach(item => {
      if (hash[item[field]] === undefined)
        hash[item[field]] = { id: item[field], name: item.Product, transactions: [] };
      hash[item[field]].transactions.push(item);
    });
    const groups = Object.keys(hash).map(key => hash[key]);
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
  
  function addUnixtime(data) {
    return data.map(datum => {
      const [DD, MM, YYYY] = datum[0].split('-');
      const [HH, mm] = datum[1].split(':');
      datum.unixtime = Date.parse(`${YYYY}-${MM}-${DD}T${HH}:${mm}:00`);
      return datum;
    });
  }
  
  function parseNums(data, fields) {
    return data.map(datum => {
      fields.forEach(field => {
        datum[field] = parseInt(datum[field], 10);
      });
      return datum;
    });
  }
  
  function parseFloats(data, fields) {
    return data.map(datum => {
      fields.forEach(field => {
        datum[field] = parseFloat(datum[field]);
      });
      return datum;
    });
  }
  
  function addType(data) {
    return data.map(datum => {
      datum.type = datum.Aantal > 0 ? "buy" : "sell";
      datum.className = datum.Aantal > 0 ? "bg-red-100" : "bg-green-100";
      return datum;
    });
  }
  
  function sumField(field) {
    return (sum, item) => sum + item[field];
  }