#!/usr/bin/env python3
"""
Visualizador de arquivo .env - Mostra valores sem mascaramento
"""
import os
import sys
from pathlib import Path

def show_env_values(env_file=".env", show_secrets=False):
    """Mostra valores do arquivo .env de forma legível"""
    
    env_path = Path(env_file)
    if not env_path.exists():
        print(f"❌ Arquivo {env_file} não encontrado!")
        return
    
    print(f"🔍 VISUALIZADOR DO ARQUIVO: {env_file}")
    print("=" * 60)
    
    with open(env_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    current_section = ""
    line_num = 0
    
    for line in lines:
        line_num += 1
        line = line.rstrip()
        
        # Seções (comentários com ===)
        if line.startswith('#') and '===' in line:
            current_section = line.strip('# =')
            print(f"\n🏷️  {current_section}")
            print("-" * 40)
            continue
        
        # Comentários normais
        if line.startswith('#') or not line.strip():
            continue
        
        # Variáveis de ambiente
        if '=' in line:
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip()
            
            # Determinar se é um valor sensível
            sensitive_keys = [
                'SECRET', 'KEY', 'PASSWORD', 'TOKEN', 'API_KEY', 
                'JWT', 'DATABASE_URL', 'REDIS', 'SMTP_PASSWORD'
            ]
            
            is_sensitive = any(sensitive in key.upper() for sensitive in sensitive_keys)
            
            if value:
                if is_sensitive and not show_secrets:
                    # Mostra apenas os primeiros e últimos caracteres
                    if len(value) > 8:
                        masked_value = f"{value[:4]}...{value[-4:]}"
                    else:
                        masked_value = "*" * len(value)
                    print(f"🔐 {key}: {masked_value} (mascarado)")
                else:
                    print(f"✅ {key}: {value}")
            else:
                print(f"⚪ {key}: (vazio)")
    
    print("\n" + "=" * 60)
    print("💡 DICAS:")
    print("• Para ver valores sensíveis: python view_env.py --show-secrets")
    print("• Para editar: nano .env")
    print("• Para testar carregamento: python test_env.py")

if __name__ == "__main__":
    show_secrets = "--show-secrets" in sys.argv or "-s" in sys.argv
    env_file = ".env"
    
    # Permite especificar arquivo diferente
    for arg in sys.argv[1:]:
        if not arg.startswith('-') and arg.endswith(('.env', '.env.example')):
            env_file = arg
            break
    
    show_env_values(env_file, show_secrets)
