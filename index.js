// On statup, run script
(async () => {
    let config = {
        temp: null,
        perm: null
    };

    try {
        config = {
            temp: require('./config/temp.json'),
            perm: require('./config/perm.json')
        }
    } catch(e) {
        config = {
            temp: {
                user: null
            },
            perm: null
        }
    }

    // If config hasn't been properly setup, queue rebuild
    if(!config.temp) {
        await queue_temp_config_rebuild();
    }

    // Run server
    const express = require('express');
    const body_parser = require('body-parser');
    
    const app = express();
    // parse application/x-www-form-urlencoded
    app.use(body_parser.urlencoded({ extended: false }))
    
    // parse application/json
    app.use(body_parser.json())

    const { Octokit } = require("@octokit/core");

    app.all('/', async (req, res) => {
        // verify sponsorship
        // ...do verification
        // Then, add user via email to Github
        try {
            const octokit = new Octokit({ auth: config.temp.token });

            let invitation = await octokit.request('PUT /repos/{owner}/{repo}/collaborators/{username}', {
                    owner: config.temp.user,
                    repo: config.temp.repo,
                    username: req.body.sponsorship.sponsor.login,
                    permission: 'pull' || config.temp.permission,
                  });
            // Send notification email to client

            // Send notification email to org

            // Return
            return res.send(invitation);
        } catch(e) {
            return res.send(e);
        }
    });

    app.listen(8080 || process.env.PORT);

async function queue_temp_config_rebuild() {
    let pending_temp = {

    };
}

})();