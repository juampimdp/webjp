# Market Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Descripción

Market Dashboard es una aplicación web profesional diseñada para el seguimiento y análisis de instrumentos financieros en el mercado argentino. Proporciona información en tiempo real sobre Acciones, Bonos, Obligaciones Negociables (ONs) y operaciones MEP, ofreciendo una interfaz intuitiva y eficiente para traders e inversores.

![Dashboard Preview](public/dashboard-preview.png)

## Características Principales

- **Monitoreo en Tiempo Real**
  - Cotizaciones actualizadas cada 20 segundos
  - Visualización de spreads bid/ask
  - Tracking de volúmenes operados
  - Variaciones porcentuales en tiempo real

- **Portfolio Management**
  - Creación y seguimiento de portfolios personalizados
  - Cálculo automático de valores en ARS y USD
  - Análisis de rendimiento por tipo de activo
  - Gestión de posiciones en múltiples instrumentos

- **Análisis de Mercado**
  - Filtrado avanzado por tipo de instrumento
  - Ordenamiento multivariable de datos
  - Búsqueda instantánea de activos
  - Histórico de precios y volúmenes

- **Interfaz Moderna**
  - Diseño responsivo para todos los dispositivos
  - Modo oscuro optimizado
  - Componentes UI personalizados
  - Experiencia de usuario intuitiva

## Stack Tecnológico

### Frontend
- **Framework**: React 18 + Next.js 14
- **Estilado**: TailwindCSS + CSS Modules
- **UI Components**: Radix UI + Shadcn/ui
- **Iconografía**: Lucide React
- **Gráficos**: Recharts

### Desarrollo
- **Lenguaje**: TypeScript 5.0
- **Linting**: ESLint + Prettier
- **Build Tool**: Turbopack
- **Package Manager**: pnpm

## Instalación y Configuración

### Requisitos Previos
- Node.js (v18.0.0 o superior)
- pnpm (v8.0.0 o superior)
- Git

### Configuración Inicial

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/juampimdp/webjp.git
   cd webjp
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   Editar `.env.local` con tus credenciales:
   ```env
   API_KEY=your_api_key
   API_URL=your_api_url
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   pnpm dev
   ```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia el servidor de desarrollo |
| `pnpm build` | Crea la build de producción |
| `pnpm start` | Inicia el servidor de producción |
| `pnpm lint` | Ejecuta el linter |
| `pnpm type-check` | Verifica tipos de TypeScript |

## Estructura del Proyecto

```
jp/
├── app/                  # Núcleo de la aplicación
│   ├── layout.tsx       # Layout principal
│   ├── page.tsx         # Página principal
│   └── globals.css      # Estilos globales
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes de interfaz
│   └── market/         # Componentes específicos del mercado
├── lib/                # Utilidades y configuraciones
│   ├── api/           # Servicios de API
│   └── utils/         # Funciones auxiliares
└── public/            # Recursos estáticos
```

## Características del Dashboard

### Monitoreo de Activos
- **Acciones**: Seguimiento de acciones líderes y panel general
- **Bonos**: Monitoreo de bonos soberanos y corporativos
- **ONs**: Tracking de Obligaciones Negociables
- **MEP**: Cálculo y seguimiento de operaciones MEP

### Portfolio Management
- Creación de portfolios personalizados
- Tracking de posiciones en tiempo real
- Cálculo automático de valores en ARS/USD
- Análisis de rendimiento por activo

## Contribución

Las contribuciones son bienvenidas. Por favor, lee las [guías de contribución](CONTRIBUTING.md) antes de enviar un PR.

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## License

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Juan Pablo - [@juampimdp](https://twitter.com/juampimdp)

Link del Proyecto: [https://github.com/juampimdp/webjp](https://github.com/juampimdp/webjp)

---

<p align="center">Made with ❤️ by Juan Pablo</p>
