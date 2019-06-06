import React, { Component } from 'react';
import { TableDataProps, TableTitleProps, SearchMatchProps, 
         TableProps, SearchProps, SearchBarProps} from './types';

class TableData extends Component<TableDataProps, {}> {
  render() {
    return (
      <p>{this.props.data}</p>
    )
  }
}

class TableTitle extends Component<TableTitleProps, {}> {
  render() {
    return (
      <div className="tableTitle">
        <h3>{this.props.title}</h3>
      </div>
    )
  }
}

class SearchMatch extends Component<SearchMatchProps, {}> {
  render() {
    return (
      <div className="searchMatch">
        <p><b>{this.props.title}</b>: {this.props.match}</p>
      </div>
    );
  }
}

class Table extends Component<TableProps, {}>{
  addData(data: any, title: string) {
    // We need to get each row and store it in an array
    var rowsTitle: any[] = [];
    var search = [];
    var searchterm = this.props.searchTerm; // need this or it doesnt work
    var key = '';
    var index = 1;

    // Update row 
    data.forEach((row: any) => {
      // row.title subtited by this.props.title
      if (title.toLowerCase().indexOf(searchterm.toLowerCase()) === -1 &&
        row.tags.toLowerCase().indexOf(searchterm.toLowerCase()) === -1
      )
        return;

      // need to grab the correct match
      if (title.toLowerCase().indexOf(searchterm.toLowerCase()) === -1) {
        var m = row.tags.toLowerCase().split(' ');
        for (var i in m)
          if (m[i].indexOf(searchterm.toLowerCase()) !== -1)
            key = m[i];
      } else {
        key = title.toLowerCase();
      }

      // rowsTitle pushing Table and Search info
      rowsTitle.push(<TableTitle title={title} key={"tt" + index} />);
      
      if (searchterm !== '')
        rowsTitle.push(<SearchMatch match={key} key={"sm" + index} title={title} />);
        rowsTitle.push(<TableData data={row.tags} key={"td" + index} />);  //row.content            
      index++;
    }, title, index);

    // Then render all. Render using childs. Send them prop.title and prop.data
    var finalRows = [];
    if (searchterm !== '') {
      finalRows = rowsTitle;
    }

    return finalRows;
  }

  render() {
    var finalRows = [];
    var titles = this.props.titles;
    var data = this.props.data;

    for (var i = 0; i < data.length; i++) {
      var elementData = this.addData(data[i], "categories");
      if (finalRows.length === 0) {
        finalRows = elementData;
      }
      else {
        finalRows.concat(elementData, finalRows);
      }
    }

    return (
      <div className="searchTable">
        {finalRows}
      </div>
    );

  }
}

class Search extends Component<SearchProps, {}> {
  filterList(event: any) {
    this.props.userInput(event.target.value);
  }

  render() {
    return (
      <input type="text"
        placeholder="Search Categories"
        value={this.props.searchTerm}
        onChange={this.filterList} autoFocus>
      </input>
    );
  }
}


class SearchBar extends Component<SearchBarProps, {}> {
  state = {
    filterText: ''
  }

  handleUserInput(filter: string) {
    this.setState({
      filterText: filter
    });
  }

  render() {
    if (!this.props.categories) return <div></div>;

    let DATA = this.props.categories.map(category => category.name);
    let TITLES = ["categories"];

    return (
      <div className="searchBar">
        <Search searchTerm={this.state.filterText} userInput={this.handleUserInput} />
        <Table searchTerm={this.state.filterText} data={DATA} titles={TITLES} />
      </div>
    );
  }
}

export default SearchBar;
