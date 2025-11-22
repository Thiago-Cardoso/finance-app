---
status: pending
parallelizable: true
blocked_by: ["2.0"]
---

<task_context>
<domain>backend/advanced_features</domain>
<type>implementation</type>
<scope>supporting_feature</scope>
<complexity>medium</complexity>
<dependencies>backend_setup</dependencies>
<unblocks>"24.0", "26.0"</unblocks>
</task_context>

# Tarefa 21.0: Sistema de Importação de Dados Bancários

## Visão Geral
Implementar sistema completo de importação de dados bancários no backend Rails, incluindo suporte a múltiplos formatos (OFX, CSV, QIF), processamento assíncrono, detecção automática de transações duplicadas e categorização inteligente.

## Requisitos
- Suporte a múltiplos formatos (OFX, CSV, QIF, JSON)
- Processamento assíncrono de arquivos grandes
- Detecção e prevenção de duplicatas
- Categorização automática baseada em histórico
- Validação e sanitização de dados
- Mapeamento de colunas personalizável
- Logs detalhados de importação
- API para upload e monitoramento
- Reversão de importações
- Suporte a diferentes bancos e layouts

## Subtarefas
- [ ] 21.1 Modelo ImportJob e relacionamentos
- [ ] 21.2 Parsers para diferentes formatos
- [ ] 21.3 Sistema de detecção de duplicatas
- [ ] 21.4 Categorização automática inteligente
- [ ] 21.5 Validação e sanitização de dados
- [ ] 21.6 Processamento assíncrono com jobs
- [ ] 21.7 API de upload e monitoramento
- [ ] 21.8 Sistema de logs e auditoria
- [ ] 21.9 Reversão e rollback de importações
- [ ] 21.10 Testes unitários e de integração

## Sequenciamento
- Bloqueado por: 2.0 (Backend Setup)
- Desbloqueia: 24.0 (Integração Contas), 26.0 (Performance)
- Paralelizável: Sim (independente de outras funcionalidades)

## Detalhes de Implementação

### 1. Modelo Import Job
```ruby
# app/models/import_job.rb
class ImportJob < ApplicationRecord
  belongs_to :user
  has_many :import_logs, dependent: :destroy
  has_many :imported_transactions, class_name: 'Transaction', foreign_key: 'import_job_id', dependent: :nullify

  validates :filename, presence: true
  validates :file_format, presence: true, inclusion: { in: %w[csv ofx qif json] }
  validates :status, presence: true, inclusion: { in: %w[pending processing completed failed cancelled] }

  enum status: { pending: 0, processing: 1, completed: 2, failed: 3, cancelled: 4 }
  enum file_format: { csv: 0, ofx: 1, qif: 2, json: 3 }

  scope :recent, -> { order(created_at: :desc) }
  scope :successful, -> { where(status: :completed) }
  scope :failed, -> { where(status: :failed) }

  before_create :generate_reference_number
  after_create :schedule_processing

  def success_rate
    return 0 if total_records == 0
    ((imported_count.to_f / total_records) * 100).round(2)
  end

  def duration
    return nil unless started_at && finished_at
    (finished_at - started_at).round(2)
  end

  def can_be_reverted?
    completed? && imported_transactions.exists?
  end

  def revert!
    return false unless can_be_reverted?

    transaction do
      imported_transactions.destroy_all
      update!(
        status: :cancelled,
        reverted_at: Time.current,
        imported_count: 0
      )

      import_logs.create!(
        level: 'info',
        message: 'Import reverted successfully',
        details: { reverted_transactions: imported_count }
      )
    end

    true
  rescue => e
    import_logs.create!(
      level: 'error',
      message: 'Failed to revert import',
      details: { error: e.message }
    )
    false
  end

  def add_log(level, message, details = {})
    import_logs.create!(
      level: level,
      message: message,
      details: details
    )
  end

  def mark_as_processing!
    update!(status: :processing, started_at: Time.current)
  end

  def mark_as_completed!(imported_count, skipped_count = 0, error_count = 0)
    update!(
      status: :completed,
      finished_at: Time.current,
      imported_count: imported_count,
      skipped_count: skipped_count,
      error_count: error_count
    )
  end

  def mark_as_failed!(error_message)
    update!(
      status: :failed,
      finished_at: Time.current,
      error_message: error_message
    )
  end

  private

  def generate_reference_number
    self.reference_number = "IMP-#{Time.current.strftime('%Y%m%d')}-#{SecureRandom.hex(4).upcase}"
  end

  def schedule_processing
    ImportProcessingJob.perform_later(self)
  end
end

# app/models/import_log.rb
class ImportLog < ApplicationRecord
  belongs_to :import_job

  validates :level, presence: true, inclusion: { in: %w[debug info warning error] }
  validates :message, presence: true

  enum level: { debug: 0, info: 1, warning: 2, error: 3 }

  scope :recent, -> { order(created_at: :desc) }
  scope :errors, -> { where(level: :error) }
  scope :warnings, -> { where(level: :warning) }
end
```

