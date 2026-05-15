export default function Head() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Luolingo',
    url: 'https://luolingo.id.vn/',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://luolingo.id.vn/?q={search_term_string}',
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
