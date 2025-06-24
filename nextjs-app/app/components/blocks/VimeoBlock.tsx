import * as React from 'react';
import { cn } from '@/app/lib/utils';

interface IVimeoBlockProps {
  url: string;
  vimeoId?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  autoplay?: boolean;
  controls?: boolean;
  responsive?: boolean;
  className?: string;
}

const VimeoBlock: React.FunctionComponent<IVimeoBlockProps> = ({
  url,
  vimeoId,
  aspectRatio = '16:9',
  autoplay = false,
  controls = true,
  responsive = true,
  className
}) => {
  // Extract Vimeo ID from URL if not provided
  const extractedId = vimeoId || url.match(/(?:vimeo\.com\/(?:.*#|.*\/videos\/)?)(\d+)/)?.[1];

  if (!extractedId) {
    console.error('VimeoBlock: Invalid Vimeo URL or ID provided', { url, vimeoId });
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-gray-600">Invalid Vimeo video</p>
      </div>
    );
  }

  // Build embed URL with parameters
  const embedUrl = new URL(`https://player.vimeo.com/video/${extractedId}`);
  embedUrl.searchParams.set('autoplay', autoplay ? '1' : '0');
  embedUrl.searchParams.set('controls', controls ? '1' : '0');
  embedUrl.searchParams.set('responsive', responsive ? '1' : '0');
  embedUrl.searchParams.set('dnt', '1'); // Do not track

  // Aspect ratio classes
  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square'
  };

  return (
    <div className={cn(
      "w-full",
      responsive && "max-w-4xl mx-auto",
      className
    )}>
      <div className={cn(
        "relative overflow-hidden rounded-lg",
        aspectRatioClasses[aspectRatio]
      )}>
        <iframe
          src={embedUrl.toString()}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`Vimeo video ${extractedId}`}
        />
      </div>
    </div>
  );
};

export default VimeoBlock; 