# Script de despliegue para Windows PowerShell
# Chat Widget Monorepo

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Chat Widget - Script de Despliegue" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker esté corriendo
Write-Host "Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if (-not $?) {
    Write-Host "ERROR: Docker no está corriendo. Por favor inicia Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker está corriendo" -ForegroundColor Green
Write-Host ""

# Limpiar contenedores y volúmenes anteriores (opcional)
Write-Host "¿Deseas limpiar contenedores anteriores? (s/n): " -NoNewline -ForegroundColor Yellow
$clean = Read-Host
if ($clean -eq 's' -or $clean -eq 'S') {
    Write-Host "Limpiando contenedores anteriores..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "✓ Limpieza completada" -ForegroundColor Green
    Write-Host ""
}

# Construir y levantar los servicios
Write-Host "Construyendo y levantando servicios..." -ForegroundColor Yellow
Write-Host "(Esto puede tomar varios minutos la primera vez)" -ForegroundColor Gray
Write-Host ""

docker-compose up --build -d

if ($?) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Despliegue completado exitosamente" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Servicios disponibles:" -ForegroundColor Cyan
    Write-Host "  • Frontend:  http://localhost" -ForegroundColor White
    Write-Host "  • Backend:   http://localhost:8080/api" -ForegroundColor White
    Write-Host ""
    Write-Host "Para ver los logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs -f" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Para detener los servicios:" -ForegroundColor Yellow
    Write-Host "  docker-compose down" -ForegroundColor Gray
    Write-Host ""
    
    # Esperar a que los servicios estén listos
    Write-Host "Esperando a que los servicios estén listos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Verificar estado de los contenedores
    Write-Host ""
    Write-Host "Estado de los contenedores:" -ForegroundColor Cyan
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ Error en el despliegue" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisa los logs para más detalles:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
