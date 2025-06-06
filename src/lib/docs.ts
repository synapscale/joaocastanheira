import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';

// Define o caminho para o diretório onde seus arquivos .md da documentação estão.
// Certifique-se de que a pasta 'content/docs' existe na raiz do seu projeto Next.js (ou seja, 'frontend/content/docs')
const docsDirectory = path.join(process.cwd(), 'content/docs');

// Interface para o frontmatter dos seus documentos Markdown
// Adicione ou remova campos conforme necessário e defina se são opcionais
interface DocFrontmatter {
  title?: string;
  date?: string;
  // Exemplo de outro campo que você pode ter:
  // description?: string;
  [key: string]: unknown; // Permite outras chaves, usando 'unknown' que é mais seguro que 'any'
}

export function getSortedDocsData(): ({ id: string } & DocFrontmatter)[] {
  const fileNames: string[] = fs.readdirSync(docsDirectory);
  const allDocsData = fileNames.map((fileName: string) => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(docsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    return {
      id,
      ...(matterResult.data as DocFrontmatter),
    };
  });

  return allDocsData.sort((a: { id: string }, b: { id: string }) => {
    if (a.id < b.id) {
      return -1;
    } else {
      return 1;
    }
  });
}

export async function getDocData(id: string): Promise<{
  id: string;
  mdxSource: MDXRemoteSerializeResult & { source: string };
} & DocFrontmatter> {
  const fullPath = path.join(docsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);

  const mdxSource = await serialize(matterResult.content, { scope: matterResult.data });

  return {
    id,
    mdxSource: { ...mdxSource, source: matterResult.content },
    ...(matterResult.data as DocFrontmatter),
  };
}

export function getAllDocSlugs(): { params: { slug: string } }[] {
  const fileNames: string[] = fs.readdirSync(docsDirectory);
  return fileNames.map((fileName: string) => {
    return {
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    };
  });
}


