# Quick Reference - AI Network Engineering Assistant

## 🚀 Essential Commands

### Start Everything
```bash
./start-app.sh
```

### Stop Everything (Aggressive)
```bash
./stop-app.sh
```

### Check Status
```bash
./status.sh
```

### Full Restart
```bash
./stop-app.sh && ./start-app.sh
```

## 🔧 Quick Troubleshooting

### Port 8000 Occupied
```bash
./stop-app.sh
# If still stuck:
sudo lsof -ti:8000 | xargs -r sudo kill -9
```

### React App Won't Start
```bash
./stop-app.sh
./start-app.sh
# Check which port it's using
./status.sh
```

### Stubborn Docker Processes
```bash
./stop-app.sh
# Manual cleanup if needed:
docker stop $(docker ps -q)
sudo pkill -f "docker-proxy"
```

### Services Not Responding
```bash
./status.sh
# If unhealthy:
./stop-app.sh && ./start-app.sh
```

## 📊 Expected Outputs

### Start Success
```
✅ ChromaDB: Running at http://localhost:8000
✅ React App: Running at http://localhost:5174
```

### Stop Success
```
✅ All services stopped successfully!
ChromaDB (Port 8000): ✅ Stopped
React App (Port 5173): ✅ Stopped
React App (Port 5174): ✅ Stopped
```

### Status Check
```
✅ ChromaDB: Running at http://localhost:8000
✅ React App: Running at http://localhost:5174
```

## 🎯 Access URLs

- **Main App**: http://localhost:5174 (or 5173)
- **ChromaDB API**: http://localhost:8000/api/v1

## 🆘 Emergency Commands

### Nuclear Option (Complete Cleanup)
```bash
sudo pkill -f "chroma\|docker-proxy\|vite\|npm"
docker stop $(docker ps -q) 2>/dev/null
sudo lsof -ti:8000 | xargs -r sudo kill -9
sudo lsof -ti:5173 | xargs -r sudo kill -9
sudo lsof -ti:5174 | xargs -r sudo kill -9
```

### Check What's Using Ports
```bash
lsof -i :8000
lsof -i :5173
lsof -i :5174
```

### Force Restart Everything
```bash
./stop-app.sh
sleep 2
./start-app.sh
./status.sh
```

---

**📖 Full Documentation**: See [README.md](README.md) and [SCRIPTS.md](SCRIPTS.md) for detailed information. 