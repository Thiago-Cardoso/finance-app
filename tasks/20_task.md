---
status: pending
parallelizable: true
blocked_by: ["2.0"]
---

<task_context>
<domain>backend/notifications</domain>
<type>implementation</type>
<scope>supporting_feature</scope>
<complexity>medium</complexity>
<dependencies>backend_setup</dependencies>
<unblocks>"25.0", "26.0"</unblocks>
</task_context>

# Tarefa 20.0: Sistema de Notificações e Alertas (Backend)

## Visão Geral
Implementar sistema completo de notificações e alertas no backend Rails, incluindo alertas automáticos para orçamentos, lembretes de transações, notificações de metas e sistema de comunicação por email e push notifications.

## Requisitos
- Sistema de notificações em tempo real
- Alertas automáticos de orçamentos
- Lembretes personalizáveis
- Notificações por email e push
- Templates de notificação customizáveis
- Configurações de preferências do usuário
- Histórico de notificações
- Sistema de agendamento de notificações
- API para frontend consumir notificações
- Integração com serviços externos (SendGrid, FCM)

## Subtarefas
- [ ] 20.1 Modelo Notification e relacionamentos
- [ ] 20.2 Sistema de tipos e templates de notificação
- [ ] 20.3 Configurações de preferências do usuário
- [ ] 20.4 Service para envio de notificações
- [ ] 20.5 Jobs para processamento assíncrono
- [ ] 20.6 Integração com email (SendGrid/SMTP)
- [ ] 20.7 Sistema de push notifications (FCM)
- [ ] 20.8 API endpoints para notificações
- [ ] 20.9 Sistema de agendamento automático
- [ ] 20.10 Testes unitários e de integração

## Sequenciamento
- Bloqueado por: 2.0 (Backend Setup)
- Desbloqueia: 25.0 (Metas Financeiras), 26.0 (Performance)
- Paralelizável: Sim (independente de outras funcionalidades)

## Detalhes de Implementação

### 1. Modelo Notification
```ruby
# app/models/notification.rb
class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :notifiable, polymorphic: true, optional: true

  validates :title, presence: true, length: { maximum: 100 }
  validates :message, presence: true, length: { maximum: 500 }
  validates :notification_type, presence: true, inclusion: { in: %w[budget_alert transaction_reminder goal_progress system_update expense_warning income_milestone budget_overrun saving_achievement] }
  validates :priority, presence: true, inclusion: { in: %w[low medium high urgent] }
  validates :delivery_method, presence: true, inclusion: { in: %w[email push in_app sms] }

  enum status: { pending: 0, sent: 1, delivered: 2, read: 3, failed: 4 }
  enum priority: { low: 0, medium: 1, high: 2, urgent: 3 }
  enum notification_type: {
    budget_alert: 0,
    transaction_reminder: 1,
    goal_progress: 2,
    system_update: 3,
    expense_warning: 4,
    income_milestone: 5,
    budget_overrun: 6,
    saving_achievement: 7
  }

  scope :unread, -> { where.not(status: [:read]) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_type, ->(type) { where(notification_type: type) }
  scope :by_priority, ->(priority) { where(priority: priority) }
  scope :for_delivery, -> { where(status: [:pending, :failed]) }

  before_create :set_default_values
  after_create :schedule_delivery

  def mark_as_read!
    update!(status: :read, read_at: Time.current)
  end

  def mark_as_sent!
    update!(status: :sent, sent_at: Time.current)
  end

  def mark_as_delivered!
    update!(status: :delivered, delivered_at: Time.current)
  end

  def mark_as_failed!(error_message = nil)
    update!(status: :failed, error_message: error_message, failed_at: Time.current)
  end

  def should_send?
    pending? && user.notification_preferences.allows?(notification_type, delivery_method)
  end

  def icon
    case notification_type
    when 'budget_alert', 'budget_overrun'
      '💰'
    when 'transaction_reminder'
      '📝'
    when 'goal_progress', 'saving_achievement'
      '🎯'
    when 'expense_warning'
      '⚠️'
    when 'income_milestone'
      '💚'
    when 'system_update'
      '📢'
    else
      '🔔'
    end
  end

  def color_class
    case priority
    when 'urgent'
      'text-red-600 bg-red-50'
    when 'high'
      'text-orange-600 bg-orange-50'
    when 'medium'
      'text-blue-600 bg-blue-50'
    else
      'text-gray-600 bg-gray-50'
    end
  end

  private

  def set_default_values
    self.status ||= :pending
    self.priority ||= :medium
    self.delivery_method ||= 'in_app'
  end

  def schedule_delivery
    NotificationDeliveryJob.perform_later(self) if should_send?
  end
end
```

