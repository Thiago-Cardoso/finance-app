#!/usr/bin/env python3
"""
Script para testar conectividade com PostgreSQL Supabase
"""
import os
import psycopg2
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def test_connection():
    """Testa conexão com o banco PostgreSQL"""
    try:
        # Obter URL de conexão
        database_url = os.getenv('DATABASE_URL')

        if not database_url:
            print("❌ DATABASE_URL não encontrada no arquivo .env")
            return False

        print("🔄 Testando conexão com PostgreSQL...")
        print(f"URL: {database_url[:50]}...")

        # Conectar ao banco
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        # Testar query simples
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]

        print("✅ Conexão estabelecida com sucesso!")
        print(f"📊 Versão PostgreSQL: {version}")

        # Testar permissões básicas
        cursor.execute("SELECT current_user, current_database();")
        user, database = cursor.fetchone()

        print(f"👤 Usuário conectado: {user}")
        print(f"🗄️  Banco de dados: {database}")

        # Testar criação de tabela (permissões)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_connection (
                id SERIAL PRIMARY KEY,
                test_timestamp TIMESTAMP DEFAULT NOW()
            );
        """)

        cursor.execute("INSERT INTO test_connection DEFAULT VALUES;")
        cursor.execute("SELECT COUNT(*) FROM test_connection;")
        count = cursor.fetchone()[0]

        print(f"✅ Permissões de escrita: OK (registros de teste: {count})")

        # Limpar tabela de teste
        cursor.execute("DROP TABLE IF EXISTS test_connection;")

        conn.commit()
        cursor.close()
        conn.close()

        print("✅ Teste de conectividade concluído com sucesso!")
        return True

    except Exception as e:
        print(f"❌ Erro na conexão: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_connection()
    exit(0 if success else 1)