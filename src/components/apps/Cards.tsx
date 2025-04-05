import React, { useEffect, useRef } from 'react';
import cards from '../../config/cards';
import * as AdaptiveCards from "adaptivecards";

interface CardData {
  type: string;
  version?: string;
  body: any[];
  actions?: any[];
}

export const AdaptiveCard = (props: CardData) => {
  const cardContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (cardContainerRef.current && props) {
      const adaptiveCard = new AdaptiveCards.AdaptiveCard();
      adaptiveCard.parse(props);
      const renderedCard = adaptiveCard.render();

      // Clear previous card and append new one
      cardContainerRef.current.innerHTML = "";
      if (renderedCard) {
        cardContainerRef.current.appendChild(renderedCard);
      }
    }
  }, [props]);

  return <div ref={cardContainerRef} />;
};

const Cards = () => {
  const renderCard = (card: CardData, index: number) => {
    return (
      <AdaptiveCard
        type={card.type}
        version={card.version} // Optional, can be omitted if not needed
        key={index}
        body={card.body}
        actions={card.actions} // Pass actions if available
      />
    );
  };

  return (
    <div>
      {cards.map((c, index) => renderCard(c, index))}
    </div>
  );
}

export default Cards;
