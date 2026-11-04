import HomeSlider from './HomeSlider';

/** Top of the home page: one big rounded slider. */
export default function HomeLead({ slides = [], slideSpeed = '1x' }) {
  return (
    <div className="relative mx-auto max-w-6xl">
      <HomeSlider slides={slides} speed={slideSpeed} />
    </div>
  );
}
