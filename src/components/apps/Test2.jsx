import React from 'react';
import './Test2.scss';

class Test2 extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
			keywordInput: '',
			values: [],
			dictionary: {},
			dictionaryIndex: {},
			textToCypher: '',
			charSelected: ''
		}
  }
	
	componentDidUpdate(prevProps, prevState) {
		if(prevState.keywordInput !== this.state.keywordInput) {
			this.renderSourceText();
		}
	}
	
	renderKeywordInput() {
    let keywordInput = '';
		return (
			<div className="app__keyword">
				<h2 className="app__title">Keyword</h2>
				<input className="app__input" type='text' onChange={event => event && (keywordInput = event.target.value)} />
				<button onClick={event => event && this.setState({ keywordInput: keywordInput.toUpperCase() })}>Update</button>
      </div>
		)
  }
  
	renderTable() {
		const { keywordInput, charSelected, dictionaryIndex, values } = this.state;

		let isEmpty = Object.keys(dictionaryIndex).length === 0; 

		return (
			<table className="app__table">
        <thead>
          <tr>
            {keywordInput.split('').map((c, i) => {
							const index = !isEmpty ? dictionaryIndex[charSelected] : -1;
							const className = index === i ? "app__table-head-selected" : "app__table-head";
							return (
								<td className={className} key={i}>{c}</td>
							);
						})}
          </tr>
        </thead>
				<tbody>
          <tr>
					  {values.map((v, i) => {
							const index = !isEmpty ? dictionaryIndex[charSelected] : -1;
							const className = index === i ? "app__table-body-selected" : "app__table-body";

							return (
								<td className={className} key={i}>
									{v}
								</td>);
						})}
          </tr>
				</tbody>
			</table>
		)
	}
	
	renderSourceText() {
		const { keywordInput } = this.state;
		
		let size = keywordInput.length;
		let token = 0;
		let dictionary = {};
		let dictionaryIndex = {};
    let init = 'A'.charCodeAt(0);
    let end = 'Z'.charCodeAt(0);
    let range = end - init; 
    let values = keywordInput.split('').map(c => c.charCodeAt(0) - 'A'.charCodeAt(0));

		for(let i = 0; i<=range ; i++) {			
			let offset = values[token] + i;
      offset = (offset <= range ) ? offset : (offset - range - 1);
      
			dictionary = {
				...dictionary,
				[String.fromCharCode(i + init)]: String.fromCharCode(offset + init)
			};
			
			dictionaryIndex = {
				...dictionaryIndex,
				[String.fromCharCode(i + init)]: token
			}

			token = (token < size-1) ? (token+1) : 0;
 		}
		
		this.setState({ dictionary, dictionaryIndex, values, charSelected: '' });
  }
  
  renderSourceTable() {
    const { dictionary } = this.state;

    return (
      <table className="app__table">
        <thead>
          <tr>
            {Object.keys(dictionary).map((c, i) => {
              return (
							<td className="app__table-head" key={i}>
								<button onClick={event => event && this.setState({ charSelected: c })}>{c}</button>
							</td>);
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Object.values(dictionary).map((v, i) => {
              return <td className="app__table-body" key={i}>{v}</td>
            })}
          </tr>
        </tbody>
      </table>
    )
  }
	
	renderSourceDisplay() {
		return (
			<div className="app__display">
				<input className="app__input" type="text" onChange={event => event && this.setState({ 
					textToCypher: event.target.value.toUpperCase()
				})} value={this.state.textToCypher}></input>
				<button onClick={event => event && this.setState({ textToCypher: '' })}>Clear</button>
			</div>
		);
	}
	
	renderCypherText() {
		const { textToCypher, dictionary } = this.state;
    
    const cypherText = textToCypher.split('').map(c => dictionary[c]).join('');

		return (
			<div className="app__cypher">
				<h2 className="app__title">Cypher Text</h2>
				<input disabled={true} type='text' value={cypherText} />
			</div>
		)
	}
	  
  render() {
	  const { keywordInput, dictionary, textToCypher } = this.state;
		
		let keys = Object.keys(dictionary);

    return (
      <div className="app">
        {this.renderKeywordInput()}
        {keywordInput && this.renderTable()}
        {keys.length > 0 && this.renderSourceDisplay()}
        {keys.length > 0 && this.renderSourceTable()}
        {textToCypher && this.renderCypherText()}
      </div>
    )
  }
}
/*
export default Test2;

const api = (function () {
  const peopleFruits = {
    alice: {
      apple: 2, 
      grape: 24,
      pear: 3 
    },
    bob: {
      apple: undefined,
      strawberry: null,
      pear: 12,
      watermelon: 1
    }
  }

  const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const getNumFruit = async (name, fruit) => {
    const wait = Math.floor(5000 * Math.random());
    
    await sleep(wait);
    
    return peopleFruits[name][fruit];
  }
  
  const getFruits = () => {
    let uniqueFruits = {};
    
    Object.values(peopleFruits).forEach(fruitsObject => {
      Object.keys(fruitsObject)
        .forEach(fruitName => {
         if (!!fruitsObject[fruitName] && !uniqueFruits[fruitName]) {
           uniqueFruits[fruitName] = 0;
         }
      });            
    });
    
    return Object.keys(uniqueFruits);
  }

  return {
    names: Object.keys(peopleFruits), // fill in, [ 'alice', 'bob' ]
    availableFruits: getFruits(), // fill in, [ 'apple', 'grape', 'pear', 'watermelon' ]
    getNumFruit,
  }
})();

console.log(api.names);
console.log(api.availableFruits);

async logMessage = () => {
  const peopleTypes = {};
  api.names.forEach(name => {
    peopleTypes[name] = { total: 0, numberFruits: [] };
    await Promise.all(api.availableFruits.map(async (fruit) => {
      const value = await api.getNumFruit(name, fruit);
      if (!!value) {
        peopleTypes[name] = { ...peopleTypes[name], total: peopleTypes[name].total + value };
        peopleTypes[name] = { ...peopleTypes[name], numberFruits:  [...peopleTypes[name].numberFruits, `${fruit} - ${value}`] };      
      }
    }));
 });
  
  Object.keys
}

/* 
log a message for each person in the form of:
"${NAME} has ${NUMBER_OF_TYPES} type(s) of fruit: [${FRUIT_NAME} - ${NUMBER_OF_FRUIT},]. All in all, ${NAME} has ${SUM} fruit(s)!"

"alice, has 3 types of fruit: apple - 2, grape - 24, pear - 3. All in all, alice has 29 fruits!"
"bob, has 2 types of fruit: pear - 12, watermelon - 1. All in all, bob has 13 fruits!"
*/


