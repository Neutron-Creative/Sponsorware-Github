/*
    Require neccessary dependencies 
*/
// Github API interface
const { Octokit } = require("@octokit/core");
// Lambda JSON
const querystring = require('querystring');

/*
    Configure webhook
*/
// Initialize Github API connection
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  exports.handler = async function (event) {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Extract params from event body
    let params = querystring.parse(event.body);
    console.log('Params');
    console.log(params);

    // verify sponsorship
    // FIX LATER
    if (!params.action) {
        return { statusCode: 400, body: "Failed to verify request as sponsorship payload" };
    }

    // sort by intent, take action
    switch(params.action) {
        case "created":
            let invitation = await create_invite(params);
            return invitation;
            break;
        /*case "pending_tier_change":
            let tier_change = await change_tier(params);
            return tier_change;
            break;*/
        default:
            return {
                statusCode: 400,
                body: 'Request action not supported at this time'
            }
            break;
    }

  }

  async function create_invite(params) {
    try {
        // Verify request pre-requisites
        if (!params.sponsorship.sponsor.login) {
            return { statusCode: 400, body: "Sponsorship payload incomplete" };
        }

        // Then, add user via email to Github
        let invitation = await octokit.request('PUT /repos/{owner}/{repo}/collaborators/{username}', {
            owner: process.env.GITHUB_USER,
            repo: process.env.GITHUB_REPO,
            username: params.sponsorship.sponsor.login,
            permission: process.env.GITHUB_PERMISSION || 'pull',
        });
        // Finalize response to client
        return {
            statusCode: 200,
            body: 'User invited successfully!'
        };
    } catch(e) {
        console.log('Error!');
        console.log(e);
        // Finalize response to client
        return {
            statusCode: 500,
            body: e
        };
    }
  }

  /*
    Tier Upgrades & Downgrades
    -----------------------------
    Coming soon - have to put on hold due to server provider issues.
    Requires a cron job and database to modify tier on effective date, since subscriptions don't end at the same time the webhook is called.
  */
  /*async function tier_change(params) {

  }*/