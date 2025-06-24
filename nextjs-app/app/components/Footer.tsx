import Link from "next/link";
import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/live";
import { settingsQuery } from "@/sanity/lib/queries";
import type { SettingsQueryResult, NavItem as SanityNavItem } from "@/types/sanity.types";
import { cn } from "@/app/lib/utils";

// Removed local SanityFetchResponse as it was causing issues

interface FooterNavItem extends Omit<SanityNavItem, 'page' | 'post'> {
  _key: string;
  page?: { title?: string; slug?: string };
  hrefLabel?: string;
  internalName?: string;
  dropdownLabel?: string;
  title?: string;
}

const resolveLinkUrl = (link: FooterNavItem): string => {
  if (link.linkType === "page" && link.page?.slug) {
    return link.page.slug.startsWith("/") ? link.page.slug : `/${link.page.slug}`;
  }
  if (link.linkType === "href" && link.href) {
    return link.href;
  }
  return "#";
};

const getLinkText = (link: FooterNavItem): string => {
  if (link.linkType === "page" && link.page?.title) return link.page.title;
  if (link.linkType === "href" && link.hrefLabel) return link.hrefLabel;
  if (link.internalName) return link.internalName;
  if (link.dropdownLabel) return link.dropdownLabel;
  if (link.title) return link.title;
  return "More";
};

export default async function Footer() {
  const { data: settings } = await sanityFetch<any>({
    query: `*[_type == "settings"][0]{
      siteLogo{
        ...,
        asset->,
        alt
      },
      showTitle,
      title
    }`,
    stega: false,
  });

  let logoContent = null;

  if (settings?.siteLogo?.asset?.url) {
    const logoAsset = settings.siteLogo.asset;
    const logoAlt = settings.siteLogo.alt || settings.title || "Site Logo";
    let actualWidth = 125;
    let actualHeight = 65;

    if (logoAsset.metadata?.dimensions?.width && logoAsset.metadata?.dimensions?.height) {
      const aspectRatio = logoAsset.metadata.dimensions.width / logoAsset.metadata.dimensions.height;
      actualHeight = 65;
      actualWidth = Math.round(actualHeight * aspectRatio);
    }

    logoContent = (
      <Link href="/" className="flex gap-2 items-center">
        <Image
          src={logoAsset.url}
          alt={logoAlt}
          width={actualWidth}
          height={actualHeight}
          className="w-[125px] xl:w-[165px]"
          loading="eager"
        />
        {settings.showTitle && (
          <span className="text-2xl">
            {settings.title}
          </span>
        )}
      </Link>
    );
  } else if (settings?.title) {
    logoContent = (
      <Link href="/" className="flex gap-2 items-center">
        {settings.showTitle && <span className="text-2xl">{settings.title}</span>}
      </Link>
    );
  }

  return (
    <footer id="site-footer" className="layout-block clear-both text-foreground">
      <div className="container">
        <div className="md:flex justify-between">
          <p>
            {logoContent}<br />
            4500 Park Granada, Suite 206<br />
            Calabasas, CA 91302<br />
            <span className="font-medium">Toll Free:</span> 800-578-8802<br />
            <span className="font-medium">PH:</span> 818-449-9300<br />
            <span className="font-medium">CA License:</span> #0814733<br />
          </p>
          <div className="pt-8 md:pt-0">
            <h2 className="text-xl text-primary mb-2">Company Info</h2>
            <nav>
              <ul className="grid grid-cols-2 lg:block">
                <li><Link href="/about" className="inline-block text-lg text-secondary py-4 my-2 lg:py-0 lg:my-0">About</Link></li>
                <li><Link href="/about/exec-management-team" className="inline-block text-lg text-secondary py-4 my-2 lg:py-0 lg:my-0">Our Team</Link></li>
                <li><Link href="/privacy-policy" className="inline-block text-lg text-secondary py-4 my-2 lg:py-0 lg:my-0">Privacy</Link></li>
                <li><Link href="/contact-us" className="inline-block text-lg text-secondary py-4 my-2 lg:py-0 lg:my-0">Contact Us</Link></li>
                <li><Link href="/sitemap" className="inline-block text-lg text-secondary py-4 my-2 lg:py-0 lg:my-0">Sitemap</Link></li>
              </ul>
            </nav>
          </div>
        </div>
        <p className="text-center py-4">
          &copy;{new Date().getFullYear()} {settings?.title || "Untitled"}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
