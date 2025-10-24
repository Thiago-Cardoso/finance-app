FactoryBot.define do
  factory :report do
    association :user
    name { "Financial Summary Report" }
    report_type { :financial_summary }
    period_type { :monthly }
    status { :pending }
    filter_criteria { {} }
    generated_at { nil }

    trait :completed do
      status { :completed }
      generated_at { Time.current }
    end

    trait :processing do
      status { :processing }
    end

    trait :failed do
      status { :failed }
    end

    trait :financial_summary do
      report_type { :financial_summary }
      name { "Resumo Financeiro" }
    end

    trait :budget_performance do
      report_type { :budget_performance }
      name { "Performance de Orçamento" }
    end

    trait :with_filters do
      filter_criteria do
        {
          start_date: Date.current.beginning_of_month.to_s,
          end_date: Date.current.end_of_month.to_s,
          period_type: 'monthly'
        }
      end
    end
  end
end
