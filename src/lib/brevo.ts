export async function sendWelcomeEmail(email: string, name: string) {
    const apiKey = process.env.BREVO_API_KEY
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "contato@comunidadeiaacademy.com.br"

    if (!apiKey) {
        console.error("BREVO_API_KEY not found in environment variables")
        return { error: "Email configuration missing" }
    }

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": apiKey,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: {
                    name: "Comunidade IA Academy",
                    email: senderEmail
                },
                to: [{ email, name }],
                subject: "Bem-vindo à Comunidade IA Academy! 🚀",
                htmlContent: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #000; color: #fff; border-radius: 24px;">
                        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 24px;">Olá, ${name}! 🎉</h1>
                        <p style="font-size: 16px; line-height: 1.6; color: #ccc; margin-bottom: 32px;">
                            Seu acesso à <strong>Comunidade IA Academy</strong> já está liberado! Estamos muito felizes em ter você conosco.
                        </p>
                        
                        <div style="background-color: #111; padding: 24px; border-radius: 16px; border: 1px solid #222; margin-bottom: 32px;">
                            <p style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #666;">Seus dados de acesso:</p>
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #fff;"><strong>Link:</strong> <a href="https://comunidadeiaacademy.com.br" style="color: #3b82f6; text-decoration: none;">comunidadeiaacademy.com.br</a></p>
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #fff;"><strong>E-mail:</strong> ${email}</p>
                            <p style="margin: 0; font-size: 14px; color: #fff;"><strong>Senha inicial:</strong> ACADEMY@123</p>
                        </div>
                        
                        <a href="https://comunidadeiaacademy.com.br/login" style="display: block; text-align: center; background-color: #fff; color: #000; padding: 16px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 16px;">
                            Acessar Plataforma Agora
                        </a>
                        
                        <p style="font-size: 12px; color: #444; margin-top: 40px; text-align: center;">
                            Recomendamos que você altere sua senha no primeiro acesso para sua total segurança.
                        </p>
                    </div>
                `
            })
        })

        const data = await response.json()
        if (!response.ok) {
            console.error("Brevo API Error:", data)
            return { error: "Failed to send email" }
        }

        return { success: true }
    } catch (error) {
        console.error("Error sending welcome email:", error)
        return { error: "Internal email error" }
    }
}
