import React from "react";
import { useLocation } from "wouter";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from "@/components/ui/skeleton";
import type { Campaign } from "@/api/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CampaignSliderProps {
  campaigns: Campaign[];
  isLoading: boolean;
}

export function CampaignSlider({ campaigns, isLoading }: CampaignSliderProps) {
  const [, setLocation] = useLocation();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", skipSnaps: false },
    [
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  React.useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleCampaignClick = (campaign: Campaign) => {
    if (campaign.redirectType === "default_products") {
      setLocation("/products");
    } else if (campaign.redirectType === "custom_link" && campaign.redirectUrl) {
      // Check if internal route
      if (campaign.redirectUrl.startsWith("/")) {
        setLocation(campaign.redirectUrl);
      } else {
        // External url
        window.open(campaign.redirectUrl, "_blank");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full relative h-[400px] md:h-[500px]">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
    );
  }

  // We enforce maximum one active campaign
  const activeCampaign = campaigns?.[0];

  if (!activeCampaign || !activeCampaign.media || activeCampaign.media.length === 0) {
    return null;
  }

  const hasMultipleMedia = activeCampaign.media.length > 1;

  return (
    <div className="w-full bg-gray-50/50">
      <div className="relative overflow-hidden group" ref={hasMultipleMedia ? emblaRef : undefined}>
        <div className={`flex ${hasMultipleMedia ? "touch-pan-y" : ""}`}>
          {activeCampaign.media.map((media, index) => {
            return (
              <div
                key={`${activeCampaign.id}-${index}`}
                className="relative flex-[0_0_100%] min-w-0 h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] cursor-pointer bg-black"
                onClick={() => handleCampaignClick(activeCampaign)}
              >
                {media.type === "image" && (
                  <img
                    src={media.url}
                    alt={activeCampaign.title}
                    className="absolute block w-full h-full object-cover object-center transition-opacity duration-500"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                )}

                {media.type === "video" && (
                  <video
                    src={media.url}
                    className="absolute block w-full h-full object-cover object-center"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                )}

                {media.type === "youtube" && (
                  <div className="absolute inset-0 w-full h-full pointer-events-auto">
                    <iframe
                      src={media.url}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows for Multiple Media */}
        {hasMultipleMedia && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white text-black opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:flex h-10 w-10"
              onClick={(e) => {
                e.stopPropagation();
                emblaApi?.scrollPrev();
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white text-black opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:flex h-10 w-10"
              onClick={(e) => {
                e.stopPropagation();
                emblaApi?.scrollNext();
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Navigation Dots for Multiple Media */}
        {hasMultipleMedia && scrollSnaps.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-10">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  emblaApi?.scrollTo(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
