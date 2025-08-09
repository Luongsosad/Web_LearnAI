export default function Head() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Learning By AI',
    url: 'https://learning-by-ai.vercel.app/',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://learning-by-ai.vercel.app/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'vi-VN',
  };
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
