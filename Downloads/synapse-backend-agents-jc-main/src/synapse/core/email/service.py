"""
Sistema de email completo para notificações e verificação
"""

import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional, Dict, Any
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
import logging
from synapse.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.username = settings.SMTP_USERNAME
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME

        # Configurar templates
        template_dir = Path(__file__).parent.parent.parent / "templates" / "email"
        template_dir.mkdir(parents=True, exist_ok=True)
        self.template_env = Environment(loader=FileSystemLoader(str(template_dir)))

        # Criar templates padrão se não existirem
        self._create_default_templates()

    def _create_default_templates(self):
        """Cria templates padrão de email"""
        template_dir = Path(__file__).parent.parent.parent / "templates" / "email"

        # Template de verificação de email
        verification_template = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verificação de Email - SynapScale</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SynapScale</h1>
        </div>
        <div class="content">
            <h2>Verificação de Email</h2>
            <p>Olá!</p>
            <p>Obrigado por se registrar no SynapScale. Para completar seu cadastro, clique no botão abaixo para verificar seu email:</p>
            <p style="text-align: center;">
                <a href="{{ verification_url }}" class="button">Verificar Email</a>
            </p>
            <p>Se você não conseguir clicar no botão, copie e cole este link no seu navegador:</p>
            <p>{{ verification_url }}</p>
            <p>Este link expira em 24 horas.</p>
        </div>
        <div class="footer">
            <p>© 2025 SynapScale. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
        """

        # Template de redefinição de senha
        password_reset_template = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redefinição de Senha - SynapScale</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SynapScale</h1>
        </div>
        <div class="content">
            <h2>Redefinição de Senha</h2>
            <p>Olá!</p>
            <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
            <p style="text-align: center;">
                <a href="{{ reset_url }}" class="button">Redefinir Senha</a>
            </p>
            <p>Se você não conseguir clicar no botão, copie e cole este link no seu navegador:</p>
            <p>{{ reset_url }}</p>
            <p>Este link expira em 1 hora.</p>
            <p>Se você não solicitou esta redefinição, ignore este email.</p>
        </div>
        <div class="footer">
            <p>© 2025 SynapScale. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
        """

        # Template de notificação
        notification_template = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ subject }} - SynapScale</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SynapScale</h1>
        </div>
        <div class="content">
            <h2>{{ title }}</h2>
            <p>Olá {{ user_name }}!</p>
            {{ content | safe }}
        </div>
        <div class="footer">
            <p>© 2025 SynapScale. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
        """

        # Salvar templates
        templates = {
            "verification.html": verification_template,
            "password_reset.html": password_reset_template,
            "notification.html": notification_template,
        }

        for filename, content in templates.items():
            template_path = template_dir / filename
            if not template_path.exists():
                template_path.write_text(content.strip())

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str | None = None,
        attachments: list[dict[str, Any]] | None = None,
    ) -> bool:
        """Envia um email"""
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email

            # Adicionar conteúdo texto se fornecido
            if text_content:
                text_part = MIMEText(text_content, "plain", "utf-8")
                msg.attach(text_part)

            # Adicionar conteúdo HTML
            html_part = MIMEText(html_content, "html", "utf-8")
            msg.attach(html_part)

            # Adicionar anexos se fornecidos
            if attachments:
                for attachment in attachments:
                    self._add_attachment(msg, attachment)

            # Enviar email
            await self._send_smtp(msg)
            logger.info(f"Email enviado com sucesso para {to_email}")
            return True

        except Exception as e:
            logger.error(f"Erro ao enviar email para {to_email}: {str(e)}")
            return False

    async def _send_smtp(self, msg: MIMEMultipart):
        """Envia email via SMTP"""

        def _send():
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)

        # Executar em thread separada para não bloquear
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _send)

    def _add_attachment(self, msg: MIMEMultipart, attachment: dict[str, Any]):
        """Adiciona anexo ao email"""
        try:
            with open(attachment["path"], "rb") as f:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(f.read())
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f'attachment; filename= {attachment["filename"]}',
                )
                msg.attach(part)
        except Exception as e:
            logger.error(f"Erro ao adicionar anexo {attachment['filename']}: {str(e)}")

    async def send_verification_email(
        self, email: str, token: str, user_name: str = ""
    ) -> bool:
        """Envia email de verificação"""
        try:
            template = self.template_env.get_template("verification.html")
            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

            html_content = template.render(
                verification_url=verification_url,
                user_name=user_name,
            )

            return await self.send_email(
                to_email=email,
                subject="Verificação de Email - SynapScale",
                html_content=html_content,
            )
        except Exception as e:
            logger.error(f"Erro ao enviar email de verificação: {str(e)}")
            return False

    async def send_password_reset_email(
        self, email: str, token: str, user_name: str = ""
    ) -> bool:
        """Envia email de redefinição de senha"""
        try:
            template = self.template_env.get_template("password_reset.html")
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

            html_content = template.render(
                reset_url=reset_url,
                user_name=user_name,
            )

            return await self.send_email(
                to_email=email,
                subject="Redefinição de Senha - SynapScale",
                html_content=html_content,
            )
        except Exception as e:
            logger.error(f"Erro ao enviar email de redefinição: {str(e)}")
            return False

    async def send_notification_email(
        self,
        email: str,
        title: str,
        content: str,
        user_name: str = "",
        subject: str | None = None,
    ) -> bool:
        """Envia email de notificação"""
        try:
            template = self.template_env.get_template("notification.html")

            html_content = template.render(
                title=title,
                content=content,
                user_name=user_name,
                subject=subject or title,
            )

            return await self.send_email(
                to_email=email,
                subject=subject or f"{title} - SynapScale",
                html_content=html_content,
            )
        except Exception as e:
            logger.error(f"Erro ao enviar email de notificação: {str(e)}")
            return False

    async def send_workflow_completion_email(
        self,
        email: str,
        workflow_name: str,
        execution_id: str,
        user_name: str = "",
    ) -> bool:
        """Envia notificação de conclusão de workflow"""
        content = f"""
        <p>Seu workflow <strong>{workflow_name}</strong> foi executado com sucesso!</p>
        <p>ID da execução: <code>{execution_id}</code></p>
        <p>Você pode visualizar os resultados acessando sua dashboard.</p>
        """

        return await self.send_notification_email(
            email=email,
            title="Workflow Concluído",
            content=content,
            user_name=user_name,
            subject=f"Workflow '{workflow_name}' Concluído",
        )

    async def send_agent_message_email(
        self,
        email: str,
        agent_name: str,
        message_preview: str,
        user_name: str = "",
    ) -> bool:
        """Envia notificação de nova mensagem de agente"""
        content = f"""
        <p>Você recebeu uma nova mensagem do agente <strong>{agent_name}</strong>:</p>
        <blockquote style="border-left: 4px solid #4f46e5; padding-left: 16px; margin: 16px 0;">
            {message_preview}
        </blockquote>
        <p>Acesse sua dashboard para ver a conversa completa.</p>
        """

        return await self.send_notification_email(
            email=email,
            title="Nova Mensagem de Agente",
            content=content,
            user_name=user_name,
            subject=f"Nova mensagem de {agent_name}",
        )


# Instância global do serviço de email
email_service = EmailService()
