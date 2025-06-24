import Link from "next/link";
import MainNavigation from "./MainNavigation";
import { sanityFetch } from "@/sanity/lib/live";
// import { OptimizedImage } from "@/app/components/ui/optimized-image"; // This import is unused
import MobileNavigation from "./MobileNavigation";
import Image from "next/image";

export default async function Header() {
  const { data } = await sanityFetch<any>({
    query: `*[_type == "settings"][0]{
    siteLogo{
      ...,
      asset->,
      alt
    },
    showTitle,
    title
}`,
  });

  let actualWidth = 125;
  let actualHeight = 65;
  let logoLinkContent = null;

  if (data?.siteLogo?.asset) {
    const logoAsset = data.siteLogo.asset;
    const logoWidth = logoAsset.metadata?.dimensions?.width;
    const logoHeight = logoAsset.metadata?.dimensions?.height;

    if (logoWidth && logoHeight) {
      const logoAspectRatio = logoWidth / logoHeight;
      actualHeight = 65;
      actualWidth = Math.round(actualHeight * logoAspectRatio);
    } else {
      console.warn("[Header] Logo dimensions missing in metadata, using default display size.");
    }

    logoLinkContent = (
      <Link href="/" className="flex gap-2 items-center">
        <Image
          src={data.siteLogo.asset.url}
          alt={data.siteLogo.alt || data.title || "Site Logo"}
          width={actualWidth}
          height={actualHeight}
          className="w-[125px] xl:w-[165px]"
          loading="eager"
          priority
        />
        {data.showTitle && (
          <span className="text-2xl">
            {data.title}
          </span>
        )}
      </Link>
    );
  } else {
    if (data?.title) {
      logoLinkContent = (
        <Link href="/" className="flex gap-2 items-center">
          {data.showTitle && <span className="text-2xl">{data.title}</span>}
        </Link>
      );
    }
    console.warn("[Header] Site logo data is missing.");
  }

  return (
    <header id="site-header" className="layout-block relative z-50">
      <div className="container">
        <div className="flex justify-between items-center gap-8">
          {logoLinkContent}
          <MainNavigation />
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}

