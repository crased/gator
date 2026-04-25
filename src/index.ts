
import { CommandsRegistry, handlerLogin, handlerRegister, registerCommand, runCommand, resetCommand, getUsersCommand, aggCommand  } from './commands.js';
import { addFeed, handlerFeed, followFeed, following, unfollow } from './feed.js';
import { handlerBrowse } from './posts.js';
import { middlewareLoggedIn } from './middleware.js';
async function main() {
const obj: CommandsRegistry = {};
registerCommand(obj, "feeds", handlerFeed)
registerCommand(obj, "login", handlerLogin)
registerCommand(obj, "register", handlerRegister)
registerCommand(obj, "reset", resetCommand )
registerCommand(obj, 'users', getUsersCommand)
registerCommand(obj, 'agg', aggCommand)
registerCommand(obj, 'addfeed', middlewareLoggedIn(addFeed))
registerCommand(obj, "follow", middlewareLoggedIn(followFeed))
registerCommand(obj, "following", middlewareLoggedIn(following))
registerCommand(obj,"unfollow", middlewareLoggedIn(unfollow))
registerCommand(obj, "browse", middlewareLoggedIn(handlerBrowse))

const args = process.argv.slice(2);
if (args.length === 0) {
 console.log('error: no command has been given') 
 process.exit(1)   
}
const cmdName = args[0];
const cmdArgs = args.slice(1);
try {
await runCommand(obj, cmdName, ...cmdArgs)
} catch (error) {
 console.error(error)
 process.exit(1)
}
process.exit(0)
}
main();