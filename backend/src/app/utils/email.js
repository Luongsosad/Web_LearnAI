import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendVerificationEmail(to, code) {
    const mailOptions = {
        from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Xác thực tài khoản Learning by AI',
        html: `
            <h3>Chào mừng bạn đến với hệ thống</h3>
            <p>Bạn vừa yêu cầu mã xác thực để đăng ký hoặc đăng nhập Learning by AI.</p>
            <p>Mã xác thực của bạn là: <b>${code}</b></p>
            <p>Mã này sẽ hết hạn sau <strong>90s</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
            <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
            <hr>
            <p>Trân trọng,<br><strong>LearningAI Team</strong></p>
        `,
    };

    await transporter.sendMail(mailOptions);
}

export { sendVerificationEmail };
