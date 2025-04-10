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

const EmblaCarousel: React.FC<PropType> = (props) => {
    const { slides, options } = props;
    const [emblaRef, emblaApi] = useEmblaCarousel(options,
      [ // Array of plugins
          Autoplay({
              delay: 4000, // Delay between slides in milliseconds (4 seconds)
              stopOnInteraction: true,
              stopOnMouseEnter: true,
              stopOnFocusIn: true,
          })
      ]
    );
    const [selectedIndex, setSelectedIndex] = useState(0);

    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick
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
        return <div>No slides to display.</div>;
    }

    return (
      <section className="embla relative">
          <div className="embla__viewport" ref={emblaRef}>
              <div className="embla__container">
                  {slides.map((slideData, index) => (
                    <div
                      className={`embla__slide ${
                        index === selectedIndex ? 'is-selected' : ''
                      }`}
                      key={slideData.id}
                    >
                        <section className="flex flex-col items-center justify-center rounded-3xl bg-white w-full h-auto p-11">
                            {/* Render slide content as before */}
                            {slideData.type === 'image' && slideData.imageUrl && (
                              <div className="relative w-full h-full">
                                  <Image
                                    src={slideData.imageUrl}
                                    alt={slideData.altText || 'Carousel image'}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    priority={index === 0}
                                    sizes="(max-width: 768px) 90vw, 75vw"
                                  />
                              </div>
                            )}
                            {slideData.type === 'custom' && (
                              <>
                                  {slideData.title && <h3 className="text-black text-8xl">{slideData.title}</h3>}
                                  <div className="flex flex-row justify-end items-center mt-8">
                                      {slideData.description && <p className="text-wrap size-1/3 mr-40 text-left">{slideData.description}</p>}
                                      {slideData.imageUrl && <Image
                                        src={slideData.imageUrl}
                                        alt={slideData.altText || 'Carousel image'}
                                        width={0}
                                        height={0}
                                        className="rounded-3xl w-auto h-auto"
                                      />}
                                  </div>
                              </>
                            )}
                        </section>
                    </div>
                  ))}
              </div>
          </div>

          <PrevButton
            onClick={onPrevButtonClick}
            disabled={prevBtnDisabled}
          />
          <NextButton
            onClick={onNextButtonClick}
            disabled={nextBtnDisabled}
          />
      </section>
    );
};

export default EmblaCarousel;