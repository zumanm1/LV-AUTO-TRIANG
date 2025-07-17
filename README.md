# AI Network Engineering Assistant

A sophisticated React-based AI Network Engineering Assistant with enhanced RAG capabilities, knowledge libraries, and automated network operations.

## 🚀 Quick Start

### Start All Services
```bash
./start-app.sh
```

**Features:**
- **Smart Service Detection**: Automatically detects and handles existing processes
- **Multi-Method ChromaDB Startup**: Tries native, Python, and Docker methods
- **Port Management**: Automatically finds available ports (5173/5174 for React)
- **Health Checks**: Waits for services to be ready before reporting status
- **Process Cleanup**: Removes orphaned processes before starting
- **Comprehensive Status Reporting**: Shows all service URLs and features

**Startup Process:**
1. Cleans up any existing processes on target ports
2. Starts ChromaDB using the best available method
3. Starts React app on the first available port
4. Performs health checks and reports status
5. Displays access URLs and available features

### Stop All Services (Aggressive Mode)
```bash
./stop-app.sh
```

**Enhanced Aggressive Features:**
- **Multi-Method Process Detection**: Uses netstat, lsof, ss, fuser, and manual search
- **Progressive Kill Strategy**: SIGTERM → SIGKILL → sudo escalation
- **Docker Proxy Handling**: Specifically targets Docker proxy processes on port 8000
- **Nuclear Option**: Final cleanup with iptables and manual process termination
- **Comprehensive Cleanup**: Removes all related processes and containers

**Stop Process:**
1. **Method 1**: netstat + graceful kill
2. **Method 2**: lsof + progressive termination
3. **Method 3**: ss + socket-based detection
4. **Method 4**: fuser + direct port killing
5. **Method 5**: Manual process search and termination
6. **Nuclear**: sudo escalation and iptables blocking

### Check Service Status
```bash
./status.sh
```

**Status Features:**
- **Real-time Health Checks**: Tests actual service connectivity
- **Port Availability**: Checks all target ports (8000, 5173, 5174)
- **Service Details**: Shows URLs, API endpoints, and feature availability
- **Process Information**: Displays running PIDs and container IDs
- **Feature Inventory**: Lists available knowledge libraries and capabilities

## 📋 Script Details

### start-app.sh
```bash
# Smart startup with automatic port detection
./start-app.sh

# Expected output:
🚀 Starting AI Network Engineering Assistant...
✅ ChromaDB: Running at http://localhost:8000
✅ React App: Running at http://localhost:5174
🎉 Application Status:
======================
✅ ChromaDB: Running at http://localhost:8000
✅ React App: Running at http://localhost:5174
🔗 Access your AI Network Engineering Assistant:
   Main App: http://localhost:5174
   ChromaDB API: http://localhost:8000/api/v1
📚 Available Features:
   • Enhanced RAG with Knowledge Libraries
   • Error Patterns Database (8 categories)
   • Best Practices Library (8 categories)
   • Network Protocols Knowledge Base (8 protocols)
   • Sophisticated Document Processing
   • Knowledge-Driven Validation
```

### stop-app.sh (Aggressive Mode)
```bash
# Aggressive shutdown with multiple fallback methods
./stop-app.sh

# Expected output:
🛑 Stopping AI Network Engineering Assistant...
==============================================
🔧 Stopping ChromaDB (Aggressive Mode)...
   🔥 Aggressively stopping ChromaDB on port 8000...
     Using fuser to kill processes on port 8000...
     Searching for any remaining processes on port 8000...
     ✅ ChromaDB successfully stopped on port 8000
🐳 Stopping ChromaDB Docker containers...
🧹 Cleaning up ChromaDB processes by name...
⚛️ Stopping React applications...
   🔥 Aggressively stopping React App (5173) on port 5173...
   🔥 Aggressively stopping React App (5174) on port 5174...
🧹 Cleaning up Node.js processes...
🔥 Final aggressive cleanup for port 8000...

✅ All services stopped successfully!

📊 Final Status:
==================
ChromaDB (Port 8000): ✅ Stopped
React App (Port 5173): ✅ Stopped
React App (Port 5174): ✅ Stopped
```