### 2. Base Parser para Importação
```ruby
# app/services/import/base_parser.rb
module Import
  class BaseParser
    include ActiveModel::Model

    attr_accessor :file_content, :import_job, :user, :options

    def initialize(attributes = {})
      @options = {}
      super(attributes)
    end

    def parse
      raise NotImplementedError, 'Subclasses must implement parse method'
    end

    protected

    def normalize_transaction_data(data)
      {
        description: normalize_description(data[:description]),
        amount: normalize_amount(data[:amount]),
        date: normalize_date(data[:date]),
        transaction_type: normalize_transaction_type(data[:amount]),
        external_id: generate_external_id(data),
        raw_data: data
      }
    end

    def normalize_description(description)
      return '' unless description.present?

      description.to_s
                 .strip
                 .gsub(/\s+/, ' ')
                 .truncate(100)
    end

    def normalize_amount(amount)
      return 0 unless amount.present?

      # Remove currency symbols and convert to float
      clean_amount = amount.to_s
                           .gsub(/[R$\s]/, '')
                           .gsub(',', '.')
                           .to_f
                           .abs

      clean_amount.round(2)
    end

    def normalize_date(date)
      return Date.current unless date.present?

      case date
      when Date
        date
      when String
        parse_date_string(date)
      else
        Date.current
      end
    rescue
      Date.current
    end

    def normalize_transaction_type(amount)
      amount.to_f >= 0 ? 'income' : 'expense'
    end

    def generate_external_id(data)
      # Generate a unique ID based on transaction data
      key = "#{data[:date]}-#{data[:amount]}-#{data[:description]}"
      Digest::MD5.hexdigest(key)
    end

    def parse_date_string(date_string)
      # Try different date formats
      formats = [
        '%Y-%m-%d',
        '%d/%m/%Y',
        '%m/%d/%Y',
        '%d-%m-%Y',
        '%Y/%m/%d'
      ]

      formats.each do |format|
        begin
          return Date.strptime(date_string, format)
        rescue ArgumentError
          next
        end
      end

      # If no format works, try automatic parsing
      Date.parse(date_string)
    rescue
      Date.current
    end

    def log_info(message, details = {})
      import_job.add_log('info', message, details)
    end

    def log_warning(message, details = {})
      import_job.add_log('warning', message, details)
    end

    def log_error(message, details = {})
      import_job.add_log('error', message, details)
    end
  end
end
```

### 3. Parser para CSV
```ruby
# app/services/import/csv_parser.rb
module Import
  class CsvParser < BaseParser
    require 'csv'

    def parse
      transactions = []

      begin
        csv_data = CSV.parse(file_content, headers: true, skip_blanks: true)

        log_info("Starting CSV parsing", { total_rows: csv_data.size })

        csv_data.each_with_index do |row, index|
          begin
            transaction_data = extract_transaction_data(row)
            next unless transaction_data

            normalized_data = normalize_transaction_data(transaction_data)
            transactions << normalized_data

          rescue => e
            log_error("Error parsing row #{index + 1}", {
              row_data: row.to_h,
              error: e.message
            })
            next
          end
        end

        log_info("CSV parsing completed", {
          total_rows: csv_data.size,
          valid_transactions: transactions.size
        })

        transactions
      rescue => e
        log_error("Failed to parse CSV file", { error: e.message })
        raise ImportError, "Invalid CSV format: #{e.message}"
      end
    end

    private

    def extract_transaction_data(row)
      # Default column mapping - can be customized via options
      column_mapping = options[:column_mapping] || default_column_mapping

      data = {}
      column_mapping.each do |field, column_name|
        data[field] = row[column_name]
      end

      # Skip rows without essential data
      return nil unless data[:description].present? && data[:amount].present?

      data
    end

    def default_column_mapping
      {
        date: 'Data',
        description: 'Descrição',
        amount: 'Valor',
        category: 'Categoria'
      }
    end
  end
end
```

