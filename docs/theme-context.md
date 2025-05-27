# Documentação do Contexto de Tema

## Visão Geral

O contexto de tema (`ThemeContext`) fornece uma maneira de gerenciar e aplicar temas visuais consistentes em toda a aplicação. Ele permite a troca dinâmica de temas, afetando cores, estilos de borda, sombras e outros aspectos visuais dos componentes.

## Estrutura do Tema

Cada tema é definido como um objeto com a seguinte estrutura:

\`\`\`typescript
type Theme = {
  name: ThemeName;           // Identificador único do tema
  label: string;             // Nome amigável para exibição
  nodeColors: NodeThemeColors; // Cores para cada categoria de nó
  canvasBg: string;          // Classe CSS para o fundo do canvas
  nodeStyle: {
    borderRadius: string;    // Classe CSS para o raio da borda dos nós
    shadowSize: string;      // Classe CSS para o tamanho da sombra dos nós
  }
}
\`\`\`

As cores para cada categoria de nó são definidas como:

\`\`\`typescript
type NodeThemeColors = {
  [key: string]: {
    background: string;      // Classe CSS para o fundo do nó
    border: string;          // Classe CSS para a borda do nó
    text: string;            // Classe CSS para o texto do nó
    headerBg: string;        // Classe CSS para o fundo do cabeçalho do nó
  }
}
\`\`\`

## Temas Disponíveis

A aplicação inclui os seguintes temas pré-definidos:

1. **Default** - Tema padrão com cores suaves
2. **Colorful** - Tema com cores vibrantes
3. **Minimal** - Tema minimalista com design limpo
4. **Dark** - Tema escuro para uso noturno
5. **Pastel** - Tema com cores pastel suaves

## Uso do Contexto

### Provedor de Tema

O `ThemeProvider` deve envolver os componentes que precisam acessar o tema:

\`\`\`tsx
import { ThemeProvider } from "@/contexts/theme-context";

function App() {
  return (
    <ThemeProvider>
      <YourComponent />
    </ThemeProvider>
  );
}
\`\`\`

### Consumindo o Tema

Use o hook `useTheme` para acessar o tema atual e funções relacionadas:

\`\`\`tsx
import { useTheme } from "@/contexts/theme-context";

function YourComponent() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  
  // Exemplo de uso das cores do tema
  return (
    <div className={currentTheme.canvasBg}>
      <div className={`${currentTheme.nodeColors.ai.background} ${currentTheme.nodeColors.ai.border} border`}>
        <div className={`${currentTheme.nodeColors.ai.headerBg} ${currentTheme.nodeColors.ai.text}`}>
          Cabeçalho do Nó
        </div>
        Conteúdo do Nó
      </div>
    </div>
  );
}
\`\`\`

### Alterando o Tema

Para alterar o tema atual:

\`\`\`tsx
import { useTheme } from "@/contexts/theme-context";

function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  
  return (
    <select 
      value={currentTheme.name} 
      onChange={(e) => setTheme(e.target.value as ThemeName)}
    >
      {availableThemes.map((theme) => (
        <option key={theme.name} value={theme.name}>
          {theme.label}
        </option>
      ))}
    </select>
  );
}
\`\`\`

## Persistência

O tema selecionado é persistido no `localStorage` com a chave `"canvas-theme"`, permitindo que a preferência do usuário seja mantida entre sessões.

## Extensão

Para adicionar um novo tema:

1. Defina o novo tema seguindo a estrutura `Theme`
2. Adicione-o ao objeto `themes` no arquivo `contexts/theme-context.tsx`
3. Atualize o tipo `ThemeName` para incluir o identificador do novo tema

Exemplo:

\`\`\`typescript
// Adicionar ao tipo ThemeName
export type ThemeName = "default" | "colorful" | "minimal" | "dark" | "pastel" | "new-theme";

// Adicionar ao objeto themes
const themes: Record<ThemeName, Theme> = {
  // Temas existentes...
  
  "new-theme": {
    name: "new-theme",
    label: "Novo Tema",
    canvasBg: "bg-indigo-50",
    nodeStyle: {
      borderRadius: "rounded-lg",
      shadowSize: "shadow-md",
    },
    nodeColors: {
      // Definir cores para cada categoria...
    }
  }
};
\`\`\`

## Considerações de Acessibilidade

Ao criar novos temas, considere:

1. Contraste suficiente entre texto e fundo (WCAG 2.1 AA requer uma taxa de contraste de pelo menos 4.5:1)
2. Não confiar apenas na cor para transmitir informações
3. Testar com ferramentas de verificação de contraste
4. Considerar usuários com daltonismo ao escolher combinações de cores
\`\`\`

## 7. Criando um arquivo de documentação para o contexto do canvas
