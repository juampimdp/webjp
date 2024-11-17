# Market Dashboard

Este proyecto es una aplicación web desarrollada para mostrar información financiera sobre Acciones, Bonos, ONs y el mercado de MEP en Argentina. La aplicación permite realizar búsquedas, ordenar datos y refrescar la información de manera automática. Está diseñada utilizando React, Next.js, y varias bibliotecas de UI para una experiencia moderna y funcional.

## Características Principales

- Visualización de datos financieros en tiempo real sobre diferentes activos.
- Búsqueda y filtrado dinámico por símbolo.
- Ordenación de datos por diferentes criterios, incluyendo precio de compra, precio de venta, y variación porcentual.
- Actualización automática cada 20 segundos, además de una opción para actualizar manualmente los datos.
- Interfaz moderna y responsiva con componentes reutilizables.

## Tecnologías Utilizadas

- **React**: Para la creación de la interfaz de usuario.
- **Next.js**: Para el framework y soporte de la aplicación React.
- **Lucide-react**: Para los iconos utilizados en la interfaz.
- **CSS y TailwindCSS**: Para los estilos de la interfaz.

## Cómo Ejecutar

1. **Instalación**:
   - Clona este repositorio.
   - Ejecuta `npm install` para instalar las dependencias.

2. **Desarrollo**:
   - Ejecuta `npm run dev` para iniciar el servidor de desarrollo.

3. **Producción**:
   - Ejecuta `npm run build` para generar una versión optimizada del proyecto.
   - Luego, ejecuta `npm start` para servir la aplicación.

## Autor

Hecho por **Juan Pablo (JP)**.

## Estructura del Proyecto

```
jp/
├── app/                # Directorio principal de la aplicación
├── components/         # Componentes reutilizables
├── lib/               # Utilidades y funciones auxiliares
└── public/            # Archivos estáticos
```

## Requisitos Previos

- Node.js (versión 18 o superior)
- npm o pnpm

## Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:
```env
API_KEY=tu_api_key
API_URL=url_de_tu_api
```

## Scripts Disponibles

- `npm run dev`: Inicia el entorno de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm start`: Inicia la aplicación en modo producción
- `npm run lint`: Ejecuta el linter para verificar el código

## Contribución

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles

## Contacto

Juan Pablo (JP) - [@tuTwitter](https://twitter.com/tuUsuario)

Link del proyecto: [https://github.com/juampimdp/webjp](https://github.com/juampimdp/webjp)

## Agradecimientos

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
