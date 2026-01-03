/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *                    ENDLESS NEXUS - DEPLOYMENT SCRIPT
 *                    Module: NexusMock sur Endless Testnet
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Ce script gère le déploiement complet du module NexusMock :
 * 1. Vérifie/charge le compte de déploiement
 * 2. Vérifie le solde EDS (avec instructions faucet si nécessaire)
 * 3. Compile le module Move
 * 4. Publie sur Endless Testnet
 * 5. Affiche l'adresse du module pour le frontend
 */

import {
    Endless,
    EndlessConfig,
    Network,
    Account,
    Ed25519PrivateKey,
    AccountAddress,
    Hex,
} from "@endlesslab/endless-ts-sdk";
import * as fs from "fs";
import * as path from "path";
import { execSync, spawnSync } from "child_process";
import * as readline from "readline";

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // Endless Testnet endpoints
    FULLNODE_URL: process.env.ENDLESS_FULLNODE_URL || "https://rpc-testnet.endless.link/v1",
    FAUCET_URL: process.env.ENDLESS_FAUCET_URL || "https://faucet-testnet.endless.link",
    EXPLORER_URL: "https://explorer-testnet.endless.link",
    
    // Paths
    MODULE_PATH: path.resolve(__dirname, ".."),
    ACCOUNT_FILE: path.resolve(__dirname, "..", ".endless", "account.json"),
    MOVE_TOML_PATH: path.resolve(__dirname, "..", "Move.toml"),
    
    // Deployment settings
    MIN_BALANCE_FOR_DEPLOY: 10_000_000, // 0.1 EDS minimum requis
    MODULE_NAME: "nexus_mock",
    PACKAGE_NAME: "NexusMock",
};

// ============================================
// TYPES
// ============================================

interface SavedAccount {
    address: string;
    privateKey: string;
    publicKey: string;
    createdAt: string;
}

interface DeploymentResult {
    success: boolean;
    moduleAddress?: string;
    transactionHash?: string;
    error?: string;
}

// ============================================
// CONSOLE HELPERS
// ============================================

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
};

function log(message: string): void {
    console.log(message);
}

function logStep(step: number, message: string): void {
    console.log(`\n${colors.cyan}[${step}/5]${colors.reset} ${colors.bright}${message}${colors.reset}`);
}

function logSuccess(message: string): void {
    console.log(`${colors.green}   ✅ ${message}${colors.reset}`);
}

function logError(message: string): void {
    console.log(`${colors.red}   ❌ ${message}${colors.reset}`);
}

function logWarning(message: string): void {
    console.log(`${colors.yellow}   ⚠️  ${message}${colors.reset}`);
}

function logInfo(message: string): void {
    console.log(`${colors.blue}   ℹ️  ${message}${colors.reset}`);
}

