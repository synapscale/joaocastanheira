import React from "react";

// Função para obter o ícone do provedor
export function getProviderIcon(provider: string): React.ReactNode {
  switch (provider) {
    case "openai":
      return "i";
    case "deepseek":
      return <ProviderIcon src="/deepseek-logo-inspired.png" alt="DeepSeek" />;
    case "qwen":
      return <ProviderIcon src="/placeholder-ct6n6.png" alt="Qwen" />;
    case "google":
      return <ProviderIcon src="/google-g-logo.png" alt="Google" />;
    case "anthropic":
      return <ProviderIcon src="/anthropic-logo.png" alt="Anthropic" />;
    case "xai":
      return <ProviderIcon src="/placeholder-akjv1.png" alt="xAI" />;
    case "meta":
      return <ProviderIcon src="/abstract-infinity-logo.png" alt="Meta" />;
    default:
      return "i";
  }
}

// Componente para encapsular os ícones
const ProviderIcon: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  return (
    <img
      src={src}
      alt={alt}
      className="w-4 h-4"
    />
  );
};

// Nomes de exibição para os provedores
export const providerNames: Record<string, string> = {
  openai: "OpenAI",
  deepseek: "DeepSeek",
  qwen: "Qwen",
  google: "Google",
  anthropic: "Anthropic",
  xai: "xAI",
  meta: "Meta",
};
