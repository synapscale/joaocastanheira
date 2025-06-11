#!/usr/bin/env python3
"""
Visualizador de arquivo .env sem mascaramento
Uso: python view_env_clear.py [--section SECAO]
"""
import sys
import re
from pathlib import Path

def view_env_file(section_filter=None):
    """Visualiza o arquivo .env de forma clara"""
    env_file = Path(".env")
    
    if not env_file.exists():
        print("❌ Arquivo .env não encontrado!")
        return
    
    print("🔍 VISUALIZADOR .ENV SEM MASCARAMENTO")
    print("=" * 50)
    
    with open(env_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    current_section = None
    section_count = {}
    
    for i, line in enumerate(lines, 1):
        line = line.rstrip()
        
        # Detectar seções
        if line.startswith("# ===="):
            match = re.search(r'# =+ (.+?) =+', line)
            if match:
                current_section = match.group(1).strip()
                section_count[current_section] = section_count.get(current_section, 0)
        
        # Filtrar por seção se especificado
        if section_filter and current_section:
            if section_filter.lower() not in current_section.lower():
                continue
        
        # Colorir variáveis
        if '=' in line and not line.startswith('#'):
            key, value = line.split('=', 1)
            if value.strip():
                print(f"{i:3}: 🔑 {key} = {value}")
            else:
                print(f"{i:3}: ⚪ {key} = (vazio)")
        elif line.startswith('# ===='):
            print(f"\n📁 {current_section}")
            print("-" * 40)
        elif line.startswith('#'):
            continue  # Pular comentários simples
        elif line.strip():
            print(f"{i:3}: {line}")
    
    print(f"\n📊 Resumo:")
    vars_count = sum(1 for line in lines if '=' in line and not line.startswith('#'))
    print(f"   Total de variáveis: {vars_count}")
    print(f"   Total de seções: {len(section_count)}")

if __name__ == "__main__":
    section = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == "--section" else None
    view_env_file(section)
