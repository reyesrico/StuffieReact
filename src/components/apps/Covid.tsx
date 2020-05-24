import React, { Component } from 'react';
// import Dropdown from 'react-dropdown';
import Select from 'react-select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { isEqual, sortBy } from 'lodash';

import Loading from '../shared/Loading';
import { CountryDataRow } from './types';
import { hasProvince, hasCity, createMap, getUniqueCities, getCityData, manageCountryData, getProvinces } from '../helpers/CovidHelper';
import { getCountry, getCountries } from '../../services/covid';

import './Covid.scss';

class Covid extends Component<any, any> {
  state = {
    defaultCountrySlug: 'mexico',
    menu: { 'fn': null },
    all: null,
    country: [],
    countryData: [],
    countries: [],
    countrySelected: { name: null, Country: '', value: '', label: null },
    isLoading: false,
    provinces: [],
    provinceData: [],
    provinceSelected: { name: null, value: '', label: null },
    cities: [],
    citySelected: { name: null, value: '', label: null },
    usMap: {}
  }

  componentDidMount() {
    const { defaultCountrySlug } = this.state;

    getCountries().then((res: any) => {
      let sorted = sortBy(res.data, ['Slug']);
      let id = 0;
      let countries = sorted.map((row: any, index: number) => {
        if (row.Slug === defaultCountrySlug) {
          id = index;
        }
        return { ...row, value: row.Slug, label: row.Country, name: row.Slug };
      });

      this.setState({ countries, countrySelected: countries[id] });
    });
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (!this.state.isLoading) {
      if(!isEqual(prevState.countrySelected, this.state.countrySelected)) {
        this.getCountryInfo();
      } else {
        if (!isEqual(prevState.provinceSelected, this.state.provinceSelected)) {
          if (hasCity(this.state.country)) {
            let cities = getUniqueCities(this.state.usMap, this.state.provinceSelected);
            this.setState({ cities, citySelected: cities[0] });
          }
        }
      }  
    }
  }

  getCountryInfo = () => {
    const { countrySelected } = this.state;

    this.setState({ isLoading: true });

    getCountry(countrySelected.value)
    .then(res => {
      const country = res.data;
      let usMap, provinces, provinceSelected, cities, citySelected;

      if (hasProvince(country)) {
        usMap = createMap(country);
        provinces = getProvinces(usMap);
        provinceSelected = provinces[0];

        if (hasCity(country)) {
          cities = getUniqueCities(usMap, provinceSelected);
          citySelected = cities[0];  
        }

        this.setState({ usMap, country, cities, provinces, provinceSelected, citySelected });
      } else {
        this.setState({
          country,
          usMap: {},
          provinceSelected: { name: null },
          provinces: [],
          provinceData: [],
          citySelected: { name: null },
          cities: []
        });
      }
    })
    .finally(() => this.setState({ isLoading: false }));
  }


  renderChart(country: CountryDataRow[], managed: boolean = false) {
    const { provinceSelected, usMap, citySelected } = this.state;
    let data = hasCity(country)? getCityData(usMap, provinceSelected, citySelected):
                // @ts-ignore
               hasProvince(country)? usMap[provinceSelected.label]:
               country;

    data = managed ? manageCountryData(data) : data;

    if (!data || !data.length) return <div>No data</div>;

    return (
      <AreaChart width={500} height={250} data={data}
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
    const { country, countries, countrySelected, isLoading, provinces, provinceSelected, cities, citySelected } = this.state;

    let countryText = countrySelected.label ?? 'Country';
    if (!countries.length || isLoading) return (<Loading size="xl" message={`Loading ${countryText} Data`} />);

    let countryHasProvince = hasProvince(country);
    let countryHasCity = hasCity(country);

    return (
      <div>
        <h2>COVID {countrySelected.label} Charts</h2>
        <hr />
        <div className="covid__dropdowns">
          <Select onChange={(countrySelected: any) => this.setState({ countrySelected })} options={countries} value={countrySelected} />
          {countryHasProvince && <Select onChange={(provinceSelected: any) => this.setState({ provinceSelected })} options={provinces} value={provinceSelected} />}
          {countryHasCity && <Select onChange={(citySelected: any ) => this.setState({ citySelected })} options={cities} value={citySelected} />}
        </div>
        <hr/>
        {this.renderChart(country)}
        <hr />
        {this.renderChart(country, true)}
        <hr />
        <div className="covid__texts">
          <div className="covid__text">{countrySelected.label}</div>
          {countryHasProvince && <div className="covid__text">{provinceSelected?.label}</div>}
          {countryHasCity && <div className="covid__text">{citySelected?.label}</div>}
        </div>
      </div>
    );
  }
}

export default Covid;
