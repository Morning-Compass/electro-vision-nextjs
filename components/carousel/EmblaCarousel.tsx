// src/components/carousel/EmblaCarousel.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Import hooks
import Image from 'next/image';
import { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel'; // Import EmblaCarouselType
// Remove imports for arrow buttons if they are not used elsewhere
// import { PrevButton, NextButton, usePrevNextButtons } from './EmblaCarouselArrowButtons';
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
        [emblaApi, selectedIndex] // Depend on emblaApi and selectedIndex
    );

    // Remove logic related to usePrevNextButtons if arrows are fully removed
    // const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

    if (!slides || slides.length === 0) {
        return <div>No images to display.</div>;
    }

    return (
        <section className="embla">
            <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container">
                    {slides.map((imageUrl, index) => (
                        // --- Add onClick and conditional class ---
                        <div
                            className={`embla__slide ${
                                index === selectedIndex ? 'is-selected' : ''
                            }`} // Add 'is-selected' class
                            key={index}
                            onClick={() => handleSlideClick(index)} // Add click handler
                        >
                            <Image
                                src={imageUrl}
                                alt={`${altText} ${index + 1}`}
                                fill
                                style={{ objectFit: 'contain' }} // Or 'cover'
                                priority={index === 0}
                                sizes="(max-width: 768px) 90vw, 70vw" // Adjust as needed
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Remove Controls Section --- */}
            {/*
            <div className="embla__controls">
                <div className="embla__buttons">
                    <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
                    <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
                </div>
                {/* Dots can remain if desired */}
            {/*</div>
            */}
        </section>
    );
};

export default EmblaCarousel;