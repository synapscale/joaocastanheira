/**
 * Testes E2E para o Chat
 * 
 * Este arquivo contém testes end-to-end para o fluxo completo do chat.
 */

import { test, expect } from '@playwright/test';

test.describe('Chat Interface E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a página de chat
    await page.goto('/chat');
  });

  test('deve carregar a interface de chat corretamente', async ({ page }) => {
    // Verifica se os elementos principais estão presentes
    await expect(page.locator('h1')).toContainText('Nova conversa');
    await expect(page.locator('textarea[placeholder="Digite sua mensagem..."]')).toBeVisible();
  });

  test('deve enviar uma mensagem e receber resposta', async ({ page }) => {
    // Digita e envia uma mensagem
    await page.fill('textarea[placeholder="Digite sua mensagem..."]', 'Olá, como vai?');
    await page.click('button[aria-label="Enviar mensagem"]');
    
    // Verifica se a mensagem do usuário aparece
    await expect(page.locator('text=Olá, como vai?')).toBeVisible();
    
    // Espera pela resposta do assistente
    await expect(page.locator('text=Processando...')).toBeVisible();
    await expect(page.locator('text=Processando...')).not.toBeVisible({ timeout: 10000 });
    
    // Verifica se há uma resposta do assistente
    await expect(page.locator('text=Assistente')).toBeVisible();
  });

  test('deve criar uma nova conversa', async ({ page }) => {
    // Envia uma mensagem inicial
    await page.fill('textarea[placeholder="Digite sua mensagem..."]', 'Primeira conversa');
    await page.click('button[aria-label="Enviar mensagem"]');
    
    // Espera pela resposta
    await expect(page.locator('text=Processando...')).not.toBeVisible({ timeout: 10000 });
    
    // Cria uma nova conversa
    await page.click('button[aria-label="Nova conversa"]');
    
    // Verifica se o textarea está vazio
    await expect(page.locator('textarea[placeholder="Digite sua mensagem..."]')).toBeEmpty();
    
    // Envia uma mensagem na nova conversa
    await page.fill('textarea[placeholder="Digite sua mensagem..."]', 'Segunda conversa');
    await page.click('button[aria-label="Enviar mensagem"]');
    
    // Verifica se a nova mensagem aparece
    await expect(page.locator('text=Segunda conversa')).toBeVisible();
  });

  test('deve alternar entre conversas', async ({ page }) => {
    // Cria primeira conversa
    await page.fill('textarea[placeholder="Digite sua mensagem..."]', 'Conversa 1');
    await page.click('button[aria-label="Enviar mensagem"]');
    await expect(page.locator('text=Processando...')).not.toBeVisible({ timeout: 10000 });
    
    // Cria segunda conversa
    await page.click('button[aria-label="Nova conversa"]');
    await page.fill('textarea[placeholder="Digite sua mensagem..."]', 'Conversa 2');
    await page.click('button[aria-label="Enviar mensagem"]');
    await expect(page.locator('text=Processando...')).not.toBeVisible({ timeout: 10000 });
    
    // Abre a barra lateral
    await page.click('button[aria-label="Toggle sidebar"]');
    
    // Clica na primeira conversa
    await page.click('text=Conversa 1', { exact: false });
    
    // Verifica se a primeira conversa está visível
    await expect(page.locator('text=Conversa 1')).toBeVisible();
    await expect(page.locator('text=Conversa 2')).not.toBeVisible();
  });

  test('deve mostrar e ocultar configurações', async ({ page }) => {
    // Clica no botão de mostrar configurações
    await page.click('text=Mostrar Configurações');
    
    // Verifica se os seletores estão visíveis
    await expect(page.locator('text=GPT-4o')).toBeVisible();
    await expect(page.locator('text=Nenhuma')).toBeVisible();
    await expect(page.locator('text=Padrão')).toBeVisible();
    
    // Clica no botão de ocultar configurações
    await page.click('text=Ocultar Configurações');
    
    // Verifica se os seletores estão ocultos
    await expect(page.locator('text=GPT-4o')).not.toBeVisible();
  });

  test('deve navegar entre abas', async ({ page }) => {
    // Verifica se está na página de chat
    await expect(page.url()).toContain('/chat');
    
    // Clica no link para o Canvas
    await page.click('a[href="/canvas"]');
    
    // Verifica se navegou para o Canvas
    await expect(page.url()).toContain('/canvas');
    
    // Clica no link para voltar ao Chat
    await page.click('a[href="/chat"]');
    
    // Verifica se voltou para o Chat
    await expect(page.url()).toContain('/chat');
  });

  test('deve ser responsivo em dispositivos móveis', async ({ page }) => {
    // Define o tamanho da tela para mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verifica se o botão de menu móvel está visível
    await expect(page.locator('button[aria-label="Abrir menu de navegação"]')).toBeVisible();
    
    // Clica no botão de menu
    await page.click('button[aria-label="Abrir menu de navegação"]');
    
    // Verifica se a sidebar aparece
    await expect(page.locator('text=Conversas')).toBeVisible();
    
    // Clica fora para fechar
    await page.click('div.fixed.inset-0');
    
    // Verifica se a sidebar desaparece
    await expect(page.locator('text=Conversas')).not.toBeVisible();
  });
});
