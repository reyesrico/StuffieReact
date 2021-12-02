import React from 'react';
import AdaptiveCards from "adaptivecards";

const card = {
  "type": "AdaptiveCard",
  "version": "1.0",
  "body": [
    {
      "type": "Image",
      "url": "https://adaptivecards.io/content/adaptive-card-50.png"
    },
    {
      "type": "TextBlock",
      "text": "Hello **Adaptive Cards!**"
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "Learn more",
      "url": "https://adaptivecards.io"
    },
    {
      "type": "Action.OpenUrl",
      "title": "GitHub",
      "url": "https://github.com/Microsoft/AdaptiveCards"
    }
  ]
};

const Cards = () => {
  console.log('merol');
  let adaptiveCard = new AdaptiveCards.AdaptiveCard();
  adaptiveCard.hostConfig = new AdaptiveCards.HostConfig({
    fontFamily: "Segoe UI, Helvetica Neue, sans-serif"
  });

  adaptiveCard.onExecuteAction = function (action) { alert("Ow!"); }
  adaptiveCard.parse(card);
  let renderedCard = adaptiveCard.render();

  return (
    <div>
      {renderedCard}
    </div>
  )
}

export default Cards;
