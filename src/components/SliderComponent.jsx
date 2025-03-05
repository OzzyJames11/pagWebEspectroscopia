import React from 'react';
import './styles/SliderComponent.css';
import sliderImage from '../assets/slider.png'

const SliderComponent = () => {
  return (
    <div className="slider">
      <img src={sliderImage} alt="Slider" />
    </div>
  );
};

export default SliderComponent;