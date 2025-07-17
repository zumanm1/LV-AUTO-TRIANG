# AI Network Engineering Assistant - Scripts Documentation

This document provides detailed information about the management scripts for the AI Network Engineering Assistant.

## 📋 Script Overview

| Script | Purpose | Key Features |
|--------|---------|--------------|
| `start-app.sh` | Smart service startup | Multi-method detection, port management, health checks |
| `stop-app.sh` | Aggressive service shutdown | Multi-method termination, Docker handling, sudo escalation |
| `status.sh` | Comprehensive status checking | Real-time health checks, feature inventory |

## 🚀 start-app.sh - Smart Service Startup

### Purpose
Intelligently starts all required services for the AI Network Engineering Assistant with automatic port detection, process cleanup, and health monitoring.

### Key Features
- **Smart Process Detection**: Automatically detects and handles existing processes
- **Multi-Method ChromaDB Startup**: Tries native, Python, and Docker methods
- **Automatic Port Management**: Finds available ports for React app (5173 → 5174)
- **Health Checks**: Waits for services to be ready before reporting
- **Process Cleanup**: Removes orphaned processes before starting
- **Comprehensive Reporting**: Shows all service URLs and available features

### Startup Process Flow
1. **Environment Check**: Validates script dependencies and permissions
2. **Process Cleanup**: Removes any existing processes on target ports
3. **ChromaDB Startup**: Tries multiple startup methods in order:
   - Native ChromaDB binary
   - Python ChromaDB module
   - Docker container
4. **React App Startup**: Starts on first available port (5173 or 5174)
5. **Health Verification**: Tests service connectivity
6. **Status Reporting**: Displays comprehensive status information

### Usage Examples
```bash
# Basic startup
./start-app.sh

# With verbose output (if script supports it)
./start-app.sh --verbose

# Force clean startup (stops existing services first)
./stop-app.sh && ./start-app.sh
```

### Expected Output
```
🚀 Starting AI Network Engineering Assistant...
✅ ChromaDB: Running at http://localhost:8000
✅ React app is already running
   React app available at: http://localhost:5174
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
Press Ctrl+C to stop all services
```

### Error Handling
- **Port Conflicts**: Automatically finds alternative ports
- **Service Failures**: Reports specific failure reasons
- **Permission Issues**: Provides sudo escalation guidance
- **Dependency Issues**: Validates required tools and services

## 🛑 stop-app.sh - Aggressive Service Shutdown

### Purpose
Completely stops all services using multiple aggressive methods to ensure no processes remain running, especially handling stubborn Docker proxy processes.

### Key Features
- **Multi-Method Process Detection**: Uses netstat, lsof, ss, fuser, and manual search
- **Progressive Kill Strategy**: SIGTERM → SIGKILL → sudo escalation
- **Docker Proxy Handling**: Specifically targets Docker proxy processes on port 8000
- **Nuclear Option**: Final cleanup with iptables and manual process termination
- **Comprehensive Cleanup**: Removes all related processes and containers

### Aggressive Stop Methods

#### Method 1: netstat + Graceful Kill
```bash
# Find processes using netstat
netstat -tlnp | grep ":8000"
# Extract PID and kill gracefully
kill -15 $PID || kill -9 $PID || sudo kill -9 $PID
```

#### Method 2: lsof + Progressive Termination
```bash
# Find all processes on port
lsof -ti:8000
# Progressive termination
lsof -ti:8000 | xargs -r kill -15
sleep 1
lsof -ti:8000 | xargs -r kill -9
sleep 1
sudo lsof -ti:8000 | xargs -r sudo kill -9
```

#### Method 3: ss + Socket-based Detection
```bash
# Use ss for socket statistics
ss -tlnp | grep ":8000"
# Extract PIDs and terminate
echo "$pids" | xargs -r kill -15
echo "$pids" | xargs -r kill -9
echo "$pids" | xargs -r sudo kill -9
```

#### Method 4: fuser + Direct Port Killing
```bash
# Direct port-based process killing
fuser -k 8000/tcp || sudo fuser -k 8000/tcp
```

#### Method 5: Manual Process Search
```bash
# Search for related processes by name
ps aux | grep -v grep | grep "8000\|chroma\|docker-proxy"
# Kill found processes
ps aux | grep -v grep | grep "8000\|chroma\|docker-proxy" | awk '{print $2}' | xargs -r kill -9
```

#### Nuclear Option
```bash
# Final aggressive cleanup
ps aux | grep -v grep | grep -E "(8000|chroma|docker-proxy)" | awk '{print $2}' | xargs -r sudo kill -9
# Use iptables to block port if needed
sudo iptables -D INPUT -p tcp --dport 8000 -j DROP 2>/dev/null
sudo iptables -A INPUT -p tcp --dport 8000 -j DROP 2>/dev/null
```

### Usage Examples
```bash
# Basic aggressive stop
./stop-app.sh

# Force stop with manual intervention
./stop-app.sh
# If still running, manually:
sudo lsof -ti:8000 | xargs -r sudo kill -9
```

### Expected Output
```
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

🎯 To restart the application, run: ./start-app.sh
```

### Error Recovery
- **Stubborn Processes**: Provides manual intervention commands
- **Permission Denied**: Automatically escalates to sudo
- **Docker Issues**: Handles orphaned containers and proxy processes

## 📊 status.sh - Comprehensive Status Checking