function printBanner(): void {
    console.log(`
${colors.cyan}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ${colors.bright}███████╗███╗   ██╗██████╗ ██╗     ███████╗███████╗███████╗${colors.cyan}   ║
║   ${colors.bright}██╔════╝████╗  ██║██╔══██╗██║     ██╔════╝██╔════╝██╔════╝${colors.cyan}   ║
║   ${colors.bright}█████╗  ██╔██╗ ██║██║  ██║██║     █████╗  ███████╗███████╗${colors.cyan}   ║
║   ${colors.bright}██╔══╝  ██║╚██╗██║██║  ██║██║     ██╔══╝  ╚════██║╚════██║${colors.cyan}   ║
║   ${colors.bright}███████╗██║ ╚████║██████╔╝███████╗███████╗███████║███████║${colors.cyan}   ║
║   ${colors.bright}╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚══════╝╚══════╝${colors.cyan}   ║
║                                                               ║
║              ${colors.magenta}NEXUS MOCK - DEPLOYMENT SCRIPT${colors.cyan}                  ║
║              ${colors.yellow}Target: Endless Testnet${colors.cyan}                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);
}

// ============================================
// ENDLESS CLIENT
// ============================================

function initEndlessClient(): Endless {
    const config = new EndlessConfig({
        fullnode: CONFIG.FULLNODE_URL,
    });
    return new Endless(config);
}

// ============================================
// ACCOUNT MANAGEMENT
// ============================================

function loadOrCreateAccount(): Account {
    const accountDir = path.dirname(CONFIG.ACCOUNT_FILE);
    
    // Try to load existing account
    if (fs.existsSync(CONFIG.ACCOUNT_FILE)) {
        log("   📂 Chargement du compte existant...");
        
        try {
            const savedAccount: SavedAccount = JSON.parse(
                fs.readFileSync(CONFIG.ACCOUNT_FILE, "utf-8")
            );
            
            const privateKey = new Ed25519PrivateKey(savedAccount.privateKey);
            const account = Account.fromPrivateKey({ privateKey });
            
            logSuccess(`Compte chargé: ${truncateAddress(account.accountAddress.toString())}`);
            logInfo(`Créé le: ${savedAccount.createdAt}`);
            
            return account;
        } catch (error) {
            logWarning("Fichier account.json corrompu, création d'un nouveau compte...");
        }
    }
    
    // Create new account
    log("   🆕 Création d'un nouveau compte...");
    const account = Account.generate();
    
    // Ensure directory exists
    if (!fs.existsSync(accountDir)) {
        fs.mkdirSync(accountDir, { recursive: true });
    }
    
    // Save account
    const accountData: SavedAccount = {
        address: account.accountAddress.toString(),
        privateKey: account.privateKey.toString(),
        publicKey: account.publicKey.toString(),
        createdAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(CONFIG.ACCOUNT_FILE, JSON.stringify(accountData, null, 2));
    
    logSuccess(`Nouveau compte créé: ${truncateAddress(account.accountAddress.toString())}`);
    logInfo(`Sauvegardé dans: ${CONFIG.ACCOUNT_FILE}`);
    
    return account;
}

function truncateAddress(address: string): string {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

// ============================================
// BALANCE CHECK
// ============================================

async function checkBalance(client: Endless, address: AccountAddress): Promise<bigint> {
    try {
        // Try to get account resources
        const resources = await client.getAccountResources({
            accountAddress: address,
        });
        
        // Look for EDS/APT coin balance in various formats
        for (const resource of resources) {
            // Standard CoinStore format
            if (resource.type.includes("0x1::coin::CoinStore")) {
                const data = resource.data as { coin?: { value: string } };
                if (data.coin?.value) {
                    return BigInt(data.coin.value);
                }
            }
            
            // Fungible Asset format
            if (resource.type.includes("fungible_asset::FungibleStore")) {
                const data = resource.data as { balance?: string };
                if (data.balance) {
                    return BigInt(data.balance);
                }
            }
        }
        
        return BigInt(0);
    } catch (error: any) {
        // Account doesn't exist on-chain yet
        if (error.message?.includes("Resource not found") || 
            error.message?.includes("Account not found") ||
            error.status === 404) {
            return BigInt(-1); // Special value indicating account doesn't exist
        }
        throw error;
    }
}

function formatEDS(amount: bigint): string {
    const decimals = 8;
    const divisor = BigInt(10 ** decimals);
    const whole = amount / divisor;
    const fraction = amount % divisor;
    
    if (fraction === BigInt(0)) {
        return `${whole} EDS`;
    }
    
    const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
    return `${whole}.${fractionStr} EDS`;
}

function printFaucetInstructions(address: string): void {
    console.log(`
${colors.yellow}╔═══════════════════════════════════════════════════════════════╗
║                    💰 FAUCET REQUIS                           ║
╠═══════════════════════════════════════════════════════════════╣${colors.reset}
${colors.yellow}║${colors.reset} Votre compte n'a pas assez d'EDS pour déployer.              ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset}                                                               ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset} ${colors.bright}Option 1: Via CLI Endless${colors.reset}                                  ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset}   ${colors.cyan}endless account fund-with-faucet \\${colors.reset}                        ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset}   ${colors.cyan}  --account ${truncateAddress(address)} \\${colors.reset}              ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset}   ${colors.cyan}  --amount 100000000${colors.reset}                                       ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset}                                                               ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset} ${colors.bright}Option 2: Via Faucet Web${colors.reset}                                   ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset}   1. Allez sur: ${colors.cyan}${CONFIG.FAUCET_URL}${colors.reset}            ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset}   2. Entrez votre adresse:                                    ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset}      ${colors.green}${address}${colors.reset}
${colors.yellow}║${colors.reset}   3. Cliquez sur "Request Tokens"                             ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset}                                                               ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset} ${colors.bright}Option 3: Via cURL${colors.reset}                                         ${colors.yellow}║${colors.reset}
${colors.yellow}║${colors.reset}   ${colors.cyan}curl -X POST "${CONFIG.FAUCET_URL}/mint" \\${colors.reset}
${colors.yellow}║${colors.reset}   ${colors.cyan}  -H "Content-Type: application/json" \\${colors.reset}
${colors.yellow}║${colors.reset}   ${colors.cyan}  -d '{"address":"${address}","amount":100000000}'${colors.reset}
${colors.yellow}║${colors.reset}                                                               ${colors.yellow}║${colors.reset}
${colors.yellow}╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);
}

