#!/bin/bash
# Script de despliegue para Linux/Mac
# Chat Widget Monorepo

echo "========================================"
echo "  Chat Widget - Script de Despliegue"
echo "========================================"
echo ""

# Verificar que Docker esté corriendo
echo "Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker no está corriendo. Por favor inicia Docker."
    exit 1
fi
echo "✓ Docker está corriendo"
echo ""

# Limpiar contenedores y volúmenes anteriores (opcional)
read -p "¿Deseas limpiar contenedores anteriores? (s/n): " clean
if [[ $clean == "s" || $clean == "S" ]]; then
    echo "Limpiando contenedores anteriores..."
    docker-compose down -v
    echo "✓ Limpieza completada"
    echo ""
fi

# Construir y levantar los servicios
echo "Construyendo y levantando servicios..."
echo "(Esto puede tomar varios minutos la primera vez)"
echo ""

docker-compose up --build -d

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  ✓ Despliegue completado exitosamente"
    echo "========================================"
    echo ""
    echo "Servicios disponibles:"
    echo "  • Frontend:  http://localhost"
    echo "  • Backend:   http://localhost:8080/api"
    echo ""
    echo "Para ver los logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "Para detener los servicios:"
    echo "  docker-compose down"
    echo ""
    
    # Esperar a que los servicios estén listos
    echo "Esperando a que los servicios estén listos..."
    sleep 5
    
    # Verificar estado de los contenedores
    echo ""
    echo "Estado de los contenedores:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
else
    echo ""
    echo "========================================"
    echo "  ✗ Error en el despliegue"
    echo "========================================"
    echo ""
    echo "Revisa los logs para más detalles:"
    echo "  docker-compose logs"
    echo ""
    exit 1
fi