### Purpose
Provides real-time status information about all services, including health checks, port availability, and feature inventory.

### Key Features
- **Real-time Health Checks**: Tests actual service connectivity
- **Port Availability**: Checks all target ports (8000, 5173, 5174)
- **Service Details**: Shows URLs, API endpoints, and feature availability
- **Process Information**: Displays running PIDs and container IDs
- **Feature Inventory**: Lists available knowledge libraries and capabilities

### Status Check Process
1. **Port Verification**: Checks if ports are listening
2. **Service Connectivity**: Tests HTTP connectivity to services
3. **Process Validation**: Verifies processes are actually running
4. **Feature Detection**: Checks knowledge library availability
5. **Status Reporting**: Displays comprehensive status information

### Usage Examples
```bash
# Basic status check
./status.sh

# Quick port check
./status.sh --ports-only

# Detailed process information
./status.sh --verbose
```

### Expected Output
```
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

### Health Check Methods
- **Port Listening**: `netstat -tlnp | grep :PORT`
- **HTTP Connectivity**: `curl -s http://localhost:PORT`
- **Process Validation**: `ps aux | grep PROCESS_NAME`
- **Docker Status**: `docker ps | grep CONTAINER_NAME`

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

#### Port 8000 Occupied
**Symptoms**: `Address localhost:8000 is not available`
**Solutions**:
1. Run aggressive stop: `./stop-app.sh`
2. Manual cleanup: `sudo lsof -ti:8000 | xargs -r sudo kill -9`
3. Check Docker: `docker ps | grep chroma`

#### React App Port Conflicts
**Symptoms**: React app won't start on expected port
**Solutions**:
1. Automatic port detection handles this
2. Manual check: `lsof -i :5173` or `lsof -i :5174`
3. Clean restart: `./stop-app.sh && ./start-app.sh`

#### Stubborn Docker Processes
**Symptoms**: ChromaDB won't stop despite multiple attempts
**Solutions**:
1. Aggressive stop script handles this automatically
2. Manual Docker cleanup: `docker stop $(docker ps -q) && docker rm $(docker ps -aq)`
3. Force kill: `sudo pkill -f "docker-proxy\|chroma"`

#### Service Health Issues
**Symptoms**: Services appear running but aren't responding
**Solutions**:
1. Use status script: `./status.sh`
2. Full restart: `./stop-app.sh && ./start-app.sh`
3. Check logs for specific errors

### Manual Intervention Commands

#### Kill All Processes on Port 8000
```bash
sudo lsof -ti:8000 | xargs -r sudo kill -9
```

#### Stop All Docker Containers
```bash
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
```

#### Kill All Chroma-Related Processes
```bash
sudo pkill -f "chroma\|docker-proxy"
```

#### Check Port Usage
```bash
# Multiple methods to check port usage
lsof -i :8000
netstat -tlnp | grep :8000
ss -tlnp | grep :8000
```

#### Force Clean Restart
```bash
# Nuclear option for complete cleanup
sudo pkill -f "chroma\|docker-proxy\|vite\|npm"
docker stop $(docker ps -q) 2>/dev/null
docker rm $(docker ps -aq) 2>/dev/null
sudo lsof -ti:8000 | xargs -r sudo kill -9
sudo lsof -ti:5173 | xargs -r sudo kill -9
sudo lsof -ti:5174 | xargs -r sudo kill -9
```

## 🔄 Common Workflows

### Development Workflow
```bash
# Start development environment
./start-app.sh

# Make code changes (auto-reload via Vite)

# Check status periodically
./status.sh

# Stop when done
./stop-app.sh
```

### Production Deployment
```bash
# Ensure clean state
./stop-app.sh

# Start production services
./start-app.sh

# Monitor status
./status.sh

# Verify health
curl -s http://localhost:5174 | head -1
curl -s http://localhost:8000/api/v1/heartbeat
```

### Troubleshooting Workflow
```bash
# Check current status
./status.sh

# If issues detected, stop everything
./stop-app.sh

# Clean restart
./start-app.sh

# Verify resolution
./status.sh
```

### Maintenance Workflow
```bash
# Stop all services
./stop-app.sh

# Perform maintenance tasks
# (update code, restart system, etc.)

# Restart services
./start-app.sh

# Verify everything works
./status.sh
```

## 🛠️ Technical Details

### Script Dependencies
- **Bash**: All scripts require bash shell (not sh)
- **Docker**: Optional for ChromaDB containerization
- **netstat/lsof/ss/fuser**: Process detection tools
- **curl**: HTTP connectivity testing
- **sudo**: Required for aggressive process termination

### Environment Variables
- `CHROMA_HOST`: ChromaDB host (default: localhost)
- `CHROMA_PORT`: ChromaDB port (default: 8000)
- `REACT_PORT`: React app port (default: 5173)

### File Permissions
```bash
# Make scripts executable
chmod +x start-app.sh stop-app.sh status.sh

# Ensure proper ownership
sudo chown $USER:$USER *.sh
```

### Logging and Debugging
- Scripts provide verbose output for troubleshooting
- Use `set -x` for debug mode: `bash -x ./script.sh`
- Check system logs: `journalctl -f`

### Performance Considerations
- Scripts are optimized for quick execution
- Health checks have reasonable timeouts
- Process detection uses efficient system calls
- Docker operations are optimized for speed

---

For additional support or feature requests, contact the project maintainer or create an issue in the project repository. 