### 2. Modelo de Preferências de Notificação
```ruby
# app/models/notification_preference.rb
class NotificationPreference < ApplicationRecord
  belongs_to :user

  validates :notification_type, presence: true, uniqueness: { scope: :user_id }
  validates :email_enabled, inclusion: { in: [true, false] }
  validates :push_enabled, inclusion: { in: [true, false] }
  validates :in_app_enabled, inclusion: { in: [true, false] }

  enum notification_type: {
    budget_alert: 0,
    transaction_reminder: 1,
    goal_progress: 2,
    system_update: 3,
    expense_warning: 4,
    income_milestone: 5,
    budget_overrun: 6,
    saving_achievement: 7
  }

  scope :enabled_for, ->(method) { where("#{method}_enabled = ?", true) }

  def allows?(notification_type, delivery_method)
    preference = user.notification_preferences.find_by(notification_type: notification_type)
    return default_setting(delivery_method) unless preference

    case delivery_method
    when 'email'
      preference.email_enabled
    when 'push'
      preference.push_enabled
    when 'in_app'
      preference.in_app_enabled
    when 'sms'
      preference.sms_enabled
    else
      false
    end
  end

  private

  def default_setting(delivery_method)
    case delivery_method
    when 'in_app'
      true
    when 'email'
      true
    when 'push'
      false
    when 'sms'
      false
    else
      false
    end
  end
end
```

### 3. Service para Criação de Notificações
```ruby
# app/services/notification_service.rb
class NotificationService
  include ActiveModel::Model

  attr_accessor :user, :notification_type, :title, :message, :priority, :notifiable, :delivery_methods, :metadata

  def initialize(attributes = {})
    @delivery_methods = ['in_app']
    @priority = 'medium'
    @metadata = {}
    super(attributes)
  end

  def call
    return failure_result('User is required') unless user.present?
    return failure_result('Invalid notification type') unless valid_notification_type?

    notifications = create_notifications
    success_result(notifications)
  end

  def self.send_budget_alert(budget, usage_percentage)
    new(
      user: budget.user,
      notification_type: 'budget_alert',
      title: "Alerta de Orçamento: #{budget.name}",
      message: "Seu orçamento '#{budget.name}' atingiu #{usage_percentage.round(1)}% de utilização.",
      priority: determine_budget_priority(usage_percentage),
      notifiable: budget,
      delivery_methods: ['in_app', 'email'],
      metadata: { usage_percentage: usage_percentage, budget_id: budget.id }
    ).call
  end

  def self.send_budget_overrun(budget)
    new(
      user: budget.user,
      notification_type: 'budget_overrun',
      title: "Orçamento Estourado: #{budget.name}",
      message: "Seu orçamento '#{budget.name}' foi ultrapassado. Revise seus gastos.",
      priority: 'urgent',
      notifiable: budget,
      delivery_methods: ['in_app', 'email', 'push'],
      metadata: { budget_id: budget.id }
    ).call
  end

  def self.send_goal_progress(goal, progress_percentage)
    new(
      user: goal.user,
      notification_type: 'goal_progress',
      title: "Progresso da Meta: #{goal.name}",
      message: "Você alcançou #{progress_percentage.round(1)}% da sua meta '#{goal.name}'!",
      priority: 'medium',
      notifiable: goal,
      delivery_methods: ['in_app'],
      metadata: { progress_percentage: progress_percentage, goal_id: goal.id }
    ).call
  end

  def self.send_transaction_reminder(user, category_name = nil)
    category_text = category_name ? " na categoria #{category_name}" : ""
    new(
      user: user,
      notification_type: 'transaction_reminder',
      title: 'Lembrete de Transação',
      message: "Não se esqueça de registrar suas transações#{category_text} de hoje!",
      priority: 'low',
      delivery_methods: ['in_app'],
      metadata: { category_name: category_name }
    ).call
  end

  def self.send_saving_achievement(user, amount)
    new(
      user: user,
      notification_type: 'saving_achievement',
      title: 'Meta de Poupança Alcançada!',
      message: "Parabéns! Você economizou #{format_currency(amount)} este mês!",
      priority: 'high',
      delivery_methods: ['in_app', 'email'],
      metadata: { amount: amount }
    ).call
  end

  def self.send_expense_warning(user, category, amount, limit)
    new(
      user: user,
      notification_type: 'expense_warning',
      title: 'Aviso de Gastos Elevados',
      message: "Seus gastos em #{category} (#{format_currency(amount)}) estão próximos do limite (#{format_currency(limit)}).",
      priority: 'high',
      delivery_methods: ['in_app', 'email'],
      metadata: { category: category, amount: amount, limit: limit }
    ).call
  end

  private

  def create_notifications
    notifications = []

    delivery_methods.each do |method|
      notification = user.notifications.create!(
        title: title,
        message: message,
        notification_type: notification_type,
        priority: priority,
        delivery_method: method,
        notifiable: notifiable,
        metadata: metadata
      )
      notifications << notification
    end

    notifications
  end

  def valid_notification_type?
    Notification.notification_types.keys.include?(notification_type.to_s)
  end

  def success_result(notifications)
    {
      success: true,
      data: notifications,
      message: "#{notifications.size} notification(s) created successfully"
    }
  end

  def failure_result(message)
    {
      success: false,
      message: message,
      data: []
    }
  end

  def self.determine_budget_priority(usage_percentage)
    case usage_percentage
    when 0..50
      'low'
    when 51..75
      'medium'
    when 76..90
      'high'
    else
      'urgent'
    end
  end

  def self.format_currency(amount)
    "R$ #{amount.to_f.round(2).to_s.gsub('.', ',')}"
  end
end
```

