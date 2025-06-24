import * as React from 'react';
import Image from 'next/image';
import { urlForImage } from '@/sanity/lib/image';
import { cn } from '@/app/lib/utils';

interface IArrowImageBlockProps {
  block: {
    _type: 'arrowImageBlock';
    image?: {
      asset?: {
        _ref: string;
        _type: 'reference';
      };
      hotspot?: any;
      crop?: any;
    };
    alt?: string;
    direction?: 'left' | 'right';
    className?: string;
  };
}

const ArrowImageBlock: React.FunctionComponent<IArrowImageBlockProps> = ({ block }) => {
  const { image, alt, direction = 'left', className } = block;

  if (!image?.asset) {
    return null;
  }

  const imageUrl = urlForImage({ source: image });
  if (!imageUrl) {
    return null;
  }

  return (
    <div className={cn(
      'hidden lg:block not-prose relative overflow-hidden aspect-square w-full',
      className
    )}>
      <Image
        src={imageUrl}
        alt={alt || ''}
        width={300}
        height={300}
        className="aspect-square w-full object-cover"
      />

      {direction === 'left' ? (
        <>
          <div className="mix-blend-multiply bg-secondary border-[0.5rem] border-white absolute inset-0 rotate-45 translate-x-[70%]">
            &nbsp;
          </div>
          <div className="border-[0.5rem] border-white absolute inset-0 rotate-45 translate-x-[70%]">
            &nbsp;
          </div>
        </>
      ) : (
        <>
          <div className="mix-blend-multiply bg-primary absolute inset-0 rotate-45 -translate-x-[70%]">
            &nbsp;
          </div>
          <div className="border-[0.5rem] border-white absolute inset-0 rotate-45 -translate-x-[70%]">
            &nbsp;
          </div>
        </>
      )}
    </div>
  );
};

export default ArrowImageBlock; 