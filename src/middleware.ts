import { UserCommandHandler, CommandHandler } from "./commands"; 
import { readConfig } from "./config";
import { getUser } from "./lib/db/queries/users";


export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
 return async (cmdName: string, ...args: string[]): Promise<void> => {
 const conf = readConfig(); 
 const user = await getUser(conf.currentUserName);
 if (!user) {
 throw new Error(`user not found`)   
 }
 await handler(cmdName, user, ...args);
}};