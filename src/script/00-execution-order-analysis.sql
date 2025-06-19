-- ANÁLISE DA ORDEM DE EXECUÇÃO SQL
-- Este arquivo documenta a ordem correta e as dependências

/*
ANÁLISE DA CADEIA DE DEPENDÊNCIAS:

1. TABELAS PRINCIPAIS PRIMEIRO
   - A tabela *profiles* deve existir antes de qualquer referência a ela
   - Estrutura básica necessária antes de modificações

2. MODIFICAÇÕES DE TABELA
   - Atualizações de restrições em *daily_messages* precisam da tabela existente
   - Adições/modificações de colunas vêm após a criação das tabelas

3. FUNCIONALIDADES DE ADMIN
   - *scheduled_messages* referencia *profiles(id)*
   - *message_deliveries* referencia *scheduled_messages* e *profiles*
   - A coluna *account_type* é necessária antes das políticas de admin

4. SISTEMA DE PAPÉIS (ROLES)
   - Criação do tipo ENUM e migração da coluna
   - Funções e gatilhos que dependem do ENUM
   - Políticas que referenciam a coluna *account_type*
*/
