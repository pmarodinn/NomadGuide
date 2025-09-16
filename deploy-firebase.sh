#!/bin/bash
# Script para fazer deploy das configurações do Firebase

echo "🔥 Fazendo deploy das configurações do Firebase..."

echo "📋 Deploy das regras do Firestore..."
firebase deploy --only firestore:rules

echo "📊 Deploy dos índices do Firestore..."
firebase deploy --only firestore:indexes

echo "✅ Deploy completo!"
echo "🌐 Console: https://console.firebase.google.com/project/nomadguide-5ea09/overview"

echo ""
echo "📊 Status dos índices:"
firebase firestore:indexes
