const express = require('express');
const body_parser = require('body-parser');
const chalk = require('chalk');
const prompts = require('prompts');
const nodemailer = require('nodemailer');

let config = {
    temp: require('./config/temp.json') || null,
    perm: require('./config/perm.json') || null
};

const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: config.temp.token });

main();

// On statup, run script
async function main() {

    // If config hasn't been properly setup, queue rebuild
    if(!config.temp) {
        await queue_temp_config_rebuild();
    }

    // Run server
    const app = express();

    // parse application/x-www-form-urlencoded
    app.use(body_parser.urlencoded({ extended: false }))
    
    // parse application/json
    app.use(body_parser.json())

    // Funding metrics API
    app.all('/funding', async (req, res) => {
      return res.send({
        total_sum: 0,
        sponsors: 0,
        goal_completion: 0
      });
    });

    // Github Sponsorship Webhook Listener
    app.all('/', async (req, res) => {
        // verify sponsorship
        // ...do verification
        // Then, add user via email to Github
        try {

            let invitation = await octokit.request('PUT /repos/{owner}/{repo}/collaborators/{username}', {
                    owner: config.temp.user,
                    repo: config.temp.repo,
                    username: req.body.sponsorship.sponsor.login,
                    permission: 'pull' || config.temp.permission,
                  });

            // Setup Email
            // Generate test SMTP service account from ethereal.email
            // Only needed if you don't have a real mail account for testing
            if(!config.temp.smtp) {
                let testAccount = await nodemailer.createTestAccount();

                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: testAccount.user, // generated ethereal user
                        pass: testAccount.pass, // generated ethereal password
                    },
                });
            } else {
                // create reusable transporter object using provided user smtp data
                let transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email" || config.temp.smtp.host,
                    port: 587 || config.temp.smtp.port,
                    secure: false || config.temp.smtp.secure, // true for 465, false for other ports
                    auth: {
                        user: config.temp.smtp.auth.user, // generated ethereal user
                        pass: config.temp.smtp.auth.user.pass, // generated ethereal password
                    },
                });
            }

                // Send notification email to client
                let client= await transporter.sendMail({
                    from: '"Fred Foo 👻" <foo@example.com>' || config.temp.mail.from, // sender address
                    to: req.body.sponsorship.sponsor.login, // list of receivers
                    subject: "Hello ✔" || config.temp.mail.subject, // Subject line
                    html: `Howdy!`, // html body
                });

                // Send notification email to org
                let organization = await transporter.sendMail({
                    from: '"Fred Foo 👻" <foo@example.com>' || config.temp.mail.internal.from, // sender address
                    to: config.temp.mail.internal.to, // list of receivers
                    subject: "Action performed: granted permission to repository" || config.temp.mail.internal.subject, // Subject line
                    html: "<b>Hello world?</b>", // html body
                });
            // Return
            return res.send({ client, organization });
        } catch(e) {
            return res.send(e);
        }
    });

    // Make application publically accessible
    app.listen(8080 || process.env.PORT);

}

async function queue_temp_config_rebuild() {
    let pending_temp = {

    };
}