const cards = [
  // {
  //   "type": "AdaptiveCard",
  //   "version": "1.0",
  //   "body": [
  //     {
  //       "type": "Image",
  //       "url": "https://adaptivecards.io/content/adaptive-card-50.png",
  //     },
  //     {
  //       "type": "TextBlock",
  //       "text": "Hello **Adaptive Cards!**",
  //     },
  //   ],
  //   "actions": [
  //     {
  //       "type": "Action.OpenUrl",
  //       "title": "Learn more",
  //       "url": "https://adaptivecards.io",
  //     },
  //     {
  //       "type": "Action.OpenUrl",
  //       "title": "GitHub",
  //       "url": "https://github.com/Microsoft/AdaptiveCards",
  //     },
  //     {
  //       "type": "Action.Submit",
  //       "id": "clickMe",
  //       "title": "Click me!"
  //     }
  //   ],
  // },
  {
    "type": "AdaptiveCard",
    "version": "1.6",
    "body": {
      "type": "Carousel",
      "timer": 5000,
      "pages": [
        {
          "type": "CarouselPage",
          "id": "firstCarouselPage",
          "selectAction": {
            "type": "Action.OpenUrl",
            "title": "Click for more information about the first carousel page!",
            "url": "https://adaptivecards.io/"
          },
          "items": [
            {
              "type": "Image",
              "url": "https://adaptivecards.io/content/cats/1.png",
              "size": "medium"
            }
          ]
        },
        {
          "type": "CarouselPage",
          "id": "theSecondCarouselPage",
          "items": [
            {
              "type": "Image",
              "url": "https://adaptivecards.io/content/cats/2.png",
              "size": "medium"
            }
          ]
        },
        {
          "type": "CarouselPage",
          "id": "last-carousel-page",
          "items": [
            {
              "type": "Image",
              "url": "https://adaptivecards.io/content/cats/3.png",
              "altText": "That's a cool cat!",
              "size": "medium"
            }
          ]
        }
      ]
    },
    "actions": [
      {
        "type": "Action.OpenUrl",
        "title": "See more",
        "url": "https://adaptivecards.io"
      },
      {
        "type": "Action.OpenUrl",
        "title": "Another action",
        "url": "https://adaptivecards.io"
      }
    ]
  },
  {
    "type": "AdaptiveCard",
    "version": "1.0",
    "actions": [
      {
        "type": "Action.Submit",
        "id": "clickMe",
        "title": "Click me!"
      }
    ]
  },
  // {
  //   "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  //   "type": "AdaptiveCard",
  //   "version": "1.0",
  //   "body": [
  //     {
  //       "type": "TextBlock",
  //       "size": "default",
  //       "text": "1. Right click on the report menu and select open from the task list:",
  //       "wrap": true,
  //       "maxLines": 0
  //     },
  //     {
  //       "type": "Image",
  //       "url": "https://adaptivecards.io/content/cats/3.png",
  //       "size": "auto",
  //       "horizontalAlignment": "center",
  //       "selectAction": "No"
  //     }
  //   ]
  // }
];

export default cards;
