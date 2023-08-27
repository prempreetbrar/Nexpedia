const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");

module.exports = class Email {
  #to;
  #firstName;
  #url;
  #from;

  constructor(user, url) {
    this.#to = user.email;
    this.#firstName = user.name.split(" ").shift();
    this.#url = url;
    this.#from = `Nexpedia Inc. <${process.env.EMAIL_FROM}>`;
  }

  #newTransport() {
    if (process.env.NODE_ENV === "production") {
      // sendgrid
      return "sendgrid";
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async #send(template, subject) {
    // render HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.#firstName,
        url: this.#url,
        subject,
      }
    );

    // define email options
    const mailOptions = {
      from: this.#from,
      to: this.#to,
      subject,
      html,
      text: convert(html),
    };

    // create a transporter and send email
    await this.#newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.#send("welcome", "Welcome to the Nexpedia Family!");
  }
};
