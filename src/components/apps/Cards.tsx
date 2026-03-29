import React from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './Cards.scss';

interface CardItem {
  id: string;
  title: string;
  image: string;
  description?: string;
  link?: string;
}

const sampleCards: CardItem[] = [
  {
    id: '1',
    title: 'Card 1',
    image: 'https://picsum.photos/400/300?random=1',
    description: 'Sample card description',
    link: '#'
  },
  {
    id: '2',
    title: 'Card 2',
    image: 'https://picsum.photos/400/300?random=2',
    description: 'Another card description',
    link: '#'
  },
  {
    id: '3',
    title: 'Card 3',
    image: 'https://picsum.photos/400/300?random=3',
    description: 'Third card description',
    link: '#'
  }
];

const CardSlide = ({ card }: { card: CardItem }) => (
  <div className="cards__card">
    <img src={card.image} alt={card.title} />
    <div className="cards__card-body">
      <h3 className="cards__card-title">{card.title}</h3>
      {card.description && (
        <p className="cards__card-description">{card.description}</p>
      )}
    </div>
  </div>
);

const Cards = () => {
  const { t } = useTranslation();
  return (
    <div className="cards">
      <div className="cards__header">
        <h2 className="cards__title">{t('apps.cards')}</h2>
      </div>
      <div className="cards__carousel">
        <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }}
      >
        {sampleCards.map((card) => (
          <SwiperSlide key={card.id}>
            <CardSlide card={card} />
          </SwiperSlide>
        ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Cards;
