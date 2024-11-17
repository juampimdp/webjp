# Market Dashboard

## Descripción

Market Dashboard es una aplicación web profesional diseñada para el seguimiento y análisis de instrumentos financieros en el mercado argentino. Proporciona información en tiempo real sobre Acciones, Bonos, Obligaciones Negociables (ONs) y operaciones MEP, ofreciendo una interfaz intuitiva y eficiente para traders e inversores.

## Características Principales

- **Monitoreo en Tiempo Real**: Visualización de cotizaciones y variaciones de múltiples instrumentos financieros
- **Análisis de Mercado**: 
  - Seguimiento de precios de compra/venta
  - Variaciones porcentuales
  - Volúmenes operados
  - Tendencias de mercado
- **Funcionalidades Avanzadas**:
  - Búsqueda y filtrado dinámico por instrumento
  - Ordenamiento multivariable de datos
  - Actualización automática cada 20 segundos
  - Actualización manual bajo demanda
- **Interfaz Optimizada**: Diseño responsivo adaptado a diferentes dispositivos y resoluciones

## Stack Tecnológico

### Frontend
- React 18
- Next.js 14
- Lucide React (iconografía)
- CSS Modules

### Desarrollo
- TypeScript
- ESLint
- Prettier

## Instalación y Configuración

### Requisitos Previos
- Node.js (versión 18 o superior)
- npm o pnpm

### Configuración Inicial
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/juampimdp/webjp.git
   cd webjp
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Crear archivo `.env.local`:
   ```env
   API_KEY=your_api_key
   API_URL=your_api_url
   ```

### Scripts Disponibles

```bash
npm run dev      # Desarrollo - http://localhost:3000
npm run build    # Compilación para producción
npm start        # Iniciar versión de producción
npm run lint     # Ejecutar análisis de código
```

## Estructura del Proyecto

```
jp/
├── app/ # Núcleo de la aplicación
│ ├── layout.tsx # Layout principal
│ ├── page.tsx # Página principal
│ └── globals.css # Estilos globales
├── components/ # Componentes reutilizables
│ ├── ui/ # Componentes de interfaz
│ │ ├── avatar.tsx # Componente de avatar
│ │ ├── button.tsx # Componente de botón
│ │ ├── card.tsx # Componente de tarjeta
│ │ ├── input.tsx # Componente de entrada
│ │ ├── select.tsx # Componente de selección
│ │ └── tabs.tsx # Componente de pestañas
│ └── market-dashboard.tsx # Dashboard principal del mercado
├── lib/ # Utilidades y configuraciones
│ ├── api/ # Servicios de API
│ └── utils/ # Funciones auxiliares
├── public/ # Recursos estáticos
├── .gitignore # Configuración de archivos ignorados
├── components.json # Configuración de componentes UI
├── package.json # Dependencias y scripts
├── postcss.config.js # Configuración de PostCSS
├── tailwind.config.ts # Configuración de Tailwind CSS
├── tsconfig.json # Configuración de TypeScript
└── README.md # Documentación del proyecto
```

## Documentación Adicional

Para más información sobre las tecnologías utilizadas:

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de React](https://reactjs.org/)

## Licencia

Este proyecto está bajo la Licencia MIT. Consulte el archivo [LICENSE.md](LICENSE.md) para más detalles.

## Autor

Desarrollado por Juan Pablo (JP)

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abra un issue primero para discutir los cambios propuestos.

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit de cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Crear Pull Request
