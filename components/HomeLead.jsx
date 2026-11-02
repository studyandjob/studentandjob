import HomeSlider from './HomeSlider';
import JobSearchForm from './JobSearchForm';

/** Top of the home page: one big rounded slider with the search pill floating over its bottom edge. */
export default function HomeLead({ slides = [], slideSpeed = '1x' }) {
  return (
    <div className="relative">
      <HomeSlider slides={slides} speed={slideSpeed} />
      <div className="relative z-10 -mt-7 px-3 sm:px-8">
        <JobSearchForm />
      </div>
    </div>
  );
}
