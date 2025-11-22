---
status: completed
parallelizable: false
blocked_by: ["25.0"]
---

<task_context>
<domain>frontend/advanced_features</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>backend_goals_api, react_query, tailwindcss</dependencies>
<unblocks>""</unblocks>
</task_context>

# Tarefa 30.0: Sistema de Metas Financeiras - Frontend

## Visão Geral
Implementar interface completa para o sistema de metas financeiras no frontend Next.js, integrado com a API backend desenvolvida na tarefa 25.0.

## Requisitos
- Página de listagem de metas com filtros
- Formulários de criação/edição de metas
- Página de detalhes com progresso visual
- Sistema de contribuições manuais
- Visualização de milestones e conquistas
- Sistema de gamificação (badges, pontos)
- Gráficos de progresso
- Notificações e alertas
- Responsividade mobile-first

## Subtarefas
- [ ] 30.1 Tipos TypeScript para metas
- [ ] 30.2 Service de API (goalsService)
- [ ] 30.3 Hook useGoals e useGoal
- [ ] 30.4 Página /goals (listagem)
- [ ] 30.5 Componente GoalCard
- [ ] 30.6 GoalFilters e GoalsSummary
- [ ] 30.7 GoalFormModal (criar/editar)
- [ ] 30.8 Página /goals/[id] (detalhes)
- [ ] 30.9 GoalProgress com milestones
- [ ] 30.10 AchievementsBadges (gamificação)
- [ ] 30.11 ContributionForm e lista
- [ ] 30.12 Testes de componentes

## Tempo Estimado
**Total**: 8-10 dias de trabalho