### 4. Service para Entrega de Notificações
```ruby
# app/services/notification_delivery_service.rb
class NotificationDeliveryService
  include ActiveModel::Model

  attr_accessor :notification

  def call
    return failure_result('Notification is required') unless notification.present?
    return failure_result('Notification already sent') unless notification.pending?

    case notification.delivery_method
    when 'email'
      send_email_notification
    when 'push'
      send_push_notification
    when 'sms'
      send_sms_notification
    when 'in_app'
      send_in_app_notification
    else
      failure_result('Invalid delivery method')
    end
  end

  private

  def send_email_notification
    begin
      NotificationMailer.send_notification(notification).deliver_now
      notification.mark_as_sent!
      success_result('Email sent successfully')
    rescue => e
      notification.mark_as_failed!(e.message)
      failure_result("Email delivery failed: #{e.message}")
    end
  end

  def send_push_notification
    begin
      # Integrate with FCM or similar service
      push_service = PushNotificationService.new
      result = push_service.send_to_user(
        user: notification.user,
        title: notification.title,
        body: notification.message,
        data: notification.metadata
      )

      if result[:success]
        notification.mark_as_sent!
        success_result('Push notification sent successfully')
      else
        notification.mark_as_failed!(result[:error])
        failure_result("Push notification failed: #{result[:error]}")
      end
    rescue => e
      notification.mark_as_failed!(e.message)
      failure_result("Push notification delivery failed: #{e.message}")
    end
  end

  def send_sms_notification
    begin
      # Integrate with SMS service (Twilio, AWS SNS, etc.)
      sms_service = SmsService.new
      result = sms_service.send_message(
        to: notification.user.phone_number,
        message: "#{notification.title}: #{notification.message}"
      )

      if result[:success]
        notification.mark_as_sent!
        success_result('SMS sent successfully')
      else
        notification.mark_as_failed!(result[:error])
        failure_result("SMS failed: #{result[:error]}")
      end
    rescue => e
      notification.mark_as_failed!(e.message)
      failure_result("SMS delivery failed: #{e.message}")
    end
  end

  def send_in_app_notification
    # In-app notifications are created in database and consumed by frontend
    notification.mark_as_sent!
    success_result('In-app notification created successfully')
  end

  def success_result(message)
    {
      success: true,
      message: message
    }
  end

  def failure_result(message)
    {
      success: false,
      message: message
    }
  end
end
```

