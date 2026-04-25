import { readConfig, setUser } from "./config";
import { fetchFeed } from "./fetch";
import { createUser, getUser, resetUsers, getUsers } from "./lib/db/queries/users";
import type { User } from "./schema";
import { db } from "./lib/db/index";
import { Agent } from "http";
import { title } from "process";
import { scrapeFeed } from "./feed";
import { time } from "console";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export type UserCommandHandler = (cmdName: string, user: User, ...args: string[] ) => Promise<void>;



export async function handlerLogin(cmdName: string, ...args: string[]) {
if (args.length === 0) {
throw new Error('Username input needed!');
}
const check = await getUser(args[0]) 
if (typeof check === 'undefined') {
throw new Error("Username doesn't exist")  
}
setUser(args[0])
console.log(`UserName has been set!`)
};

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
if (args.length === 0) {
throw new Error('username input needed!'); 
}
const bounce = await getUser(args[0])
if (typeof bounce !== 'undefined') {
throw new Error('user already exist:')
}
const user = await createUser(args[0]);
setUser(args[0]);
console.log(user);
};


export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
registry[cmdName] = handler;


}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
if (typeof registry[cmdName] === "undefined" ) {
  throw new Error(`Command name not found!`)  
}
await registry[cmdName](cmdName, ...args)
}

export async function resetCommand(cmdName: string) {
await resetUsers();
console.log('Reset was successful...');
process.exit(0)
};

export async function getUsersCommand(cmdName: string) {
const elements = await getUsers();
const item = readConfig();
for (let i = 0; i < elements.length; i++) {
if (elements[i].name === item.currentUserName) {
console.log(`* ${elements[i].name} (current)`);
} else {
console.log(`* ${elements[i].name}`);
}
}
process.exit(0);
};

export async function aggCommand(cmdName: string, timeBetweenReq: string) {
const TBR = parseDuration(timeBetweenReq)
console.log(`collecting feeds every ${TBR}ms`)
  scrapeFeed().catch(console.error);

const interval = setInterval(() => { 
  scrapeFeed().catch(console.error);
}, TBR);
await new Promise<void>((resolve) => {
process.on("SIGINT", () => { 
 console.log("Shutting down...");
 clearInterval(interval);
 resolve();
//const url = 'https://www.wagslane.dev/index.xml'
//const response = await fetchFeed(url);
//console.log(JSON.stringify(response, null, 2));
});
});

}

export function parseDuration(durationStr: string): number {
const regex = /^(\d+)(ms|s|m|h)$/;
const match = durationStr.match(regex);
if (!match) {
 throw new Error(`invalid duration string`); 
}
const value = parseInt(match[1]);
const unit = match[2];
switch (unit) {
 case "ms":
  return value * 1; 
 case "s":
  return value * 1000;
 case "m":
  return value * 60 * 1000;
 case "h":
  return value * 60 * 60 * 1000; 
 default:
  throw new Error("unknown unit");
};
}