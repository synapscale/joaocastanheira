import Link from 'next/link';
import { getAllDocSlugs } from '@/lib/docs';

export default function DocsIndexPage() {
  const slugs: string[] = getAllDocSlugs().map(slugObj => slugObj.params.slug);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Documentação</h1>
      {slugs.length > 0 ? (
        <ul className="space-y-4">
          {slugs.map((slug: string) => (
            <li key={slug} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
              <Link href={`/docs/${slug}`}>
                <a className="text-xl font-semibold text-blue-700 hover:text-blue-900 hover:underline">
                  {slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700">Nenhum documento encontrado.</p>
      )}
    </div>
  );
}

