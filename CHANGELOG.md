# Changelog

## AURA FIRST ACCESS 1.0

### Implementado

- Tela de login com novos CTAs:
  - `Criar Empresa`
  - `Primeiro Acesso`
- Fluxo público de primeiro acesso:
  - explicação da experiência;
  - entrada para o wizard de criação.
- Wizard de criação de empresa com etapas:
  - dados da empresa;
  - administrador;
  - plano inicial;
  - criação automática.
- Backend público para onboarding:
  - cria empresa;
  - cria usuário administrador;
  - gera permissões `ADMIN MASTER`;
  - aplica configurações padrão;
  - abre sessão automaticamente.
- Tela de boas-vindas com ações iniciais:
  - Configurar Financeiro;
  - Importar Dados;
  - Conhecer a AURA.
- Assistente de configuração com a sequência:
  - empresa;
  - categorias;
  - fornecedores;
  - clientes;
  - boletos;
  - Aura Copilot.
- Seed de testes atualizado:
  - `admin@aura.local`
  - `Mega168168`
  - empresa `MegaLojao1020`
- Validações de segurança no onboarding:
  - empresa/e-mail duplicados bloqueados;
  - senha mínima de 8 caracteres.

## 1.0.1 — Correção oficial AURA OS 1.0

### Implementado

- Reorganização da navegação principal na hierarquia oficial:
  - AURA OS
  - Financeiro
  - Cadastros
  - Relatórios
  - Configurações
  - Em breve
- Aura Bubble™ como launcher global:
  - clique abre Aura Copilot;
  - duplo clique ativa Voice UX;
  - pressionar abre menu rápido;
  - arrastável com posição salva;
  - visível em todas as telas autenticadas.
- Voice UX visual com estados:
  - Ouvindo…
  - Processando…
  - Pronto
  - transcrição em tempo real simulada para preparar a experiência.
- Sidebar com recolher/expandir e preferência salva por usuário no navegador.
- Experiência mobile/iOS dedicada:
  - layout vertical;
  - menu recolhível;
  - cards simplificados;
  - Aura Bubble sempre visível;
  - acesso de voz priorizado no topo e no launcher.
- Identidade visual ajustada para exibir AURA OS como marca principal da interface.
- Área AURA 2.0 “Em breve” preparada com navegação para:
  - Time Machine™
  - War Room™
  - Visão 360°
  - Simulações
  - Cenários

### Observações

- As funcionalidades AURA 2.0 foram apenas preparadas para navegação, sem implementação funcional.
- A compatibilidade com assets legados `PagFacil-logo-v7.png` e `PagFacil-icon-v7.png` foi preservada; a interface passa a priorizar a marca AURA OS.