### 4. Parser para OFX
```ruby
# app/services/import/ofx_parser.rb
module Import
  class OfxParser < BaseParser
    require 'nokogiri'

    def parse
      transactions = []

      begin
        # Clean and parse OFX content
        cleaned_content = clean_ofx_content(file_content)
        doc = Nokogiri::XML(cleaned_content)

        transaction_nodes = doc.xpath('//STMTTRN')

        log_info("Starting OFX parsing", { total_transactions: transaction_nodes.size })

        transaction_nodes.each_with_index do |node, index|
          begin
            transaction_data = extract_ofx_transaction_data(node)
            next unless transaction_data

            normalized_data = normalize_transaction_data(transaction_data)
            transactions << normalized_data

          rescue => e
            log_error("Error parsing OFX transaction #{index + 1}", {
              node_content: node.to_s,
              error: e.message
            })
            next
          end
        end

        log_info("OFX parsing completed", {
          total_transactions: transaction_nodes.size,
          valid_transactions: transactions.size
        })

        transactions
      rescue => e
        log_error("Failed to parse OFX file", { error: e.message })
        raise ImportError, "Invalid OFX format: #{e.message}"
      end
    end

    private

    def clean_ofx_content(content)
      # Remove OFX header and clean content for XML parsing
      content = content.gsub(/^.*?<OFX>/m, '<OFX>')
      content = content.gsub(/<([^>]+)>([^<]*)/m) { |match|
        tag, value = match.match(/<([^>]+)>([^<]*)/m).captures
        "<#{tag}>#{value}</#{tag}>"
      }
      content
    end

    def extract_ofx_transaction_data(node)
      {
        date: node.xpath('DTPOSTED').text,
        amount: node.xpath('TRNAMT').text,
        description: node.xpath('MEMO').text.presence || node.xpath('NAME').text,
        transaction_id: node.xpath('FITID').text,
        type: node.xpath('TRNTYPE').text
      }
    end
  end
end
```

### 5. Service de Detecção de Duplicatas
```ruby
# app/services/import/duplicate_detector.rb
module Import
  class DuplicateDetector
    include ActiveModel::Model

    attr_accessor :user, :transaction_data, :import_job

    def initialize(attributes = {})
      super(attributes)
    end

    def is_duplicate?
      # Check for exact matches
      return true if exact_match_exists?

      # Check for similar transactions (fuzzy matching)
      return true if similar_transaction_exists?

      false
    end

    def find_potential_duplicates
      potential_duplicates = []

      # Exact external_id match
      if transaction_data[:external_id].present?
        exact_match = user.transactions.find_by(external_id: transaction_data[:external_id])
        potential_duplicates << { transaction: exact_match, match_type: 'exact_external_id' } if exact_match
      end

      # Date, amount, and description similarity
      date_range = (transaction_data[:date] - 2.days)..(transaction_data[:date] + 2.days)
      amount = transaction_data[:amount]

      similar_transactions = user.transactions
                                .where(date: date_range)
                                .where('ABS(amount - ?) <= ?', amount, 0.01) # Allow 1 cent difference

      similar_transactions.each do |transaction|
        similarity_score = calculate_description_similarity(
          transaction.description,
          transaction_data[:description]
        )

        if similarity_score > 0.8 # 80% similarity threshold
          potential_duplicates << {
            transaction: transaction,
            match_type: 'fuzzy',
            similarity_score: similarity_score
          }
        end
      end

      potential_duplicates
    end

    private

    def exact_match_exists?
      return false unless transaction_data[:external_id].present?

      user.transactions.exists?(external_id: transaction_data[:external_id])
    end

    def similar_transaction_exists?
      duplicates = find_potential_duplicates
      duplicates.any? { |dup| dup[:match_type] == 'fuzzy' && dup[:similarity_score] > 0.9 }
    end

    def calculate_description_similarity(desc1, desc2)
      # Simple similarity calculation using Levenshtein distance
      return 0.0 if desc1.blank? || desc2.blank?

      desc1_clean = desc1.downcase.strip
      desc2_clean = desc2.downcase.strip

      return 1.0 if desc1_clean == desc2_clean

      distance = levenshtein_distance(desc1_clean, desc2_clean)
      max_length = [desc1_clean.length, desc2_clean.length].max

      return 0.0 if max_length == 0

      (1.0 - distance.to_f / max_length).round(3)
    end

    def levenshtein_distance(str1, str2)
      matrix = Array.new(str1.length + 1) { Array.new(str2.length + 1) }

      (0..str1.length).each { |i| matrix[i][0] = i }
      (0..str2.length).each { |j| matrix[0][j] = j }

      (1..str1.length).each do |i|
        (1..str2.length).each do |j|
          cost = str1[i - 1] == str2[j - 1] ? 0 : 1
          matrix[i][j] = [
            matrix[i - 1][j] + 1,      # deletion
            matrix[i][j - 1] + 1,      # insertion
            matrix[i - 1][j - 1] + cost # substitution
          ].min
        end
      end

      matrix[str1.length][str2.length]
    end
  end
end
```