// ============================================
// MOVE.TOML UPDATE
// ============================================

function updateMoveToml(accountAddress: string): void {
    log("   📝 Mise à jour de Move.toml...");
    
    let moveToml = fs.readFileSync(CONFIG.MOVE_TOML_PATH, "utf-8");
    
    // Replace nexus_addr placeholder with actual address
    const originalToml = moveToml;
    
    // Handle various formats
    moveToml = moveToml.replace(
        /nexus_addr\s*=\s*"_"/g,
        `nexus_addr = "${accountAddress}"`
    );
    moveToml = moveToml.replace(
        /nexus_addr\s*=\s*'_'/g,
        `nexus_addr = "${accountAddress}"`
    );
    // Also update if there's already an address
    moveToml = moveToml.replace(
        /nexus_addr\s*=\s*"0x[a-fA-F0-9]+"/g,
        `nexus_addr = "${accountAddress}"`
    );
    
    if (moveToml !== originalToml) {
        fs.writeFileSync(CONFIG.MOVE_TOML_PATH, moveToml);
        logSuccess(`Move.toml mis à jour avec l'adresse: ${truncateAddress(accountAddress)}`);
    } else {
        logInfo("Move.toml déjà configuré");
    }
}

// ============================================
// COMPILATION
// ============================================

function compileModule(): boolean {
    log("   🔨 Compilation du module Move...");
    
    try {
        // Check if endless CLI is available
        const checkCli = spawnSync("endless", ["--version"], { 
            shell: true, 
            encoding: "utf-8",
            cwd: CONFIG.MODULE_PATH 
        });
        
        if (checkCli.error || checkCli.status !== 0) {
            // Try with 'aptos' CLI as fallback (compatible)
            const checkAptos = spawnSync("aptos", ["--version"], { 
                shell: true, 
                encoding: "utf-8" 
            });
            
            if (checkAptos.error || checkAptos.status !== 0) {
                logError("Ni 'endless' ni 'aptos' CLI n'est installé!");
                logInfo("Installez le CLI: cargo install endless-cli");
                return false;
            }
            
            logWarning("'endless' CLI non trouvé, utilisation de 'aptos' CLI...");
            execSync("aptos move compile", { 
                cwd: CONFIG.MODULE_PATH, 
                stdio: "pipe" 
            });
        } else {
            execSync("endless move compile", { 
                cwd: CONFIG.MODULE_PATH, 
                stdio: "pipe" 
            });
        }
        
        // Verify compiled output exists
        const bytecodeDir = path.join(
            CONFIG.MODULE_PATH, 
            "build", 
            CONFIG.PACKAGE_NAME, 
            "bytecode_modules"
        );
        
        if (!fs.existsSync(bytecodeDir)) {
            logError("Dossier bytecode non trouvé après compilation");
            return false;
        }
        
        const moduleFile = path.join(bytecodeDir, `${CONFIG.MODULE_NAME}.mv`);
        if (!fs.existsSync(moduleFile)) {
            logError(`Module compilé non trouvé: ${moduleFile}`);
            return false;
        }
        
        const stats = fs.statSync(moduleFile);
        logSuccess(`Compilation réussie! (${stats.size} bytes)`);
        
        return true;
    } catch (error: any) {
        logError("Erreur de compilation:");
        console.error(error.message || error);
        
        // Show compilation output if available
        if (error.stdout) console.log(error.stdout.toString());
        if (error.stderr) console.error(error.stderr.toString());
        
        return false;
    }
}

// ============================================
// PUBLICATION
// ============================================

