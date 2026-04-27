# NOTA AYUDA

SI HAGO UN CAMBIO EN EL CODIGO Y QUIERO QUE SE ACTUALICE AUTOMATICAMENTE EN DOCKER, PARA ELLO DEBEMOS MODIFICAR EL ARCHIVO `tsconfig.json`

## Development pasos

1. Clonar el proyecto
2. Crear un archivo `.env` basado en el archivo `.env.template`
3. Levantar la base de datos con `docker compose up -d`
4. Levantar el proyecto con `npm run start:dev`
5. no esta mal, luego de levantar el proyecto, ejecutar `npx prisma generate` para generar o actualizar el cliente de prisma

## notas personales

Si modificamos el modelo producto del archivo schema.prisma, ejemplo le creamos un campo mas, para que se cree y ejecute la migracion al mismo tiempo, desde la terminal debemos ejecutar algo como:
  npx prisma migrate dev --name campoDisponible

despues debemos actualizar el cliente de prisma, para ello ejecutamos el comando:
npx prisma generate

## Pasos para convertir un proyecto en microservicios

ajustar el archivo main.ts como lo tenemos e indicar el protolo con el que se comunicara con los otros microservicios, ejemplo TCP