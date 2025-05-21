// EmblaCarousel.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  PrevButton,
  NextButton,
  usePrevNextButtons
} from '@/components/carousel/EmblaCarouselArrowButtons';

type SlideData = {
  id: string | number;
  type: string;
  title?: string;
  imageUrl?: string;
  altText?: string;
  description?: string;
};

type PropType = {
  slides: SlideData[];
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = ({ slides, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    options,
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const updateSelectedIndex = useCallback((api: EmblaCarouselType) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    updateSelectedIndex(emblaApi);
    emblaApi.on('select', updateSelectedIndex);
    emblaApi.on('reInit', updateSelectedIndex);

    return () => {
      emblaApi?.off('select', updateSelectedIndex);
      emblaApi?.off('reInit', updateSelectedIndex);
    };
  }, [emblaApi, updateSelectedIndex]);

  if (!slides || slides.length === 0) {
    return <div role="status">No slides to display.</div>;
  }

  return (
    <section className="embla relative w-full" aria-label="Feature carousel">
      <div className="embla__viewport overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex items-start">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`embla__slide min-w-0 flex-[0_0_100%] transition-opacity duration-300 ${
                index === selectedIndex ? 'opacity-100' : 'opacity-70'
              }`}
              aria-hidden={index !== selectedIndex}
            >
              <section className="flex flex-col items-center justify-center rounded-3xl bg-white w-full p-4 md:p-6 lg:p-8 text-center">
                {slide.type === 'image' && slide.imageUrl && (
                  // Original image type section remains similar but ensures min-height doesn't restrict large images
                  <div className="relative w-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] flex items-center justify-center">
                    <Image
                      src={slide.imageUrl}
                      alt={slide.altText || 'Carousel image'}
                      fill
                      priority={index === 0}
                      style={{ objectFit: 'contain' }}
                      sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 50vw"
                    />
                  </div>
                )}

                {slide.type === 'custom' && (
                  <div>
                    {slide.title && (
                      <h3 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 text-black">
                        {slide.title}
                      </h3>
                    )}
                    <div className="flex flex-col lg:flex-row justify-center lg:justify-around items-center w-full lg:h-[50vh] gap-4 lg:gap-6">
                      {slide.description && (
                        <p className="text-wrap w-full lg:w-2/5 xl:w-1/3 text-sm sm:text-base text-center lg:text-left order-2 lg:order-1">
                          {slide.description}
                        </p>
                      )}
                      {slide.imageUrl && (
                        <div className="w-full max-w-lg sm:max-w-xl lg:w-4/5 xl:w-3/4 flex justify-center items-center order-1 lg:order-2 my-4 lg:my-0">
                          <Image
                            src={slide.imageUrl}
                            alt={slide.altText || 'Carousel image'}
                            width={0}
                            height={0}
                            className="rounded-3xl object-contain w-full h-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </div>
          ))}
        </div>
      </div>

      <PrevButton
        onClick={onPrevButtonClick}
        disabled={prevBtnDisabled}
        aria-label="Previous slide"
      />
      <NextButton
        onClick={onNextButtonClick}
        disabled={nextBtnDisabled}
        aria-label="Next slide"
      />
    </section>
  );
};

export default EmblaCarousel;