async function publishModule(accountAddress: string): Promise<DeploymentResult> {
    log("   📤 Publication sur Endless Testnet...");
    
    try {
        // Use CLI for publication (more reliable)
        const publishCmd = process.platform === "win32" 
            ? "endless move publish --assume-yes 2>&1"
            : "endless move publish --assume-yes";
            
        const result = spawnSync(publishCmd, {
            shell: true,
            cwd: CONFIG.MODULE_PATH,
            encoding: "utf-8",
            env: { ...process.env },
        });
        
        // Check if we need to use aptos CLI instead
        if (result.error || (result.stderr && result.stderr.includes("not recognized"))) {
            logWarning("Utilisation de 'aptos' CLI comme fallback...");
            
            const aptosResult = spawnSync("aptos move publish --assume-yes", {
                shell: true,
                cwd: CONFIG.MODULE_PATH,
                encoding: "utf-8",
            });
            
            if (aptosResult.status !== 0) {
                return {
                    success: false,
                    error: aptosResult.stderr || aptosResult.stdout || "Publication failed",
                };
            }
            
            // Try to extract transaction hash from output
            const hashMatch = (aptosResult.stdout || "").match(/Transaction hash: (0x[a-fA-F0-9]+)/);
            
            return {
                success: true,
                moduleAddress: accountAddress,
                transactionHash: hashMatch ? hashMatch[1] : undefined,
            };
        }
        
        if (result.status !== 0) {
            const errorOutput = result.stderr || result.stdout || "Unknown error";
            
            // Check for specific errors
            if (errorOutput.includes("INSUFFICIENT_BALANCE")) {
                return {
                    success: false,
                    error: "Solde insuffisant pour payer les frais de gas",
                };
            }
            
            if (errorOutput.includes("MODULE_EXISTS") || errorOutput.includes("already published")) {
                logWarning("Le module existe déjà à cette adresse");
                return {
                    success: true,
                    moduleAddress: accountAddress,
                    transactionHash: "already-published",
                };
            }
            
            return {
                success: false,
                error: errorOutput,
            };
        }
        
        // Extract transaction hash from output
        const output = result.stdout || "";
        const hashMatch = output.match(/Transaction hash: (0x[a-fA-F0-9]+)/i) ||
                         output.match(/"hash":\s*"(0x[a-fA-F0-9]+)"/);
        
        logSuccess("Module publié avec succès!");
        
        return {
            success: true,
            moduleAddress: accountAddress,
            transactionHash: hashMatch ? hashMatch[1] : undefined,
        };
        
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Unknown error during publication",
        };
    }
}

// ============================================
// USER PROMPT
// ============================================

