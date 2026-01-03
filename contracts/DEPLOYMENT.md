# ═══════════════════════════════════════════════════════════════════════════════
#                    ENDLESS NEXUS - DEPLOYMENT GUIDE
#                    Module: NexusMock sur Endless Testnet
# ═══════════════════════════════════════════════════════════════════════════════

## 📋 PRÉREQUIS

### 1. Installer Endless CLI
```powershell
# Option A: Via cargo (Rust doit être installé)
cargo install endless-cli

# Option B: Télécharger le binaire depuis GitHub
# https://github.com/endless-labs/endless-cli/releases

# Vérifier l'installation
endless --version
```

### 2. Installer Node.js & pnpm (pour le script TypeScript)
```powershell
# Vérifier Node.js
node --version  # >= 18.x requis

# Installer pnpm (optionnel, npm fonctionne aussi)
npm install -g pnpm
```

---

## 🚀 MÉTHODE 1: Déploiement via CLI Endless (Recommandé)

### Étape 1: Initialiser le profil Endless
```powershell
# Créer un nouveau compte testnet
endless init --network testnet

# Suivre les instructions:
# - Choisir "testnet" comme réseau
# - Générer une nouvelle clé ou importer existante
# - Le CLI va créer ~/.endless/config.yaml
```

### Étape 2: Vérifier le compte créé
```powershell
# Afficher l'adresse du compte
endless account lookup-address

# Obtenir des tokens testnet via faucet
endless account fund-with-faucet --account default --amount 100000000
```

### Étape 3: Mettre à jour Move.toml avec votre adresse
```powershell
# Ouvrir Move.toml et remplacer nexus_addr = "_" par votre adresse
# Exemple: nexus_addr = "0x1234...abcd"
```

### Étape 4: Compiler le module
```powershell
cd c:\Users\pc_fi\Documents\Workspace_VSCode\Endless\contracts

# Compiler
endless move compile

# Tester (optionnel)
endless move test
```

### Étape 5: Publier sur Testnet
```powershell
# Publier le module
endless move publish --profile default --assume-yes

# Ou avec confirmation manuelle
endless move publish --profile default
```

### Étape 6: Vérifier le déploiement
```powershell
# Voir les modules publiés
endless account list --query modules --account default
```

---

## 🚀 MÉTHODE 2: Déploiement via Script TypeScript

### Étape 1: Installer les dépendances
```powershell
cd c:\Users\pc_fi\Documents\Workspace_VSCode\Endless\contracts

# Avec npm
npm install

# Ou avec pnpm
pnpm install
```

### Étape 2: Exécuter le script de déploiement
```powershell
npm run deploy
```

Le script va automatiquement:
1. ✅ Créer un compte (ou charger existant depuis `.endless/account.json`)
2. ✅ Demander des tokens via faucet
3. ✅ Compiler le module Move
4. ✅ Publier sur le testnet
5. ✅ Afficher le hash de transaction

---

## 📝 COMMANDES CLI UTILES

### Gestion de compte
```powershell
# Créer un nouveau compte
endless account create --profile testnet

# Voir le solde
endless account balance --profile default

# Transférer des tokens
endless account transfer --account <RECIPIENT> --amount 1000
```

### Compilation & Tests
```powershell
# Compiler uniquement
endless move compile

# Lancer les tests unitaires
endless move test

# Compiler avec verbose
endless move compile --verbose
```

### Interaction avec le module déployé
```powershell
# Appeler une fonction view
endless move view \
  --function-id '<MODULE_ADDR>::nexus_mock::get_service_price'

# Appeler une entry function
endless move run \
  --function-id '<MODULE_ADDR>::nexus_mock::request_ai_service' \
  --args 'string:code_auditor' 'string:Audit my smart contract'
```

---

## 🔍 VÉRIFICATION POST-DÉPLOIEMENT

### 1. Via CLI
```powershell
# Vérifier que le module existe
endless move view --function-id '<VOTRE_ADRESSE>::nexus_mock::is_initialized'

# Vérifier le prix du service
endless move view --function-id '<VOTRE_ADRESSE>::nexus_mock::get_service_price'
```

### 2. Via Explorer
Visitez l'explorateur Endless Testnet:
- URL: `https://explorer.testnet.endless.link/account/<VOTRE_ADRESSE>/modules`

---

## 🛠️ RÉSOLUTION DE PROBLÈMES

### Erreur: "Account not found"
```powershell
# Le compte n'existe pas encore on-chain, demander des fonds
endless account fund-with-faucet --account default --amount 100000000
```

### Erreur: "Insufficient gas"
```powershell
# Augmenter le gas maximum
endless move publish --max-gas 200000
```

### Erreur: "Module already exists"
```powershell
# Le module a déjà été publié à cette adresse
# Option 1: Créer un nouveau compte
endless init --network testnet --profile nexus2

# Option 2: Mettre à niveau (si compatible)
endless move publish --upgrade-policy compatible
```

### Erreur: Compilation "unbound module"
```powershell
# Vérifier que Move.toml a les bonnes dépendances
# et que endless_framework pointe vers le bon repo
```

---

## 📊 RÉSUMÉ DES COMMANDES RAPIDES

```powershell
# === SETUP ONE-TIME ===
endless init --network testnet
endless account fund-with-faucet --account default --amount 100000000

# === DEPLOY ===
cd c:\Users\pc_fi\Documents\Workspace_VSCode\Endless\contracts
endless move compile
endless move publish --assume-yes

# === VERIFY ===
endless move view --function-id '<ADDR>::nexus_mock::is_initialized'
```

---

## 📁 STRUCTURE FINALE DU PROJET

```
Endless/contracts/
├── Move.toml              # Configuration du package Move
├── NexusMock.move         # Smart contract principal
├── package.json           # Config npm pour scripts TS
├── tsconfig.json          # Config TypeScript
├── scripts/
│   └── deploy.ts          # Script de déploiement automatisé
├── build/                 # (généré) Bytecode compilé
│   └── NexusMock/
│       └── bytecode_modules/
│           └── nexus_mock.mv
└── .endless/              # (généré) Données du compte
    └── account.json
```

---

**🎉 Une fois déployé, notez l'adresse du module pour l'étape Frontend !**
