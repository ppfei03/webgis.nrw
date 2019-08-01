import csv from 'csvtojson';

export default class CSVParser {
  constructor() {}

  // CSV handler functions

  getAsText(fileToRead, callback) {
    console.log('reading file');

    const reader = new FileReader();
    // Read file into memory as UTF-8
    reader.readAsText(fileToRead);
    console.log('reading file');
    // Handle errors load
    reader.onload = event => {
      const csvString = event.target.result;
      const title = $('#csv_title').val();
      const unit = $('#csv_unit').val();
      this.processData(csvString, title, unit, dataset => {
        console.log(dataset);
        callback(dataset);
      });
    };
    reader.onerror = this.errorHandler;
  }

  processData(csvString, title, unit, callback) {
    let header;
    const customDataset = {
      title: title,
      unit: unit,
      MIN: 0,
      MAX: 0,
      data: []
    };

    csv({
      delimiter: ';'
    })
      .fromString(csvString, {
        encoding: 'utf8'
      })
      .on('header', parsedHeader => {
        console.log(parsedHeader);
        header = parsedHeader;
      })
      .on('csv', csvRow => {
        // Wenn die Row mit einer Zahl beginnt..
        if (!isNaN(Number(csvRow[0]))) {
          const cityObject = {
            RS: csvRow[0],
            AGS: csvRow[0],
            GEN: csvRow[1],
            MIN: 0,
            MAX: 0,
            data: {}
          };
          header.forEach((element, idx) => {
            if (!isNaN(Number(element)) && element !== '') {
              cityObject.data[`${element}`] = csvRow[idx].replace(',', '.');
              // eslint-disable-next-line no-undef
              cityObject.MAX = this._setAndFindMax(
                cityObject.MAX,
                Number(csvRow[idx])
              );
              cityObject.MIN = this._setAndFindMin(
                cityObject.MIN,
                Number(csvRow[idx])
              );
            } else if (customDataset.unit === 'wahlen') {
              if (idx > 1) {
                if (!isNaN(Number(csvRow[idx].replace(',', '.')))) {
                  cityObject.data[`${element}`] = csvRow[idx].replace(',', '.');
                  cityObject.MAX = this._setAndFindMax(
                    cityObject.MAX,
                    Number(csvRow[idx].replace(',', '.'))
                  );
                  cityObject.MIN = this._setAndFindMin(
                    cityObject.MIN,
                    Number(csvRow[idx].replace(',', '.'))
                  );
                }
              }
            }
          }, this);

          customDataset.data.push(cityObject);
        }
      })
      .on('done', () => {
        console.log(customDataset)
        callback(customDataset);
      });
  }

  _setAndFindMax(MAX, csvRowIndx) {
    if (MAX < csvRowIndx) {
      MAX = csvRowIndx;
    }

    return MAX;
  }

  _setAndFindMin(MIN, csvRowIndx) {
    if (MIN > csvRowIndx || MIN === 0) {
      MIN = csvRowIndx;
    }

    return MIN;
  }

  errorHandler(evt) {
    if (evt.target.error.name === 'NotReadableError') {
      alert("Canno't read file !");
    }
  }
}
