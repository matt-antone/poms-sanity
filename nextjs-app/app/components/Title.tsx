import * as React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';
import { cn } from '@/app/lib/utils';

interface ITitleProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  showBreadcrumbs?: boolean;
}

const Title: React.FunctionComponent<ITitleProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  className,
  titleLevel = 1,
  showBreadcrumbs = true
}) => {
  const HeadingTag = `h${titleLevel}` as keyof JSX.IntrinsicElements;

  return (
    <div className={cn("page-title", className)}>
      {showBreadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}
      <div className="max-w-3xl">
        <HeadingTag className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
          {title}
        </HeadingTag>
        {subtitle && (
          <p className="mt-4 text-base lg:text-lg leading-relaxed uppercase font-light text-inherit">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default Title; 