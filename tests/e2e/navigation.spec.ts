describe('Cypress E2E Tests', () => {
  beforeEach(() => {
    // Visitar a página inicial antes de cada teste
    cy.visit('/');
  });

  it('deve navegar para a página de chat', () => {
    // Clicar no link ou botão de navegação para o chat
    cy.get('a[href*="chat"], button:contains("Chat")').first().click();
    
    // Verificar se estamos na página de chat
    cy.url().should('include', '/chat');
    
    // Verificar se os componentes principais do chat estão presentes
    cy.get('[data-component="ChatInterface"]').should('exist');
    cy.get('textarea').should('exist');
    cy.get('button:contains("Enviar")').should('exist');
  });

  it('deve enviar uma mensagem no chat', () => {
    // Navegar para a página de chat
    cy.visit('/chat');
    
    // Digitar uma mensagem no campo de texto
    const mensagem = 'Olá, isso é um teste automatizado!';
    cy.get('textarea').type(mensagem);
    
    // Clicar no botão de enviar
    cy.get('button:contains("Enviar")').click();
    
    // Verificar se a mensagem aparece na área de mensagens
    cy.contains(mensagem).should('exist');
    
    // Verificar se o sistema está processando ou respondeu
    cy.get('[data-role="assistant-message"]').should('exist', { timeout: 10000 });
  });

  it('deve alternar entre temas claro e escuro', () => {
    // Verificar tema inicial
    cy.get('html').should('have.attr', 'data-theme');
    
    // Clicar no botão de alternar tema
    cy.get('button[aria-label*="tema"], button:has(.paintbrush)').click();
    
    // Selecionar tema escuro
    cy.contains('Escuro').click();
    
    // Verificar se o tema foi alterado
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    
    // Clicar novamente no botão de alternar tema
    cy.get('button[aria-label*="tema"], button:has(.paintbrush)').click();
    
    // Selecionar tema claro
    cy.contains('Claro').click();
    
    // Verificar se o tema foi alterado de volta
    cy.get('html').should('have.attr', 'data-theme', 'light');
  });

  it('deve navegar entre as diferentes abas da aplicação', () => {
    // Verificar navegação para o Canvas
    cy.get('a[href*="canvas"], button:contains("Canvas")').first().click();
    cy.url().should('include', '/canvas');
    
    // Verificar navegação para o Chat
    cy.get('a[href*="chat"], button:contains("Chat")').first().click();
    cy.url().should('include', '/chat');
    
    // Verificar navegação para Configurações (se existir)
    cy.get('a[href*="settings"], button:contains("Configurações")').first().click();
    cy.url().should('include', '/settings');
  });
});
