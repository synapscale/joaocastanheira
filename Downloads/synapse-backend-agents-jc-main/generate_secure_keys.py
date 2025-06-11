#!/usr/bin/env python3
"""
Gerador de chaves seguras para o SynapScale Backend
Execute este script para gerar todas as chaves necessárias no .env
"""

import secrets
import base64
import os
from pathlib import Path


def generate_secret_key(length: int = 64) -> str:
    """Gera uma chave secreta segura"""
    return secrets.token_urlsafe(length)


def generate_jwt_secret() -> str:
    """Gera uma chave secreta para JWT"""
    return secrets.token_urlsafe(64)


def generate_encryption_key() -> str:
    """Gera uma chave de criptografia base64"""
    key = secrets.token_bytes(32)  # 256 bits
    return base64.b64encode(key).decode('utf-8')


def generate_webhook_secret() -> str:
    """Gera uma chave secreta para webhooks"""
    return secrets.token_urlsafe(32)


def create_env_file(force: bool = False):
    """Cria arquivo .env com chaves seguras"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if env_file.exists() and not force:
        response = input("⚠️  Arquivo .env já existe. Sobrescrever? (y/N): ")
        if response.lower() != 'y':
            print("❌ Operação cancelada.")
            return
    
    if not env_example.exists():
        print("❌ Arquivo .env.example não encontrado!")
        return
    
    # Lê o template
    with open(env_example, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Gera chaves seguras
    secret_key = generate_secret_key()
    jwt_secret = generate_jwt_secret()
    encryption_key = generate_encryption_key()
    webhook_secret = generate_webhook_secret()
    
    # Substitui os placeholders
    replacements = {
        'GERE_UMA_CHAVE_SECRETA_FORTE_32_CARACTERES': secret_key,
        'GERE_UMA_CHAVE_JWT_FORTE_64_CARACTERES': jwt_secret,
        'GERE_UMA_CHAVE_CRIPTOGRAFIA_BASE64_32_BYTES': encryption_key,
        'sua_chave_webhook_segura': webhook_secret,
    }
    
    for placeholder, value in replacements.items():
        content = content.replace(placeholder, value)
    
    # Escreve o arquivo .env
    with open(env_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Arquivo .env criado com sucesso!")
    print("\n🔐 Chaves geradas:")
    print(f"   SECRET_KEY: {secret_key[:20]}...")
    print(f"   JWT_SECRET_KEY: {jwt_secret[:20]}...")
    print(f"   ENCRYPTION_KEY: {encryption_key[:20]}...")
    print(f"   WEBHOOK_SECRET: {webhook_secret[:20]}...")
    
    print("\n📝 Próximos passos:")
    print("   1. Configure suas chaves de API dos provedores LLM")
    print("   2. Configure as credenciais do banco de dados")
    print("   3. Configure as credenciais SMTP para emails")
    print("   4. Para produção, altere ENVIRONMENT=production e DEBUG=false")
    print("\n⚠️  IMPORTANTE: Nunca commite o arquivo .env no git!")


def show_keys_info():
    """Mostra informações sobre as chaves"""
    print("🔐 Tipos de chaves que serão geradas:")
    print()
    print("SECRET_KEY:")
    print("   - Chave principal da aplicação")
    print("   - Usada para criptografia geral")
    print("   - 64 caracteres aleatórios")
    print()
    print("JWT_SECRET_KEY:")
    print("   - Chave para assinatura de tokens JWT")
    print("   - Garante integridade dos tokens")
    print("   - 64 caracteres aleatórios")
    print()
    print("ENCRYPTION_KEY:")
    print("   - Chave de criptografia AES-256")
    print("   - Codificada em base64")
    print("   - 32 bytes (256 bits)")
    print()
    print("WEBHOOK_SECRET:")
    print("   - Chave para validação de webhooks")
    print("   - Garante autenticidade das requisições")
    print("   - 32 caracteres aleatórios")
    print()


if __name__ == "__main__":
    import sys
    
    # Verifica se foi passado o parâmetro --auto
    if len(sys.argv) > 1 and sys.argv[1] == "--auto":
        print("🚀 Gerador de Chaves Seguras - SynapScale Backend (MODO AUTOMÁTICO)")
        print("=" * 60)
        print("🤖 Executando automaticamente a opção 1...")
        create_env_file(force=True)
        sys.exit(0)
    
    print("🚀 Gerador de Chaves Seguras - SynapScale Backend")
    print("=" * 50)
    
    while True:
        print("\nOpções:")
        print("1. Gerar arquivo .env com chaves seguras")
        print("2. Mostrar informações sobre as chaves")
        print("3. Gerar apenas uma chave específica")
        print("4. Sair")
        
        choice = input("\nEscolha uma opção (1-4): ").strip()
        
        if choice == "1":
            create_env_file()
            break
            
        elif choice == "2":
            show_keys_info()
            
        elif choice == "3":
            print("\nTipos de chave disponíveis:")
            print("1. SECRET_KEY")
            print("2. JWT_SECRET_KEY") 
            print("3. ENCRYPTION_KEY")
            print("4. WEBHOOK_SECRET")
            
            key_choice = input("\nEscolha o tipo de chave (1-4): ").strip()
            
            if key_choice == "1":
                key = generate_secret_key()
                print(f"\nSECRET_KEY gerada: {key}")
            elif key_choice == "2":
                key = generate_jwt_secret()
                print(f"\nJWT_SECRET_KEY gerada: {key}")
            elif key_choice == "3":
                key = generate_encryption_key()
                print(f"\nENCRYPTION_KEY gerada: {key}")
            elif key_choice == "4":
                key = generate_webhook_secret()
                print(f"\nWEBHOOK_SECRET gerada: {key}")
            else:
                print("❌ Opção inválida!")
                
        elif choice == "4":
            print("👋 Até logo!")
            break
            
        else:
            print("❌ Opção inválida! Digite 1, 2, 3 ou 4.")