async function waitForUserConfirmation(message: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    return new Promise((resolve) => {
        rl.question(`\n${colors.yellow}❓ ${message} (o/n): ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === "o" || answer.toLowerCase() === "y" || answer === "");
        });
    });
}

// ============================================
// MAIN DEPLOYMENT FLOW
// ============================================

async function main(): Promise<void> {
    printBanner();
    
    // Initialize Endless client
    const client = initEndlessClient();
    log(`🌐 Endpoint: ${CONFIG.FULLNODE_URL}`);
    
    // ═══════════════════════════════════════════
    // STEP 1: Account Setup
    // ═══════════════════════════════════════════
    logStep(1, "Configuration du compte");
    
    const account = loadOrCreateAccount();
    const accountAddress = account.accountAddress.toString();
    
    // ═══════════════════════════════════════════
    // STEP 2: Balance Check
    // ═══════════════════════════════════════════
    logStep(2, "Vérification du solde EDS");
    
    const balance = await checkBalance(client, account.accountAddress);
    
    if (balance === BigInt(-1)) {
        logWarning("Compte non trouvé on-chain (nouveau compte)");
        printFaucetInstructions(accountAddress);
        
        const shouldContinue = await waitForUserConfirmation(
            "Avez-vous obtenu des tokens via le faucet? Continuer?"
        );
        
        if (!shouldContinue) {
            log("\n👋 Déploiement annulé. Relancez après avoir obtenu des tokens.");
            process.exit(0);
        }
        
        // Re-check balance
        const newBalance = await checkBalance(client, account.accountAddress);
        if (newBalance <= BigInt(0)) {
            logError("Toujours pas de tokens détectés. Veuillez réessayer.");
            process.exit(1);
        }
        
        logSuccess(`Solde détecté: ${formatEDS(newBalance)}`);
        
    } else if (balance < BigInt(CONFIG.MIN_BALANCE_FOR_DEPLOY)) {
        logWarning(`Solde insuffisant: ${formatEDS(balance)}`);
        logInfo(`Minimum requis: ${formatEDS(BigInt(CONFIG.MIN_BALANCE_FOR_DEPLOY))}`);
        printFaucetInstructions(accountAddress);
        
        const shouldContinue = await waitForUserConfirmation(
            "Continuer quand même? (risque d'échec)"
        );
        
        if (!shouldContinue) {
            process.exit(0);
        }
    } else {
        logSuccess(`Solde: ${formatEDS(balance)}`);
    }
    
    // ═══════════════════════════════════════════
    // STEP 3: Update Move.toml
    // ═══════════════════════════════════════════
    logStep(3, "Configuration du module");
    
    updateMoveToml(accountAddress);
    
    // ═══════════════════════════════════════════
    // STEP 4: Compile
    // ═══════════════════════════════════════════
    logStep(4, "Compilation");
    
    const compiled = compileModule();
    if (!compiled) {
        logError("Échec de la compilation. Déploiement annulé.");
        process.exit(1);
    }
    
    // ═══════════════════════════════════════════
    // STEP 5: Publish
    // ═══════════════════════════════════════════
    logStep(5, "Publication sur Endless Testnet");
    
    const deployResult = await publishModule(accountAddress);
    
    if (!deployResult.success) {
        logError(`Échec de la publication: ${deployResult.error}`);
        process.exit(1);
    }
    
    // ═══════════════════════════════════════════
    // SUCCESS OUTPUT
    // ═══════════════════════════════════════════
    console.log(`
${colors.green}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║               🎉 DÉPLOIEMENT RÉUSSI! 🎉                       ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣${colors.reset}
${colors.green}║${colors.reset}                                                               ${colors.green}║${colors.reset}
${colors.green}║${colors.reset}  ${colors.bright}📋 INFORMATIONS À COPIER DANS LE FRONTEND:${colors.reset}                  ${colors.green}║${colors.reset}
${colors.green}║${colors.reset}                                                               ${colors.green}║${colors.reset}
${colors.green}║${colors.reset}  ${colors.cyan}Module Address:${colors.reset}                                            ${colors.green}║${colors.reset}
${colors.green}║${colors.reset}  ${colors.yellow}${accountAddress}${colors.reset}
${colors.green}║${colors.reset}                                                               ${colors.green}║${colors.reset}
${colors.green}║${colors.reset}  ${colors.cyan}Module Name:${colors.reset} ${CONFIG.MODULE_NAME}                                    ${colors.green}║${colors.reset}
${colors.green}║${colors.reset}                                                               ${colors.green}║${colors.reset}
${colors.green}║${colors.reset}  ${colors.cyan}Full Function ID:${colors.reset}                                          ${colors.green}║${colors.reset}
${colors.green}║${colors.reset}  ${colors.yellow}${accountAddress}::${CONFIG.MODULE_NAME}::request_ai_service${colors.reset}
${colors.green}║${colors.reset}                                                               ${colors.green}║${colors.reset}
${deployResult.transactionHash ? `${colors.green}║${colors.reset}  ${colors.cyan}Transaction Hash:${colors.reset}                                         ${colors.green}║${colors.reset}
${colors.green}║${colors.reset}  ${colors.magenta}${deployResult.transactionHash}${colors.reset}
${colors.green}║${colors.reset}                                                               ${colors.green}║${colors.reset}` : ""}
${colors.green}║${colors.reset}  ${colors.cyan}Explorer:${colors.reset}                                                  ${colors.green}║${colors.reset}
${colors.green}║${colors.reset}  ${colors.blue}${CONFIG.EXPLORER_URL}/account/${accountAddress}/modules${colors.reset}
${colors.green}║${colors.reset}                                                               ${colors.green}║${colors.reset}
╚═══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.bright}📝 Configuration pour le Frontend (à copier):${colors.reset}

${colors.cyan}// config/contracts.ts
export const NEXUS_CONTRACT = {
    address: "${accountAddress}",
    module: "${CONFIG.MODULE_NAME}",
    functions: {
        requestAiService: "${accountAddress}::${CONFIG.MODULE_NAME}::request_ai_service",
        requestWithPayment: "${accountAddress}::${CONFIG.MODULE_NAME}::request_ai_service_with_payment",
    },
    views: {
        isInitialized: "${accountAddress}::${CONFIG.MODULE_NAME}::is_initialized",
        getServicePrice: "${accountAddress}::${CONFIG.MODULE_NAME}::get_service_price",
        getTreasury: "${accountAddress}::${CONFIG.MODULE_NAME}::get_treasury",
        getTotalRequests: "${accountAddress}::${CONFIG.MODULE_NAME}::get_total_requests",
        getUserBalance: "${accountAddress}::${CONFIG.MODULE_NAME}::get_user_eds_balance",
    },
};${colors.reset}
`);
}

// ============================================
// RUN
// ============================================

main().catch((error) => {
    logError(`Erreur fatale: ${error.message || error}`);
    console.error(error);
    process.exit(1);
});
