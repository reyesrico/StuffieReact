import React from 'react';
import { Action } from 'adaptivecards';
import AdaptiveCard from 'react-adaptivecards';
import cards from '../../config/cards';

const Cards = () => {
  const renderCard = (card: any, index: number) => {
    return (<AdaptiveCard
      key={index}
      payload={card}
      onExecuteAction={(action: Action) => console.log(action)}
      style={{width: '500px', border: '1px solid black', "background-color": 'red'}}
    />);
  };

  return (
    <div>
      {cards.map((c, index) => renderCard(c, index))}
    </div>
  );
}

export default Cards;
