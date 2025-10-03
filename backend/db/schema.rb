# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_10_03_212453) do
  create_schema "auth"
  create_schema "extensions"
  create_schema "graphql"
  create_schema "graphql_public"
  create_schema "pgbouncer"
  create_schema "realtime"
  create_schema "storage"
  create_schema "vault"

  # These are extensions that must be enabled in order to support this database
  enable_extension "extensions.pg_stat_statements"
  enable_extension "extensions.pgcrypto"
  enable_extension "extensions.uuid-ossp"
  enable_extension "graphql.pg_graphql"
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_trgm"
  enable_extension "vault.supabase_vault"

  # Custom types defined in this database.
  # Note that some types may not work with other database engines. Be careful if changing database.
  create_enum "account_type", ["checking", "savings", "credit_card", "investment", "cash"]
  create_enum "budget_period", ["weekly", "monthly", "yearly"]
  create_enum "category_type", ["income", "expense"]
  create_enum "transaction_type", ["income", "expense", "transfer"]

  create_table "accounts", force: :cascade do |t|
    t.string "name", limit: 100, null: false
    t.enum "account_type", null: false, enum_type: "account_type"
    t.decimal "initial_balance", precision: 12, scale: 2, default: "0.0"
    t.decimal "current_balance", precision: 12, scale: 2, default: "0.0"
    t.bigint "user_id", null: false
    t.boolean "is_active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_type"], name: "index_accounts_on_account_type"
    t.index ["user_id", "is_active"], name: "index_accounts_on_user_active"
    t.index ["user_id"], name: "index_accounts_on_user_id"
  end

  create_table "budgets", force: :cascade do |t|
    t.string "name", limit: 100, null: false
    t.decimal "amount", precision: 12, scale: 2, null: false
    t.decimal "spent", precision: 12, scale: 2, default: "0.0"
    t.enum "period", default: "monthly", null: false, enum_type: "budget_period"
    t.date "start_date", null: false
    t.date "end_date", null: false
    t.bigint "user_id", null: false
    t.bigint "category_id", null: false
    t.boolean "is_active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_budgets_on_category_id"
    t.index ["period"], name: "index_budgets_on_period"
    t.index ["user_id", "category_id", "period", "start_date"], name: "index_budgets_on_user_category_period", unique: true
    t.index ["user_id", "is_active", "start_date", "end_date"], name: "index_budgets_on_user_active_dates"
    t.index ["user_id"], name: "index_budgets_on_user_id"
  end

  create_table "categories", force: :cascade do |t|
    t.string "name", limit: 100, null: false
    t.string "color", limit: 7, default: "#6366f1", null: false
    t.string "icon", limit: 50
    t.enum "category_type", default: "expense", null: false, enum_type: "category_type"
    t.bigint "user_id"
    t.boolean "is_default", default: false
    t.boolean "is_active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_type"], name: "index_categories_on_category_type"
    t.index ["user_id", "name"], name: "index_categories_on_user_id_and_name", unique: true, where: "(user_id IS NOT NULL)"
    t.index ["user_id"], name: "index_categories_on_user_id"
  end

  create_table "goals", force: :cascade do |t|
    t.string "title", limit: 255, null: false
    t.text "description"
    t.decimal "target_amount", precision: 12, scale: 2, null: false
    t.decimal "current_amount", precision: 12, scale: 2, default: "0.0"
    t.date "target_date"
    t.bigint "user_id", null: false
    t.boolean "is_achieved", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["is_achieved"], name: "index_goals_on_is_achieved"
    t.index ["target_date"], name: "index_goals_on_target_date"
    t.index ["user_id", "is_achieved", "target_date"], name: "index_goals_on_user_achieved_target"
    t.index ["user_id"], name: "index_goals_on_user_id"
  end

  create_table "transactions", force: :cascade do |t|
    t.string "description", null: false
    t.decimal "amount", precision: 12, scale: 2, null: false
    t.enum "transaction_type", null: false, enum_type: "transaction_type"
    t.date "date", null: false
    t.text "notes"
    t.bigint "user_id", null: false
    t.bigint "category_id"
    t.bigint "account_id"
    t.bigint "transfer_account_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_transactions_on_account_id"
    t.index ["category_id"], name: "index_transactions_on_category_id"
    t.index ["date"], name: "index_transactions_on_date"
    t.index ["description"], name: "index_transactions_on_description_trgm", opclass: :gin_trgm_ops, using: :gin
    t.index ["transaction_type"], name: "index_transactions_on_transaction_type"
    t.index ["user_id", "account_id"], name: "index_transactions_on_user_and_account"
    t.index ["user_id", "amount"], name: "index_transactions_on_user_and_amount"
    t.index ["user_id", "category_id", "date"], name: "index_transactions_on_user_category_date"
    t.index ["user_id", "category_id"], name: "index_transactions_on_user_and_category"
    t.index ["user_id", "created_at"], name: "index_transactions_on_user_created"
    t.index ["user_id", "date", "amount"], name: "index_transactions_on_user_date_amount"
    t.index ["user_id", "date", "transaction_type"], name: "index_transactions_on_user_date_type"
    t.index ["user_id", "date"], name: "index_transactions_on_user_and_date"
    t.index ["user_id", "transaction_type"], name: "index_transactions_on_user_and_type"
    t.index ["user_id"], name: "index_transactions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "first_name", limit: 100, null: false
    t.string "last_name", limit: 100, null: false
    t.string "jti", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "accounts", "users", on_delete: :cascade
  add_foreign_key "budgets", "categories", on_delete: :cascade
  add_foreign_key "budgets", "users", on_delete: :cascade
  add_foreign_key "categories", "users", on_delete: :cascade
  add_foreign_key "goals", "users", on_delete: :cascade
  add_foreign_key "transactions", "accounts", column: "transfer_account_id", on_delete: :nullify
  add_foreign_key "transactions", "accounts", on_delete: :nullify
  add_foreign_key "transactions", "categories", on_delete: :nullify
  add_foreign_key "transactions", "users", on_delete: :cascade
end