### 5. Jobs para Processamento
```ruby
# app/jobs/notification_delivery_job.rb
class NotificationDeliveryJob < ApplicationJob
  queue_as :notifications

  retry_on StandardError, wait: :exponentially_longer, attempts: 3

  def perform(notification)
    NotificationDeliveryService.new(notification: notification).call
  end
end

# app/jobs/daily_budget_check_job.rb
class DailyBudgetCheckJob < ApplicationJob
  queue_as :default

  def perform
    Budget.active.current.find_each do |budget|
      current_period = budget.current_period
      next unless current_period

      usage_percentage = budget.usage_percentage(current_period)

      # Send alerts based on usage percentage
      case usage_percentage
      when 75..89
        send_budget_alert(budget, usage_percentage, 'warning')
      when 90..99
        send_budget_alert(budget, usage_percentage, 'critical')
      when 100..Float::INFINITY
        send_budget_overrun(budget)
      end
    end
  end

  private

  def send_budget_alert(budget, usage_percentage, level)
    # Check if we've already sent this level of alert recently
    recent_alert = budget.user.notifications
                         .where(notification_type: 'budget_alert')
                         .where(notifiable: budget)
                         .where('created_at > ?', 24.hours.ago)
                         .where("metadata->>'level' = ?", level)
                         .exists?

    return if recent_alert

    NotificationService.send_budget_alert(budget, usage_percentage)
  end

  def send_budget_overrun(budget)
    # Check if we've already sent overrun alert recently
    recent_overrun = budget.user.notifications
                           .where(notification_type: 'budget_overrun')
                           .where(notifiable: budget)
                           .where('created_at > ?', 24.hours.ago)
                           .exists?

    return if recent_overrun

    NotificationService.send_budget_overrun(budget)
  end
end

# app/jobs/transaction_reminder_job.rb
class TransactionReminderJob < ApplicationJob
  queue_as :default

  def perform
    # Send reminders to users who haven't added transactions today
    User.includes(:transactions, :notification_preferences).find_each do |user|
      next unless should_send_reminder?(user)

      NotificationService.send_transaction_reminder(user)
    end
  end

  private

  def should_send_reminder?(user)
    # Check if user has transactions today
    has_transactions_today = user.transactions.where(date: Date.current).exists?
    return false if has_transactions_today

    # Check if user wants reminders
    reminder_preference = user.notification_preferences
                             .find_by(notification_type: 'transaction_reminder')

    return true if reminder_preference.nil? # Default to enabled
    reminder_preference.in_app_enabled
  end
end
```

### 6. Controller de Notificações
```ruby
# app/controllers/api/v1/notifications_controller.rb
class Api::V1::NotificationsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_notification, only: [:show, :mark_as_read, :destroy]

  # GET /api/v1/notifications
  def index
    notifications = current_user.notifications
                               .includes(:notifiable)
                               .recent

    notifications = filter_notifications(notifications) if filter_params.any?
    notifications = notifications.page(params[:page]).per(params[:per_page] || 20)

    render json: {
      success: true,
      data: ActiveModelSerializers::SerializableResource.new(
        notifications,
        each_serializer: NotificationSerializer
      ),
      meta: {
        pagination: {
          current_page: notifications.current_page,
          total_pages: notifications.total_pages,
          total_count: notifications.total_count,
          per_page: notifications.limit_value
        },
        unread_count: current_user.notifications.unread.count
      }
    }
  end

  # GET /api/v1/notifications/:id
  def show
    render json: {
      success: true,
      data: NotificationSerializer.new(@notification)
    }
  end

  # PATCH /api/v1/notifications/:id/mark_as_read
  def mark_as_read
    @notification.mark_as_read!

    render json: {
      success: true,
      data: NotificationSerializer.new(@notification),
      message: 'Notification marked as read'
    }
  end

  # PATCH /api/v1/notifications/mark_all_as_read
  def mark_all_as_read
    count = current_user.notifications.unread.update_all(
      status: 'read',
      read_at: Time.current,
      updated_at: Time.current
    )

    render json: {
      success: true,
      message: "#{count} notifications marked as read"
    }
  end

  # DELETE /api/v1/notifications/:id
  def destroy
    @notification.destroy

    render json: {
      success: true,
      message: 'Notification deleted successfully'
    }
  end

  # GET /api/v1/notifications/unread_count
  def unread_count
    count = current_user.notifications.unread.count

    render json: {
      success: true,
      data: { unread_count: count }
    }
  end

  # GET /api/v1/notifications/preferences
  def preferences
    preferences = current_user.notification_preferences.includes(:user)

    render json: {
      success: true,
      data: ActiveModelSerializers::SerializableResource.new(
        preferences,
        each_serializer: NotificationPreferenceSerializer
      )
    }
  end

  # PATCH /api/v1/notifications/preferences
  def update_preferences
    preferences_params.each do |type, settings|
      preference = current_user.notification_preferences
                              .find_or_initialize_by(notification_type: type)

      preference.assign_attributes(settings)
      preference.save!
    end

    render json: {
      success: true,
      message: 'Notification preferences updated successfully'
    }
  end

  private

  def set_notification
    @notification = current_user.notifications.find(params[:id])
  end

  def filter_params
    params.permit(:status, :notification_type, :priority, :delivery_method)
  end

  def filter_notifications(notifications)
    notifications = notifications.where(status: filter_params[:status]) if filter_params[:status].present?
    notifications = notifications.by_type(filter_params[:notification_type]) if filter_params[:notification_type].present?
    notifications = notifications.by_priority(filter_params[:priority]) if filter_params[:priority].present?
    notifications = notifications.where(delivery_method: filter_params[:delivery_method]) if filter_params[:delivery_method].present?
    notifications
  end

  def preferences_params
    params.require(:preferences).permit!
  end
end
```