### 6. Service de Categorização Automática
```ruby
# app/services/import/auto_categorizer.rb
module Import
  class AutoCategorizer
    include ActiveModel::Model

    attr_accessor :user, :transaction_data

    def categorize
      # Try exact description match first
      category = find_by_exact_description_match
      return category if category

      # Try keyword matching
      category = find_by_keyword_matching
      return category if category

      # Try machine learning approach (if implemented)
      category = find_by_ml_prediction
      return category if category

      # Return default category or nil
      user.categories.where(name: 'Outros').first
    end

    def confidence_score
      @confidence_score ||= calculate_confidence
    end

    private

    def find_by_exact_description_match
      # Find transactions with exact description match
      similar_transaction = user.transactions
                               .where(description: transaction_data[:description])
                               .joins(:category)
                               .group('categories.id')
                               .order('COUNT(*) DESC')
                               .first

      similar_transaction&.category
    end

    def find_by_keyword_matching
      description = transaction_data[:description].downcase

      # Define keyword patterns for common categories
      keyword_patterns = {
        'Alimentação' => ['supermercado', 'restaurante', 'lanchonete', 'padaria', 'açougue', 'delivery'],
        'Transporte' => ['uber', 'taxi', '99', 'combustível', 'posto', 'gasolina', 'ônibus'],
        'Saúde' => ['farmácia', 'médico', 'hospital', 'clínica', 'dentista', 'laboratório'],
        'Lazer' => ['cinema', 'teatro', 'bar', 'shopping', 'netflix', 'spotify'],
        'Casa' => ['mercado', 'supermercado', 'casa', 'móveis', 'decoração'],
        'Educação' => ['escola', 'faculdade', 'curso', 'livro', 'universidade']
      }

      keyword_patterns.each do |category_name, keywords|
        if keywords.any? { |keyword| description.include?(keyword) }
          category = user.categories.find_by(name: category_name)
          if category
            @confidence_score = 0.7
            return category
          end
        end
      end

      nil
    end

    def find_by_ml_prediction
      # Placeholder for ML-based categorization
      # Could integrate with services like Google AutoML, AWS Comprehend, etc.
      nil
    end

    def calculate_confidence
      return @confidence_score if @confidence_score

      # Default confidence calculation
      if find_by_exact_description_match
        0.95
      elsif find_by_keyword_matching
        0.7
      else
        0.3
      end
    end
  end
end
```

