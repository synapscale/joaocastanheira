import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | SynapScale',
  description: 'Faça login na sua conta SynapScale para acessar seus workflows e automações.',
  robots: 'noindex, nofollow',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 