### 7. Serializers
```ruby
# app/serializers/notification_serializer.rb
class NotificationSerializer < ActiveModel::Serializer
  attributes :id, :title, :message, :notification_type, :priority, :status,
             :delivery_method, :icon, :color_class, :created_at, :read_at,
             :metadata, :notifiable_type, :notifiable_id

  def icon
    object.icon
  end

  def color_class
    object.color_class
  end

  def metadata
    object.metadata || {}
  end
end

# app/serializers/notification_preference_serializer.rb
class NotificationPreferenceSerializer < ActiveModel::Serializer
  attributes :id, :notification_type, :email_enabled, :push_enabled,
             :in_app_enabled, :sms_enabled, :created_at, :updated_at

  def notification_type
    object.notification_type.humanize
  end
end
```

### 8. Mailer
```ruby
# app/mailers/notification_mailer.rb
class NotificationMailer < ApplicationMailer
  default from: 'notifications@financeapp.com'

  def send_notification(notification)
    @notification = notification
    @user = notification.user

    mail(
      to: @user.email,
      subject: @notification.title,
      template_path: 'notification_mailer',
      template_name: notification.notification_type
    )
  end
end
```

### 9. Testes RSpec
```ruby
# spec/services/notification_service_spec.rb
require 'rails_helper'

RSpec.describe NotificationService do
  let(:user) { create(:user) }
  let(:budget) { create(:budget, user: user) }

  describe '.send_budget_alert' do
    it 'creates a budget alert notification' do
      expect {
        described_class.send_budget_alert(budget, 80.5)
      }.to change { user.notifications.count }.by(2) # in_app + email

      notification = user.notifications.last
      expect(notification.notification_type).to eq('budget_alert')
      expect(notification.title).to include(budget.name)
      expect(notification.message).to include('80.5%')
      expect(notification.priority).to eq('high')
    end
  end

  describe '.send_budget_overrun' do
    it 'creates an urgent budget overrun notification' do
      expect {
        described_class.send_budget_overrun(budget)
      }.to change { user.notifications.count }.by(3) # in_app + email + push

      notification = user.notifications.last
      expect(notification.notification_type).to eq('budget_overrun')
      expect(notification.priority).to eq('urgent')
    end
  end

  describe '#call' do
    let(:service) {
      described_class.new(
        user: user,
        notification_type: 'system_update',
        title: 'Test Notification',
        message: 'Test message'
      )
    }

    it 'creates a notification successfully' do
      result = service.call

      expect(result[:success]).to be true
      expect(result[:data]).to be_an(Array)
      expect(result[:data].size).to eq(1)
    end

    it 'fails without a user' do
      service.user = nil
      result = service.call

      expect(result[:success]).to be false
      expect(result[:message]).to eq('User is required')
    end

    it 'fails with invalid notification type' do
      service.notification_type = 'invalid_type'
      result = service.call

      expect(result[:success]).to be false
      expect(result[:message]).to eq('Invalid notification type')
    end
  end
end
```

## Critérios de Sucesso
- [ ] Modelo Notification com relacionamentos corretos
- [ ] Sistema de tipos de notificação funcionando
- [ ] Preferências de usuário implementadas
- [ ] Service de criação de notificações
- [ ] Jobs de processamento assíncrono
- [ ] Integração com email funcionando
- [ ] Sistema de push notifications configurado
- [ ] API completa para frontend
- [ ] Sistema de agendamento automático
- [ ] Testes unitários com cobertura 90%+

## Integrações Externas
- SendGrid para emails
- Firebase Cloud Messaging para push
- Twilio para SMS (opcional)
- AWS SNS como alternativa

## Recursos Necessários
- Desenvolvedor backend Rails experiente
- DevOps para configuração de serviços externos
- Tester para validação de entrega

## Tempo Estimado
- Modelos e relacionamentos: 6-8 horas
- Services de notificação: 8-10 horas
- Jobs e processamento: 6-8 horas
- Integrações externas: 8-10 horas
- API e controllers: 6-8 horas
- Testes e documentação: 8-10 horas
- **Total**: 5-7 dias de trabalho