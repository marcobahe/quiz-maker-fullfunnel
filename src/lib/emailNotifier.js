import nodemailer from 'nodemailer';

// Configuração do transporter do Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: 'fully11012001@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || '', // App Password do Gmail
  },
});

// Função para verificar se o email de notificação está configurado
export function isEmailConfigured() {
  return !!process.env.GMAIL_APP_PASSWORD;
}

// Template HTML para email de lead quente
function generateHotLeadEmailTemplate({ quizName, leadData, quizId }) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Novo Lead Quente - ${quizName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 25px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .lead-data {
          background: #f8f9fa;
          border-left: 4px solid #7c3aed;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .lead-data h3 {
          margin-top: 0;
          color: #7c3aed;
          font-size: 18px;
        }
        .data-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .data-row:last-child {
          border-bottom: none;
        }
        .data-label {
          font-weight: 600;
          color: #495057;
        }
        .data-value {
          color: #333;
        }
        .score-badge {
          background: #7c3aed;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: bold;
          display: inline-block;
        }
        .cta-button {
          display: inline-block;
          background: #7c3aed;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
          font-size: 14px;
        }
        @media (max-width: 600px) {
          .data-row {
            flex-direction: column;
          }
          .data-label {
            margin-bottom: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔥 Novo Lead Quente!</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Quiz: ${quizName}</p>
        </div>

        <p>Olá! Você recebeu um novo lead <strong>quente</strong> no seu quiz <em>"${quizName}"</em>.</p>

        <div class="lead-data">
          <h3>📊 Dados do Lead</h3>
          
          <div class="data-row">
            <span class="data-label">Nome:</span>
            <span class="data-value">${leadData.name || '—'}</span>
          </div>
          
          <div class="data-row">
            <span class="data-label">Email:</span>
            <span class="data-value">${leadData.email || '—'}</span>
          </div>
          
          <div class="data-row">
            <span class="data-label">Telefone:</span>
            <span class="data-value">${leadData.phone || '—'}</span>
          </div>
          
          <div class="data-row">
            <span class="data-label">Pontuação:</span>
            <span class="data-value"><span class="score-badge">${leadData.score || 0}</span></span>
          </div>
          
          <div class="data-row">
            <span class="data-label">Resultado:</span>
            <span class="data-value">${leadData.resultCategory || '—'}</span>
          </div>
          
          <div class="data-row">
            <span class="data-label">Data:</span>
            <span class="data-value">${new Date(leadData.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
          </div>
        </div>

        <div style="text-align: center;">
          <a href="https://go.quizmebaby.app/quiz/${quizId}/leads" class="cta-button">
            Ver Todos os Leads
          </a>
        </div>

        <p style="color: #6c757d; font-size: 14px;">
          💡 <strong>Dica:</strong> Entre em contato com este lead rapidamente! Leads quentes têm maior probabilidade de conversão quando contactados nas primeiras horas.
        </p>

        <div class="footer">
          <p>Este email foi enviado automaticamente pelo sistema QuizMeBaby.</p>
          <p>Para gerenciar suas notificações, acesse as configurações do quiz.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Função para enviar notificação de lead quente
export async function sendHotLeadNotification({ quizData, leadData }) {
  // Verificar se as notificações estão habilitadas
  if (!quizData.emailNotifications || quizData.notificationMode !== 'instant-hot') {
    return { success: false, reason: 'Notificações não habilitadas' };
  }

  // Se não tem app password, apenas log (placeholder)
  if (!isEmailConfigured()) {
    console.log('📧 [EMAIL PLACEHOLDER] Novo lead quente:', {
      quiz: quizData.name,
      lead: leadData.name || leadData.email,
      score: leadData.score,
      resultado: leadData.resultCategory,
    });
    return { success: true, reason: 'Placeholder mode' };
  }

  try {
    const recipientEmail = quizData.notificationEmail || quizData.user?.email;
    
    if (!recipientEmail) {
      return { success: false, reason: 'Email destinatário não encontrado' };
    }

    const htmlContent = generateHotLeadEmailTemplate({
      quizName: quizData.name,
      leadData,
      quizId: quizData.id,
    });

    const mailOptions = {
      from: '"QuizMeBaby" <fully11012001@gmail.com>',
      to: recipientEmail,
      subject: `🔥 Novo Lead Quente - ${quizData.name}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      recipient: recipientEmail,
    };
  } catch (error) {
    console.error('Erro ao enviar email de notificação:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Função auxiliar para determinar se um lead é "quente" baseado no score range
export function isHotLead(leadScore, scoreRanges) {
  if (!scoreRanges || scoreRanges.length === 0) return false;
  
  try {
    const ranges = typeof scoreRanges === 'string' ? JSON.parse(scoreRanges) : scoreRanges;
    
    if (ranges.length === 0) return false;
    
    // Encontrar o score range mais alto (maior max)
    const highestRange = ranges.reduce((highest, current) => {
      return (current.max || 0) > (highest.max || 0) ? current : highest;
    });
    
    // Verificar se o lead está na faixa mais alta
    return leadScore >= (highestRange.min || 0) && leadScore <= (highestRange.max || 0);
  } catch (error) {
    console.error('Erro ao verificar se lead é quente:', error);
    return false;
  }
}

// Placeholder para resumo diário/semanal (implementação futura)
export async function sendDailySummary({ quizData, leadsToday }) {
  console.log('📧 [PLACEHOLDER] Resumo diário:', {
    quiz: quizData.name,
    totalLeads: leadsToday.length,
    hotLeads: leadsToday.filter(lead => isHotLead(lead.score, quizData.scoreRanges)).length,
  });
  
  return { success: true, reason: 'Daily summary placeholder' };
}

export async function sendWeeklySummary({ quizData, leadsThisWeek }) {
  console.log('📧 [PLACEHOLDER] Resumo semanal:', {
    quiz: quizData.name,
    totalLeads: leadsThisWeek.length,
    hotLeads: leadsThisWeek.filter(lead => isHotLead(lead.score, quizData.scoreRanges)).length,
  });
  
  return { success: true, reason: 'Weekly summary placeholder' };
}