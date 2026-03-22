// config.ts
const isMac = process.platform === "darwin";
// Centralizando a inteligência de caminhos
// const root = process.cwd();

export const CONFIG = {
  // Redes
  port: {
    admin: Number(process.env.PORT_ADMIN),
    delivery: Number(process.env.PORT_DELIVERY)
  },
  paths: {
    root: process.env.PATH_ROOT,
    storage: process.env.PATH_STORAGE,
    sites: process.env.PATH_SITES,
    backups: process.env.PATH_BACKUPS,
  },
  // Segurança
  jwtSecret: process.env.JWT_SECRET,
  // Identificação do Ambiente
  isDev: process.env.NODE_ENV !== "production",
  isMac,
};
