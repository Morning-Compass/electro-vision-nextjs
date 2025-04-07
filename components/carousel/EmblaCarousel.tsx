'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';

type PropType = {
    slides: string[];
    options?: EmblaOptionsType;
    altText?: string;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
    const { slides, options, altText = "Carousel image" } = props;
    const [emblaRef, emblaApi] = useEmblaCarousel(options);
    // --- State to track selected index ---
    const [selectedIndex, setSelectedIndex] = useState(0);

    // --- Update selected index state when slide changes ---
    const updateSelectedIndex = useCallback((api: EmblaCarouselType) => {
        if (!api) return;
        setSelectedIndex(api.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        updateSelectedIndex(emblaApi); // Set initial index
        emblaApi.on('select', updateSelectedIndex); // Update on slide change
        emblaApi.on('reInit', updateSelectedIndex); // Update on reinitialization

        // Clean up listener on component unmount
        return () => {
            emblaApi?.off('select', updateSelectedIndex);
            emblaApi?.off('reInit', updateSelectedIndex);
        };
    }, [emblaApi, updateSelectedIndex]);

    // --- Click handler for slides ---
    const handleSlideClick = useCallback(
        (index: number) => {
            if (!emblaApi) return;
            // Check if the clicked slide is the currently selected one
            if (index === selectedIndex) return; // Do nothing if clicking the selected slide
            emblaApi.scrollTo(index);
        },
        [emblaApi, selectedIndex]
    );

    if (!slides || slides.length === 0) {
        return <div>No images to display.</div>;
    }

    return (
        <section className="embla">
            <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container">
                    {slides.map((imageUrl, index) => (
                        <div
                            className={`embla__slide ${
                                index === selectedIndex ? 'is-selected' : ''
                            }`}
                            key={index}
                            onClick={() => handleSlideClick(index)}
                        >
                            <Image
                                src={imageUrl}
                                alt={`${altText} ${index + 1}`}
                                fill
                                style={{ objectFit: 'contain' }}
                                priority={index === 0}
                                sizes="(max-width: 768px) 90vw, 70vw"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EmblaCarousel;