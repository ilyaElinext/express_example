    /* this program listens for /reload request at port 4500. 
    or a GitHub WebHook trigger (see: https://technology.amis.nl/2018/03/20/handle-a-github-push-event-from-a-web-hook-trigger-in-a-node-application/)
    When it receives such a request, it will perform a Git pull in the app sub directory (from where this application runs) 

    TODO
    - add the option to schedule an automatic periodic git pull

    - use https://www.npmjs.com/package/simple-git instead of shelljs plus local Git client (this could allow usage of a lighter base image - e.g. node-slim)
    */

    const RELOAD_PATH = '/reload'
    const GITHUB_WEBHOOK_PATH = '/github/push'

    var http = require('http');
    var server = http.createServer(function (request, response) {
        if (request.method === 'GET' && request.url === RELOAD_PATH) {
            console.log(`reload request starting at ${new Date().toISOString()}...`);
            refreshAppFromGit();
            response.write(`RELOADED!!${new Date().toISOString()}`);
            response.end();
            console.log('reload request handled...');
        } if (request.method === 'POST' && request.url === GITHUB_WEBHOOK_PATH) {
            console.log(`GitHub WebHook event handling starting ${new Date().toISOString()}...`);
                var githubEvent = request.body
                // - githubEvent.head_commit is the last (and frequently the only) commit
                // - githubEvent.pusher is the user of the pusher pusher.name and pusher.email
                // - timestamp of final commit: githubEvent.head_commit.timestamp
                // - branch:  githubEvent.ref (refs/heads/master)
               
                var commits = {}
                if (githubEvent.commits)
                  commits = githubEvent.commits.reduce(
                    function (agg, commit) {
                      agg.messages = agg.messages + commit.message + ";"
                      agg.filesTouched = agg.filesTouched.concat(commit.added).concat(commit.modified).concat(commit.removed)
//                        .filter(file => file.indexOf("src/js/jet-composites/input-country") > -1)
                      return agg
                    }
                    , { "messages": "", "filesTouched": [] })
               
                var push = {
                  "finalCommitIdentifier": githubEvent.after,
                  "pusher": githubEvent.pusher,
                  "timestamp": githubEvent.head_commit.timestamp,
                  "branch": githubEvent.ref,
                  "finalComment": githubEvent.head_commit.message,
                  "commits": commits
                }
                console.log("WebHook Push Event: " + JSON.stringify(push))
                if (push.commits.filesTouched.length > 0) {
                  console.log("This commit involves changes to the Node application, so let's perform a git pull ")
                  refreshAppFromGit();
                }
               
                var response = push
                response.json(response)
                console.log(`GitHub WebHook event handling complete at ${new Date().toISOString()}`);
              

        }
        else {
            // respond
            response.write('Reload is live at path '+RELOAD_PATH);
            response.end();
        }
    });
    server.listen(4500);
    console.log('Server running and listening at Port 4500');

    //https://stackoverflow.com/questions/44647778/how-to-run-shell-script-file-using-nodejs
    // https://www.npmjs.com/package/shelljs

    var shell = require('shelljs');
    var pwd = shell.pwd()
    console.info(`current dir ${pwd}`)

    function refreshAppFromGit() {
        if (shell.exec('./gitRefresh.sh').code !== 0) {
            shell.echo('Error: Git Pull failed');
            shell.exit(1);
        } else {
    //        shell.exec('npm install')
        //  shell.exit(0);
        }

    }
