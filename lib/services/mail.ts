import nodemailer from 'nodemailer'

interface EmailOptions {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    // In production, these should be properly set in .env.local
    // Using Ethereal (https://ethereal.email/) for development/testing if real credentials aren't provided

    let host = process.env.SMTP_HOST;
    let port = Number(process.env.SMTP_PORT);
    let user = process.env.SMTP_USER;
    let pass = process.env.SMTP_PASS;

    if (!host) {
        const testAccount = await nodemailer.createTestAccount();
        host = testAccount.smtp.host;
        port = testAccount.smtp.port;
        user = testAccount.user;
        pass = testAccount.pass;
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user,
            pass,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Spartans Team" <noreply@spartans.com>',
            to,
            subject,
            html,
        });

        console.log('Message sent: %s', info.messageId);

        if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.SMTP_HOST) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('Error sending email:', error)
        throw error
    }
}
