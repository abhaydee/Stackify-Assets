import React, { useState } from 'react';

const TRANSFORM = 100;

const Carousel: React.FC<{ images: string[] }> = ({ images }) => {
  const [current, setCurrent] = useState(0);

  const previousSlide = (): void => {
    if (current === 0) setCurrent(images.length - 1);
    else setCurrent(current - 1);
  };

  const nextSlide = (): void => {
    if (current === images.length - 1) setCurrent(0);
    else setCurrent(current + 1);
  };

  return (
    <div className="overflow-hidden relative ">
      <div
        className="flex transition ease-out duration-400"
        style={{
          transform: `translateX(-${current * TRANSFORM}%)`,
        }}
      >
        {images.map((slide, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={index}
            src={slide}
            alt={`Slide ${index}`}
            className="object-contain w-full h-full rounded-2xl"
          />
        ))}
      </div>

      <div className="absolute top-0 h-full w-full flex items-center">
        <div className="absolute left-0 ml-4">
          <button onClick={previousSlide}>
            <div className="rounded-full w-8 h-8 cursor-pointer bg-gray-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>
          </button>
        </div>

        <div className="absolute right-0 mr-4">
          <button onClick={nextSlide}>
            <div className="rounded-full w-8 h-8 cursor-pointer bg-gray-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 py-4 flex justify-center gap-3 w-full">
        {images.map((_, index) => (
          <div
            onClick={(): void => {
              setCurrent(index);
            }}
            key={`circle${index}`}
            className={`rounded-full w-5 h-5 cursor-pointer  ${
              index === current ? 'bg-white' : 'bg-gray-500'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
