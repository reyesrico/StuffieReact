import React, { Component } from 'react';
import moment from 'moment';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { getCountry } from '../../services/covid';
// import { getAll, getDefault } from '../../services/covid';
import { CountryDataRow } from './types';

class Covid extends Component<any, any> {
  state = {
    menu: { 'fn': null },
    all: null,
    country: [],
    countryData: []
  }

  componentDidMount() {
    this.covid();
  }

  manageCountryData = () => {
    const { country } = this.state;

    let row: CountryDataRow = country[0];

    let confirmedInc: number[] = [row.Confirmed];
    let dates: string[] = [moment(row.Date).format("MMM Do")];

    for(let i = 1; i < country.length; i++) {
      row = country[i];
      let lastRow: CountryDataRow = country[i-1];
      let increment = row.Confirmed - lastRow.Confirmed;
      confirmedInc[i] = increment;
      dates.push(moment(row.Date).format("MMM Do"));
    }

    let countryData = country.map((row: CountryDataRow, index: number) => {
      return { ...row, Confirmed: confirmedInc[index], Date: dates[index] }
    });

    return countryData;
  }

  covid = () => {
    // getDefault().then(res => this.setState({ menu: res.data }));
    // getAll().then(res => this.setState({ all: res.data }));
    getCountry("mexico").then(res => this.setState({ country: res.data }));
  }

  renderChart(country: CountryDataRow[]) {
    
    return (
      <AreaChart width={500} height={250} data={country}
      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="colorDeaths" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
        </linearGradient>
      </defs>
      <XAxis dataKey="Date" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Area type="monotone" dataKey="Confirmed" stroke="#8884d8" fillOpacity={1} fill="url(#colorConfirmed)" />
      <Area type="monotone" dataKey="Deaths" stroke="#82ca9d" fillOpacity={1} fill="url(#colorDeaths)" />
    </AreaChart>
    );
  }

  render() {
    const { country } = this.state;

    if (!country.length) return (<div>Reading ...</div>);

    let newCountry = this.manageCountryData();

    return (
      <div>
        {this.renderChart(country)}
        <hr />
        {this.renderChart(newCountry)}
        <div>Mexico Data</div>
      </div>
    );
  }
}

export default Covid;
