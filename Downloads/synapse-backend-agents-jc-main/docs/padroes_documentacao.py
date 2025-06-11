"""Padrões de documentação para o backend SynapScale.

Este documento define os padrões de documentação a serem seguidos em todo o projeto,
garantindo consistência e clareza na documentação do código.
"""

# Padrões de Docstrings

"""Exemplo de docstring para módulo.

Este módulo contém utilitários para [descrição da funcionalidade].

Exemplo:
    ```python
    from src.synapse.utils import helper
    result = helper.format_data(data)
    ```
"""

def example_function(param1, param2=None):
    """Exemplo de docstring para função.
    
    Descrição detalhada da função, explicando seu propósito e comportamento.
    Pode ocupar múltiplas linhas e deve ser clara e concisa.
    
    Args:
        param1 (tipo): Descrição do primeiro parâmetro.
        param2 (tipo, opcional): Descrição do segundo parâmetro. Padrão é None.
            
    Returns:
        tipo: Descrição do valor retornado.
            
    Raises:
        ExceptionType: Descrição das condições que causam esta exceção.
        
    Examples:
        >>> example_function("teste", 123)
        "resultado esperado"
        
        Exemplos mais complexos podem usar blocos de código:
        ```python
        data = {"key": "value"}
        result = example_function(data, 123)
        print(result)
        ```
    """
    pass


class ExampleClass:
    """Exemplo de docstring para classe.
    
    Descrição detalhada da classe, explicando seu propósito e comportamento.
    
    Attributes:
        attr1 (tipo): Descrição do primeiro atributo.
        attr2 (tipo): Descrição do segundo atributo.
        
    Examples:
        >>> obj = ExampleClass(param="valor")
        >>> obj.method()
        "resultado esperado"
    """
    
    def __init__(self, param):
        """Inicializa a classe com os parâmetros fornecidos.
        
        Args:
            param (tipo): Descrição do parâmetro.
        """
        self.attr1 = param
        
    def method(self, param=None):
        """Exemplo de docstring para método.
        
        Args:
            param (tipo, opcional): Descrição do parâmetro. Padrão é None.
            
        Returns:
            tipo: Descrição do valor retornado.
            
        Raises:
            ExceptionType: Descrição das condições que causam esta exceção.
        """
        pass


# Padrões para Comentários de Código

# Bom: Explica o porquê, não o quê
# x += 1  # Incrementa para compensar o índice base-0

# Ruim: Apenas repete o código
# x += 1  # Adiciona 1 a x

# Bom: Explica lógica complexa
# Calcula a média ponderada usando os pesos definidos na configuração
# weighted_sum = sum(value * weights[i] for i, value in enumerate(values))
# result = weighted_sum / sum(weights)

# Padrões para Documentação de API

'''
Exemplo de documentação para endpoint:

```python
@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    category: str = Form(...),
    tags: str = Form(""),
    current_user: User = Depends(get_current_user),
):
    """Faz upload de um arquivo para o sistema.
    
    Este endpoint permite que usuários autenticados façam upload de arquivos,
    categorizem e adicionem tags para facilitar a organização.
    
    Args:
        file: O arquivo a ser enviado
        category: Categoria do arquivo (image, video, audio, document, archive)
        tags: Tags separadas por vírgula (opcional)
        current_user: Usuário autenticado (injetado via dependência)
        
    Returns:
        FileUploadResponse: Resposta contendo ID do arquivo e mensagem de sucesso
        
    Raises:
        HTTPException 400: Se o arquivo não passar nas validações de segurança
        HTTPException 401: Se o usuário não estiver autenticado
        HTTPException 429: Se o limite de taxa for excedido
        HTTPException 500: Se ocorrer um erro interno no servidor
        
    Examples:
        ```
        curl -X POST "https://api.synapscale.com/api/v1/upload" \
            -H "Authorization: Bearer {token}" \
            -F "file=@document.pdf" \
            -F "category=document" \
            -F "tags=relatório,financeiro"
        ```
        
        Response:
        ```json
        {
            "file_id": "file_1234567890abcdef",
            "message": "Arquivo enviado com sucesso"
        }
        ```
    '''

# Padrões para README

"""
# Nome do Componente

## Visão Geral

Breve descrição do componente e seu propósito no sistema.

## Funcionalidades

- Funcionalidade 1: Descrição
- Funcionalidade 2: Descrição
- ...

## Uso

```python
# Exemplo de código mostrando como usar o componente
from src.synapse.component import Feature

feature = Feature()
result = feature.process(data)
```

## Configuração

Descrição das opções de configuração disponíveis:

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| option1 | string | "default" | Descrição da opção 1 |
| option2 | int | 100 | Descrição da opção 2 |

## Dependências

- Dependência 1: Razão/uso
- Dependência 2: Razão/uso
- ...

## Considerações de Segurança

Informações sobre aspectos de segurança relevantes.

## Referências

- [Link para documentação relacionada]()
- [Link para recursos externos]()
"""
