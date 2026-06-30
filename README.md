# 🏋️ MD.Studio — Gestão do Estúdio de Fitness

Aplicação web para gestão de reservas do estúdio de fitness do edifício.  
Desenvolvida em HTML, CSS e JavaScript puro — sem dependências externas.

---

## ✨ Funcionalidades

- **Reservas com duração variável** — 30 min, 1 hora ou 1h 30
- **Horário alargado** — 07:00 às 22:00 em dias de semana · 07:00 às 21:00 ao fim de semana
- **Duas zonas independentes** — 🏃 Cardio e 💪 Musculação (máx. 2 ocupantes simultâneos)
- **Selector de data sem popup** — combobox com hoje + 7 dias seguintes (Dia da Semana, DD-MM-YYYY)
- **Calendário integrado** — vista por dia, 7 dias ou intervalo personalizado
- **Reservas multi-slot** — no calendário, toda a duração fica colorida e clicável
- **Sincronização com Google Calendar** — fonte de verdade partilhada entre todos os dispositivos
- **Auto-refresh a cada 30 segundos** — reservas sempre atualizadas
- **Otimizada para smartphone** — iOS light theme, navegação por tabs, áreas de toque amplas
- **Login simples** — acesso protegido por credenciais partilhadas

---

## 📱 Como aceder

👉 **[https://jreifelix.github.io/mdstudio/](https://jreifelix.github.io/mdstudio/)**

Compatível com qualquer browser moderno em desktop ou smartphone.  
Para instalar como app no iPhone: Safari → Partilhar → Adicionar ao Ecrã de Início (usar ícone 180×180px).

---

## 🗓️ Como fazer uma reserva

1. Fazer login com as credenciais do estúdio
2. Selecionar a **data** na combobox (hoje até +7 dias)
3. Escolher a **duração** (30 min / 1 hora / 1h 30)
4. Escolher a **zona** (Cardio ou Musculação)
5. Selecionar o **horário** disponível na grelha
6. Introduzir o **nome ou número de habitação**
7. Confirmar a reserva

A reserva fica imediatamente visível no calendário e sincronizada com o Google Calendar.

---

## � Horários disponíveis

| Dia | Primeiro bloco | Último bloco |
|---|---|---|
| Segunda a Sexta | 07:00 | 21:30 – 22:00 |
| Sábado e Domingo | 07:00 | 20:30 – 21:00 |

---

## �🔄 Sincronização entre dispositivos

A app usa **Google Apps Script** como intermediário para ler e escrever no Google Calendar — sem necessidade de login Google por parte dos utilizadores.

Os dados são sincronizados automaticamente a cada 30 segundos.  
O botão **🔄 Atualizar Reservas** permite sincronização manual imediata.

---

## 🛠️ Tecnologias

| Componente | Tecnologia |
|---|---|
| Frontend | HTML5 + CSS3 + JavaScript (vanilla) |
| Design | iOS-inspired light theme (SF Pro, #007AFF, frosted glass) |
| Alojamento | GitHub Pages |
| Base de dados | Google Calendar (via Apps Script) |
| Sincronização | Google Apps Script Web App + JSONP |

---

## 📂 Estrutura do projeto

```
mdstudio/
├── index.html          # Aplicação completa (single-file)
├── Code.gs             # Google Apps Script (backend)
├── mdstudi.png         # Logótipo (usar 180×180px para Apple Touch Icon)
└── README.md           # Este ficheiro
```

---

## ⚙️ Configuração (administrador)

### Google Apps Script
1. Aceda a [script.google.com](https://script.google.com) → abra o projeto **MDStudio**
2. Para atualizações ao `Code.gs`: **Implementar → Gerir implementações → Editar → Nova versão → Implementar**

### Calendário
Os eventos são escritos no calendário configurado em `Code.gs` via `CALENDAR_ID`.  
Cada evento inclui metadados `[MDSTUDIO_v1]` com data, hora, duração, zona, nome e ID único.

### Ícone para iPhone (ecrã inicial)
Para um ícone de qualidade nativa, o ficheiro `mdstudi.png` deve ter **180 × 180 px**, fundo sólido e cantos retos (o iOS aplica o arredondamento automaticamente).

---

## 📄 Licença

Uso interno — Edifício MD.Studio
