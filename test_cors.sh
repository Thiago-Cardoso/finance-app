#!/bin/bash

echo "🔍 Testando CORS do Backend..."
echo ""

# 1. Testar Health Endpoint
echo "1️⃣ Testando se o backend está online..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://finance-app-api-adbw.onrender.com/health)

if [ "$HEALTH" = "200" ]; then
  echo "✅ Backend está ONLINE (Status: $HEALTH)"
else
  echo "❌ Backend está OFFLINE ou reiniciando (Status: $HEALTH)"
  echo "   Aguarde mais alguns minutos e tente novamente"
  exit 1
fi

echo ""

# 2. Testar CORS Preflight
echo "2️⃣ Testando CORS Preflight (OPTIONS request)..."
CORS_RESPONSE=$(curl -s -X OPTIONS https://finance-app-api-adbw.onrender.com/api/v1/auth/sign_up \
  -H "Origin: https://finance-app-lake-one.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
  echo "✅ CORS está CONFIGURADO corretamente!"
  echo ""
  echo "Headers CORS retornados:"
  echo "$CORS_RESPONSE" | grep "Access-Control"
else
  echo "❌ CORS NÃO está configurado corretamente"
  echo ""
  echo "Resposta completa:"
  echo "$CORS_RESPONSE"
fi

echo ""
echo "3️⃣ Testando requisição real de cadastro..."

SIGNUP_RESPONSE=$(curl -s -X POST https://finance-app-api-adbw.onrender.com/api/v1/auth/sign_up \
  -H "Origin: https://finance-app-lake-one.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"Test123!","password_confirmation":"Test123!"}' \
  -w "\nHTTP_CODE:%{http_code}" \
  -i)

if echo "$SIGNUP_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
  echo "✅ CORS está funcionando em requisições POST!"
else
  echo "⚠️  Verifique se FRONTEND_URL está configurado no Render"
fi

echo ""
echo "📋 Variável esperada no Render:"
echo "   Key: FRONTEND_URL"
echo "   Value: https://finance-app-lake-one.vercel.app"
echo ""
echo "🔗 Acesse: https://dashboard.render.com → Seu service → Environment"
