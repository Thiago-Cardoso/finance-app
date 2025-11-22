# Regras de Estilo para Ruby

Este documento define as convenções de estilo para a escrita de código Ruby.

## Nomenclatura de Métodos

- **Métodos Singleton (de classe):** Use `::` ou `.`
- **Métodos de Instância:** Use `#` ou `.`

Inclua o nome da classe ou módulo para métodos que não estão no escopo atual.

```ruby
::bar
#baz
Foo.bar
Foo#baz
```

## Formatação de Código

### Alinhamento de Saída de Comentários

Alinhe os comentários de saída (`# => ...`) para melhorar a legibilidade.

```ruby
a = [1, 2, 3] #=> [1, 2, 3]
a.shuffle!    #=> [2, 3, 1]
a             #=> [2, 3, 1]
```

### Heredocs

Use a sintaxe de "here document" (heredoc) para strings de múltiplas linhas.

- **Heredoc Padrão:**
  ```ruby
  expected_result = <<HEREDOC
    Este texto pode ter uma formatação especial.
    E pode abranger várias linhas.
  HEREDOC
  ```

- **Heredoc Indentado (`<<-`):** O delimitador final pode ser indentado.
  ```ruby
  expected_result = <<-INDENTED_HEREDOC
    Este texto pode ter uma formatação especial.
    E pode abranger várias linhas.
  INDENTED_HEREDOC
  ```

- **Heredoc "Squiggly" (`<<~`):** Remove a indentação inicial de cada linha.
  ```ruby
  expected_result = <<~SQUIGGLY_HEREDOC
    Este texto pode ter uma formatação especial.
    E pode abranger várias linhas.
  SQUIGGLY_HEREDOC
  ```

## Documentação (RDoc)

### `call-seq`

Use a diretiva `call-seq:` para documentar como um método deve ser chamado.

- **Métodos de Instância:**
  ```ruby
  # call-seq:
  #   count -> integer
  #   count(obj) -> integer
  #   count {|element| ... } -> integer
  ```

- **Métodos com Blocos:**
  ```ruby
  # call-seq:
  #   array.select {|element| ... } -> new_array
  #   array.select -> new_enumerator
  ```

- **Operadores Binários:**
  ```ruby
  # call-seq:
  #   self & other_array -> new_array
  ```

### Links

- Use `+rdoc-ref+` para links internos para a documentação do core ou da biblioteca padrão.
- Use URLs completas para links externos.

## Guardas de Versão do Ruby

Use guardas de versão para executar código condicionalmente com base na versão do interpretador Ruby. Isso é útil em testes.

```ruby
ruby_version_is ""..."3.2" do
  # Especificações para RUBY_VERSION < 3.2
end

ruby_version_is "3.2" do
  # Especificações para RUBY_VERSION >= 3.2
end
```
