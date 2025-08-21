# 📱 Configuração Mobile - Risk Radar POA Social

## 🚀 Visão Geral

Esta aplicação está configurada para funcionar como app mobile nativo usando **Capacitor**. O sistema de gestão de riscos foi otimizado para dispositivos móveis com:

- Interface responsiva e touch-friendly
- Gráficos interativos adaptáveis
- Modais otimizados para telas pequenas
- Controles de navegação nativos
- Performance otimizada

## 📋 Pré-requisitos

### Para Android:
- **Android Studio** instalado
- **Java Development Kit (JDK)** 8 ou superior
- **Android SDK** e **Android SDK Tools**

### Para iOS (apenas Mac):
- **macOS** com **Xcode** instalado
- **iOS SDK**
- Conta de desenvolvedor Apple (para dispositivo físico)

## 🔧 Setup Inicial

### 1. Exportar e Configurar o Projeto

```bash
# 1. Exporte o projeto para seu GitHub via botão "Export to Github"
# 2. Clone o projeto do seu repositório
git clone <seu-repo-url>
cd <nome-do-projeto>

# 3. Instale as dependências
npm install
```

### 2. Inicializar Capacitor

```bash
# O projeto já está configurado com Capacitor
# Verifique se a configuração está correta
npx cap doctor
```

### 3. Adicionar Plataformas

#### Para Android:
```bash
npx cap add android
npx cap update android
```

#### Para iOS:
```bash
npx cap add ios  
npx cap update ios
```

### 4. Build da Aplicação

```bash
# Build do projeto web
npm run build

# Sincronizar com as plataformas nativas
npx cap sync
```

## 📱 Executando no Dispositivo/Emulador

### Android

```bash
# Executar no Android (emulador ou dispositivo)
npx cap run android

# Ou abrir no Android Studio
npx cap open android
```

### iOS

```bash
# Executar no iOS (simulador ou dispositivo) 
npx cap run ios

# Ou abrir no Xcode
npx cap open ios
```

## 🔄 Desenvolvimento Contínuo

### Hot Reload Durante Desenvolvimento

1. **Configure o URL do servidor de desenvolvimento** no `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'https://4f703af6-b256-4327-9941-b725eb84d0da.lovableproject.com?forceHideBadge=true',
     cleartext: true
   }
   ```

2. **Para desenvolver localmente**, altere para:
   ```typescript
   server: {
     url: 'http://localhost:5173', // ou sua porta local
     cleartext: true
   }
   ```

3. **Sincronize as mudanças**:
   ```bash
   npx cap sync
   ```

### Atualizações da App

Sempre que fizer mudanças no código:

```bash
# 1. Build do projeto
npm run build

# 2. Sincronizar com plataformas nativas
npx cap sync

# 3. Executar novamente
npx cap run android # ou ios
```

## 📊 Funcionalidades Mobile Otimizadas

### ✅ Interface Responsiva
- **Cards adaptativos** com layout flexível
- **Gráficos responsivos** que se ajustam ao tamanho da tela
- **Controles touch-friendly** com área de toque aumentada
- **Modais otimizados** com scroll e altura limitada

### ✅ Navegação Mobile
- **Tabs responsivos** com ícones e labels adaptativos
- **Drawer para busca** em telas pequenas
- **Breadcrumbs inteligentes** adaptados ao contexto
- **Menu hambúrguer** para navegação principal

### ✅ Análise de Causas Otimizada
- **Filtros em grid responsivo** para fácil uso em mobile
- **Gráficos empilhados** em telas pequenas
- **Cards expansíveis** com gestos touch
- **Labels truncados** para melhor legibilidade

### ✅ Performance
- **Lazy loading** de componentes pesados
- **Virtualização** de listas longas
- **Imagens otimizadas** para diferentes densidades
- **Animações suaves** sem comprometer performance

## 🔧 Configurações do Capacitor

### Configurações Atuais

```typescript
// capacitor.config.ts
{
  appId: 'app.lovable.4f703af6b25643279941b725eb84d0da',
  appName: 'risk-radar-poa-social',
  webDir: 'dist',
  server: {
    url: 'https://4f703af6-b256-4327-9941-b725eb84d0da.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3b82f6"
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#3b82f6'
    }
  }
}
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Build falha**:
   ```bash
   # Limpe e reinstale dependências
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Capacitor não encontrado**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   ```

3. **Android Studio não abre**:
   - Verifique se o Android Studio está instalado
   - Execute `npx cap doctor` para diagnóstico

4. **iOS não funciona no Windows**:
   - iOS desenvolvimento requer macOS
   - Use um Mac ou serviço de cloud como MacInCloud

### Logs e Debug

```bash
# Ver logs detalhados do Capacitor
npx cap doctor

# Logs do Android
adb logcat

# Logs do iOS (no Xcode)
# Window > Devices and Simulators > Select device > Open Console
```

## 📚 Recursos Adicionais

- **[Documentação Capacitor](https://capacitorjs.com/docs)**
- **[Capacitor Android](https://capacitorjs.com/docs/android)**  
- **[Capacitor iOS](https://capacitorjs.com/docs/ios)**
- **[Blog Post Lovable Mobile](https://lovable.dev/blogs/TODO)**

## 🎯 Próximos Passos

1. **Teste em dispositivos físicos** para validar performance
2. **Configure push notifications** se necessário
3. **Implemente recursos nativos** como câmera, geolocalização
4. **Otimize para diferentes tamanhos** de tela e densidade
5. **Prepare para publicação** nas app stores

---

**📝 Nota**: Este projeto foi otimizado especificamente para funcionar bem em dispositivos móveis, mantendo toda funcionalidade de análise de riscos disponível em uma interface touch-friendly.