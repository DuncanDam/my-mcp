# 🚀 Easy Distribution Guide

**Simple setup for 2-3 person teams without Docker complexity**

## 📦 One-Time Setup for Team Members

### Option 1: Direct Install (Recommended)
```bash
# Install globally from your shared folder/repo
npm install -g /path/to/mcp-content-analyzer

# Or from a shared zip file
unzip mcp-content-analyzer.zip
cd mcp-content-analyzer
npm install -g .
```

### Option 2: Clone and Install
```bash
git clone https://github.com/your-team/mcp-content-analyzer.git
cd mcp-content-analyzer
npm install -g .
```

## ⚡ Quick Start Commands

After installation, team members can use these simple commands:

```bash
# 1. Initial setup (run once)
mcp-content-analyzer setup

# 2. Configure Claude Desktop (run once)
mcp-content-analyzer config

# 3. Restart Claude Desktop completely

# 4. Start the analyzer
mcp-content-analyzer start
```

## 🔄 Easy Updates

Team members can update with one command:

```bash
# Update to latest version
mcp-content-analyzer update
```

## 📋 All Available Commands

| Command | Description |
|---------|-------------|
| `mcp-content-analyzer setup` | Install dependencies and setup directories |
| `mcp-content-analyzer config` | Generate Claude Desktop configuration |
| `mcp-content-analyzer start` | Start the MCP server |
| `mcp-content-analyzer test` | Test server connection |
| `mcp-content-analyzer update` | Update to latest version |
| `mcp-content-analyzer dev` | Start in development mode |
| `mcp-content-analyzer help` | Show help |

## 📤 For Team Leaders: Distribution Options

### Method 1: Simple Zip Distribution (FREE - Recommended for 2-3 people)
```bash
# Create distribution package automatically
npm run create-distribution

# This creates: mcp-content-analyzer-v1.0.0.zip
# Share via email, Slack, shared drive, etc.
```

**Team members:**
1. Extract zip file
2. Follow `INSTALL.md` in the extracted folder
3. Run `npm install -g .`

### Method 2: Git Repository (FREE)
```bash
# Push to private GitHub/GitLab repository
git push origin main

# Team members install directly:
npm install -g git+https://github.com/your-team/mcp-content-analyzer.git

# Updates:
git push origin main  # You push updates
npm update -g @your-team/mcp-content-analyzer  # They update
```

### Method 3: Public npm Registry (FREE)
```bash
# 1. Create free account at npmjs.com
# 2. Choose unique package name in package.json
npm login
npm publish

# Team installs with:
npm install -g your-unique-package-name
```

**⚠️ Note:** Code becomes publicly visible

### Method 4: Private npm Registry ($7/month)
```bash
# For organizations wanting private packages
npm publish --access restricted

# Team needs organization access
npm install -g @your-org/mcp-content-analyzer
```

## 🛠️ Troubleshooting

### Installation Issues
```bash
# If global install fails, try with sudo (macOS/Linux)
sudo npm install -g .

# Or install locally and use npx
npm install
npx mcp-content-analyzer setup
```

### Permission Issues
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Update Issues
```bash
# Force reinstall
npm uninstall -g mcp-content-analyzer
npm install -g /path/to/mcp-content-analyzer
```

## ✅ Verification

After setup, verify everything works:

1. **Test installation**: `mcp-content-analyzer help`
2. **Test server**: `mcp-content-analyzer test`
3. **Test Claude integration**: Ask Claude to call `test_connection`

## 🎯 Benefits Over Docker

- ✅ **Simpler setup**: No Docker knowledge required
- ✅ **Faster startup**: No container overhead
- ✅ **Easy updates**: Single command updates
- ✅ **Global access**: Works from any directory
- ✅ **Native performance**: Direct Node.js execution
- ✅ **Easy debugging**: Standard Node.js tooling

## 📞 Support

If team members have issues:

1. Check the troubleshooting section above
2. Run `mcp-content-analyzer test` for diagnostics
3. Check logs in the installation directory
4. Contact team lead for support

---

**Perfect for small teams who want MCP Content Analyzer without Docker complexity! 🎉**