### 7. Service Principal de Importação
```ruby
# app/services/import/transaction_importer.rb
module Import
  class TransactionImporter
    include ActiveModel::Model

    attr_accessor :import_job

    def process
      import_job.mark_as_processing!

      begin
        # Parse file based on format
        parser = get_parser_for_format
        transactions_data = parser.parse

        import_job.update!(total_records: transactions_data.size)

        # Process each transaction
        imported_count = 0
        skipped_count = 0
        error_count = 0

        transactions_data.each_with_index do |transaction_data, index|
          begin
            result = process_single_transaction(transaction_data, index + 1)

            case result[:status]
            when :imported
              imported_count += 1
            when :skipped
              skipped_count += 1
            when :error
              error_count += 1
            end

          rescue => e
            error_count += 1
            import_job.add_log('error', "Failed to process transaction #{index + 1}", {
              transaction_data: transaction_data,
              error: e.message
            })
          end
        end

        import_job.mark_as_completed!(imported_count, skipped_count, error_count)

        import_job.add_log('info', 'Import completed successfully', {
          imported: imported_count,
          skipped: skipped_count,
          errors: error_count
        })

      rescue => e
        import_job.mark_as_failed!(e.message)
        import_job.add_log('error', 'Import failed', { error: e.message })
        raise e
      end
    end

    private

    def get_parser_for_format
      case import_job.file_format
      when 'csv'
        CsvParser.new(
          file_content: import_job.file_content,
          import_job: import_job,
          user: import_job.user,
          options: import_job.options || {}
        )
      when 'ofx'
        OfxParser.new(
          file_content: import_job.file_content,
          import_job: import_job,
          user: import_job.user
        )
      when 'qif'
        QifParser.new(
          file_content: import_job.file_content,
          import_job: import_job,
          user: import_job.user
        )
      else
        raise ImportError, "Unsupported file format: #{import_job.file_format}"
      end
    end

    def process_single_transaction(transaction_data, row_number)
      # Check for duplicates
      duplicate_detector = DuplicateDetector.new(
        user: import_job.user,
        transaction_data: transaction_data,
        import_job: import_job
      )

      if duplicate_detector.is_duplicate?
        import_job.add_log('warning', "Duplicate transaction skipped (row #{row_number})", {
          transaction_data: transaction_data
        })
        return { status: :skipped, reason: 'duplicate' }
      end

      # Auto-categorize
      categorizer = AutoCategorizer.new(
        user: import_job.user,
        transaction_data: transaction_data
      )

      category = categorizer.categorize

      # Create transaction
      transaction = import_job.user.transactions.build(
        description: transaction_data[:description],
        amount: transaction_data[:amount],
        date: transaction_data[:date],
        transaction_type: transaction_data[:transaction_type],
        category: category,
        external_id: transaction_data[:external_id],
        import_job: import_job,
        notes: "Imported from #{import_job.file_format.upcase} file"
      )

      if transaction.save
        import_job.add_log('debug', "Transaction imported successfully (row #{row_number})", {
          transaction_id: transaction.id,
          category: category&.name,
          confidence: categorizer.confidence_score
        })
        { status: :imported, transaction: transaction }
      else
        import_job.add_log('error', "Failed to save transaction (row #{row_number})", {
          transaction_data: transaction_data,
          errors: transaction.errors.full_messages
        })
        { status: :error, errors: transaction.errors.full_messages }
      end
    end
  end

  class ImportError < StandardError; end
end
```

### 8. Job de Processamento
```ruby
# app/jobs/import_processing_job.rb
class ImportProcessingJob < ApplicationJob
  queue_as :imports

  retry_on Import::ImportError, wait: :exponentially_longer, attempts: 3
  discard_on ActiveJob::DeserializationError

  def perform(import_job)
    Import::TransactionImporter.new(import_job: import_job).process
  end
end
```

### 9. Controller de Importação
```ruby
# app/controllers/api/v1/imports_controller.rb
class Api::V1::ImportsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_import_job, only: [:show, :destroy, :revert, :logs]

  # GET /api/v1/imports
  def index
    imports = current_user.import_jobs
                         .includes(:import_logs)
                         .recent
                         .page(params[:page])
                         .per(params[:per_page] || 20)

    render json: {
      success: true,
      data: ActiveModelSerializers::SerializableResource.new(
        imports,
        each_serializer: ImportJobSerializer
      ),
      meta: {
        pagination: {
          current_page: imports.current_page,
          total_pages: imports.total_pages,
          total_count: imports.total_count,
          per_page: imports.limit_value
        }
      }
    }
  end

  # POST /api/v1/imports
  def create
    uploaded_file = params[:file]

    unless uploaded_file.present?
      return render json: {
        success: false,
        message: 'File is required'
      }, status: :unprocessable_entity
    end

    file_format = detect_file_format(uploaded_file)

    import_job = current_user.import_jobs.create!(
      filename: uploaded_file.original_filename,
      file_format: file_format,
      file_content: uploaded_file.read,
      file_size: uploaded_file.size,
      options: import_params[:options] || {}
    )

    render json: {
      success: true,
      data: ImportJobSerializer.new(import_job),
      message: 'Import job created successfully'
    }, status: :created
  end

  # GET /api/v1/imports/:id
  def show
    render json: {
      success: true,
      data: ImportJobSerializer.new(@import_job, include_logs: true)
    }
  end

  # DELETE /api/v1/imports/:id
  def destroy
    @import_job.destroy

    render json: {
      success: true,
      message: 'Import job deleted successfully'
    }
  end

  # POST /api/v1/imports/:id/revert
  def revert
    if @import_job.revert!
      render json: {
        success: true,
        message: 'Import reverted successfully'
      }
    else
      render json: {
        success: false,
        message: 'Failed to revert import'
      }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/imports/:id/logs
  def logs
    logs = @import_job.import_logs
                     .recent
                     .page(params[:page])
                     .per(params[:per_page] || 50)

    render json: {
      success: true,
      data: ActiveModelSerializers::SerializableResource.new(
        logs,
        each_serializer: ImportLogSerializer
      ),
      meta: {
        pagination: {
          current_page: logs.current_page,
          total_pages: logs.total_pages,
          total_count: logs.total_count,
          per_page: logs.limit_value
        }
      }
    }
  end

  private

  def set_import_job
    @import_job = current_user.import_jobs.find(params[:id])
  end

  def import_params
    params.permit(:file, options: {})
  end

  def detect_file_format(uploaded_file)
    extension = File.extname(uploaded_file.original_filename).downcase

    case extension
    when '.csv'
      'csv'
    when '.ofx'
      'ofx'
    when '.qif'
      'qif'
    when '.json'
      'json'
    else
      # Try to detect by content
      content_preview = uploaded_file.read(1000)
      uploaded_file.rewind

      if content_preview.include?('<OFX>')
        'ofx'
      elsif content_preview.include?('!Type:')
        'qif'
      elsif content_preview.start_with?('{') || content_preview.start_with?('[')
        'json'
      else
        'csv' # Default assumption
      end
    end
  end
end
```

