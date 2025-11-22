#!/usr/bin/env python3
"""
Script para testar o setup básico do Rails API
"""
import requests
import json
import sys
import time
import subprocess
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def test_health_endpoint():
    """Testa o endpoint de health check"""
    try:
        print("🔄 Testando endpoint de health check...")

        # Aguardar o servidor inicializar
        time.sleep(2)

        response = requests.get('http://localhost:3001/api/v1/health', timeout=10)

        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passou!")
            print(f"📊 Status: {data.get('message', 'OK')}")
            print(f"🕐 Timestamp: {data.get('data', {}).get('timestamp', 'N/A')}")
            print(f"🏷️  Versão: {data.get('data', {}).get('version', 'N/A')}")
            print(f"🌍 Ambiente: {data.get('data', {}).get('environment', 'N/A')}")
            return True
        else:
            print(f"❌ Health check falhou: Status {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar ao servidor Rails")
        print("💡 Certifique-se de que o servidor está rodando em http://localhost:3001")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {str(e)}")
        return False

def test_cors_headers():
    """Testa se os headers CORS estão configurados"""
    try:
        print("\n🔄 Testando configuração CORS...")

        # Fazer request OPTIONS para testar CORS
        response = requests.options(
            'http://localhost:3001/api/v1/health',
            headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=10
        )

        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }

        if any(cors_headers.values()):
            print("✅ Headers CORS configurados!")
            for header, value in cors_headers.items():
                if value:
                    print(f"  {header}: {value}")
            return True
        else:
            print("⚠️  Headers CORS não encontrados")
            return False

    except Exception as e:
        print(f"❌ Erro ao testar CORS: {str(e)}")
        return False

def test_api_structure():
    """Testa a estrutura básica da API"""
    try:
        print("\n🔄 Testando estrutura da API...")

        # Testar endpoint inexistente (deve retornar 404)
        response = requests.get('http://localhost:3001/api/v1/nonexistent', timeout=10)

        if response.status_code == 404:
            data = response.json()
            if data.get('success') == False and 'not found' in data.get('message', '').lower():
                print("✅ Tratamento de 404 funcionando!")
                return True

        print("⚠️  Tratamento de 404 pode não estar funcionando corretamente")
        return False

    except Exception as e:
        print(f"❌ Erro ao testar estrutura da API: {str(e)}")
        return False

def check_docker_services():
    """Verifica se os serviços Docker estão rodando"""
    try:
        print("\n🔄 Verificando serviços Docker...")

        # Verificar se docker-compose está rodando
        result = subprocess.run(
            ['docker-compose', 'ps'],
            capture_output=True,
            text=True,
            cwd='/Users/thiagocardoso/Documents/Course/branas-ia/project-study'
        )

        if result.returncode == 0:
            output = result.stdout
            services = ['postgres', 'redis', 'backend']

            for service in services:
                if service in output and 'Up' in output:
                    print(f"✅ Serviço {service} está rodando")
                else:
                    print(f"⚠️  Serviço {service} pode não estar rodando")

            return True
        else:
            print("⚠️  Docker Compose não está rodando ou não está configurado")
            return False

    except FileNotFoundError:
        print("⚠️  Docker Compose não encontrado")
        return False
    except Exception as e:
        print(f"❌ Erro ao verificar Docker: {str(e)}")
        return False

def run_all_tests():
    """Executa todos os testes"""
    print("🚀 Iniciando testes do setup Rails API...\n")

    tests = [
        ("Docker Services", check_docker_services),
        ("Health Endpoint", test_health_endpoint),
        ("CORS Configuration", test_cors_headers),
        ("API Structure", test_api_structure),
    ]

    results = []

    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"🧪 {test_name}")
        print('='*50)

        result = test_func()
        results.append((test_name, result))

    # Resumo final
    print(f"\n{'='*50}")
    print("📋 RESUMO DOS TESTES")
    print('='*50)

    passed = 0
    for test_name, result in results:
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{test_name}: {status}")
        if result:
            passed += 1

    print(f"\n📊 Total: {passed}/{len(results)} testes passaram")

    if passed == len(results):
        print("🎉 Todos os testes passaram! Setup Rails API está funcionando!")
        return 0
    else:
        print("⚠️  Alguns testes falharam. Verifique a configuração.")
        return 1

if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)