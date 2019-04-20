import React, { Component } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { AreaChart, Area } from 'recharts';
import { Treemap } from 'recharts';
import { PieChart, Pie } from 'recharts';
import { ScatterChart, ZAxis, Scatter } from 'recharts';
import { RadialBarChart, RadialBar, RadialBarData } from 'recharts';
import { barChartData, treemapChartData, pieChartData01, pieChartData02, radialChartData } from '../services/charts';

class Charts extends Component {
  state = {
    barChartData: [],
    treemapChartData: [],
    pieChartData01: [],
    pieChartData02: [],
    radialChartData: [],  
  };

  render() {
    return (
      <div>
        <BarChart width={600} height={300} data={barChartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Bar dataKey="pv" fill="#8884d8" />
          <Bar dataKey="uv" fill="#82ca9d" />
        </BarChart>

        <LineChart width={600} height={300} data={barChartData}>
          <XAxis dataKey="name" padding={{ left: 30, right: 30 }} />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>

        <AreaChart width={730} height={250} data={barChartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
          <Area type="monotone" dataKey="pv" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
        </AreaChart>

        <Treemap
          width={730}
          height={250}
          data={treemapChartData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
        />

        <PieChart width={800} height={400}>
          <Pie dataKey="value" data={pieChartData01} cx={200} cy={200} outerRadius={60} fill="#8884d8" />
          <Pie dataKey="value" data={pieChartData02} cx={200} cy={200} innerRadius={70} outerRadius={90} fill="#82ca9d" label />
        </PieChart>

        <ScatterChart width={730} height={250}
          margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="value" name="stature" unit="cm" />
          <YAxis dataKey="value" name="weight" unit="cm" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="Data01" data={pieChartData01} fill="#8884d8" />
          <Scatter name="Data02" data={pieChartData02} fill="#82ca9d" />
        </ScatterChart>

        <RadialBarChart width={730} height={250} innerRadius="10%" outerRadius="80%" data={radialChartData} startAngle={180} endAngle={0}>
          <RadialBar angleAxisId={15} label={{ fill: '#666', position: 'insideStart' }} background dataKey='uv' />
          <Legend iconSize={10} width={120} height={140} layout='vertical' verticalAlign='middle' align="right" />
          <Tooltip />
        </RadialBarChart>
      </div>
    );
  }
}

export default Charts;
