# 🏋️ MD.Studio — Gestão do Estúdio de Fitness

Aplicação web para gestão de reservas do estúdio de fitness do edifício.  
Desenvolvida em HTML, CSS e JavaScript puro — sem dependências externas.

---

## ✨ Funcionalidades

- **Reservas por blocos de 1 hora** — horário das 07:00 às 21:00
- **Duas zonas independentes** — 🏃 Cardio e 💪 Musculação (máx. 2 ocupantes simultâneos)
- **Calendário integrado** — vista por dia, 7 dias ou intervalo personalizado
- **Sincronização com Google Calendar** — fonte de verdade partilhada entre todos os dispositivos
- **Auto-refresh a cada 30 segundos** — reservas sempre atualizadas
- **Otimizada para smartphone** — navegação por tabs, áreas de toque amplas, sem zoom automático
- **Login simples** — acesso protegido por credenciais partilhadas

---

## 📱 Como aceder

👉 **[https://jreifelix.github.io/mdstudio/](https://jreifelix.github.io/mdstudio/)**

Compatível com qualquer browser moderno em desktop ou smartphone.

---

## 🗓️ Como fazer uma reserva

1. Fazer login com as credenciais do estúdio
2. Selecionar a **data**
3. Escolher a **zona** (Cardio ou Musculação)
4. Selecionar o **horário** disponível
5. Introduzir o **nome ou número de habitação**
6. Confirmar a reserva

A reserva fica imediatamente visível no calendário e sincronizada com o Google Calendar.

---

## 🔄 Sincronização entre dispositivos

A app usa **Google Apps Script** como intermediário para ler e escrever no Google Calendar — sem necessidade de login Google por parte dos utilizadores.

Os dados são sincronizados automaticamente a cada 30 segundos.

---

## 🛠️ Tecnologias

| Componente | Tecnologia |
|---|---|
| Frontend | HTML5 + CSS3 + JavaScript (vanilla) |
| Alojamento | GitHub Pages |
| Base de dados | Google Calendar (via Apps Script) |
| Sincronização | Google Apps Script Web App + JSONP |

---

## 📂 Estrutura do projeto

```
mdstudio/
├── index.html   # Aplicação completa (single-file)
├── Code.gs      # Google Apps Script (backend)
└── README.md    # Este ficheiro
```

---

## ⚙️ Configuração (administrador)

### Google Apps Script
1. Aceda a [script.google.com](https://script.google.com) → abra o projeto **MDStudio**
2. Para atualizações: **Implementar → Gerir implementações → Editar → Nova versão → Implementar**

### Calendário
Os eventos são escritos no calendário configurado em `Code.gs` via `CALENDAR_ID`.

---

## 📄 Licença

Uso interno — Edifício MD.Studio
