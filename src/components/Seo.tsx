import { Helmet } from "react-helmet-async";

interface SeoAuthor {
  name: string;
  url?: string;
}

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
  datePublished?: string;
  dateModified?: string;
  author?: SeoAuthor;
}

const ORIGIN = "https://hub.mrflow.com.br";
const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/QOxsOCPLdoWqcZHw4rluKIZw7h52/social-images/social-1777558596702-Logo_Welcome_Hub.webp";

export function Seo({
  title,
  description,
  path,
  image,
  type = "website",
  jsonLd,
  noindex,
  datePublished,
  dateModified,
  author,
}: SeoProps) {
  const url = `${ORIGIN}${path}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow"} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="Mr Flow Welcome Hub" />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {type === "article" && datePublished && (
        <meta property="article:published_time" content={datePublished} />
      )}
      {type === "article" && (dateModified || datePublished) && (
        <meta property="article:modified_time" content={dateModified ?? datePublished!} />
      )}
      {type === "article" && author?.name && (
        <meta property="article:author" content={author.name} />
      )}
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
      ))}
    </Helmet>
  );
}