### status.sh
```bash
# Comprehensive status checking
./status.sh

# Expected output:
📊 AI Network Engineering Assistant Status
==========================================
🔍 Checking services...

✅ ChromaDB: Running at http://localhost:8000
✅ React App: Running at http://localhost:5174

🎯 Access URLs:
   Main Application: http://localhost:5174
   ChromaDB API: http://localhost:8000/api/v1

📚 Available Features:
   • Enhanced RAG with Knowledge Libraries
   • Error Patterns Database (8 categories)
   • Best Practices Library (8 categories)
   • Network Protocols Knowledge Base (8 protocols)
   • Sophisticated Document Processing
   • Knowledge-Driven Validation
```

## 🔧 Troubleshooting

### Port Conflicts
**Problem**: `Address localhost:8000 is not available`
**Solutions**:
1. Run the aggressive stop script: `./stop-app.sh`
2. Manual cleanup: `sudo lsof -ti:8000 | xargs -r sudo kill -9`
3. Check for Docker containers: `docker ps | grep chroma`

**Problem**: React app won't start on expected port
**Solutions**:
1. The start script automatically finds available ports (5173 → 5174)
2. Check for existing processes: `lsof -i :5173` or `lsof -i :5174`
3. Use the stop script to clean up: `./stop-app.sh`

### Stubborn Processes
**Problem**: ChromaDB won't stop (Docker proxy processes)
**Solutions**:
1. The aggressive stop script handles this automatically
2. Manual Docker cleanup: `docker stop $(docker ps -q) && docker rm $(docker ps -aq)`
3. Force kill all processes: `sudo pkill -f "docker-proxy\|chroma"`

### Service Health Issues
**Problem**: Services appear running but aren't responding
**Solutions**:
1. Use status script to check actual connectivity: `./status.sh`
2. Restart services: `./stop-app.sh && ./start-app.sh`
3. Check logs for specific errors

### Manual Intervention Commands
```bash
# Kill all processes on port 8000
sudo lsof -ti:8000 | xargs -r sudo kill -9

# Stop all Docker containers
docker stop $(docker ps -q)

# Kill all chroma-related processes
sudo pkill -f "chroma\|docker-proxy"

# Check what's using a port
lsof -i :8000
netstat -tlnp | grep :8000
ss -tlnp | grep :8000
```

## 🔄 Common Operations

### Full Restart
```bash
./stop-app.sh
./start-app.sh
```

### Quick Status Check
```bash
./status.sh
```

### Development Workflow
```bash
# Start services
./start-app.sh

# Make changes to code (auto-reload via Vite)

# Check status
./status.sh

# Stop when done
./stop-app.sh
```

### Production Deployment
```bash
# Ensure clean state
./stop-app.sh

# Start with production settings
./start-app.sh

# Monitor status
./status.sh
```

## 📚 Enhanced Features

### Knowledge Libraries
- **Error Patterns Database**: 8 categories of network error patterns
- **Best Practices Library**: 8 categories of network best practices
- **Network Protocols Knowledge Base**: 8 major network protocols

### RAG Capabilities
- **Enhanced Document Processing**: Sophisticated chunking and indexing
- **Knowledge-Driven Validation**: AI-powered validation workflows
- **Multi-Source Integration**: Combines user documents with knowledge libraries

### Network Operations
- **Automated Network Analysis**: AI-powered network diagnostics
- **Configuration Management**: Intelligent network configuration handling
- **Troubleshooting Assistance**: Context-aware problem resolution

## 🛠️ Technical Details

### Service Architecture
- **ChromaDB**: Vector database for RAG operations (Port 8000)
- **React App**: Modern UI with Vite dev server (Port 5173/5174)
- **Knowledge Libraries**: JSON-based knowledge repositories
- **Document Services**: Enhanced document processing and indexing

### Script Dependencies
- **Bash**: All scripts require bash shell
- **Docker**: Optional for ChromaDB containerization
- **netstat/lsof/ss/fuser**: Process detection tools
- **sudo**: Required for aggressive process termination

### File Structure
```
LV-AUTO-TRIANG/
├── start-app.sh          # Smart service startup
├── stop-app.sh           # Aggressive service shutdown
├── status.sh             # Comprehensive status checking
├── src/
│   ├── knowledge/        # Knowledge library JSON files
│   └── services/         # Service implementations
└── README.md            # This documentation
```

## 📖 Additional Documentation

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**: Essential commands and troubleshooting (start here!)
- **[SCRIPTS.md](SCRIPTS.md)**: Detailed technical documentation for all management scripts
- **Script Comments**: Inline documentation in each script file
- **Component Documentation**: See individual component files for implementation details

---

For detailed script implementation, see the comments in each script file. For technical support, contact the project maintainer.
