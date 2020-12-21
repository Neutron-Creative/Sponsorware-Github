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
                    html: `
                    <!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Simple Transactional Email</title>
    <style>
    /* -------------------------------------
        INLINED WITH htmlemail.io/inline
    ------------------------------------- */
    /* -------------------------------------
        RESPONSIVE AND MOBILE FRIENDLY STYLES
    ------------------------------------- */
    @media only screen and (max-width: 620px) {
      table[class=body] h1 {
        font-size: 28px !important;
        margin-bottom: 10px !important;
      }
      table[class=body] p,
            table[class=body] ul,
            table[class=body] ol,
            table[class=body] td,
            table[class=body] span,
            table[class=body] a {
        font-size: 16px !important;
      }
      table[class=body] .wrapper,
            table[class=body] .article {
        padding: 10px !important;
      }
      table[class=body] .content {
        padding: 0 !important;
      }
      table[class=body] .container {
        padding: 0 !important;
        width: 100% !important;
      }
      table[class=body] .main {
        border-left-width: 0 !important;
        border-radius: 0 !important;
        border-right-width: 0 !important;
      }
      table[class=body] .btn table {
        width: 100% !important;
      }
      table[class=body] .btn a {
        width: 100% !important;
      }
      table[class=body] .img-responsive {
        height: auto !important;
        max-width: 100% !important;
        width: auto !important;
      }
    }

    /* -------------------------------------
        PRESERVE THESE STYLES IN THE HEAD
    ------------------------------------- */
    @media all {
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
        line-height: 100%;
      }
      .apple-link a {
        color: inherit !important;
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        text-decoration: none !important;
      }
      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
      .btn-primary table td:hover {
        background-color: #34495e !important;
      }
      .btn-primary a:hover {
        background-color: #34495e !important;
        border-color: #34495e !important;
      }
    }
    </style>
  </head>
  <body class="" style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
    <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">This is preheader text. Some clients will show this text as a preview.</span>
    <table border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td>
        <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;">
          <div class="content" style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;">

            <!-- START CENTERED WHITE CONTAINER -->
            <table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;">
                  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
                    <tr>
                      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Howdy,</p>
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Thanks for your support! Your contribution allows us to keep building projects you love.<br>Below is the link to the included Github repository with your sponsorship.</p>
                        <table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;">
                          <tbody>
                            <tr>
                              <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;">
                                <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                  <tbody>
                                    <tr>
                                      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; background-color: #5353EC; border-radius: 5px; text-align: center;"> <a href="https://github.com/` + config.temp.user + `/` + config.temp.repo + `/" target="_blank" style="display: inline-block; color: #ffffff; background-color: #5353EC; border: solid 1px #5353EC; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #5353EC;">Visit the repository now</a> </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">This is a really simple email template. Its sole purpose is to get the recipient to click the button with no distractions.</p>
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Good luck! Hope it works.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            <!-- END MAIN CONTENT AREA -->
            </table>

            <!-- START FOOTER -->
            <div class="footer" style="clear: both; Margin-top: 10px; text-align: center; width: 100%;">
              <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
                <tr>
                  <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;">
                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Company Inc, 3 Abbey Road, San Francisco CA 94102</span>
                    <br> Don't like these emails? <a href="http://i.imgur.com/CScmqnj.gif" style="text-decoration: underline; color: #999999; font-size: 12px; text-align: center;">Unsubscribe</a>.
                  </td>
                </tr>
                <tr>
                  <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;">
                    Powered by <a href="https://`+config.temp.user+`/`+config.temp.repo+`/" style="color: #999999; font-size: 12px; text-align: center; text-decoration: none;">HTMLemail</a>.
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->

          <!-- END CENTERED WHITE CONTAINER -->
          </div>
        </td>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td>
      </tr>
    </table>
  </body>
</html>
                    `, // html body
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
    app.listen(8080 || process.env.PORT);

}

async function queue_temp_config_rebuild() {
    let pending_temp = {

    };
}