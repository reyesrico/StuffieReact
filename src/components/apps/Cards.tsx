import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

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
  <div style={{
    background: 'var(--colorNeutralBackground1)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}>
    <img
      src={card.image}
      alt={card.title}
      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
    />
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 8px', color: 'var(--colorNeutralForeground1)' }}>
        {card.title}
      </h3>
      {card.description && (
        <p style={{ margin: 0, color: 'var(--colorNeutralForeground2)' }}>
          {card.description}
        </p>
      )}
    </div>
  </div>
);

const Cards = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Cards Carousel</h2>
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
  );
};

export default Cards;