### 10. Testes RSpec
```ruby
# spec/services/import/transaction_importer_spec.rb
require 'rails_helper'

RSpec.describe Import::TransactionImporter do
  let(:user) { create(:user) }
  let(:category) { create(:category, user: user, name: 'Alimentação') }

  let(:csv_content) do
    <<~CSV
      Data,Descrição,Valor,Categoria
      2024-01-15,Supermercado ABC,-150.00,Alimentação
      2024-01-16,Salário,5000.00,Receita
      2024-01-17,Restaurante XYZ,-80.50,Alimentação
    CSV
  end

  let(:import_job) do
    create(:import_job,
      user: user,
      file_format: 'csv',
      file_content: csv_content
    )
  end

  subject { described_class.new(import_job: import_job) }

  describe '#process' do
    it 'imports transactions successfully' do
      expect {
        subject.process
      }.to change { user.transactions.count }.by(3)

      import_job.reload
      expect(import_job.status).to eq('completed')
      expect(import_job.imported_count).to eq(3)
      expect(import_job.error_count).to eq(0)
    end

    it 'handles duplicate transactions' do
      # Create existing transaction
      create(:transaction,
        user: user,
        description: 'Supermercado ABC',
        amount: 150.00,
        date: Date.parse('2024-01-15')
      )

      expect {
        subject.process
      }.to change { user.transactions.count }.by(2) # Should skip duplicate

      import_job.reload
      expect(import_job.imported_count).to eq(2)
      expect(import_job.skipped_count).to eq(1)
    end

    it 'categorizes transactions automatically' do
      subject.process

      food_transactions = user.transactions.joins(:category)
                             .where(categories: { name: 'Alimentação' })

      expect(food_transactions.count).to eq(2)
    end

    it 'handles parsing errors gracefully' do
      import_job.update!(file_content: 'invalid,csv,content')

      expect {
        subject.process
      }.not_to raise_error

      import_job.reload
      expect(import_job.status).to eq('failed')
      expect(import_job.error_message).to be_present
    end

    it 'creates detailed logs' do
      subject.process

      import_job.reload
      expect(import_job.import_logs.count).to be > 0
      expect(import_job.import_logs.info.count).to be > 0
    end
  end
end
```

## Critérios de Sucesso
- [ ] Modelo ImportJob com relacionamentos corretos
- [ ] Parsers para CSV, OFX e QIF funcionando
- [ ] Detecção de duplicatas eficiente
- [ ] Categorização automática implementada
- [ ] Validação e sanitização robustas
- [ ] Processamento assíncrono funcionando
- [ ] API completa de upload e monitoramento
- [ ] Sistema de logs detalhados
- [ ] Reversão de importações funcionando
- [ ] Testes unitários com cobertura 90%+

## Performance e Segurança
- Processamento assíncrono para arquivos grandes
- Validação de tipos de arquivo
- Limite de tamanho de arquivo
- Sanitização de dados de entrada
- Logs detalhados para auditoria

## Recursos Necessários
- Desenvolvedor backend Rails sênior
- Analista para validação de formatos bancários
- Tester para casos de uso complexos

## Tempo Estimado
- Modelos e estrutura: 6-8 horas
- Parsers de formato: 10-12 horas
- Detecção de duplicatas: 6-8 horas
- Categorização automática: 8-10 horas
- Processamento assíncrono: 6-8 horas
- API e interface: 6-8 horas
- Testes e validação: 10-12 horas
- **Total**: 7-9 dias de trabalho