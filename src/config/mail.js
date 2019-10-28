export default {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    default: {
        from: 'GoBarber team <noreply@gobarber.com>'
    }
};

/*
Mail Svcs:
Amazon SES
Mailgun
Sparkpost
Mandril -> Mailchimp
Mailtrap -> DEV env
*/
