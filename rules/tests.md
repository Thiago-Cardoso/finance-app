Testes

Utilize a biblioteca jest para determinar os cenários de teste e as expectativas e sinon para implementar test patterns como stub, spy e mock

Para rodar os testes, utilize o comando yarn test

Todos os testes devem ficar dentro da pasta /test, não coloque os testes na pasta /src, junto com os arquivos que estão sendo testados

Os testes devem ter a extensão .test.ts

Não crie dependência entre os testes, deve ser possível rodar cada um deles de forma independente

Siga o princípio Arrange, Act, Assert ou Given, When, Then para garantir o máximo de organização e legibilidade dentro dos testes

Se estiver testando algum comportamento que depende de um Date, e isso for importante para o que estiver sendo testado, utilize um Mock para garantir que o teste seja repetível

Se um teste depender de recursos externos como requisições HTTP, banco de dados, mensageria, sistema de arquivos ou API devem ficar na pasta /test/integration, caso contrário podem ficar na pasta /test/unit

Crie testes para os endpoints HTTP, esses testes não devem utilizar bibliotecas como supertest e devem ser de integração. Além disso, crie esses testes somente para garantir o funcionamento do fluxo principal e alternativo (explorando principalmente os status code e a mensagem de erro), deixando a variação de testes de regras de negócio para os testes sobre os use cases

Crie testes para todos os use cases, nesse caso, teste sempre os fluxos principais e pelo menos um fluxo alternativo, que lance exceptions. Utilize o test pattern stub para evitar utilizar APIs externas nesse nível de teste.

Crie testes para todos o domain, teste todas as possibilidades de regras, todas as variações possíveis, sempre no nível de unidade, sem depender de nenhum recurso externo

Foque em testar um comportamento por teste, evite escrever testes muito grandes

Garanta que o código que está sendo escrito esteja totalmente coberto por testes

Crie expectativas consistentes, garantindo que tudo que estiver sendo testado está de fato sendo conferido

Sempre encerre conexões com o banco de dados ou plataformas de mensageria depois de executar os testes

Utilize beforeEach para inicializar

# Regras para Testes com RSpec

Este documento descreve as melhores práticas e convenções para escrever testes usando RSpec.

## Estrutura dos Testes

- **`describe`**: Use para agrupar testes para uma classe, módulo ou método. O primeiro argumento pode ser a classe ou uma string.
- **`context`**: Use para descrever um estado ou condição específica dentro de um grupo `describe`. Ajuda a organizar os testes em cenários.
- **`it`**: Use para definir um exemplo de teste individual. A descrição deve ser uma frase que descreve o comportamento esperado.

```ruby
RSpec.describe "Usando um array como uma pilha" do
  def build_stack
    []
  end

  before(:example) do
    @stack = build_stack
  end

  it 'está inicialmente vazio' do
    expect(@stack).to be_empty
  end

  context "após um item ter sido empurrado" do
    before(:example) do
      @stack.push :item
    end

    it 'permite que o item empurrado seja retirado' do
      expect(@stack.pop).to eq(:item)
    end
  end
end
```

## Exemplos Compartilhados (`shared_examples`)

Use `shared_examples` para reutilizar a lógica de teste em diferentes grupos de exemplos. Isso é útil para testar comportamentos comuns em várias classes.

```ruby
RSpec.shared_examples "coleções" do |collection_class|
  it "está vazia quando criada pela primeira vez" do
    expect(collection_class.new).to be_empty
  end
end

RSpec.describe Array do
  include_examples "coleções", Array
end

RSpec.describe Hash do
  include_examples "coleções", Hash
end
```

## Focando em Testes Específicos

Durante o desenvolvimento, pode ser útil executar apenas um subconjunto de testes. Use a metadados `:focus`.

Configure no seu `spec_helper.rb`:
```ruby
RSpec.configure do |config|
  config.filter_run_when_matching :focus
end
```

Então, marque um exemplo ou grupo com `:focus`:
```ruby
it "faz algo", :focus do
  # ...
end

# Ou use os aliases:
fit "faz algo"
fdescribe "Algo"
fcontext "Outra coisa"
```

## Mocks e Stubs

Use o `receive` para criar expectativas em objetos.

### Restringindo o Número de Chamadas

Você pode especificar quantas vezes um método deve ser chamado.

```ruby
expect(user).to receive(:save).exactly(3).times
user.save
user.save
user.save
```

## Sintaxe de Expectativa

Prefira a sintaxe `expect` em vez da sintaxe `should`.

```ruby
# Preferível
expect(actual).to eq(expected)
expect(actual).to be > 3
expect([1, 2, 3]).not_to include 4

# Obsoleto
actual.should eq expected
actual.should be > 3
[1, 2, 3].should_not include 4
```