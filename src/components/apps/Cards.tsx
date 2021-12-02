import React from 'react';
import * as AdaptiveCards from "adaptivecards";
import cards from '../../config/cards';

const Cards = () => {
  const renderCard = (card: any) => {
    let adaptiveCard = new AdaptiveCards.AdaptiveCard();
    adaptiveCard.hostConfig = new AdaptiveCards.HostConfig({
      fontFamily: "Segoe UI, Helvetica Neue, sans-serif"
    });

    adaptiveCard.onExecuteAction = function (action) { console.log('merol'); }
    adaptiveCard.parse(card);

    return adaptiveCard.render();
  };

  return (
    <div>
      {
        cards.map((c, index) => {
          return (<div key={index} dangerouslySetInnerHTML={{ __html: renderCard(c)?.innerHTML || '' }}></div>);
        })
      }
    </div>
  );
}

export default Cards;
