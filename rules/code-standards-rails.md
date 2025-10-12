# Padrões de Código para Ruby on Rails 8

Este documento descreve os padrões de código e as melhores práticas para o desenvolvimento de aplicações com Ruby on Rails 8.

## Versionamento

O Rails segue um esquema de versionamento semântico modificado:

- **X.Y.Z**
  - **X**: Versão principal - novas funcionalidades, possíveis quebras de API (reservado para ocasiões especiais).
  - **Y**: Versão menor - novas funcionalidades, pode conter quebras de API (atua como a versão principal do SemVer).
  - **Z**: Versão de patch - apenas correções de bugs, sem quebras de API, sem novas funcionalidades (exceto para correções de segurança).

## Convenções de Nomenclatura

- Use 'application' para se referir a aplicações Rails padrão.
- Use 'engine' para componentes como o Devise.
- Evite 'services' a menos que esteja discutindo Arquitetura Orientada a Serviços (SOA).

```ruby
# RUIM
# Production services can report their status upstream.
# Devise is a Rails authentication application.

# BOM
# Production applications can report their status upstream.
# Devise is a Rails authentication engine.
```

## Controllers

Exemplo de um controller de API padrão para um recurso `Group`:

```ruby
# app/controllers/groups_controller.rb
class GroupsController < ApplicationController
  before_action :set_group, only: %i[ show update destroy ]

  # GET /groups
  def index
    @groups = Group.all
    render json: @groups
  end

  # GET /groups/1
  def show
    render json: @group
  end

  # POST /groups
  def create
    @group = Group.new(group_params)
    if @group.save
      render json: @group, status: :created, location: @group
    else
      render json: @group.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /groups/1
  def update
    if @group.update(group_params)
      render json: @group
    else
      render json: @group.errors, status: :unprocessable_entity
    end
  end

  # DELETE /groups/1
  def destroy
    @group.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_group
      @group = Group.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def group_params
      params.require(:group).permit(:name)
    end
end
```

## Status HTTP

Use os símbolos do Rails para os códigos de status HTTP para maior clareza.

```ruby
render status: :forbidden # Em vez de render status: 403
```

Aqui está uma referência:

- **Sucesso:**
  - `200`: `:ok`
  - `201`: `:created`
  - `204`: `:no_content`
- **Erro do Cliente:**
  - `400`: `:bad_request`
  - `401`: `:unauthorized`
  - `403`: `:forbidden`
  - `404`: `:not_found`
  - `422`: `:unprocessable_entity`
- **Erro do Servidor:**
  - `500`: `:internal_server_error`

## Validações do Active Record

Use as opções de validação comuns de forma consistente:

- `:allow_nil`: Pula a validação se o valor do atributo for `nil`.
- `:allow_blank`: Pula a validação se o valor do atributo estiver em branco.
- `:message`: Especifica uma mensagem de erro personalizada.
- `:on`: Especifica os contextos (`:create`, `:update`) onde a validação deve ocorrer.

## Formato do CHANGELOG

Ao contribuir para projetos Rails ou ao manter um CHANGELOG, siga este formato:

```markdown
*   Resumo da mudança que descreve brevemente o que foi alterado. Você pode usar múltiplas
    linhas e quebrá-las em torno de 80 caracteres. Exemplos de código são aceitáveis, se necessário:

        class Foo
          def bar
            puts 'baz'
          end
        end

    Você pode continuar após o exemplo de código e pode anexar o número do problema.

    Fixes #1234.

    *Seu Nome*
```
