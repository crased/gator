import * as os from 'os';
import * as path from 'path';
import { readFileSync, writeFileSync } from 'fs';

export type Config = {
dbUrl: string;
currentUserName: string;
};


export function setUser(userName: string) {
const config = readConfig();
config.currentUserName = userName;
writeConfig(config);
}

export function readConfig() {
const fullPath = path.join(os.homedir(), ".gatorconfig.json")
const rawConfig = JSON.parse(readFileSync(fullPath,'utf-8'))
return validateConfig(rawConfig);
};


function validateConfig(rawConfig: any): Config {
 if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
    throw new Error("...");
 };
 if (typeof rawConfig.current_user_name !== "string") {
    throw new Error("...");
 };
 const config: Config = {
 dbUrl: rawConfig.db_url,
 currentUserName: rawConfig.current_user_name,
 };
 return config;
 }

function writeConfig(cfg: Config): void {
const fullPath = path.join(os.homedir(), ".gatorconfig.json")
const rawConfig = {
db_url: cfg.dbUrl,
current_user_name: cfg.currentUserName,
};
const data = JSON.stringify(rawConfig);
writeFileSync(fullPath, data, 'utf-8');
};
